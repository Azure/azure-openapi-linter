import { JsonPath, rules, MergeStates, OpenApiTypes } from "@microsoft.azure/openapi-validator-core"

import { ArmHelper } from "../utilities/arm-helper"
export const TopLevelResourcesListByResourceGroup = "TopLevelResourcesListByResourceGroup"

// RPC Code: RPC-Get-V1-05
rules.push({
  id: "R4016",
  name: TopLevelResourcesListByResourceGroup,
  severity: "error",
  category: "ARMViolation",
  mergeState: MergeStates.composed,
  openapiType: OpenApiTypes.arm,
  appliesTo_JsonQuery: "$",
  *run(doc, node, path, ctx) {
    const msg = 'The top-level resource "{0}" does not have list by resource group operation, please add it.'
    const utils = new ArmHelper(doc, ctx?.specPath!, ctx?.inventory!)
    const topLevelResources = utils.getTopLevelResourcesByRG()
    const allCollectionApis = utils.getCollectionApiInfo()
    for (const resource of topLevelResources) {
      const hasMatched = allCollectionApis.some(
        (collection) => resource === collection.childModelName && collection.collectionGetPath.some((p) => utils.isPathByResourceGroup(p))
      )
      if (!hasMatched) {
        yield {
          message: msg.replace("{0}", resource),
          location: ["$", "definitions", resource] as JsonPath,
        }
      }
    }
  },
})
