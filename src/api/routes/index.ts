import { Router } from "express"

import { checkJwt, loadUser } from "../middleware/authz.middleware"
import FormsController from "../controllers/forms-controller"

export * from "./owner-router"
export * from "./users-router"
export * from "./lookup-router"
export * from "./perm-router"
export * from "./manager-router"
export * from "./healthcheck-router"
export * from "./form-router"
export * from "./preapproved-router"
export * from "./traveldesk-router"
export * from "./travCom-router"
export * from "./reconcile-router"
export * from "./lookup-tables-router"
// export * from "./tmp-travCom-router"

const router = Router()

router.use("/api", checkJwt)
router.use("/api", loadUser)

// TODO: move all routing logic to this file, and move all route actions into controllers
router.route("/api/forms").get(FormsController.index).post(FormsController.create)

export default router
