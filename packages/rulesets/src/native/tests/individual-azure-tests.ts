/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import * as assert from "assert"
import { LintResultMessage, OpenApiTypes } from "@microsoft.azure/openapi-validator-core"

import { AvoidEmptyResponseSchema } from "../legacyRules/AvoidEmptyResponseSchema"
import { AzureResourceTagsSchema } from "../legacyRules/AzureResourceTagsSchema"
import { ControlCharactersAreNotAllowed } from "../legacyRules/ControlCharactersAreNotAllowed"
import { DefaultErrorResponseSchema } from "../legacyRules/DefaultErrorResponseSchema"
import { DeleteOperationResponses } from "../legacyRules/DeleteOperationResponses"
import { DeprecatedXmsCodeGenerationSetting } from "../legacyRules/DeprecatedXmsCodeGenerationSetting"
import { EnumMustHaveType } from "../legacyRules/EnumMustHaveType"
import { EnumMustNotHaveEmptyValue } from "../legacyRules/EnumMustNotHaveEmptyValue"
import { EnumMustRespectType } from "../legacyRules/EnumMustRespectType"
import { EnumUniqueValue } from "../legacyRules/EnumUniqueValue"
import { ExtensionResourcePathPattern } from "../legacyRules/ExtensionResourcePathPattern"
import { IntegerTypeMustHaveFormat } from "../legacyRules/IntegerTypeMustHaveFormat"
import { LicenseHeaderMustNotBeSpecified } from "../legacyRules/LicenseHeaderMustNotBeSpecified"
import { MissingTypeObject } from "../legacyRules/MissingTypeObject"
import { MissingXmsErrorResponse } from "../legacyRules/MissingXmsErrorResponse"
import { OperationIdRequired } from "../legacyRules/OperationIdRequired"
import { ParametersOrder } from "../legacyRules/ParametersOrder"
import { PostOperationIdContainsUrlVerb } from "../legacyRules/PostOperationIdContainsUrlVerb"
import { PreviewVersionOverOneYear } from "../legacyRules/PreviewVersionOverOneYear"
import { RequiredDefaultResponse } from "../legacyRules/RequiredDefaultResponse"
import { Rpaas_ResourceProvisioningState } from "../legacyRules/Rpaas_ResourceProvisioningState"
import { ValidResponseCodeRequired } from "../legacyRules/ValidResponseCodeRequired"
import { XmsEnumValidation } from "../legacyRules/XmsEnumValidation"
import { XmsIdentifierValidation } from "../legacyRules/XmsIdentifierValidation"
import { XmsPageableMustHaveCorrespondingResponse } from "../legacyRules/XmsPageableMustHaveCorrespondingResponse"
import { PathResourceProviderNamePascalCase } from "./../legacyRules/PathResourceProviderNamePascalCase"
import { PathResourceTypeNameCamelCase } from "./../legacyRules/PathResourceTypeNameCamelCase"
import { assertValidationRuleCount, collectTestMessagesFromValidator, getWarningMessages, getErrorMessages } from "./utilities/tests-helper"

