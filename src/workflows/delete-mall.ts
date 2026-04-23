import { createWorkflow, WorkflowResponse } from "@medusajs/framework/workflows-sdk"
import { deleteMallStep } from "./steps/delete-mall-step"

export const deleteMallWorkflow = createWorkflow(
  "delete-mall",
  function (input: { id: string }) {
    const result = deleteMallStep(input)
    return new WorkflowResponse(result)
  }
)