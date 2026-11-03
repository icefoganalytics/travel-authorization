const SPREADSHEET_FORMULA_PREFIX = /^\s*[=+\-@]/

export function neutralizeSpreadsheetFormula(value: string): string {
  if (SPREADSHEET_FORMULA_PREFIX.test(value)) {
    return `'${value}`
  }

  return value
}

export default neutralizeSpreadsheetFormula
