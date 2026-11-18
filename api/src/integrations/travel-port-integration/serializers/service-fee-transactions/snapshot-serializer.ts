import { ServiceFeeTransaction } from "@/integrations/travel-port-integration/models"
import BaseSerializer from "@/serializers/base-serializer"

export class SnapshotSerializer extends BaseSerializer<ServiceFeeTransaction> {
  perform() {
    return {
      TravelOrderIdentifier: this.record.travelOrderIdentifier,
      SFActiveVoidStatus: this.record.activeVoidStatus,
      SFDocumentNbr: this.record.serviceFeeDocumentNumber,
      NameOnServiceFee: this.record.nameOnServiceFee,
      SFIssueDate: this.record.issueDate,
      SFCurrencyCode: this.record.currencyCode,
      ServiceFeeAmount: this.record.serviceFeeAmount,
      SFCommissionAmount: this.record.commissionAmount,
      RelatedTicketDocumentNbr: this.record.relatedTicketDocumentNumber,
      RelatedInvoiceNbr: this.record.relatedInvoiceNumber,
      RecordLocator: this.record.recordLocator,
    }
  }
}

export default SnapshotSerializer
