import { readFileSync } from "node:fs"
import { join } from "node:path"

import { template } from "lodash"

export class TemplateClient {
  constructor(private templateRootPath: string = __dirname) {}

  render(templateRelativePath: string, data: Record<string, unknown>): string {
    const templatePath = join(this.templateRootPath, templateRelativePath)
    const templateSource = readFileSync(templatePath, "utf8")

    return template(templateSource)(data)
  }

  loadAsset(assetRelativePath: string): string {
    const assetPath = join(this.templateRootPath, assetRelativePath)
    return readFileSync(assetPath, "base64")
  }
}

const templateClient = new TemplateClient()

export default templateClient
