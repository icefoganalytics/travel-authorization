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
  NotNull,
  PrimaryKey,
} from "@sequelize/core/decorators-legacy"

import BaseModel from "@/models/base-model"
import TravelAuthorization from "@/models/travel-authorization"
import TravelAuthorizationPreApproval from "@/models/travel-authorization-pre-approval"

export class TravelAuthorizationPreApprovalProfile extends BaseModel<
  InferAttributes<TravelAuthorizationPreApprovalProfile>,
  InferCreationAttributes<TravelAuthorizationPreApprovalProfile>
> {
  @PrimaryKey
  @AutoIncrement
  @Attribute(DataTypes.INTEGER)
  declare id: CreationOptional<number>

  @Attribute(DataTypes.INTEGER)
  @NotNull
  declare preApprovalId: number

  @Attribute(DataTypes.STRING(255))
  @NotNull
  declare profileName: string

  @Attribute(DataTypes.STRING(255))
  @NotNull
  declare department: string

  @Attribute(DataTypes.STRING(255))
  declare branch: string | null

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

  @BelongsTo(() => TravelAuthorizationPreApproval, {
    foreignKey: "preApprovalId",
    inverse: {
      as: "profiles",
      type: "hasMany",
    },
  })
  declare preApproval?: NonAttribute<TravelAuthorizationPreApproval>

  @HasMany(() => TravelAuthorization, {
    foreignKey: "preApprovalProfileId",
    inverse: "preApprovalProfile",
  })
  declare travelAuthorizations?: NonAttribute<TravelAuthorization[]>

  static establishScopes(): void {
    // TODO: add better search!
    this.addSearchScope(["profile_name"])
    this.addScope("approved", () => ({
      include: [
        {
          association: "preApproval",
          where: {
            status: TravelAuthorizationPreApproval.Statuses.APPROVED,
          },
        },
      ],
    }))
    this.addScope("openDateOrBeforeStartDate", () => ({
      include: [
        {
          association: "preApproval",
          where: {
            [Op.or]: [
              {
                startDate: {
                  [Op.gte]: new Date().toISOString(),
                },
              },
              {
                isOpenForAnyDate: true,
              },
            ],
          },
        },
      ],
    }))
  }
}
export default TravelAuthorizationPreApprovalProfile
