import { flushPromises, mount } from "@vue/test-utils"

import StringDateInput from "@/components/common/StringDateInput.vue"
import { mockVuetify } from "@/tests/support"

describe("web/src/components/common/StringDateInput.vue", () => {
  describe("StringDateInput", () => {
    test.each([
      { readonly: true, expectedPicker: false },
      { readonly: false, expectedPicker: true },
    ])(
      "when readonly is $readonly, clicking respects picker availability",
      async ({ readonly, expectedPicker }) => {
        // Arrange
        const wrapper = mount(StringDateInput, {
          props: { modelValue: "2026-11-12", readonly },
          attachTo: document.body,
          global: { plugins: [mockVuetify()] },
        })

        // Act
        await wrapper.get("input").trigger("click")
        await flushPromises()

        // Assert
        const pickerExists = document.querySelector(".v-overlay--active .v-date-picker") !== null
        expect(pickerExists).toBe(expectedPicker)
      }
    )

    test("when a caller requests an open menu on a read-only field, the calendar stays closed", async () => {
      // Arrange
      const wrapper = mount(StringDateInput, {
        props: {
          modelValue: "2026-11-12",
          readonly: true,
          menuProps: {
            modelValue: true,
          },
        },
        attachTo: document.body,
        global: { plugins: [mockVuetify()] },
      })

      // Act
      await wrapper.get("input").trigger("click")
      await flushPromises()

      // Assert
      expect(document.querySelector(".v-overlay--active .v-date-picker")).toBeNull()
    })

    test("when a field becomes editable, the calendar retains caller-supplied menu styling", async () => {
      // Arrange
      const wrapper = mount(StringDateInput, {
        props: {
          modelValue: "2026-11-12",
          readonly: true,
          menuProps: {
            contentClass: "travel-date-menu",
          },
        },
        attachTo: document.body,
        global: { plugins: [mockVuetify()] },
      })

      // Act
      await wrapper.setProps({ readonly: false })
      await wrapper.get("input").trigger("click")
      await flushPromises()

      // Assert
      expect(
        document.querySelector(".v-overlay--active .travel-date-menu .v-date-picker")
      ).not.toBeNull()
    })
  })
})
