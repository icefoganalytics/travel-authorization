import db from "@/integrations/trav-com-integration/db/db-client"

export { type ArInvoiceNoHealthRaw } from "./accounts-receivable-invoice"
export { type ArInvoiceDetailNoHealthRaw } from "./accounts-receivable-invoice-detail"
export { type CityRaw } from "./city"
export { type SegmentNoHealthRaw } from "./segment"

import AccountsReceivableInvoice from "./accounts-receivable-invoice"
import AccountsReceivableInvoiceDetail from "./accounts-receivable-invoice-detail"
import City from "./city"
import Segment from "./segment"

db.addModels([AccountsReceivableInvoice, AccountsReceivableInvoiceDetail])

AccountsReceivableInvoice.establishScopes()
AccountsReceivableInvoiceDetail.establishScopes()

City.establishAssociations()
Segment.establishAssociations()

export {
  AccountsReceivableInvoice,
  AccountsReceivableInvoiceDetail,
  City,
  Segment,
  // add additional models as needed
}

export default db
