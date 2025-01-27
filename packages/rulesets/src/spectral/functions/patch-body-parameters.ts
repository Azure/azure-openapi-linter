import type { IFunctionResult } from "@stoplight/spectral-core"
import { getProperties, getRequiredProperties } from "./utils"

//This rule appears if in the patch body parameters have properties which is marked as required or x-ms-mutability:["create"] or have default
const patchBodyParameters = (parameters: any, _opts: any, paths: any): IFunctionResult[] => {
  if (parameters === null || parameters.schema === undefined || parameters.in !== "body") {
    return []
  }

  const path = paths.path || []

  const properties: object = getProperties(parameters.schema)
  const requiredProperties = getRequiredProperties(parameters.schema)
  const errors = []
  for (const prop of Object.keys(properties)) {
    // skip validation for identity property 
    // as it refers MSI(managed service identity) from common-types
    if (prop.toLowerCase() === "identity") {
      continue
    }

    if (properties[prop].default) {
      errors.push({
        message: `Properties of a PATCH request body must not have default value, property:${prop}.`,
        path: [...path, "schema"],
      })
    }

    if (requiredProperties.includes(prop)) {
      errors.push({
        message: `Properties of a PATCH request body must not be required, property:${prop}.`,
        path: [...path, "schema"],
      })
    }

    const xmsMutability = properties[prop]["x-ms-mutability"]
    if (xmsMutability && xmsMutability.length === 1 && xmsMutability[0] === "create") {
      errors.push({
        message: `Properties of a PATCH request body must not be x-ms-mutability: ["create"], property:${prop}.`,
        path: [...path, "schema"],
      })
    }
    // recursive check on nested properties
    if (properties[prop].type === "object" || (properties[prop].type === undefined && properties[prop].properties)) {
      errors.push(
        ...patchBodyParameters(
          {
            schema: properties[prop],
            in: "body",
          },
          _opts,
          { path: [...path, "schema", "properties", prop] },
        ),
      )
    }
  }
  return errors
}

export default patchBodyParameters
