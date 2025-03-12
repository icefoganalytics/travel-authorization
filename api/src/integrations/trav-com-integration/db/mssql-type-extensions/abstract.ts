import logger from "@/utils/logger"

const warnings: Record<string, boolean> = {}

/**
 * @see https://github.com/sequelize/sequelize/blob/v6.37.6/src/data-types.js
 */
export class ABSTRACT {
  options: Record<string, unknown> = {}

  constructor(options: Record<string, unknown> = {}) {
    this.options = options
  }

  static warn(link: string, text: string): void {
    if (!warnings[text]) {
      warnings[text] = true
      logger.warn(`${text} \n>> Check: ${link}`)
    }
  }

  static extend(oldType: ABSTRACT) {
    return new this(oldType.options)
  }

  static get dialectTypes() {
    return new this().dialectTypes
  }

  get dialectTypes() {
    return ""
  }

  static get key() {
    return new this().key
  }

  get key() {
    return ""
  }

  static toString(options: Record<string, unknown>) {
    return new this(options).toString(options)
  }

  toString(options: Record<string, unknown>) {
    return this.toSql(options)
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  static toSql(options?: Record<string, unknown>) {
    return new this(options).toSql(options)
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  toSql(options?: Record<string, unknown>) {
    return this.key
  }

  static stringify(value: unknown, options: Record<string, unknown>): string {
    return new this(options).stringify(value, options)
  }

  stringify(value: unknown, options: Record<string, unknown>): string {
    if (this._stringify) {
      return this._stringify(value, options)
    }
    return String(value)
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  static _stringify(value: unknown, options: Record<string, unknown>): string {
    return new this(options)._stringify(value, options)
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _stringify(value: unknown, options: Record<string, unknown>): string {
    return String(value)
  }

  bindParam(value: unknown, options: { bindParam: (val: unknown) => unknown }) {
    if (this._bindParam) {
      return this._bindParam(value, options)
    }
    return options.bindParam(this.stringify(value, options))
  }

  _bindParam?: (value: unknown, options: unknown) => unknown
}

export default ABSTRACT
