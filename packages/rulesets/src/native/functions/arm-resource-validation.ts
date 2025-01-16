import { RuleContext } from "@microsoft.azure/openapi-validator-core"
import _ from "lodash"
import { ArmHelper } from "../utilities/arm-helper"
import { getResourceProvider } from "../utilities/rules-helper"

export function* trackedResourcesMustHavePut(openapiSection: any, options: {}, ctx: RuleContext) {
  const armHelper = new ArmHelper(ctx?.document, ctx?.specPath, ctx?.inventory!)
  const allTrackedResources = armHelper.getTrackedResources()
  for (const re of allTrackedResources) {
    if (!re.operations.some((op: any) => op.httpMethod === "put")) {
      yield {
        location: ["definitions", re.modelName],
        message: `The tracked resource ${re.modelName} does not have a corresponding put operation.`,
      }
    }
  }
}

export function* trackedResourceBeyondsThirdLevel(openapiSection: any, options: {}, ctx: RuleContext) {
  const armHelper = new ArmHelper(ctx?.document, ctx?.specPath, ctx?.inventory!)
  const allTrackedResources = armHelper.getTrackedResources()
  const regex = /^.*\/providers\/microsoft\.\w+(?:\/\w+\/(\w+|{\w+})){4,}/gi
  for (const re of allTrackedResources) {
    if (re.operations.some((op: any) => regex.test(op.apiPath))) {
      yield {
        location: ["definitions", re.modelName],
        message: `The tracked resource ${re.modelName} is beyond third level of nesting.`,
      }
    }
  }
}

// support delete operation for all tracked resource , and all top level proxy resources.
export function* allResourcesHaveDelete(openapiSection: any, options: { isTrackedResource: boolean }, ctx: RuleContext) {
  const armHelper = new ArmHelper(ctx?.document, ctx?.specPath, ctx?.inventory!)
  const allResources = options.isTrackedResource ? armHelper.getTrackedResources() : armHelper.getProxyResources()
  for (const re of allResources) {
    const apiPath = re.operations.find((op: any) => op.apiPath)?.apiPath
    if (apiPath && !apiPath.toLowerCase().includes("privateendpointconnectionproxies")) {
      if ((options.isTrackedResource || armHelper.findOperation(apiPath, "put")) && !armHelper.findOperation(apiPath, "delete")) {
        yield {
          location: ["definitions", re.modelName],
          message: `The resource ${re.modelName} does not have a corresponding delete operation.`,
        }
      }
    }
  }
}

// support delete operation for all tracked resource , and all top level proxy resources.
export function* trackedResourcesHavePatch(openapiSection: any, options: {}, ctx: RuleContext) {
  const armHelper = new ArmHelper(ctx?.document, ctx?.specPath, ctx?.inventory!)
  const allTrackedResources = armHelper.getTrackedResources()
  for (const re of allTrackedResources) {
    const apiPath = re.operations.find((op: any) => op.apiPath)?.apiPath
    if (apiPath && !apiPath.toLowerCase().includes("privateendpointconnectionproxies")) {
      if (!armHelper.findOperation(apiPath, "patch")) {
        yield {
          location: ["definitions", re.modelName],
          message: `Tracked resource '${re.modelName}' must have patch operation that at least supports the update of tags.`,
        }
      }
    }
  }
}

export function* armResourcePropertiesBag(openapiSection: any, options: {}, ctx: RuleContext) {
  const armHelper = new ArmHelper(ctx?.document, ctx?.specPath, ctx?.inventory!)
  const allResources = armHelper.getTrackedResources()
  const propertiesBag = ["name", "id", "type", "location", "tags"]

  function checkPropertiesBag(model: any, resourceName: string, propertiesPath: string[]) {
    let messages: any[] = []
    const properties = armHelper.getProperty(model!, "properties")
    if (properties) {
      propertiesPath.push("properties")
      for (const p of propertiesBag) {
        if (armHelper.getProperty(properties, p)) {
          messages.push(
            `Top level property names should not be repeated inside the properties bag for ARM resource '${resourceName}'. Properties [${propertiesPath
              .concat(p)
              .join(".")}] conflict with ARM top level properties. Please rename these.`,
          )
        }
      }

      const subResult = checkPropertiesBag(properties, resourceName, propertiesPath)
      messages = messages.concat(subResult)
    }
    return messages
  }

  for (const re of allResources) {
    const model = armHelper.getResourceByName(re.modelName)
    const messages = checkPropertiesBag(model, re.modelName, [])
    for (const message of messages) {
      yield {
        location: ["definitions", re.modelName],
        message,
      }
    }
  }
}

