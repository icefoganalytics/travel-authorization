# Serializers

## Intent

Serializer code is easy to make technically correct but stylistically inconsistent. A shared
pattern keeps association serialization readable and makes missing eager-loads fail loudly.

Decision rules:

- destructure associations first when the serializer depends on eager-loaded data
- fail with explicit preload errors when a required association is missing
- serialize associations into named locals before building the final returned object

Serializers take model data, in the form mapping directly to the database structure, but with any casing standardize to JS standard. Data is then converted to a standard format that matches an external view as seen in the front-end.

Serializers are used in controllers to convert from a database representation to a front-end data packet. Serializers should generally not be used for general data formating such as date or money formatting, as formatting those kinds of things in the front-end is generally more flexible.

e.g. Usage in a Controller might look like this

```typescript
export class FormsController extends BaseController {
  index() {
    return Form.findAll({
      where: { userId: this.currentUser.id },
      include: ["stops", "purpose"],
    }).then((forms) => {
      const serializedForms = FormSerializer.asTable(forms)
      return this.response.json({ forms: serializedForms })
    })
  }
}
```

## Association Pattern

Prefer this shape when a serializer returns an eager-loaded nested entity:

```typescript
export class ShowSerializer extends BaseSerializer<Form> {
  perform(): FormAsShow {
    const { purpose } = this.record
    if (isUndefined(purpose)) {
      throw new Error("Expected form purpose association to be preloaded.")
    }

    const serializedPurpose = Purposes.ReferenceSerializer.perform(purpose)

    return {
      ...pick(this.record, [
        "id",
        "purposeId",
      ]),
      purpose: serializedPurpose,
    }
  }
}
```