describe("IndividualAzureTests", () => {
  test("control characters not allowed test", async () => {
    const fileName = "ContainsControlCharacters.json"
    const messages: LintResultMessage[] = await collectTestMessagesFromValidator(fileName, OpenApiTypes.arm, ControlCharactersAreNotAllowed)
    assertValidationRuleCount(messages, ControlCharactersAreNotAllowed, 2)
  })

  test("post operation id must contain Url verb", async () => {
    const fileName = "PostOperationIdWithoutUrlVerb.json"
    const messages: LintResultMessage[] = await collectTestMessagesFromValidator(fileName, OpenApiTypes.arm, PostOperationIdContainsUrlVerb)
    assertValidationRuleCount(messages, PostOperationIdContainsUrlVerb, 1)
    assert.ok(
      messages[0].message ===
        "OperationId should contain the verb: 'invoke' in:'simpleManualTrigger_call'. Consider updating the operationId"
    )
  })
  test("info section with x-ms-code-generation-settings must not contain a header", async () => {
    const fileName = "InfoWithLicenseHeader.json"
    const messages: LintResultMessage[] = await collectTestMessagesFromValidator(
      fileName,
      OpenApiTypes.arm,
      LicenseHeaderMustNotBeSpecified
    )
    assertValidationRuleCount(messages, LicenseHeaderMustNotBeSpecified, 1)
  })

  test("path resource provider name use pascal case eg: Microsoft.Insight", async () => {
    const fileName = "PathResourceProviderNamePascalCase.json"
    const messages: LintResultMessage[] = await collectTestMessagesFromValidator(
      fileName,
      OpenApiTypes.arm,
      PathResourceProviderNamePascalCase
    )
    assertValidationRuleCount(messages, PathResourceProviderNamePascalCase, 1)
  })

  test("OperationId Required", async () => {
    const fileName = "OperationIdMissed.json"
    const messages: LintResultMessage[] = await collectTestMessagesFromValidator(fileName, OpenApiTypes.arm, OperationIdRequired)
    assertValidationRuleCount(messages, OperationIdRequired, 2)
  })

  test("Enum must have type", async () => {
    const fileName = "EnumMustHaveType.json"
    const messages: LintResultMessage[] = await collectTestMessagesFromValidator(fileName, OpenApiTypes.arm, EnumMustHaveType)
    assertValidationRuleCount(messages, EnumMustHaveType, 2)
  })

  test("Enum unique value", async () => {
    const fileName = "EnumUniqueValue.json"
    const messages: LintResultMessage[] = await collectTestMessagesFromValidator(fileName, OpenApiTypes.arm, EnumUniqueValue)
    assertValidationRuleCount(messages, EnumUniqueValue, 1)
  })

  test("Enum must respect type", async () => {
    const fileName = "EnumMustRespectType.json"
    const messages: LintResultMessage[] = await collectTestMessagesFromValidator(fileName, OpenApiTypes.arm, EnumMustRespectType)
    assertValidationRuleCount(messages, EnumMustRespectType, 4)
  })

  test("path resource type name use camel case eg: proactiveDetectionConfigs", async () => {
    const fileName = "PathResourceTypeNameCamelCase.json"
    const messages: LintResultMessage[] = await collectTestMessagesFromValidator(fileName, OpenApiTypes.arm, PathResourceTypeNameCamelCase)
    assertValidationRuleCount(messages, PathResourceTypeNameCamelCase, 1)
  })
  test("Enum must not have empty value", async () => {
    const fileName = "EnumMustNotHaveEmptyValue.json"
    const messages: LintResultMessage[] = await collectTestMessagesFromValidator(fileName, OpenApiTypes.arm, EnumMustNotHaveEmptyValue)
    assertValidationRuleCount(messages, EnumMustNotHaveEmptyValue, 1)
  })

  test("Must not have empty response schema", async () => {
    const fileName = "EmptyResponseSchema.json"
    const messages: LintResultMessage[] = await collectTestMessagesFromValidator(fileName, OpenApiTypes.arm, AvoidEmptyResponseSchema)
    assertValidationRuleCount(messages, AvoidEmptyResponseSchema, 1)
  })

  test("x-ms-code-generation-settings depreated", async () => {
    const fileName = "InfoWithxmsCodeGenerationSetting.json"
    const messages: LintResultMessage[] = await collectTestMessagesFromValidator(
      fileName,
      OpenApiTypes.arm,
      DeprecatedXmsCodeGenerationSetting
    )
    assertValidationRuleCount(messages, DeprecatedXmsCodeGenerationSetting, 1)
  })

  test("default response schema correspond to document", async () => {
    const fileName = "DefaultResponseSchemaMatch.json"
    const messages: LintResultMessage[] = await collectTestMessagesFromValidator(fileName, OpenApiTypes.arm, DefaultErrorResponseSchema)
    assertValidationRuleCount(messages, DefaultErrorResponseSchema, 0)
  })

  test("default response schema does not correspond to document", async () => {
    const fileName = "DefaultResponseSchemaDismatch.json"
    const messages: LintResultMessage[] = await collectTestMessagesFromValidator(fileName, OpenApiTypes.arm, DefaultErrorResponseSchema)
    assertValidationRuleCount(messages, DefaultErrorResponseSchema, 1)
  })

  test("default response required", async () => {
    const fileName = "DefaultResponseMissed.json"
    const messages: LintResultMessage[] = await collectTestMessagesFromValidator(fileName, OpenApiTypes.arm, RequiredDefaultResponse)
    assertValidationRuleCount(messages, RequiredDefaultResponse, 1)
  })

  test("delete response required", async () => {
    const fileName = "DeleteResponseMissed.json"
    const messages: LintResultMessage[] = await collectTestMessagesFromValidator(fileName, OpenApiTypes.arm, DeleteOperationResponses)
    assertValidationRuleCount(messages, DeleteOperationResponses, 1)
  })

  test("interger must have format", async () => {
    const fileName = "IntegerWithoutFormat.json"
    const messages: LintResultMessage[] = await collectTestMessagesFromValidator(fileName, OpenApiTypes.arm, IntegerTypeMustHaveFormat)
    assertValidationRuleCount(messages, IntegerTypeMustHaveFormat, 1)
  })

  test("x-ms-pageable doesn't have corresponding property", async () => {
    const fileName = "PageableOperationWithoutCorrespondingProp.json"
    const messages: LintResultMessage[] = await collectTestMessagesFromValidator(
      fileName,
      OpenApiTypes.arm,
      XmsPageableMustHaveCorrespondingResponse
    )
    assertValidationRuleCount(messages, XmsPageableMustHaveCorrespondingResponse, 1)
  })

  test("x-ms-pageable have corresponding property", async () => {
    const fileName = "PageableOperationWithCorrespondingProp.json"
    const messages: LintResultMessage[] = await collectTestMessagesFromValidator(
      fileName,
      OpenApiTypes.arm,
      XmsPageableMustHaveCorrespondingResponse
    )
    assertValidationRuleCount(messages, XmsPageableMustHaveCorrespondingResponse, 0)
  })

  test("x-ms-pageable have null nextlink", async () => {
    const fileName = "PageableOperationWithNullNextLink.json"
    const messages: LintResultMessage[] = await collectTestMessagesFromValidator(
      fileName,
      OpenApiTypes.arm,
      XmsPageableMustHaveCorrespondingResponse
    )
    assertValidationRuleCount(messages, XmsPageableMustHaveCorrespondingResponse, 0)
  })


  test("Preview version over a year", async () => {
    const fileName = "PreviewVersionOverOneYear.json"
    const messages: LintResultMessage[] = await collectTestMessagesFromValidator(fileName, OpenApiTypes.arm, PreviewVersionOverOneYear)
    assertValidationRuleCount(messages, PreviewVersionOverOneYear, 1)
  })

  test("Raas resource is defined with empty properties", async () => {
    const fileName = "RpaasResourceWithEmptyPropertiesBag.json"
    const messages: LintResultMessage[] = await collectTestMessagesFromValidator(
      fileName,
      OpenApiTypes.rpaas,
      Rpaas_ResourceProvisioningState
    )
    assertValidationRuleCount(messages, Rpaas_ResourceProvisioningState, 1)
  })

  test("Raas resource is defined with provisioning properties", async () => {
    const fileName = "RpaasResourceWithProvisioningState.json"
    const messages: LintResultMessage[] = await collectTestMessagesFromValidator(
      fileName,
      OpenApiTypes.rpaas,
      Rpaas_ResourceProvisioningState
    )
    assertValidationRuleCount(messages, Rpaas_ResourceProvisioningState, 0)
  })

  test("only has default response", async () => {
    const fileName = "OnlyDefaultResponseSchema.json"
    const messages: LintResultMessage[] = await collectTestMessagesFromValidator(fileName, OpenApiTypes.arm, ValidResponseCodeRequired)
    assertValidationRuleCount(messages, ValidResponseCodeRequired, 1)
  })

  test("not only has default response", async () => {
    const fileName = "NotOnlyDefaultResponseSchema.json"
    const messages: LintResultMessage[] = await collectTestMessagesFromValidator(fileName, OpenApiTypes.arm, ValidResponseCodeRequired)
    assertValidationRuleCount(messages, ValidResponseCodeRequired, 0)
  })

  test("resource tag meet common type", async () => {
    const filename = "ResourceWithTag.json"
    const messages: LintResultMessage[] = await collectTestMessagesFromValidator(filename, OpenApiTypes.arm, AzureResourceTagsSchema)
    assertValidationRuleCount(messages, AzureResourceTagsSchema, 1)
  })

  test("missing x-ms-error-response", async () => {
    const fileName = "ErrorResponseMissing.json"
    const messages: LintResultMessage[] = await collectTestMessagesFromValidator(fileName, OpenApiTypes.arm, MissingXmsErrorResponse)
    assertValidationRuleCount(messages, MissingXmsErrorResponse, 2)
  })

  test("missing type:object", async () => {
    const fileName = "missingTypeObject.json"
    const messages: LintResultMessage[] = await collectTestMessagesFromValidator(fileName, OpenApiTypes.arm, MissingTypeObject)
    assertValidationRuleCount(messages, MissingTypeObject, 9)
  })

  test("parameter order not match", async () => {
    const fileName = "ParameterOrderNotMatchPath.json"
    const messages: LintResultMessage[] = await collectTestMessagesFromValidator(fileName, OpenApiTypes.arm, ParametersOrder)
    assertValidationRuleCount(messages, ParametersOrder, 1)
  })

  test("rpaas extension resource", async () => {
    const fileName = "RPaaSExtensionResource.json"
    const messages: LintResultMessage[] = await collectTestMessagesFromValidator(fileName, OpenApiTypes.rpaas, ExtensionResourcePathPattern)
    assertValidationRuleCount(messages, ExtensionResourcePathPattern, 1)
  })

  test("x-ms-enum absent", async () => {
    const fileName = "XmsEnumAbsent.json"
    const messages: LintResultMessage[] = await collectTestMessagesFromValidator(fileName, OpenApiTypes.arm, XmsEnumValidation)
    assertValidationRuleCount(messages, XmsEnumValidation, 2)
  })

  test("x-ms-identifiers missing", async () => {
    const fileName = "XmsIdentifiers.json"
    const messages: LintResultMessage[] = await collectTestMessagesFromValidator(fileName, OpenApiTypes.arm, XmsIdentifierValidation)
    assertValidationRuleCount(messages, XmsIdentifierValidation, 2)
  })
  test("no put in for tracked resource", async () => {
    const fileNames = ["armResource/trackedResourceNoPut.json", "armResource/trackedResourceCommon.json"]
    const ruleName = "TrackedResourcesMustHavePut"
    const messages: LintResultMessage[] = await collectTestMessagesFromValidator(fileNames, OpenApiTypes.arm, ruleName)
    assertValidationRuleCount(messages, ruleName, 1)
  })

  test("no delete in for tracked resource", async () => {
    const fileNames = ["armResource/trackedResourceNoDelete.json", "armResource/trackedResourceCommon.json"]
    const ruleName = "AllTrackedResourcesMustHaveDelete"
    const messages: LintResultMessage[] = await collectTestMessagesFromValidator(fileNames, OpenApiTypes.arm, ruleName)
    assertValidationRuleCount(messages, ruleName, 1)
    getErrorMessages(messages)
  })

  test("no delete in for proxy resource", async () => {
    const fileNames = ["armResource/trackedResourceNoDelete.json", "armResource/trackedResourceCommon.json"]
    const ruleName = "AllProxyResourcesShouldHaveDelete"
    const messages: LintResultMessage[] = await collectTestMessagesFromValidator(fileNames, OpenApiTypes.arm, ruleName)
    assertValidationRuleCount(messages, ruleName, 1)
    getWarningMessages(messages)
  })

  test("tracked resource beyonds third level", async () => {
    const fileNames = ["armResource/trackedResourceBeyondsThirdLevel.json", "armResource/trackedResourceCommon.json"]
    const ruleName = "TrackedResourceBeyondsThirdLevel"
    const messages: LintResultMessage[] = await collectTestMessagesFromValidator(fileNames, OpenApiTypes.arm, ruleName)
    assertValidationRuleCount(messages, ruleName, 1)
  })
})
