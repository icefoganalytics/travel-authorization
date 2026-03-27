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

/**
 * Vuetify 2 goTo service types
 * @see {@link https://v2.vuetifyjs.com/en/features/scrolling/#api | Vuetify 2 Scrolling Documentation}
 * @see {@link https://github.com/vuetifyjs/vuetify/blob/b1cd40459b4a0801c021c0985ccd46fa65b9f579/packages/vuetify/src/services/goto/index.ts | Vuetify goTo Source}
 *
 * Local file at: web/node_modules/vuetify/lib/services/goto/index.js
 */
declare module "vuetify/lib/services/goto" {
  import Vue from "vue"

  export type VuetifyGoToTarget = number | string | HTMLElement | Vue

  export type VuetifyGoToEasing =
    | ((t: number) => number)
    | "easeInOut"
    | "easeInOutCubic"
    | "easeInOutQuad"
    | "easeIn"
    | "easeInCubic"
    | "easeInQuad"
    | "easeOut"
    | "easeOutCubic"
    | "easeOutQuad"
    | "linear"

  export interface GoToOptions {
    container?: Element | string
    duration?: number
    offset?: number
    easing?: VuetifyGoToEasing
    appOffset?: boolean
  }

  export default function goTo(target: VuetifyGoToTarget, options?: GoToOptions): Promise<number>
}
