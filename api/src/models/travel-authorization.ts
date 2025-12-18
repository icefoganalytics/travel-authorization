import {
  DataTypes,
  Op,
  type CreationOptional,
  type InferAttributes,
  type InferCreationAttributes,
  type NonAttribute,
} from "@sequelize/core"
import {
  Attribute,
  AutoIncrement,
  BelongsTo,
  Default,
  HasMany,
  HasOne,
  NotNull,
  PrimaryKey,
  Table,
  Unique,
  ValidateAttribute,
} from "@sequelize/core/decorators-legacy"
import { DateTime } from "luxon"

import BaseModel from "@/models/base-model"
import Expense from "@/models/expense"
import Stop from "@/models/stop"
import TravelAuthorizationPreApprovalProfile from "@/models/travel-authorization-pre-approval-profile"
import TravelDeskTravelRequest from "@/models/travel-desk-travel-request"
import TravelPurpose from "@/models/travel-purpose"
import TravelSegment from "@/models/travel-segment"
import User from "@/models/user"

import {
  buildIsTravellingQuery,
  buildIsUpcomingTravelQuery,
  buildIsBeforeTripEndQuery,
} from "@/queries/travel-authorizations"

// TODO: state management is going to be a bit deal for this project
// we should do some aggressive data modeling an engineering before this becomes unmagable
// Statuses are sorted by presumed order of progression
export enum TravelAuthorizationStatuses {
  // TODO: might want replace DELETED status with `deleted_at` field from Sequelize paranoid feature.
  // See https://sequelize.org/docs/v6/core-concepts/paranoid/
  DRAFT = "draft",
  SUBMITTED = "submitted",
  CHANGE_REQUESTED = "change_requested",
  APPROVED = "approved",
  BOOKED = "booked",
  DENIED = "denied",
  EXPENSE_CLAIM_SUBMITTED = "expense_claim_submitted",
  EXPENSE_CLAIM_APPROVED = "expense_claim_approved",
  EXPENSE_CLAIM_DENIED = "expense_claim_denied",
  EXPENSED = "expensed",
  AWAITING_DIRECTOR_APPROVAL = "awaiting_director_approval",
  DELETED = "deleted",
}

export enum TravelAuthorizationTripTypes {
  ROUND_TRIP = "round_trip",
  ONE_WAY = "one_way",
  MULTI_CITY = "multi_city",
}

export enum TravelAuthorizationWizardStepNames {
  EDIT_PURPOSE_DETAILS = "edit-purpose-details",
  EDIT_TRIP_DETAILS = "edit-trip-details",
  GENERATE_ESTIMATE = "generate-estimate",
  SUBMIT_TO_SUPERVISOR = "submit-to-supervisor",
  AWAITING_SUPERVISOR_APPROVAL = "awaiting-supervisor-approval",
  EDIT_TRAVELLER_DETAILS = "edit-traveller-details",
  SUBMIT_TO_TRAVEL_DESK = "submit-to-travel-desk",
  AWAITING_FLIGHT_OPTIONS = "awaiting-flight-options",
  RANK_FLIGHT_OPTIONS = "rank-flight-options",
  AWAITING_BOOKING_CONFIRMATION = "awaiting-booking-confirmation",
  AWAITING_TRAVEL_START = "awaiting-travel-start",
  CONFIRM_ACTUAL_TRAVEL_DETAILS = "confirm-actual-travel-details",
  SUBMIT_EXPENSES = "submit-expenses",
  AWAITING_EXPENSE_CLAIM_APPROVAL = "awaiting-expense-claim-approval",
  AWAITING_FINANCE_REVIEW_AND_PROCESSING = "awaiting-finance-review-and-processing",
  REVIEW_EXPENSES = "review-expenses",
}

@Table({
  paranoid: false,
})
export class TravelAuthorization extends BaseModel<
  InferAttributes<TravelAuthorization>,
  InferCreationAttributes<TravelAuthorization>
