/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { nodes } from "jsonpath";
import { Message } from "../jsonrpc/types";
import { rules, OpenApiTypes, MergeStates, ValidationMessage, Rule } from "./rule";

// register rules
require("./rules/PageableOperation");
require("./rules/DescriptionMustNotBeNodeName");
require("./rules/ControlCharactersAreNotAllowed");
require("./rules/ArraySchemaMustHaveItems");
require("./rules/PostOperationIdContainsUrlVerb");
require("./rules/LicenseHeaderMustNotBeSpecified");
require("./rules/PathResourceProviderNamePascalCase");
require("./rules/PathResourceTypeNameCamelCase");
require("./rules/OperationIdRequired");
require("./rules/EnumMustHaveType");
require("./rules/EnumUniqueValue");
require("./rules/EnumMustNotHaveEmptyValue");
require("./rules/UniqueXmsEnumName");
require("./rules/DeprecatedXmsCodeGenerationSetting");
require("./rules/AvoidEmptyResponseSchema");
require("./rules/DefaultErrorResponseSchema");


export async function run(
  document: string,
  openapiDefinition: any,
  sendMessage: (m: Message) => void,
  openapiType: OpenApiTypes,
  mergeState: MergeStates
) {
  const rulesToRun = rules.filter(
    rule => rule.mergeState === mergeState && rule.openapiType & openapiType
  );
  for (const rule of rulesToRun) {
    for (const section of nodes(
      openapiDefinition,
      rule.appliesTo_JsonQuery || "$"
    )) {
      if (rule.run) {
        for (const message of rule.run(
          openapiDefinition,
          section.value,
          section.path.slice(1))) {
          handle(rule, message)
        }
      }
      else {
        for await (const message of rule.asyncRun(
          openapiDefinition,
          section.value,
          section.path.slice(1))) {
          handle(rule, message)
        }
      }

    }
  }

  function handle(
    rule: Rule,
    message: ValidationMessage) {
    const readableCategory = rule.category;

    // try to extract provider namespace and resource type
    const path = message.location[1] === "paths" && message.location[2];
    const pathComponents = typeof path === "string" && path.split("/");
    const pathComponentsProviderIndex =
      pathComponents && pathComponents.indexOf("providers");
    const pathComponentsTail =
      pathComponentsProviderIndex &&
      pathComponentsProviderIndex >= 0 &&
      pathComponents.slice(pathComponentsProviderIndex + 1);
    const pathComponentProviderNamespace =
      pathComponentsTail && pathComponentsTail[0];
    const pathComponentResourceType =
      pathComponentsTail && pathComponentsTail[1];

    sendMessage({
      Channel: rule.severity,
      Text: message.message,
      Key: [rule.name, rule.id, readableCategory],
      Source: [
        {
          document: document,
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
    });
  }
}
