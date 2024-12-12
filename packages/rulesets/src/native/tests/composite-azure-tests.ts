/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { LintResultMessage, OpenApiTypes } from "@microsoft.azure/openapi-validator-core"
import { AllResourcesMustHaveGetOperation } from "../legacyRules/AllResourcesMustHaveGetOperation"
import { DescriptionMustNotBeNodeName } from "../legacyRules/DescriptionMustNotBeNodeName"
import { GetCollectionResponseSchema } from "../legacyRules/GetCollectionResponseSchema"
import { NestedResourcesMustHaveListOperation } from "../legacyRules/NestedResourcesMustHaveListOperation"
import { PageableOperation } from "../legacyRules/PageableOperation"
import { PrivateEndpointResourceSchemaValidation } from "../legacyRules/PrivateEndpointResourceSchemaValidation"
import { RequiredReadOnlySystemData } from "../legacyRules/RequiredReadOnlySystemData"
import { TopLevelResourcesListByResourceGroup } from "../legacyRules/TopLevelResourcesListByResourceGroup"
import { TopLevelResourcesListBySubscription } from "../legacyRules/TopLevelResourcesListBySubscription"
import { UniqueModelName } from "../legacyRules/UniqueModelName"
import { UniqueXmsEnumName } from "../legacyRules/UniqueXmsEnumName"
import { UniqueXmsExample } from "../legacyRules/UniqueXmsExample"
import { assertValidationRuleCount, collectTestMessagesFromValidator } from "./utilities/tests-helper"

