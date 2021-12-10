/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { nodes } from "jsonpath"
import { Message } from "../jsonrpc/types"
import { MergeStates, OpenApiTypes, Rule, rules, ValidationMessage } from "./rule"

// register rules
require("./rules/PageableOperation")
require("./rules/DescriptionMustNotBeNodeName")
require("./rules/ControlCharactersAreNotAllowed")
require("./rules/ArraySchemaMustHaveItems")
require("./rules/PostOperationIdContainsUrlVerb")
require("./rules/LicenseHeaderMustNotBeSpecified")
require("./rules/PathResourceProviderNamePascalCase")
require("./rules/PathResourceTypeNameCamelCase")
require("./rules/OperationIdRequired")
require("./rules/EnumMustRespectType")
require("./rules/EnumMustHaveType")
require("./rules/EnumUniqueValue")
require("./rules/EnumMustNotHaveEmptyValue")
require("./rules/IntegerTypeMustHaveFormat")
require("./rules/UniqueXmsEnumName")
require("./rules/DeprecatedXmsCodeGenerationSetting")
require("./rules/AvoidEmptyResponseSchema")
require("./rules/DefaultErrorResponseSchema")
require("./rules/DeleteOperationResponses")
require("./rules/XmsPageableMustHaveCorrespondingResponse")
require("./rules/RequiredReadOnlySystemData")
require("./rules/RequiredDefaultResponse")
require("./rules/GetCollectionResponseSchema")
require("./rules/AllResourcesMustHaveGetOperation")
require("./rules/NestedResourcesMustHaveListOperation")
require("./rules/TopLevelResourcesListByResourceGroup")
require("./rules/TopLevelResourcesListBySubscription")
require("./rules/OperationsApiResponseSchema")
require("./rules/Rpaas_CreateOperationAsyncResponseValidation")
require("./rules/PreviewVersionOverOneYear")
require("./rules/UniqueXmsExample")
require("./rules/UniqueClientParameterName")
require("./rules/ValidResponseCodeRequired")
require("./rules/Rpaas_ResourceProvisioningState")
require("./rules/AzureResourceTagsSchema")
require("./rules/UniqueModelName")
require("./rules/MissingXmsErrorResponse")
require("./rules/MissingTypeObject")
require("./rules/PrivateEndpointResourceSchemaValidation")
require("./rules/ImplementPrivateEndpointAPIs")
require("./rules/ParametersOrder")
require("./rules/ExtensionResourcePathPattern")
require("./rules/XmsEnumValidation")

export const runRules = async (
  document: string,
  openapiDefinition: any,
  sendMessage: (m: Message) => void,
  openapiType: OpenApiTypes,
  mergeState: MergeStates,
  rules: Rule[]
) => {
  const rulesToRun = rules.filter(rule => rule.mergeState === mergeState && rule.openapiType & openapiType)
  for (const rule of rulesToRun) {
    let appliesTo_JsonQueries = rule.appliesTo_JsonQuery || "$"
    if (!Array.isArray(appliesTo_JsonQueries)) {
      appliesTo_JsonQueries = [appliesTo_JsonQueries]
    }
    for (const appliesTo_JsonQuery of appliesTo_JsonQueries) {
      for (const section of nodes(openapiDefinition, appliesTo_JsonQuery)) {
        if (rule.run) {
          for (const message of rule.run(openapiDefinition, section.value, section.path.slice(1))) {
            handle(rule, message)
          }
        } else {
          for await (const message of rule.asyncRun(openapiDefinition, section.value, section.path.slice(1))) {
            handle(rule, message)
          }
        }
      }
    }
  }

  function handle(rule: Rule, message: ValidationMessage) {
    const readableCategory = rule.category

    // try to extract provider namespace and resource type
    const path = message.location[1] === "paths" && message.location[2]
    const pathComponents = typeof path === "string" && path.split("/")
    const pathComponentsProviderIndex = pathComponents && pathComponents.indexOf("providers")
    const pathComponentsTail =
      pathComponentsProviderIndex && pathComponentsProviderIndex >= 0 && pathComponents.slice(pathComponentsProviderIndex + 1)
    const pathComponentProviderNamespace = pathComponentsTail && pathComponentsTail[0]
    const pathComponentResourceType = pathComponentsTail && pathComponentsTail[1]

    sendMessage({
      Channel: rule.severity,
      Text: message.message,
      Key: [rule.name, rule.id, readableCategory],
      Source: [
        {
          document,
          Position: { path: message.location }
        }
      ],
      Details: {
        type: rule.severity,
        code: rule.name,
        message: message.message,
        id: rule.id,
        validationCategory: readableCategory,
        providerNamespace: pathComponentProviderNamespace,
        resourceType: pathComponentResourceType
      }
    })
  }
}

export async function run(
  document: string,
  openapiDefinition: any,
  sendMessage: (m: Message) => void,
  openapiType: OpenApiTypes,
  mergeState: MergeStates
) {
  await runRules(document, openapiDefinition, sendMessage, openapiType, mergeState, rules)
}
