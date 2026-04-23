import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { MARKETPLACE_MODULE } from "../../modules/marketplace"
import { UpdateMallSchema } from "../../api/admin/malls/middlewares"

export const updateMallStep = createStep(
  "update-mall-step",
  async (input: { id: string; data: UpdateMallSchema }, { container }) => {
    const marketplaceService = container.resolve(MARKETPLACE_MODULE)
    const mall = await marketplaceService.updateMalls({
      id: input.id,
      ...input.data,
    } as any)
    return new StepResponse(mall)
  }
)