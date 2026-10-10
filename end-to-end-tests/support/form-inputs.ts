import type { Locator, Page } from "@playwright/test"

/** Commit a date-picker text value by leaving the focused input. */
export async function fillDate(field: Locator, value: string): Promise<void> {
  await field.click()
  await field.selectText()
  await field.fill(value)
  await field.press("Tab")
}

/** Select an option from the overlay belonging to this field. */
export async function selectCombobox(page: Page, field: Locator, option: string): Promise<void> {
  const input = field.and(page.locator("input"))
  const menuId = await input.getAttribute("aria-controls")
  if (!menuId) {
    throw new Error("The combobox did not identify its option menu.")
  }

  await input.press("ArrowDown")
  const menu = page.locator(`[id="${menuId}"]`)
  await menu.getByRole("option", { name: option, exact: true }).click()
  await input.press("Escape")
}
