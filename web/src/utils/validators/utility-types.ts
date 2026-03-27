/**
 * Validation rule function type for form field validation.
 * Returns true if valid, or string error message if invalid.
 */
export type ValidationRule = (value: unknown) => boolean | string

/**
 * Array of validation rules for form fields.
 */
export type ValidationRules = ValidationRule[]
