import { Knex } from "knex"
import { isEmpty, isNil } from "lodash"
import { DateTime } from "luxon"

const TARGET_TYPE = "TravelDeskTravelRequest"

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable("travel_desk_travel_requests", (table) => {
    table.string("invoice_number", 255).nullable()
  })

  await knex.raw(/* sql */ `
    UPDATE "travel_desk_travel_requests"
    SET
      "invoice_number" = "travel_desk_passenger_name_record_documents"."invoice_number"
    FROM
      "travel_desk_passenger_name_record_documents"
    WHERE
      "travel_desk_passenger_name_record_documents"."travel_desk_travel_request_id" = "travel_desk_travel_requests"."id"
      AND "travel_desk_passenger_name_record_documents"."invoice_number" IS NOT NULL
  `)

  const passengerNameRecordDocumentIds = await knex("travel_desk_passenger_name_record_documents")
    .select<{ id: number }[]>("id")
    .whereNotNull("pnr_document")
    .whereNotNull("invoice_number")

  for (const { id } of passengerNameRecordDocumentIds) {
    const passengerNameRecordDocument = await knex("travel_desk_passenger_name_record_documents")
      .select(
        "travel_desk_passenger_name_record_documents.travel_desk_travel_request_id as travelDeskTravelRequestId",
        "travel_desk_passenger_name_record_documents.invoice_number as invoiceNumber",
        "travel_desk_passenger_name_record_documents.pnr_document as pnrDocument",
        "travel_desk_passenger_name_record_documents.created_at as createdAt",
        "travel_desk_passenger_name_record_documents.updated_at as updatedAt",
        "travel_desk_travel_requests.legal_last_name as legalLastName"
      )
      .join(
        "travel_desk_travel_requests",
        "travel_desk_travel_requests.id",
        "travel_desk_passenger_name_record_documents.travel_desk_travel_request_id"
      )
      .where("travel_desk_passenger_name_record_documents.id", id)
      .first<{
        travelDeskTravelRequestId: number
        invoiceNumber: string
        pnrDocument: Buffer
        createdAt: Date
        updatedAt: Date
        legalLastName: string
      }>()

    const {
      travelDeskTravelRequestId,
      invoiceNumber,
      pnrDocument,
      createdAt,
      updatedAt,
      legalLastName,
    } = passengerNameRecordDocument

    const content = decodeDataUrl(pnrDocument)
    const { mimeType, extension } = await determineMimeTypeAndExtension(content)

    const name = buildFileName(legalLastName, invoiceNumber, createdAt, extension)

    await knex("attachments").insert({
      target_id: travelDeskTravelRequestId,
      target_type: TARGET_TYPE,
      name,
      size: content.length,
      content,
      mime_type: mimeType,
      created_at: createdAt,
      updated_at: updatedAt,
    })

    console.log(`Migrated PNR document for travel request ${travelDeskTravelRequestId}`)
  }

  await knex.schema.dropTableIfExists("travel_desk_passenger_name_record_documents")
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.createTable("travel_desk_passenger_name_record_documents", (table) => {
    table.increments("id").primary()
    table.integer("travel_desk_travel_request_id").notNullable()
    table.binary("pnr_document")
    table.string("invoice_number", 255)
    table.timestamp("created_at", { useTz: true }).notNullable().defaultTo(knex.fn.now())
    table.timestamp("updated_at", { useTz: true }).notNullable().defaultTo(knex.fn.now())

    table
      .foreign("travel_desk_travel_request_id")
      .references("id")
      .inTable("travel_desk_travel_requests")
      .onDelete("CASCADE")

    table.unique("travel_desk_travel_request_id", {
      indexName: "travel_desk_pnr_documents_travel_desk_travel_request_id_unique",
    })
  })

  await knex.raw(/* sql */ `
    INSERT INTO
      "travel_desk_passenger_name_record_documents" (
        "travel_desk_travel_request_id",
        "pnr_document",
        "invoice_number",
        "created_at",
        "updated_at"
      )
    SELECT
      "attachments"."target_id",
      "attachments"."content",
      "travel_desk_travel_requests"."invoice_number",
      "attachments"."created_at",
      "attachments"."updated_at"
    FROM
      "attachments"
      JOIN "travel_desk_travel_requests" ON "travel_desk_travel_requests"."id" = "attachments"."target_id"
    WHERE
      "attachments"."target_type" = '${TARGET_TYPE}'
      AND "attachments"."deleted_at" IS NULL
  `)

  await knex("attachments").where({ target_type: TARGET_TYPE }).delete()

  await knex.schema.alterTable("travel_desk_travel_requests", (table) => {
    table.dropColumn("invoice_number")
  })
}

const DATA_URL_REGEX = /^data:[^;]+;base64,/

function decodeDataUrl(content: Buffer): Buffer {
  const contentString = content.toString("utf8")
  if (!DATA_URL_REGEX.test(contentString)) {
    return content
  }

  const base64Data = contentString.replace(DATA_URL_REGEX, "")
  return Buffer.from(base64Data, "base64")
}

async function determineMimeTypeAndExtension(
  content: Buffer
): Promise<{ mimeType: string; extension: string }> {
  const { fileTypeFromBuffer } = await import("file-type")

  // Convert Buffer to Uint8Array to satisfy file-type's type requirements
  // Buffer extends Uint8Array but has incompatible ArrayBufferLike vs ArrayBuffer types
  const fileTypeResult = await fileTypeFromBuffer(new Uint8Array(content))
  if (isNil(fileTypeResult)) {
    return {
      mimeType: "application/octet-stream",
      extension: "",
    }
  }

  return {
    mimeType: fileTypeResult.mime,
    extension: fileTypeResult.ext,
  }
}

function buildFileName(
  legalLastName: string,
  invoiceNumber: string,
  createdAt: Date,
  extension: string
): string {
  const date = DateTime.fromJSDate(createdAt).toFormat("yyyy-MM-dd")
  const baseName = `Passenger Name Record, ${legalLastName} - ${invoiceNumber}, ${date}`

  if (isEmpty(extension)) {
    return baseName
  }

  return `${baseName}.${extension}`
}
