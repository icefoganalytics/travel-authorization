import express, { Request, Response } from "express"
import { ModelStatic } from "sequelize"
import { isNil } from "lodash"
import { DateTime } from "luxon"

import logger from "@/utils/logger"
import { RequiresAuth, RequiresRolePatAdminOrAdmin } from "@/middleware"
import { AuthorizedRequest } from "@/middleware/authorization-middleware"
import db, {
  TravelAuthorizationPreApproval,
  TravelAuthorizationPreApprovalDocument,
  TravelAuthorizationPreApprovalSubmission,
  TravelAuthorizationPreApprovalProfile,
  User,
} from "@/models"

export const preapprovedRouter = express.Router()

preapprovedRouter.get("/submissions", RequiresAuth, async function (req: Request, res: Response) {
  const applyScope = (scope: ModelStatic<TravelAuthorizationPreApprovalSubmission>, user: User) => {
    if (user.roles?.indexOf(User.Roles.ADMIN) >= 0) {
      return scope
    }

    return scope.scope({
      where: {
        department: user.department,
      },
    })
  }

  const scopedSubmissions = applyScope(
    TravelAuthorizationPreApprovalSubmission,
    (req as AuthorizedRequest).user
  )
  const submissionList = await scopedSubmissions.findAll({
    include: [
      {
        association: "preApprovals",
        include: ["profiles"],
      },
    ],
  })

  res.status(200).json(submissionList)
})

preapprovedRouter.get(
  "/submissions/:submissionId",
  RequiresAuth,
  RequiresRolePatAdminOrAdmin,
  async function (req: Request, res: Response) {
    const submissionId = req.params.submissionId
    try {
      const submission = await TravelAuthorizationPreApprovalSubmission.findByPk(submissionId)
      res.status(200).json(submission)
    } catch (error: unknown) {
      logger.info(error)
      res.status(500).json("Record Not Found")
    }
  }
)

preapprovedRouter.post(
  "/submissions/:submissionId",
  RequiresAuth,
  RequiresRolePatAdminOrAdmin,
  async function (req: Request, res: Response) {
    try {
      await db.transaction(async () => {
        const submissionId = Number(req.params.submissionId)
        const preApprovalIds = req.body.preApprovalIds
        delete req.body.preApprovalIds

        const newSubmission = req.body

        if (newSubmission.department && newSubmission.status && preApprovalIds.length > 0) {
          newSubmission.submitter = (req as AuthorizedRequest).user.displayName

          // TODO: fix legacy patterm - split creation and update into separate endpoints
          let submission
          if (submissionId > 0) {
            submission = await TravelAuthorizationPreApprovalSubmission.findByPk(submissionId)
            if (isNil(submission)) {
              return res.status(404).json("Submission not found")
            }

            submission.update(newSubmission)
          } else {
            submission = await TravelAuthorizationPreApprovalSubmission.create(newSubmission)
          }

          res.status(200).json("Successful")
        } else {
          res.status(500).json("Required fields in submission are blank")
        }
      })
    } catch (error: unknown) {
      logger.info(error)
      res.status(500).json("Insert failed")
    }
  }
)

preapprovedRouter.delete(
  "/submissions/:submissionId",
  RequiresAuth,
  RequiresRolePatAdminOrAdmin,
  async function (req: Request, res: Response) {
    try {
      const submissionId = Number(req.params.submissionId)
      const submission = await TravelAuthorizationPreApprovalSubmission.findByPk(submissionId)
      if (isNil(submission)) {
        return res.status(404).json("Submission not found")
      }

      await db.transaction(async () => {
        if (
          submission.status === TravelAuthorizationPreApprovalSubmission.Statuses.FINISHED ||
          submission.approverId ||
          submission.approvedAt
        ) {
          res.status(403).json("Cannot delete final records")
        } else {
          await submission.destroy()

          res.status(200).json("Delete Successful")
        }
      })
    } catch (error: unknown) {
      logger.info(error)
      res.status(500).json("Delete failed")
    }
  }
)

