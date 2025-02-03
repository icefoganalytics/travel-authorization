import db from "@/integrations/trav-com-integration/db/db-client"

export { type ArInvoiceNoHealthRaw } from "./accounts-receivable-invoice"
export { type ArInvoiceDetailNoHealthRaw } from "./ar-invoice-detail"
export { type Segment, type SegmentNoHealthRaw } from "./segments"

import AccountsReceivableInvoice from "./accounts-receivable-invoice"
import ArInvoiceDetail from "./ar-invoice-detail"

AccountsReceivableInvoice.establishAssociations()
ArInvoiceDetail.establishAssociations()

export {
  AccountsReceivableInvoice,
  ArInvoiceDetail,
  // add additional models as needed
}

export default db
