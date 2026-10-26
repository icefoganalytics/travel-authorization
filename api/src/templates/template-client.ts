import { join } from "path"
import { readFileSync } from "fs"

import { template, type TemplateOptions } from "lodash"

import { TEMPLATE_ROOT_PATH, VUESQUE_TEMPLATE_DELIMINATOR_REGEX } from "@/config"
import generatePdf, { type GeneratePdfOptions } from "@/lib/generate-pdf"

export class TemplateClient {
  constructor(
    private rootPath: string,
    private options: TemplateOptions
  ) {}

  render(templateRelativePath: string, data: Record<string, unknown>) {
    const templatePath = join(this.rootPath, templateRelativePath)
    const templateString = readFileSync(templatePath, "utf8")
    const compiledTemplate = template(templateString, this.options)

    return compiledTemplate(data)
  }

  htmlToPdf(htmlDocument: string, options: GeneratePdfOptions = {}) {
    return generatePdf(htmlDocument, options)
  }

  loadAsset(assetRelativePath: string) {
    const assetPath = join(this.rootPath, assetRelativePath)
    return readFileSync(assetPath, "base64")
  }
}

const templateClient = new TemplateClient(TEMPLATE_ROOT_PATH, {
  interpolate: VUESQUE_TEMPLATE_DELIMINATOR_REGEX,
})

export default templateClient
