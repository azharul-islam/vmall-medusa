import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { MARKETPLACE_MODULE } from "../../modules/marketplace"
import { CreateMallSchema } from "../../api/admin/malls/middlewares"

export const createMallStep = createStep(
  "create-mall-step",
  async (input: CreateMallSchema, { container }) => {
    const marketplaceService = container.resolve(MARKETPLACE_MODULE)
    const mall = await marketplaceService.createMalls(input as any)
    return new StepResponse(mall)
  }
)