/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { MergeStates, OpenApiTypes, rules, JsonPath } from "@microsoft.azure/openapi-validator-core"
import { ArmHelper } from "../utilities/arm-helper"
import { SwaggerHelper } from "../utilities/swagger-helper"
export const Rpaas_ResourceProvisioningState = "Rpaas_ResourceProvisioningState"

rules.push({
  id: "R4031",
  name: Rpaas_ResourceProvisioningState,
  severity: "error",
  category: "RPaaSViolation",
  mergeState: MergeStates.individual,
  openapiType: OpenApiTypes.rpaas,
  appliesTo_JsonQuery: "$",
  *run(doc, node, path, ctx) {
    const msg = `[RPaaS] The resource {0} is defined without 'provisioningState' in properties bag, consider adding the provisioningState for it.`
    const utils = new ArmHelper(doc, ctx?.specPath!, ctx?.inventory!)
    const swaggerUtil = new SwaggerHelper(doc, ctx?.specPath, ctx?.inventory)
    const allResources = utils.getAllResourceNames()
    for (const resource of allResources) {
      const model = utils.getResourceByName(resource)
      const azureResource = swaggerUtil?.getProperty(model!, "x-ms-azure-resource")
      const properties = swaggerUtil?.getProperty(model!, "properties")
      const isAzureResource = azureResource && azureResource.value
      let hasProvisioningState = false
      if (isAzureResource && properties && (!properties.value.type || properties.value.type === "object")) {
        if (swaggerUtil?.getProperty(properties, "provisioningState")) {
          hasProvisioningState = true
        }
      }
      if (isAzureResource && !hasProvisioningState) {
        yield { message: msg.replace("{0}", resource), location: ["$", "definitions", resource] as JsonPath }
      }
    }
  },
})
