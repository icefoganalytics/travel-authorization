import { Knex } from "knex"
import crypto from "crypto"

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable("travel_authorization_pre_approval_documents", (table) => {
    table.string("name")
    table.string("mime_type")
    table.integer("size_in_bytes")
    table.string("md5")
  })

  // Required to make file-type work with typescript non-module
  // Knex does not recognize .mts file extension
  const { fileTypeFromBuffer } = await import("file-type")

  const batchSize = 10 // Only load a few files at a time to avoid memory issues
  let offset = 0
  let hasMore = true

  while (hasMore) {
    const documents = await knex("travel_authorization_pre_approval_documents")
      .select("id", "approval_document")
      .orderBy("id")
      .limit(batchSize)
      .offset(offset)

    if (documents.length === 0) {
      hasMore = false
      break
    }

    for (const document of documents) {
      const buffer = document.approval_document
      if (!buffer) continue

      const type = await fileTypeFromBuffer(buffer)
      const md5 = crypto.createHash("md5").update(buffer).digest("hex")
      const size = buffer.length

      const fallbackExt = "bin"
      const fallbackMime = "application/octet-stream"
      const extension = type?.ext || fallbackExt
      const fileName = `Approval Document.${extension}`
      const mimeType = type?.mime || fallbackMime

      await knex("travel_authorization_pre_approval_documents").where({ id: document.id }).update({
        name: fileName,
        mime_type: mimeType,
        size_in_bytes: size,
        md5,
      })
    }

    offset += batchSize
  }

  await knex.schema.alterTable("travel_authorization_pre_approval_documents", (table) => {
    table.string("name").notNullable().alter()
    table.string("mime_type").notNullable().alter()
    table.integer("size_in_bytes").notNullable().alter()
    table.string("md5").notNullable().alter()
  })
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable("travel_authorization_pre_approval_documents", (table) => {
    table.dropColumn("name")
    table.dropColumn("mime_type")
    table.dropColumn("size_in_bytes")
    table.dropColumn("md5")
  })
}
