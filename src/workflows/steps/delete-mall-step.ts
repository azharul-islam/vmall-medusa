import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { MARKETPLACE_MODULE } from "../../modules/marketplace"

export const deleteMallStep = createStep(
  "delete-mall-step",
  async (input: { id: string }, { container }) => {
    const marketplaceService = container.resolve(MARKETPLACE_MODULE)
    await marketplaceService.deleteMalls(input.id)
    return new StepResponse({ id: input.id, deleted: true })
  }
)