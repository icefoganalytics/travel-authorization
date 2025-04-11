import {
  type Association,
  type CreationOptional,
  DataTypes,
  type ForeignKey,
  type InferAttributes,
  type InferCreationAttributes,
  type NonAttribute,
  Op,
} from "sequelize"

import sequelize from "@/db/db-client"

import BaseModel from "@/models/base-model"
import TravelAuthorization from "@/models/travel-authorization"
import TravelAuthorizationPreApproval from "@/models/travel-authorization-pre-approval"

export class TravelAuthorizationPreApprovalProfile extends BaseModel<
  InferAttributes<TravelAuthorizationPreApprovalProfile>,
  InferCreationAttributes<TravelAuthorizationPreApprovalProfile>
> {
  declare id: CreationOptional<number>
  declare preApprovalId: ForeignKey<TravelAuthorizationPreApproval["id"]>
  declare profileName: string
  declare department: string
  declare branch: string | null
  declare createdAt: CreationOptional<Date>
  declare updatedAt: CreationOptional<Date>
  declare deletedAt: Date | null

  // Associations
  preApproval?: NonAttribute<TravelAuthorizationPreApproval>
  travelAuthorizations?: NonAttribute<TravelAuthorization[]>

  declare static associations: {
    preApproval: Association<TravelAuthorizationPreApprovalProfile, TravelAuthorizationPreApproval>
    travelAuthorizations: Association<TravelAuthorizationPreApprovalProfile, TravelAuthorization>
  }

  static establishAssociations() {
    this.belongsTo(TravelAuthorizationPreApproval, {
      as: "preApproval",
      foreignKey: "preApprovalId",
    })
    this.hasMany(TravelAuthorization, {
      as: "travelAuthorizations",
      foreignKey: "preApprovalProfileId",
    })
  }
}

TravelAuthorizationPreApprovalProfile.init(
  {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    preApprovalId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: TravelAuthorizationPreApproval,
        key: "id",
      },
    },
    profileName: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    department: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    branch: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: DataTypes.NOW,
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: DataTypes.NOW,
    },
    deletedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    sequelize,
    scopes: {
      approved() {
        return {
          include: [
            {
              association: "preApproval",
              where: {
                status: TravelAuthorizationPreApproval.Statuses.APPROVED,
              },
            },
          ],
        }
      },
      openDateOrBeforeStartDate() {
        return {
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
        }
      },
    },
  }
)

// TODO: add better search!
TravelAuthorizationPreApprovalProfile.addSearchScope(["profile_name"])

export default TravelAuthorizationPreApprovalProfile
