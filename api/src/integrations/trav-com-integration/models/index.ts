import db from "@/integrations/trav-com-integration/db/db-client"

export { type ArInvoiceNoHealthRaw } from "./accounts-receivable-invoice"
export { type ArInvoiceDetailNoHealthRaw } from "./accounts-receivable-invoice-detail"
export { type Segment, type SegmentNoHealthRaw } from "./segments"

import AccountsReceivableInvoice from "./accounts-receivable-invoice"
import AccountsReceivableInvoiceDetail from "./accounts-receivable-invoice-detail"

AccountsReceivableInvoice.establishAssociations()
AccountsReceivableInvoiceDetail.establishAssociations()

export {
  AccountsReceivableInvoice,
  AccountsReceivableInvoiceDetail,
  // add additional models as needed
}

export default db
