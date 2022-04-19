/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { MergeStates, OpenApiTypes, rules } from "@microsoft.azure/openapi-validator-core"
export const EnumMustNotHaveEmptyValue = "EnumMustNotHaveEmptyValue"
import { transformEnum , isValidEnum } from "../utilities/rules-helper"

rules.push({
  id: "R3029",
  name: EnumMustNotHaveEmptyValue,
  severity: "error",
  category: "SDKViolation",
  mergeState: MergeStates.individual,
  openapiType: OpenApiTypes.arm | OpenApiTypes.dataplane,
  appliesTo_JsonQuery: "$..*[?(@property === 'enum')]^",
  *run(doc, node, path) {
    const msg = `Enum value must not contain empty value.`
    if (path.indexOf("x-ms-examples") === -1 && isValidEnum(node)) {
      const enumList = transformEnum(node.type, node.enum)
      if (enumList.some((value:any) => value.trim().length === 0)) {
        yield { message: `${msg}`, location: path }
      }
    }
  }
})
