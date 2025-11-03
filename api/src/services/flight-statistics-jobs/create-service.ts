import { FlightStatisticJob, User } from "@/models"
import BaseService from "@/services/base-service"

export class CreateService extends BaseService {
  constructor(protected currentUser: User) {
    super()
  }

  async perform(): Promise<FlightStatisticJob> {
    // TODO: Move the sync logic from api/src/routes/travCom-router.ts lines 96-240 here
    // This should:
    // 1. Create/update FlightStatisticJob record to track progress and prevent concurrent syncs
    // 2. Fetch data from TravCom database (ARInvoicesNoHealth, ARInvoiceDetailsNoHealth, segmentsNoHealth)
    // 3. Process and aggregate statistics by department + destination
    // 4. Delete existing flight_statistics records
    // 5. Insert new aggregated statistics
    // 6. Update job progress to 100%

    throw new Error(
      "not yet implemented - logic needs to be moved from travCom-router.ts"
    )
  }
}

export default CreateService
