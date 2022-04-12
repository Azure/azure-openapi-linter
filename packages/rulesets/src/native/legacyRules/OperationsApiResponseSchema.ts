import { rules } from "@microsoft.azure/openapi-validator-core"
import { MergeStates, OpenApiTypes } from "@microsoft.azure/openapi-validator-core"
import { ArmHelper } from "../utilities/arm-helper"

export const OperationsApiResponseSchema = "OperationsApiResponseSchema"

rules.push({
  id: "R4018",
  name: OperationsApiResponseSchema,
  severity: "error",
  category: "ARMViolation",
  mergeState: MergeStates.composed,
  openapiType: OpenApiTypes.arm,

  *run(doc, node, path) {
    const msg = 'The response schema of operations API "{0}" does not match the ARM specification. Please standardize the schema.'
    /**
     * 1 get the operations API and schema
     * 2 verify the schema
     * per ARM spec:https://github.com/Azure/azure-resource-manager-rpc/blob/master/v1.0/proxy-api-reference.md#exposing-available-operations
     */
    const utils = new ArmHelper(doc)
    const operationsApi = utils.getOperationApi()
    if (operationsApi && operationsApi[1]) {
      let isValid = true
      const value = utils?.getPropertyOfModelName(operationsApi[1], "value")
      const operationsItems = utils.stripDefinitionPath(value?.items?.$ref)
      if (value && value.items && value.items.$ref && operationsItems) {
        const name = utils?.getPropertyOfModelName(operationsItems, "name")
        const display = utils?.getPropertyOfModelName(operationsItems, "display")
        const isDataAction = utils?.getPropertyOfModelName(operationsItems, "isDataAction")
        if (!name || !isDataAction || !display) {
          isValid = false
        } else {
          if (["description", "provider", "operation", "resource"].some(e => !utils?.getPropertyOfModel(display, e))) {
            isValid = false
          }
        }
        
      } else {
        isValid = false
      }
      if (!isValid && operationsApi[0]) {
        yield {
          message: msg.replace("{0}", operationsApi[0]),
          location: ["$", "paths", operationsApi[0]]
        }
      }
    }
  }
})