describe("CompositeAzureTests", () => {
  test("description should not be property name", async () => {
    const fileName = "DescriptionSameAsPropertyName.json"
    const messages: LintResultMessage[] = await collectTestMessagesFromValidator(fileName, OpenApiTypes.arm, DescriptionMustNotBeNodeName)
    assertValidationRuleCount(messages, DescriptionMustNotBeNodeName, 2)
  })

  test("operations returning a model including an array might be pageable (sad path)", async () => {
    const fileName = "PageableOperation.json"
    const messages: LintResultMessage[] = await collectTestMessagesFromValidator(fileName, OpenApiTypes.arm, PageableOperation)
    assertValidationRuleCount(messages, PageableOperation, 1)
  })

  test("operations returning a model including an array might be pageable (happy path)", async () => {
    const fileName = "happyPath/PageableOperation.json"
    const messages: LintResultMessage[] = await collectTestMessagesFromValidator(fileName, OpenApiTypes.arm, PageableOperation)
    assertValidationRuleCount(messages, PageableOperation, 0)
  })

  test("extensions x-ms-enum must not have duplicate name", async () => {
    const fileName = "XmsEnumWithDuplicateName.json"
    const messages: LintResultMessage[] = await collectTestMessagesFromValidator(fileName, OpenApiTypes.arm, UniqueXmsEnumName)
    assertValidationRuleCount(messages, UniqueXmsEnumName, 1)
  })

  test("extensions x-ms-enum can have duplicate name with same enties (happy path)", async () => {
    const fileName = "happyPath/XmsEnumWithDuplicateNameAndSameEnties.json"
    const messages: LintResultMessage[] = await collectTestMessagesFromValidator(fileName, OpenApiTypes.arm, UniqueXmsEnumName)
    assertValidationRuleCount(messages, UniqueXmsEnumName, 0)
  })

  test("new apiVersion have operation without systemData", async () => {
    const fileName = "NewApiVersionHaveOperationWithoutSystemData.json"
    const messages: LintResultMessage[] = await collectTestMessagesFromValidator(fileName, OpenApiTypes.arm, RequiredReadOnlySystemData)
    assertValidationRuleCount(messages, RequiredReadOnlySystemData, 2)
  })

  test("all nested resources must have collection operation", async () => {
    const fileName = "armResource/compute.json"
    const messages: LintResultMessage[] = await collectTestMessagesFromValidator(
      fileName,
      OpenApiTypes.arm,
      NestedResourcesMustHaveListOperation
    )
    assertValidationRuleCount(messages, NestedResourcesMustHaveListOperation, 1)
  })

  test("top level resources must list by resource group", async () => {
    const fileName = "armResource/compute.json"
    const messages: LintResultMessage[] = await collectTestMessagesFromValidator(
      fileName,
      OpenApiTypes.arm,
      TopLevelResourcesListByResourceGroup
    )
    assertValidationRuleCount(messages, TopLevelResourcesListByResourceGroup, 1)
  })

  test("extension top level resources should report no errors", async () => {
    const fileName = ["armResource/extensionTrackedResourceNoListBySubscription.json", "armResource/trackedResourceCommon.json"]
    const messages: LintResultMessage[] = await collectTestMessagesFromValidator(
      fileName,
      OpenApiTypes.arm,
      TopLevelResourcesListBySubscription
    )
    assertValidationRuleCount(messages, TopLevelResourcesListBySubscription, 0)
  })

  test("top level resources must list by subscription", async () => {
    const fileName = "armResource/compute.json"
    const messages: LintResultMessage[] = await collectTestMessagesFromValidator(
      fileName,
      OpenApiTypes.arm,
      TopLevelResourcesListBySubscription
    )
    // There is tenant level api in compute.json file
    assertValidationRuleCount(messages, TopLevelResourcesListBySubscription, 0)
  })

  test("get collection response schema should match the ARM specification", async () => {
    const fileName = "armResource/cdn.json"
    const messages: LintResultMessage[] = await collectTestMessagesFromValidator(fileName, OpenApiTypes.arm, GetCollectionResponseSchema)
    assertValidationRuleCount(messages, GetCollectionResponseSchema, 1)
  })

  test("get collection response schema should match the ARM specification", async () => {
    console.log("hello")
    const fileName = "armResource/containerApps.json"
    const messages: LintResultMessage[] = await collectTestMessagesFromValidator(fileName, OpenApiTypes.arm, GetCollectionResponseSchema)
    assertValidationRuleCount(messages, GetCollectionResponseSchema, 0)
  })

  test("all resources must have get operation", async () => {
    const fileName = "armResource/cluster.json"
    const messages: LintResultMessage[] = await collectTestMessagesFromValidator(
      fileName,
      OpenApiTypes.arm,
      AllResourcesMustHaveGetOperation
    )
    assertValidationRuleCount(messages, AllResourcesMustHaveGetOperation, 1)
  })

  test("all resources must have get operation positive 1", async () => {
    const fileName = "armResource/firewallPolicy.json"
    const messages: LintResultMessage[] = await collectTestMessagesFromValidator(
      fileName,
      OpenApiTypes.arm,
      AllResourcesMustHaveGetOperation
    )
    assertValidationRuleCount(messages, AllResourcesMustHaveGetOperation, 0)
  })

  test("all resources must have get operation positive 2", async () => {
    const fileName = "armResource/containerservice.json"
    const messages: LintResultMessage[] = await collectTestMessagesFromValidator(
      fileName,
      OpenApiTypes.arm,
      AllResourcesMustHaveGetOperation
    )
    assertValidationRuleCount(messages, AllResourcesMustHaveGetOperation, 0)
  })
  test("all resources must have get operation positive 3", async () => {
    const fileName = "armResource/machinelearning.json"
    const messages: LintResultMessage[] = await collectTestMessagesFromValidator(
      fileName,
      OpenApiTypes.arm,
      AllResourcesMustHaveGetOperation
    )
    assertValidationRuleCount(messages, AllResourcesMustHaveGetOperation, 0)
  })

  test("all resources must have get operation positive 4", async () => {
    const fileName = "armResource/compute.json"
    const messages: LintResultMessage[] = await collectTestMessagesFromValidator(
      fileName,
      OpenApiTypes.arm,
      AllResourcesMustHaveGetOperation
    )
    assertValidationRuleCount(messages, AllResourcesMustHaveGetOperation, 0)
  })

  test("unique model name", async () => {
    const fileName = "UniqueModelName.json"
    const messages: LintResultMessage[] = await collectTestMessagesFromValidator(fileName, OpenApiTypes.arm, UniqueModelName)
    assertValidationRuleCount(messages, UniqueModelName, 1)
  })

  test("private link resource schema unmatch", async () => {
    const fileName = "PrivateLinkResourceUnMatch.json"
    const messages: LintResultMessage[] = await collectTestMessagesFromValidator(
      fileName,
      OpenApiTypes.arm,
      PrivateEndpointResourceSchemaValidation
    )
    assertValidationRuleCount(messages, PrivateEndpointResourceSchemaValidation, 2)
  })

  test("Unique x-ms-examples", async () => {
    const fileName = "UniqueXmsExample.json"
    const messages: LintResultMessage[] = await collectTestMessagesFromValidator(fileName, OpenApiTypes.arm, UniqueXmsExample)
    assertValidationRuleCount(messages, UniqueXmsExample, 1)
  })
})
