import _ from "lodash"

/**
 * get all properties as array
 */
export function getProperties(schema: any) {
  if (!schema) {
    return {}
  }
  let properties: any = {}
  if (schema.allOf && Array.isArray(schema.allOf)) {
    schema.allOf.forEach((base: any) => {
      properties = { ...getProperties(base), ...properties }
    })
  }
  if (schema.properties) {
    properties = { ...properties, ...schema.properties }
  }
  return properties
}

/**
 * get all specific property as array
 */
export function getProperty(schema: any, propName: string): any {
  if (!schema) {
    return {}
  }
  if (schema.allOf && Array.isArray(schema.allOf)) {
    for (const base of schema.allOf) {
      const result = getProperty(base, propName)
      if (result) {
        return result
      }
    }
  }
  if (schema.properties) {
    if (propName in schema.properties) {
      return schema.properties[propName]
    }
  }
  return undefined
}

export function getRequiredProperties(schema: any) {
  if (!schema) {
    return []
  }
  let requires: string[] = []
  if (schema.allOf && Array.isArray(schema.allOf)) {
    schema.allOf.forEach((base: any) => {
      requires = [...getRequiredProperties(base), ...requires]
    })
  }
  if (schema.required) {
    requires = [...schema.required, requires]
  }
  return requires
}
export type JsonPath = (string | number)[]

/**
 *
 * @param paths json pointer as an array , like ["paths","/foo"]
 * @param root source doc to search
 * @returns the found object
 */
export function jsonPath(paths: JsonPath, root: any): any {
  let result = undefined
  paths.some((p) => {
    if (typeof root !== "object" && root !== null) {
      result = undefined
      return true
    }
    root = root[p as any]
    result = root
    return false
  })
  return result
}

// diff A  B , return the properties in A but not present in B with the same layout
export function diffSchema(a: any, b: any) {
  const notMatchedProperties: string[] = []
  function diffSchemaInternal(a: any, b: any, paths: string[]) {
    if (!(a || b)) {
      return
    }
    if (a && b) {
      const propsA = getProperties(a)
      const propsB = getProperties(b)
      Object.keys(propsA).forEach((p: string) => {
        if (propsB[p]) {
          diffSchemaInternal(propsA[p], propsB[p], [...paths, p])
        } else {
          notMatchedProperties.push([...paths, p].join("."))
        }
      })
    }
  }
  diffSchemaInternal(a, b, [])
  return notMatchedProperties
}

export function getGetOperationSchema(paths: string[], ctx: any) {
  const getOperationPath = [...paths, "get"]
  const getOperation = jsonPath(getOperationPath, ctx?.documentInventory?.resolved)
  if (!getOperation) {
    return undefined
  }
  return getOperation?.responses["200"]?.schema || getOperation?.responses["201"]?.schema
}

export function isPageableOperation(operation: any) {
  return !!operation?.["x-ms-pageable"]
}

export function getReturnedType(operation: any) {
  const succeededCodes = ["200", "201", "202"]
  for (const code of succeededCodes) {
    const response = operation.responses[code]
    if (response) {
      return response?.schema?.$ref
    }
  }
}

export function getReturnedSchema(operation: any) {
  const succeededCodes = ["200", "201"]
  for (const code of succeededCodes) {
    const response = operation.responses[code]
    if (response?.schema) {
      return response?.schema
    }
  }
}

export function isXmsResource(schema: any) {
  if (!schema) {
    return false
  }
  if (schema["x-ms-azure-resource"]) {
    return true
  }
  if (schema.allOf && Array.isArray(schema.allOf)) {
    for (const base of schema.allOf) {
      if (isXmsResource(base)) {
        return true
      }
    }
  }
  return false
}

export function isSchemaEqual(a: any, b: any): boolean {
  if (a && b) {
    const propsA = Object.getOwnPropertyNames(a)
    const propsB = Object.getOwnPropertyNames(b)
    if (propsA.length === propsB.length) {
      for (let i = 0; i < propsA.length; i++) {
        const propsAName = propsA[i]
        const [propA, propB] = [a[propsAName], b[propsAName]]
        if (typeof propA === "object") {
          if (!isSchemaEqual(propA, propB)) {
            return false
          } else if (i === propsA.length - 1) {
            return true
          }
        } else if (propA !== propB) {
          return false
        } else if (propA === propB && i === propsA.length - 1) {
          return true
        }
      }
    }
  }
  return false
}

const providerAndNamespace = "/providers/[^/]+"
const resourceTypeAndResourceName = "(?:/\\w+/default|/\\w+/{[^/]+})"
const queryParam = "(?:\\?\\w+)"
const resourcePathRegEx = new RegExp(`${providerAndNamespace}${resourceTypeAndResourceName}+${queryParam}?$`, "gi")
export function getResourcesPathHierarchyBasedOnResourceType(path: string) {
  const index = path.lastIndexOf("/providers/")
  if (index === -1) {
    return []
  }
  const lastProvider = path.substr(index)
  const result = []
  const matches = lastProvider.match(resourcePathRegEx)
  if (matches && matches.length) {
    const match = matches[0]
    // slice the array to remove 'providers', provider namespace
    const resourcePathSegments = match.split("/").slice(3)
    for (const resourcePathSegment of resourcePathSegments) {
      if (resourcePathSegment.startsWith("{") || resourcePathSegment === "default") {
        continue
      }
      result.push(resourcePathSegment)
    }
  }
  return result
}

/**
 * Recursively searches an object for a key with the given name, returning the full path to the object.
 * @param object the object to search
 * @param keyName the key to look for
 * @param path optional path parameter used for the recursion and to optionally add a prefix to the found path
 * @returns full path to the key as an array, or an empty array if the key could not be found
 */
export function deepFindObjectKeyPath(object: any, keyName: string, path: string[] = []) {
  if (!_.isObject(object)) {
    return []
  }
  if (_.has(object, keyName)) {
    return _.concat(path, keyName)
  }

  for (const [key, value] of Object.entries(object)) {
    const result: any = deepFindObjectKeyPath(value, keyName, _.concat(path, key))
    if (result) {
      return result
    }
  }

  return []
}
