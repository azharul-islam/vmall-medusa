import { createWorkflow, WorkflowResponse } from "@medusajs/framework/workflows-sdk"
import { CreateMallSchema } from "../api/admin/malls/middlewares"
import { createMallStep } from "./steps/create-mall-step"

export const createMallWorkflow = createWorkflow(
  "create-mall",
  function (input: CreateMallSchema) {
    const mall = createMallStep(input)
    return new WorkflowResponse(mall)
  }
)