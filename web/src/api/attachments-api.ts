import http from "@/api/http-client"

import {
  type FiltersOptions,
  type Policy,
  type QueryOptions,
  type WhereOptions,
} from "@/api/base-api"

/** Keep in sync with api/src/models/attachment.ts */
export type Attachment = {
  id: number
  targetId: number
  targetType: string
  name: string
  size: number
  content: string
  mimeType: string
  createdAt: string
  updatedAt: string
}

export type AttachmentAsReference = Omit<Attachment, "content">

export type AttachmentWhereOptions = WhereOptions<
  Attachment,
  "id" | "targetId" | "targetType" | "name" | "size" | "mimeType"
>

export type AttachmentFiltersOptions = FiltersOptions<{
  withoutContent: boolean
}>

export type AttachmentQueryOptions = QueryOptions<AttachmentWhereOptions, AttachmentFiltersOptions>

// NOTE: not implemented in back-end yet
export const attachmentsApi = {
  async list(params: AttachmentQueryOptions = {}): Promise<{
    attachments: Attachment[]
    totalCount: number
  }> {
    const { data } = await http.get("/api/attachments", { params })
    return data
  },
  async get(attachmentId: number): Promise<{
    attachment: Attachment
    policy: Policy
  }> {
    const { data } = await http.get(`/api/attachments/${attachmentId}`)
    return data
  },
  async create(attributes: Partial<Attachment>): Promise<{
    attachment: Attachment
  }> {
    // TODO: support form data file upload
    // e.g.
    // const formData = new FormData()
    // formData.append("content", file)
    // const { data } = await http.post(`/api/attachments/${attachmentId}`, formData, {
    //   headers: {
    //     "Content-Type": "multipart/form-data",
    //   },
    // })
    const { data } = await http.post("/api/attachments", attributes)
    return data
  },
  async update(
    attachmentId: number,
    attributes: Partial<Attachment>
  ): Promise<{
    attachment: Attachment
    policy: Policy
  }> {
    const { data } = await http.patch(`/api/attachments/${attachmentId}`, attributes)
    return data
  },
  async delete(attachmentId: number): Promise<void> {
    const { data } = await http.delete(`/api/attachments/${attachmentId}`)
    return data
  },
}

export default attachmentsApi
