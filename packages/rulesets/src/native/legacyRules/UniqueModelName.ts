import { MergeStates, OpenApiTypes, rules } from "@microsoft.azure/openapi-validator-core"
export const UniqueModelName = "UniqueModelName"

rules.push({
  id: "R4033",
  name: UniqueModelName,
  severity: "error",
  category: "SDKViolation",
  mergeState: MergeStates.composed,
  openapiType: OpenApiTypes.arm,
  appliesTo_JsonQuery: "$.definitions",
  *run(doc, node, path) {
    const msg = `The model name {0} is duplicated with {1} .`
    const models = new Map<string, string>()
    for (const key of Object.keys(node)) {
      const model = models.get(key.toLowerCase())
      if (model) {
        yield { message: msg.replace("{0}", key).replace("{1}", model), location: path.concat(key) }
      } else {
        models.set(key.toLowerCase(), key)
      }
    }
  },
})
