import {
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  Model,
  Op,
  type CreationOptional,
  type NonAttribute,
} from "@sequelize/core"
import {
  Attribute,
  AutoIncrement,
  BelongsTo,
  Default,
  NotNull,
  PrimaryKey,
  Index,
} from "@sequelize/core/decorators-legacy"
import { range, sortBy } from "lodash"

import User from "@/models/user"

export const FlightReconciliationReconcilePeriods = Object.freeze(range(1, 13).concat(14)) // 1-12, 14

export class FlightReconciliation extends Model<
  InferAttributes<FlightReconciliation>,
  InferCreationAttributes<FlightReconciliation>
> {
  static readonly ReconcilePeriods = FlightReconciliationReconcilePeriods

  @Attribute(DataTypes.INTEGER)
  @PrimaryKey
  @AutoIncrement
  @NotNull
  declare id: CreationOptional<number>

  @Attribute(DataTypes.INTEGER)
  @NotNull
  declare reconcilerId: number

  // References the external database TravCom -> ARInvoiceDetailsNoHealth -> InvoiceDetailID
  @Attribute(DataTypes.INTEGER)
  @NotNull
  @Index({
    name: "flight_reconciliations_external_trav_com_identifier_unique",
    unique: true,
    where: {
      deletedAt: null,
    },
  })
  declare externalTravComIdentifier: number

  @Attribute(DataTypes.DATE)
  declare invoiceBookingDate: Date | null

  /** NOTE: This field contains mail codes, not department names. Multiple mail codes may map to the same department. */
  @Attribute(DataTypes.STRING(255))
  declare invoiceDepartment: string | null

  @Attribute(DataTypes.DECIMAL(19, 4))
  @NotNull
  declare invoiceDetailSellingFare: number

  @Attribute(DataTypes.STRING(255))
  declare invoiceDetailComputedAgentName: string | null

  @Attribute(DataTypes.STRING(255))
  @NotNull
  declare invoiceDetailVendorName: string

  @Attribute(DataTypes.STRING(255))
  @NotNull
  declare invoiceDetailComputedTravelerFirstName: string

  @Attribute(DataTypes.STRING(255))
  @NotNull
  declare invoiceDetailComputedTravelerLastName: string

  @Attribute(DataTypes.TEXT)
  declare segmentsComputedFlightInfo: string | null

  @Attribute(DataTypes.STRING(255))
  declare segmentsComputedFinalDestination: string | null

  @Attribute(DataTypes.BOOLEAN)
  @NotNull
  @Default(false)
  declare reconciled: CreationOptional<boolean>

  @Attribute({
    type: DataTypes.INTEGER,
    allowNull: true,
    validate: {
      isIn: {
        args: [[...FlightReconciliationReconcilePeriods, null]],
        msg: `Reconcile period must be one of: ${[
          ...FlightReconciliationReconcilePeriods,
          null,
        ].join(", ")}`,
      },
    },
  })
  declare reconcilePeriod: number | null

  @Attribute(DataTypes.DATE)
  @NotNull
  @Default(DataTypes.NOW)
  declare createdAt: CreationOptional<Date>

  @Attribute(DataTypes.DATE)
  @NotNull
  @Default(DataTypes.NOW)
  declare updatedAt: CreationOptional<Date>

  @Attribute(DataTypes.DATE)
  declare deletedAt: Date | null

  // Associations
  @BelongsTo(() => User, {
    foreignKey: "reconcilerId",
    inverse: {
      as: "flightReconciliations",
      type: "hasMany",
    },
  })
  declare reconciler?: NonAttribute<User>

  static establishScopes(): void {
    this.addScope("invoiceBookingDateBetween", ([date1, date2]: [string, string]) => {
      const [startDate, endDate] = sortBy([date1, date2])
      return {
        where: {
          invoiceBookingDate: {
            [Op.gte]: startDate,
            [Op.lte]: endDate,
          },
        },
      }
    })
  }
}

export default FlightReconciliation
