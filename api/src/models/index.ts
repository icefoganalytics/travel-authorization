import db from "@/db/db-client"

import DistanceMatrix from "./distance-matrix"
import Expense from "./expense"
import FlightReconciliation from "./flight-reconciliation"
import GeneralLedgerCoding from "./general-ledger-coding"
import Location from "./location"
import PerDiem from "./per-diem"
import Role from "./role"
import Stop from "./stop"
import TravelAllowance from "./travel-allowance"
import TravelAuthorization from "./travel-authorization"
import TravelAuthorizationActionLog from "./travel-authorization-action-log"
import TravelAuthorizationPreApproval from "./travel-authorization-pre-approval"
import TravelAuthorizationPreApprovalDocument from "./travel-authorization-pre-approval-document"
import TravelAuthorizationPreApprovalProfile from "./travel-authorization-pre-approval-profile"
import TravelAuthorizationPreApprovalSubmission from "./travel-authorization-pre-approval-submission"
import TravelDeskFlightOption from "./travel-desk-flight-option"
import TravelDeskFlightRequest from "./travel-desk-flight-request"
import TravelDeskFlightSegment from "./travel-desk-flight-segment"
import TravelDeskHotel from "./travel-desk-hotel"
import TravelDeskOtherTransportation from "./travel-desk-other-transportation"
import TravelDeskPassengerNameRecordDocument from "./travel-desk-passenger-name-record-document"
import TravelDeskQuestion from "./travel-desk-question"
import TravelDeskRentalCar from "./travel-desk-rental-car"
import TravelDeskTravelAgency from "./travel-desk-travel-agency"
import TravelDeskTravelRequest from "./travel-desk-travel-request"
import TravelPurpose from "./travel-purpose"
import TravelSegment from "./travel-segment"
import User from "./user"
import YgEmployee from "./yg-employee"
import YgEmployeeGroup from "./yg-employee-groups"

db.addModels([
  DistanceMatrix,
  Expense,
  FlightReconciliation,
  GeneralLedgerCoding,
  Location,
  PerDiem,
  Role,
  Stop,
  TravelAllowance,
  TravelAuthorizationActionLog,
  TravelAuthorizationPreApprovalDocument,
])

DistanceMatrix.establishScopes()
Expense.establishScopes()
FlightReconciliation.establishScopes()
GeneralLedgerCoding.establishScopes()
Location.establishScopes()
PerDiem.establishScopes()
Stop.establishScopes()
TravelAllowance.establishScopes()
TravelAuthorizationActionLog.establishScopes()
TravelAuthorizationPreApprovalDocument.establishScopes()

TravelAuthorization.establishAssociations()
TravelAuthorizationPreApproval.establishAssociations()
TravelAuthorizationPreApprovalProfile.establishAssociations()
TravelAuthorizationPreApprovalSubmission.establishAssociations()
TravelDeskFlightOption.establishAssociations()
TravelDeskFlightRequest.establishAssociations()
TravelDeskFlightSegment.establishAssociations()
TravelDeskHotel.establishAssociations()
TravelDeskOtherTransportation.establishAssociations()
TravelDeskPassengerNameRecordDocument.establishAssociations()
TravelDeskQuestion.establishAssociations()
TravelDeskRentalCar.establishAssociations()
TravelDeskTravelAgency.establishAssociations()
TravelDeskTravelRequest.establishAssociations()
TravelSegment.establishAssociations()
User.establishAssociations()

export {
  DistanceMatrix,
  Expense,
  FlightReconciliation,
  GeneralLedgerCoding,
  Location,
  PerDiem,
  Role,
  Stop,
  TravelAllowance,
  TravelAuthorization,
  TravelAuthorizationActionLog,
  TravelAuthorizationPreApproval,
  TravelAuthorizationPreApprovalDocument,
  TravelAuthorizationPreApprovalProfile,
  TravelAuthorizationPreApprovalSubmission,
  TravelDeskFlightOption,
  TravelDeskFlightRequest,
  TravelDeskFlightSegment,
  TravelDeskHotel,
  TravelDeskOtherTransportation,
  TravelDeskPassengerNameRecordDocument,
  TravelDeskQuestion,
  TravelDeskRentalCar,
  TravelDeskTravelAgency,
  TravelDeskTravelRequest,
  TravelPurpose,
  TravelSegment,
  User,
  YgEmployee,
  YgEmployeeGroup,
}

// special db instance that has access to all models.
export default db
