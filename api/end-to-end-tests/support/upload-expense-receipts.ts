import { expect, type Page } from "@playwright/test"

import { receiptFileFactory } from "../factories/upload-file-factories"

export async function uploadExpenseReceipts(page: Page): Promise<number> {
  const receiptInputs = page.locator("input[type='file'].d-none")
  await expect(receiptInputs).not.toHaveCount(0)
  const receiptInputCount = await receiptInputs.count()

  for (let index = 0; index < receiptInputCount; index++) {
    const fileChooserPromise = page.waitForEvent("filechooser")
    await page.getByRole("button", { name: "Add Receipt", exact: true }).first().click()
    const fileChooser = await fileChooserPromise
    await fileChooser.setFiles(receiptFileFactory.build())
    await expect(page.getByRole("button", { name: "View Receipt" })).toHaveCount(index + 1)
  }

  return receiptInputCount
}

export default uploadExpenseReceipts