preapprovedRouter.post(
  "/approval/:submissionId",
  RequiresAuth,
  RequiresRolePatAdminOrAdmin,
  async function (req: Request, res: Response) {
    const file = req.body.file
    const submissionId = Number(req.params.submissionId)
    const data = JSON.parse(req.body.data)

    const travelAuthorizationPreApprovalSubmission =
      await TravelAuthorizationPreApprovalSubmission.findByPk(submissionId)
    if (isNil(travelAuthorizationPreApprovalSubmission)) {
      return res.status(404).json("Submission not found")
    }

    try {
      const approvalDoc = await TravelAuthorizationPreApprovalDocument.findOne({
        where: {
          submissionId,
        },
      })
      if (approvalDoc) {
        return res.status(409).json("File Already Exist!")
      }

      if (submissionId && data.status && data.approvedBy && data.preApprovals.length > 0) {
        await db.transaction(async () => {
          await TravelAuthorizationPreApprovalDocument.create({
            submissionId,
            approvalDocument: file,
          })

          await travelAuthorizationPreApprovalSubmission.update({
            status: data.status,
            approvedAt: DateTime.utc().toJSDate(),
            approverId: data.approvedBy,
          })

          for (const preApproval of data.preApprovals) {
            await TravelAuthorizationPreApproval.update(
              {
                status: preApproval.status,
              },
              {
                where: {
                  id: preApproval.id,
                },
              }
            )
          }

          res.status(200).json("Successful")
        })
      } else {
        res.status(422).json("Required fields in submission are blank")
      }
    } catch (error: unknown) {
      logger.info(error)
      res.status(500).json("Insert failed")
    }
  }
)

preapprovedRouter.get("/document/:submissionId", RequiresAuth, async function (req, res) {
  try {
    const submissionId = Number(req.params.submissionId)
    const document = await TravelAuthorizationPreApprovalDocument.findOne({
      where: {
        submissionId,
      },
    })
    if (isNil(document)) {
      return res.status(404).json("Document not found")
    }

    res.status(200).send(document.approvalDocument)
  } catch (error: unknown) {
    logger.info(error)
    res.status(500).json("PDF not Found")
  }
})

preapprovedRouter.post(
  "/:preApprovalId",
  RequiresAuth,
  async function (req: Request, res: Response) {
    const preApprovalId = Number(req.params.preApprovalId)
    try {
      await db.transaction(async () => {
        const profiles = req.body.profiles
        delete req.body.profiles

        const newPreapproved = req.body

        if (
          newPreapproved.department &&
          newPreapproved.purpose &&
          newPreapproved.estimatedCost &&
          newPreapproved.location &&
          profiles?.length > 0
        ) {
          // TODO: fix legacy patterm - split creation and update into separate endpoints
          let preApproval
          if (preApprovalId > 0) {
            preApproval = await TravelAuthorizationPreApproval.findByPk(preApprovalId)
            if (isNil(preApproval)) {
              return res.status(404).json("Pre-approval not found")
            }

            preApproval.update(newPreapproved)
          } else {
            preApproval = await TravelAuthorizationPreApproval.create(newPreapproved)
          }

          const profilesQuery = await TravelAuthorizationPreApprovalProfile.findAll({
            attributes: ["id"],
            where: {
              preApprovalId: preApproval.id,
            },
          })

          let profileIdList = profilesQuery.map((profile) => profile.id)

          for (const profile of profiles) {
            if (profile.id) {
              profileIdList = profileIdList.filter((profileId) => profileId != profile.id)
            } else {
              const profileInfo = {
                preApprovalId: preApproval.id,
                ...profile,
              }
              await TravelAuthorizationPreApprovalProfile.create(profileInfo)
            }
          }

          await TravelAuthorizationPreApprovalProfile.destroy({
            where: {
              id: profileIdList,
            },
          })

          res.status(200).json([preApproval])
        } else {
          res.status(500).json("Required fields in submission are blank")
        }
      })
    } catch (error: unknown) {
      logger.info(error)
      res.status(500).json("Insert failed")
    }
  }
)

preapprovedRouter.delete(
  "/:preApprovalId",
  RequiresAuth,
  RequiresRolePatAdminOrAdmin,
  async function (req: Request, res: Response) {
    try {
      const preApprovalId = req.params.preApprovalId
      const preApproval = await TravelAuthorizationPreApproval.findByPk(preApprovalId)
      if (isNil(preApproval)) {
        return res.status(404).json("Pre-approval not found")
      }

      if (preApproval.status == "Approved" || preApproval.status == "Declined") {
        res.status(403).json("Cannot delete final records")
      } else {
        await preApproval.destroy()
        res.status(200).json("Delete Successful")
      }
    } catch (error: unknown) {
      logger.info(error)
      res.status(500).json("Delete failed")
    }
  }
)
