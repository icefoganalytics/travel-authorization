declare module "vuetify/lib/components" {
  // TODO: implement VBtn types.
  export interface VBtn extends HTMLButtonElement {
    $el: HTMLButtonElement
    props: {
      disabled?: boolean
      tooltipText?: string
    }
  }
  export interface VBtnConstructor {
    new (): VBtn
  }
  export const VBtn: VBtnConstructor

  export interface VChip extends HTMLDivElement {
    $el: HTMLDivElement
  }
  export interface VChipConstructor {
    new (): VChip
  }
  export const VChip: VChipConstructor

  /** Instance shape for <v-form> (Vuetify 2) */
  export interface VForm extends HTMLFormElement {
    validate: () => boolean
    reset: () => void
    resetValidation: () => void
  }
  /** Constructor type so `typeof VForm` is a constructor */
  export interface VFormConstructor {
    new (): VForm
  }
  /** Value declaration used only for typing; will be erased if configured below */
  export const VForm: VFormConstructor
}
