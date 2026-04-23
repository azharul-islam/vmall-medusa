import { createWorkflow, WorkflowResponse } from "@medusajs/framework/workflows-sdk"
import { UpdateMallSchema } from "../api/admin/malls/middlewares"
import { updateMallStep } from "./steps/update-mall-step"

export const updateMallWorkflow = createWorkflow(
  "update-mall",
  function (input: { id: string; data: UpdateMallSchema }) {
    const mall = updateMallStep(input)
    return new WorkflowResponse(mall)
  }
)