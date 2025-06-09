import {
  Association,
  CreationOptional,
  DataTypes,
  ForeignKey,
  InferAttributes,
  InferCreationAttributes,
  Model,
  NonAttribute,
  Op,
} from "sequelize"
import { DateTime } from "luxon"

import sequelize from "@/db/db-client"

import Expense from "@/models/expense"
import TravelAuthorizationPreApprovalProfile from "@/models/travel-authorization-pre-approval-profile"
import Stop from "@/models/stop"
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
  REVIEW_EXPENSES = "review-expenses",
}

export class TravelAuthorization extends Model<
  InferAttributes<TravelAuthorization>,
  InferCreationAttributes<TravelAuthorization>
> {
  static readonly Statuses = TravelAuthorizationStatuses
  static readonly TripTypes = TravelAuthorizationTripTypes
  static readonly WizardStepNames = TravelAuthorizationWizardStepNames

  declare id: CreationOptional<number>
  declare slug: string
  declare userId: ForeignKey<User["id"]>
  declare preApprovalProfileId: ForeignKey<TravelAuthorizationPreApprovalProfile["id"]> | null
  declare purposeId: ForeignKey<TravelPurpose["id"]> | null
  declare firstName: string | null
  declare lastName: string | null
  declare department: string | null
  declare division: string | null
  declare branch: string | null
  declare unit: string | null
  declare email: string | null
  declare mailcode: string | null
  declare daysOffTravelStatusEstimate: number | null
  declare daysOffTravelStatusActual: number | null
  declare dateBackToWorkEstimate: Date | string | null // DATEONLY accepts Date or string, but returns string
  declare dateBackToWorkActual: Date | string | null // DATEONLY accepts Date or string, but returns string
  declare travelDurationEstimate: number | null
  declare travelDurationActual: number | null
  declare travelAdvance: number | null
  declare eventName: string | null
  declare summary: string | null
  declare benefits: string | null
  declare status: TravelAuthorizationStatuses | null
  declare wizardStepName: string | null
  // TODO: consider making this supervisorId?
  declare supervisorEmail: string | null
  declare requestChange: string | null
  declare denialReason: string | null
  declare tripTypeEstimate: TravelAuthorizationTripTypes | null
  declare tripTypeActual: TravelAuthorizationTripTypes | null
  declare createdBy: number | null
  declare travelAdvanceInCents: number | null
  declare allTravelWithinTerritory: boolean | null
  declare createdAt: CreationOptional<Date>
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

  // Associations
  declare preApprovalProfile?: NonAttribute<TravelAuthorizationPreApprovalProfile>
  declare purpose?: NonAttribute<TravelPurpose>
  declare travelDeskTravelRequest?: NonAttribute<TravelDeskTravelRequest>
  declare user?: NonAttribute<User>
  declare expenses?: NonAttribute<Expense[]>
  declare stops?: NonAttribute<Stop[]>
  declare travelSegments?: NonAttribute<TravelSegment[]>
  declare travelSegmentActuals?: NonAttribute<TravelSegment[]>
  declare travelSegmentEstimates?: NonAttribute<TravelSegment[]>

  declare static associations: {
    expenses: Association<TravelAuthorization, Expense>
    preApprovalProfile: Association<TravelAuthorization, TravelAuthorizationPreApprovalProfile>
    purpose: Association<TravelAuthorization, TravelPurpose>
    stops: Association<TravelAuthorization, Stop>
    travelDeskTravelRequest: Association<TravelAuthorization, TravelDeskTravelRequest>
    travelSegments: Association<TravelAuthorization, TravelSegment>
    travelSegmentActuals: Association<TravelAuthorization, TravelSegment>
    travelSegmentEstimates: Association<TravelAuthorization, TravelSegment>
    user: Association<TravelAuthorization, User>
  }

  static establishAssociations() {
    this.belongsTo(TravelAuthorizationPreApprovalProfile, {
      as: "preApprovalProfile",
      foreignKey: "preApprovalProfileId",
    })
    this.belongsTo(TravelPurpose, {
      as: "purpose",
      foreignKey: "purposeId",
    })
    this.belongsTo(User, {
      as: "user",
      foreignKey: "userId",
    })
    this.hasOne(TravelDeskTravelRequest, {
      as: "travelDeskTravelRequest",
      sourceKey: "id",
      foreignKey: "travelAuthorizationId",
    })
    this.hasMany(Expense, {
      as: "expenses",
      sourceKey: "id",
      foreignKey: "travelAuthorizationId",
    })
    this.hasMany(Stop, {
      as: "stops",
      sourceKey: "id",
      foreignKey: "travelAuthorizationId",
    })
    this.hasMany(TravelSegment, {
      as: "travelSegments",
      sourceKey: "id",
      foreignKey: "travelAuthorizationId",
    })
    this.hasMany(TravelSegment, {
      as: "travelSegmentActuals",
      sourceKey: "id",
      foreignKey: "travelAuthorizationId",
      scope: {
        isActual: true,
      },
    })
    this.hasMany(TravelSegment, {
      as: "travelSegmentEstimates",
      sourceKey: "id",
      foreignKey: "travelAuthorizationId",
      scope: {
        isActual: false,
      },
    })
  }

  // Shim until Stop model is fully removed
  buildTravelSegmentsFromStops(): TravelSegment[] {
    if (this.stops === undefined || this.stops.length < 2) {
      throw new Error("Must have at least 2 stops to build a travel segments")
    }

    if (this.tripTypeEstimate === TravelAuthorizationTripTypes.MULTI_CITY && this.stops.length < 3) {
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
}

TravelAuthorization.init(
  {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    slug: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
    },
    preApprovalProfileId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: TravelAuthorizationPreApprovalProfile,
        key: "id",
      },
    },
    purposeId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: TravelPurpose,
        key: "id",
      },
    },
    // TODO: consider renaming this to requestorId?
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: User,
        key: "id",
      },
    },
    firstName: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    lastName: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    department: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    division: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    branch: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    unit: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: true,
      set(value: string | null) {
        if (typeof value === "string") {
          this.setDataValue("email", value.toLowerCase())
        } else {
          this.setDataValue("email", null)
        }
      },
    },
    mailcode: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    daysOffTravelStatusEstimate: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    daysOffTravelStatusActual: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    dateBackToWorkEstimate: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    dateBackToWorkActual: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    travelDurationEstimate: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    travelDurationActual: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    travelAdvance: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    eventName: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    summary: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    benefits: {
      type: DataTypes.STRING(2000),
      allowNull: true,
    },
    status: {
      type: DataTypes.STRING(255),
      allowNull: true, // TODO: make this non-nullable in the database then update here.
      validate: {
        isIn: {
          args: [Object.values(TravelAuthorizationStatuses)],
          msg: `Status must be one of: ${Object.values(TravelAuthorizationStatuses).join(", ")}`,
        },
      },
    },
    wizardStepName: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    supervisorEmail: {
      type: DataTypes.STRING(255),
      allowNull: true,
      set(value: string | null) {
        if (typeof value === "string") {
          this.setDataValue("supervisorEmail", value.toLowerCase())
        } else {
          this.setDataValue("supervisorEmail", null)
        }
      },
    },
    requestChange: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    denialReason: {
      type: DataTypes.STRING(2000),
      allowNull: true,
    },
    tripTypeEstimate: {
      type: DataTypes.STRING(255),
      allowNull: true,
      validate: {
        isIn: {
          args: [Object.values(TravelAuthorizationTripTypes)],
          msg: `Trip Type must be one of: ${Object.values(TravelAuthorizationTripTypes).join(", ")}`,
        },
      },
    },
    tripTypeActual: {
      type: DataTypes.STRING(255),
      allowNull: true,
      validate: {
        isIn: {
          args: [Object.values(TravelAuthorizationTripTypes)],
          msg: `Trip Type must be one of: ${Object.values(TravelAuthorizationTripTypes).join(", ")}`,
        },
      },
    },
    // TODO: make this a foreign key to the users table
    // also non-nullable,
    // maybe rename to creatorId
    createdBy: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    travelAdvanceInCents: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    allTravelWithinTerritory: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    paranoid: false,
    scopes: {
      isTravelling() {
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
      },
      isUpcomingTravel() {
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
      },
      // TODO: consider if I should send the current date from the front-end?
      isBeforeTripEnd() {
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
      },
    },
  }
)

export default TravelAuthorization