export function* bodyTopLevelProperties(openapiSection: any, options: {}, ctx: RuleContext) {
  const armHelper = new ArmHelper(ctx?.document, ctx?.specPath, ctx?.inventory!)
  const allResources = armHelper.getAllResources(true, false)
  for (const re of allResources) {
    const allowedBodyTopLevelProperties = [
      "name",
      "type",
      "id",
      "location",
      "properties",
      "tags",
      "plan",
      "sku",
      "etag",
      "managedby",
      "identity",
      "kind",
      "zones",
      "systemdata",
      "extendedlocation",
    ]
    const properties = armHelper.getResourceProperties(re.modelName)
    for (const propName of Object.keys(properties)) {
      if (!allowedBodyTopLevelProperties.includes(propName.toLowerCase())) {
        yield {
          location: ["definitions", re.modelName],
          message: `Top level properties should be one of name, type, id, location, properties, tags, plan, sku, etag, managedBy, identity, zones. Model definition '${re.modelName}' has extra properties ['${propName}'].`,
        }
      }
    }
  }
}

export function* operationsAPIImplementation(openapiSection: any, options: {}, ctx: RuleContext) {
  const armHelper = new ArmHelper(ctx?.document, ctx?.specPath, ctx?.inventory!)
  const operationsList = armHelper.getOperationApi()
  if (!operationsList) {
    const resourceProvider = getResourceProvider(ctx?.inventory!)
    yield {
      location: [],
      message: `Operations API must be implemented for '${resourceProvider}'.`,
    }
  }
}

export function* resourcesHaveRequiredProperties(openapiSection: any, options: {}, ctx: RuleContext) {
  const armHelper = new ArmHelper(ctx?.document, ctx?.specPath, ctx?.inventory!)
  const allResources = armHelper.getAllResources()
  for (const re of allResources) {
    const requiredProperties = ["name", "type", "id"]
    const properties = armHelper.getResourceProperties(re.modelName)
    for (const propName of requiredProperties) {
      const prop = properties[propName]
      if (!prop || armHelper.getAttribute(prop, "readOnly")?.value !== true) {
        yield {
          location: ["definitions", re.modelName],
          message: `Model definition '${re.modelName}' must have the properties 'name', 'id' and 'type' in its hierarchy and these properties must be marked as readonly.`,
        }
        break
      }
    }
  }
}

export function* xmsPageableListByRGAndSubscriptions(openapiSection: any, options: {}, ctx: RuleContext) {
  const armHelper = new ArmHelper(ctx?.document, ctx?.specPath, ctx?.inventory!)
  const trackedResources = armHelper.getTrackedResources()
  const collectionApiInfos = armHelper.getCollectionApiInfo()
  function isListByRgAndSubscription(apiPaths: string[]) {
    return apiPaths.some((p) => armHelper.isPathByResourceGroup(p)) && apiPaths.some((p) => armHelper.isPathBySubscription(p))
  }
  for (const collectionApiInfo of collectionApiInfos) {
    if (isListByRgAndSubscription(collectionApiInfo.collectionGetPath)) {
      const trackedResource = trackedResources.find((r) => r.modelName === collectionApiInfo.childModelName)
      const isXmsPageableResult = collectionApiInfo.collectionGetPath
        .map((p) => armHelper.isPathXmsPageable(p))
        .reduce((result, cur) => (result !== cur ? false : true))
      if (trackedResource && !isXmsPageableResult) {
        yield {
          location: ["definitions", trackedResource.modelName],
          message: `For the tracked resource '${trackedResource.modelName}', the x-ms-pageable extension values must be same for list by resource group and subscriptions operations.`,
        }
      }
    }
  }
}
