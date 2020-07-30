import { JsonPath } from "../../jsonrpc/types"
import { rules } from "../rule"
import { MergeStates, OpenApiTypes } from "../rule"
import { ResourceUtils } from "./utilities/resourceUtils"
export const GetCollectionResponseSchema: string = "GetCollectionResponseSchema"

rules.push({
  id: "R4019",
  name: GetCollectionResponseSchema,
  severity: "error",
  category: "ARMViolation",
  mergeState: MergeStates.composed,
  openapiType: OpenApiTypes.arm,
  appliesTo_JsonQuery: "$",
  *run(doc, node, path) {
    const msg: string =
      'The response in the GET collection operation "{0}" is different than the response definition in the individual GET  operation "{1}" .'
    /**
     * 1 travel all resources and find all the resources that have a collection get
     *   - by searching all the models return by a get operation and verify the schema
     * 2 check the collection model schema
     */
    const utils = new ResourceUtils(doc)
    const allCollectionPath = utils.getCollectionApiInfo()
    for (const collection of allCollectionPath) {
      let hasMatched = false
      const modelValue = utils.getPropertyOfModelName(collection.modelName, "value")
      if (modelValue) {
        hasMatched = utils.verifyCollectionModel(modelValue, collection.childModelName)
      }
      if (!hasMatched) {
        const collectionOperationId = utils.getOperationIdFromPath(collection.collectionGetPath[0])
        const specificOperationId = utils.getOperationIdFromPath(collection.specificGetPath[0])
        yield {
          message: msg.replace("{0}", collectionOperationId).replace("{1}", specificOperationId),
          location: ["$", "paths", collection.collectionGetPath] as JsonPath
        }
      }
    }
  }
})