> {
  static readonly Statuses = TravelAuthorizationStatuses
  static readonly TripTypes = TravelAuthorizationTripTypes
  static readonly WizardStepNames = TravelAuthorizationWizardStepNames

  @Attribute(DataTypes.INTEGER)
  @PrimaryKey
  @AutoIncrement
  declare id: CreationOptional<number>

  @Attribute(DataTypes.STRING)
  @NotNull
  @Unique
  declare slug: string

  // TODO: consider renaming this to requestorId?
  @Attribute(DataTypes.INTEGER)
  @NotNull
  declare userId: number

  @Attribute(DataTypes.INTEGER)
  declare preApprovalProfileId: number | null

  @Attribute(DataTypes.INTEGER)
  declare purposeId: number | null

  @Attribute(DataTypes.STRING(255))
  declare firstName: string | null

  @Attribute(DataTypes.STRING(255))
  declare lastName: string | null

  @Attribute(DataTypes.STRING(255))
  declare department: string | null

  @Attribute(DataTypes.STRING(255))
  declare division: string | null

  @Attribute(DataTypes.STRING(255))
  declare branch: string | null

  @Attribute(DataTypes.STRING(255))
  declare unit: string | null

  @Attribute({
    type: DataTypes.STRING(255),
    set(value: string | null) {
      if (typeof value === "string") {
        this.setDataValue("email", value.toLowerCase())
      } else {
        this.setDataValue("email", null)
      }
    },
  })
  declare email: string | null

  @Attribute(DataTypes.STRING(255))
  declare mailcode: string | null

  @Attribute(DataTypes.INTEGER)
  declare daysOffTravelStatusEstimate: number | null

  @Attribute(DataTypes.INTEGER)
  declare daysOffTravelStatusActual: number | null

  @Attribute(DataTypes.DATEONLY)
  declare dateBackToWorkEstimate: Date | string | null // DATEONLY accepts Date or string, but returns string

  @Attribute(DataTypes.DATEONLY)
  declare dateBackToWorkActual: Date | string | null // DATEONLY accepts Date or string, but returns string

  @Attribute(DataTypes.INTEGER)
  declare travelDurationEstimate: number | null

  @Attribute(DataTypes.INTEGER)
  declare travelDurationActual: number | null

  @Attribute(DataTypes.INTEGER)
  declare travelAdvance: number | null

  @Attribute(DataTypes.STRING(255))
  declare eventName: string | null

  @Attribute(DataTypes.STRING(255))
  declare summary: string | null

  @Attribute(DataTypes.STRING(2000))
  declare benefits: string | null

  // TODO: make this non-nullable in the database then update here.
  @Attribute(DataTypes.STRING(255))
  @ValidateAttribute({
    isIn: {
      args: [Object.values(TravelAuthorizationStatuses)],
      msg: `Status must be one of: ${Object.values(TravelAuthorizationStatuses).join(", ")}`,
    },
  })
  declare status: TravelAuthorizationStatuses | null

  @Attribute(DataTypes.STRING(255))
  declare wizardStepName: string | null

  // TODO: consider making this supervisorId?
  @Attribute(DataTypes.STRING(255))
  declare supervisorEmail: string | null

  @Attribute(DataTypes.STRING(255))
  declare requestChange: string | null

  @Attribute(DataTypes.STRING(2000))
  declare denialReason: string | null

  @Attribute(DataTypes.STRING(255))
  @ValidateAttribute({
    isIn: {
      args: [Object.values(TravelAuthorizationTripTypes)],
      msg: `Trip type must be one of: ${Object.values(TravelAuthorizationTripTypes).join(", ")}`,
    },
  })
  declare tripTypeEstimate: TravelAuthorizationTripTypes | null

  @Attribute(DataTypes.STRING(255))
  @ValidateAttribute({
    isIn: {
      args: [Object.values(TravelAuthorizationTripTypes)],
      msg: `Trip type must be one of: ${Object.values(TravelAuthorizationTripTypes).join(", ")}`,
    },
  })
  declare tripTypeActual: TravelAuthorizationTripTypes | null

  // TODO: make this a foreign key to the users table
  // also non-nullable,
  // maybe rename to creatorId
  @Attribute(DataTypes.INTEGER)
  declare createdBy: number | null

  @Attribute(DataTypes.INTEGER)
  declare travelAdvanceInCents: number | null

  @Attribute(DataTypes.BOOLEAN)
  declare allTravelWithinTerritory: boolean | null

  @Attribute(DataTypes.DATE)
  @NotNull
  @Default(DataTypes.NOW)
  declare createdAt: CreationOptional<Date>

  @Attribute(DataTypes.DATE)
  @NotNull
  @Default(DataTypes.NOW)
  declare updatedAt: CreationOptional<Date>

  // Magic methods
  get dateBackToWorkEstimateAsString(): NonAttribute<string | null> {
    if (this.dateBackToWorkEstimate instanceof Date) {
      return DateTime.fromJSDate(this.dateBackToWorkEstimate).toFormat("yyyy-LL-dd")
    }

    return this.dateBackToWorkEstimate
  }

  get dateBackToWorkActualAsString(): NonAttribute<string | null> {
    if (this.dateBackToWorkActual instanceof Date) {
      return DateTime.fromJSDate(this.dateBackToWorkActual).toFormat("yyyy-LL-dd")
    }

    return this.dateBackToWorkActual
  }

  get tripType(): NonAttribute<TravelAuthorizationTripTypes | null> {
    return this.tripTypeActual ?? this.tripTypeEstimate
  }

  // Associations
  @BelongsTo(() => TravelAuthorizationPreApprovalProfile, {
    foreignKey: "preApprovalProfileId",
    inverse: {
      as: "travelAuthorizations",
      type: "hasMany",
    },
  })
  declare preApprovalProfile?: NonAttribute<TravelAuthorizationPreApprovalProfile>

  @BelongsTo(() => TravelPurpose, {
    foreignKey: "purposeId",
    inverse: {
      as: "travelAuthorizations",
      type: "hasMany",
    },
  })
  declare purpose?: NonAttribute<TravelPurpose>

  @BelongsTo(() => User, {
    foreignKey: "userId",
    inverse: {
      as: "travelAuthorizations",
      type: "hasMany",
    },
  })
  declare user?: NonAttribute<User>

  @HasOne(() => TravelDeskTravelRequest, {
    foreignKey: {
      name: "travelAuthorizationId",
      onDelete: "CASCADE",
    },
    inverse: "travelAuthorization",
  })
  declare travelDeskTravelRequest?: NonAttribute<TravelDeskTravelRequest>

  @HasMany(() => Expense, {
    foreignKey: "travelAuthorizationId",
    inverse: "travelAuthorization",
  })
  declare expenses?: NonAttribute<Expense[]>

  @HasMany(() => Stop, {
    foreignKey: "travelAuthorizationId",
    inverse: "travelAuthorization",
  })
  declare stops?: NonAttribute<Stop[]>

  @HasMany(() => TravelSegment, {
    foreignKey: {
      name: "travelAuthorizationId",
      onDelete: "CASCADE",
    },
    inverse: "travelAuthorization",
  })
  declare travelSegments?: NonAttribute<TravelSegment[]>

  @HasMany(() => TravelSegment, {
    foreignKey: {
      name: "travelAuthorizationId",
      onDelete: "CASCADE",
    },
    inverse: "travelAuthorization",
    scope: {
      isActual: true,
    },
  })
  declare travelSegmentActuals?: NonAttribute<TravelSegment[]>

  @HasMany(() => TravelSegment, {
    foreignKey: {
      name: "travelAuthorizationId",
      onDelete: "CASCADE",
    },
    inverse: "travelAuthorization",
    scope: {
      isActual: false,
    },
  })
  declare travelSegmentEstimates?: NonAttribute<TravelSegment[]>

  // Shim until Stop model is fully removed
  buildTravelSegmentsFromStops(): TravelSegment[] {
    if (this.stops === undefined || this.stops.length < 2) {
      throw new Error("Must have at least 2 stops to build a travel segments")
    }

    if (
      this.tripTypeEstimate === TravelAuthorizationTripTypes.MULTI_CITY &&
      this.stops.length < 3
    ) {
      throw new Error("Must have at least 3 stops to build a multi-stop travel segments")
    }

    if (this.tripTypeEstimate === TravelAuthorizationTripTypes.ROUND_TRIP) {
      return this.stops.reduce((travelSegments: TravelSegment[], stop, index, stops) => {
        const isLastStop = index === stops.length - 1
        const arrivalStop = isLastStop ? stops[0] : stops[index + 1]

        const travelSegment = TravelSegment.buildFromStops({
          travelAuthorizationId: this.id,
          departureStop: stop,
          arrivalStop,
          segmentNumber: index + 1,
        })
        travelSegments.push(travelSegment)
        return travelSegments
      }, [])
    }

    return this.stops.reduce((travelSegments: TravelSegment[], stop, index, stops) => {
      const isLastStop = index === stops.length - 1
      if (isLastStop) return travelSegments

      const travelSegment = TravelSegment.buildFromStops({
        travelAuthorizationId: this.id,
        departureStop: stop,
        arrivalStop: stops[index + 1],
        segmentNumber: index + 1,
      })
      travelSegments.push(travelSegment)
      return travelSegments
    }, [])
  }

  get estimates(): NonAttribute<Expense[] | undefined> {
    return this.expenses?.filter((expense) => expense.type === Expense.Types.ESTIMATE)
  }

  static establishScopes(): void {
    this.addScope("asShow", {
      include: [
        "expenses",
        "purpose",
        "stops",
        "travelDeskTravelRequest",
        "travelSegments",
        "user",
      ],
    })
    this.addScope("isTravelling", () => {
      const currentDate = new Date().toISOString()
      return {
        where: {
          id: {
            [Op.in]: buildIsTravellingQuery(),
          },
        },
        replacements: {
          currentDate,
        },
      }
    })
    this.addScope("isUpcomingTravel", () => {
      const currentDate = new Date().toISOString()
      return {
        where: {
          id: {
            [Op.in]: buildIsUpcomingTravelQuery(),
          },
        },
        replacements: {
          currentDate,
        },
      }
    })
    // TODO: consider if I should send the current date from the front-end?
    this.addScope("isBeforeTripEnd", () => {
      const currentDate = new Date().toISOString()
      return {
        where: {
          id: {
            [Op.in]: buildIsBeforeTripEndQuery(),
          },
        },
        replacements: {
          currentDate,
        },
      }
    })
  }
}

export default TravelAuthorization
