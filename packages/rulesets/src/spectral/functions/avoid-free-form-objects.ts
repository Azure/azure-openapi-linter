import { getProperty } from "./utils"

export const avoidFreeFormObjects = (pathItem: any, _opts: any, ctx: any) => {
  if (pathItem === null || typeof pathItem !== "object") {
    return []
  }

  const neededHttpVerbs = ["put", "patch"]
  const putCodes = ["200", "201"]
  const patchCodes = ["200"]
  const path = ctx.path || []
  const errors = []

  for (const verb of neededHttpVerbs) {
    if (pathItem[verb]) {
      let codes = []
      if (verb === "patch") {
        codes = patchCodes
      } else {
        codes = putCodes
      }

      for (const code of codes) {
        if (!getProperty(pathItem[verb].responses[code]?.schema, "provisioningState")) {
          errors.push({
            message: `${code} response in long running ${verb} operation is missing ProvisioningState property. A LRO PUT and PATCH operations response schema must have ProvisioningState specified.`,
            path,
          })
        }
      }
    }
  }

  return errors
}

export default avoidFreeFormObjects
