/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import * as assert from "assert"
import { only, skip, slow, suite, test, timeout } from "mocha-typescript"
import { run } from "../../azure-openapi-validator"
import { AutoRestPluginHost } from "../../jsonrpc/plugin-host"
import { Message } from "../../jsonrpc/types"
import { MergeStates, OpenApiTypes } from "../rule"
import { AllResourcesMustHaveGetOperation } from "../rules/AllResourcesMustHaveGetOperation"
import { AllResourcesMustHaveGetOperationV2 } from "../rules/AllResourcesMustHaveGetOperationV2"
import { DescriptionMustNotBeNodeName } from "../rules/DescriptionMustNotBeNodeName"
import { GetCollectionResponseSchema } from "../rules/GetCollectionResponseSchema"
import { NestedResourcesMustHaveListOperation } from "../rules/NestedResourcesMustHaveListOperation"
import { OperationsApiResponseSchema } from "../rules/OperationsApiResponseSchema"
import { PageableOperation } from "../rules/PageableOperation"
import { RequiredSystemDataInNewApiVersions } from "../rules/RequiredSystemDataInNewApiVersions"
import { TopLevelResourcesListByResourceGroup } from "../rules/TopLevelResourcesListByResourceGroup"
import { TopLevelResourcesListBySubscription } from "../rules/TopLevelResourcesListBySubscription"
import { UniqueXmsEnumName } from "../rules/UniqueXmsEnumName"
import { assertValidationRuleCount, collectTestMessagesFromValidator } from "./utilities/tests-helper"

@suite
class CompositeAzureTests {
  @test public async "description should not be property name"() {
    const fileName: string = "DescriptionSameAsPropertyName.json"
    const messages: Message[] = await collectTestMessagesFromValidator(fileName, OpenApiTypes.arm, MergeStates.composed)
    assertValidationRuleCount(messages, DescriptionMustNotBeNodeName, 2)
  }

  @test public async "operations returning a model including an array might be pageable (sad path)"() {
    const fileName: string = "PageableOperation.json"
    const messages: Message[] = await collectTestMessagesFromValidator(fileName, OpenApiTypes.arm, MergeStates.composed)
    assertValidationRuleCount(messages, PageableOperation, 1)
  }

  @test public async "operations returning a model including an array might be pageable (happy path)"() {
    const fileName: string = "happyPath/PageableOperation.json"
    const messages: Message[] = await collectTestMessagesFromValidator(fileName, OpenApiTypes.arm, MergeStates.composed)
    assertValidationRuleCount(messages, PageableOperation, 0)
  }

  @test public async "extensions x-ms-enum must not have duplicate name"() {
    const fileName = "XmsEnumWithDuplicateName.json"
    const messages: Message[] = await collectTestMessagesFromValidator(fileName, OpenApiTypes.arm, MergeStates.composed)
    assertValidationRuleCount(messages, UniqueXmsEnumName, 1)
  }

  @test public async "extensions x-ms-enum can have duplicate name with same enties"() {
    const fileName = "XmsEnumWithDuplicateNameAndSameEnties.json"
    const messages: Message[] = await collectTestMessagesFromValidator(fileName, OpenApiTypes.arm, MergeStates.composed)
    assertValidationRuleCount(messages, UniqueXmsEnumName, 0)
  }

  @test public async "new apiVersion have operation without systemData"() {
    const fileName = "NewApiVersionHaveOperationWithoutSystemData.json"
    const messages: Message[] = await collectTestMessagesFromValidator(fileName, OpenApiTypes.arm, MergeStates.composed)
    assertValidationRuleCount(messages, RequiredSystemDataInNewApiVersions, 1)
  }

  @test public async "get collection response schema should match the ARM specification "() {
    const fileName: string = "armResource/appconfiguration.json"
    const messages: Message[] = await collectTestMessagesFromValidator(fileName, OpenApiTypes.arm, MergeStates.composed)
    assertValidationRuleCount(messages, GetCollectionResponseSchema, 0)
  }
  @test public async "all nested resources must have collection operation "() {
    const fileName: string = "armResource/compute.json"
    const messages: Message[] = await collectTestMessagesFromValidator(fileName, OpenApiTypes.arm, MergeStates.composed)
    assertValidationRuleCount(messages, NestedResourcesMustHaveListOperation, 0)
  }
  @test public async "operations api response must have specific schema"() {
    const fileName: string = "armResource/compute.json"
    const messages: Message[] = await collectTestMessagesFromValidator(fileName, OpenApiTypes.arm, MergeStates.composed)
    assertValidationRuleCount(messages, OperationsApiResponseSchema, 1)
  }
  @test public async "top level resources must list by resource group"() {
    const fileName: string = "armResource/compute.json"
    const messages: Message[] = await collectTestMessagesFromValidator(fileName, OpenApiTypes.arm, MergeStates.composed)
    assertValidationRuleCount(messages, TopLevelResourcesListByResourceGroup, 0)
  }
  @test public async "top level resources must list by subscription"() {
    const fileName: string = "armResource/compute.json"
    const messages: Message[] = await collectTestMessagesFromValidator(fileName, OpenApiTypes.arm, MergeStates.composed)
    assertValidationRuleCount(messages, TopLevelResourcesListBySubscription, 0)
  }

  @test public async "all resources must have get operation 1"() {
    const fileName: string = "armResource/desktopvirtualization.json"
    const messages: Message[] = await collectTestMessagesFromValidator(fileName, OpenApiTypes.arm, MergeStates.composed)
    assertValidationRuleCount(messages, AllResourcesMustHaveGetOperation, 0)
  }

  @test public async "all resources must have get operation 2"() {
    const fileName: string = "armResource/firewallPolicy.json"
    const messages: Message[] = await collectTestMessagesFromValidator(fileName, OpenApiTypes.arm, MergeStates.composed)
    assertValidationRuleCount(messages, AllResourcesMustHaveGetOperation, 0)
  }

  @test public async "all resources must have get operation 3"() {
    const fileName: string = "armResource/cdn.json"
    const messages: Message[] = await collectTestMessagesFromValidator(fileName, OpenApiTypes.arm, MergeStates.composed)
    assertValidationRuleCount(messages, AllResourcesMustHaveGetOperation, 2)
  }
  @test public async "all resources must have get operation 4"() {
    const fileName: string = "armResource/containerservice.json"
    const messages: Message[] = await collectTestMessagesFromValidator(fileName, OpenApiTypes.arm, MergeStates.composed)
    assertValidationRuleCount(messages, AllResourcesMustHaveGetOperation, 0)
  }
  @test public async "all resources must have get operation 5"() {
    const fileName: string = "armResource/machinelearning.json"
    const messages: Message[] = await collectTestMessagesFromValidator(fileName, OpenApiTypes.arm, MergeStates.composed)
    assertValidationRuleCount(messages, AllResourcesMustHaveGetOperation, 0)
  }

  @test public async "all resources must have get operation 6"() {
    const fileName: string = "armResource/compute.json"
    const messages: Message[] = await collectTestMessagesFromValidator(fileName, OpenApiTypes.arm, MergeStates.composed)
    assertValidationRuleCount(messages, AllResourcesMustHaveGetOperation, 10)
     assertValidationRuleCount(messages, AllResourcesMustHaveGetOperationV2, 10)
  }

  @test public async "all resources must have get operation 7 "() {
    const fileName: string = "armResource/security.json"
    const messages: Message[] = await collectTestMessagesFromValidator(fileName, OpenApiTypes.arm, MergeStates.composed)
    assertValidationRuleCount(messages, AllResourcesMustHaveGetOperation, 4)
  }

  @test public async "all resources must have get operation 8"() {
    const fileName: string = "armResource/cluster.json"
    const messages: Message[] = await collectTestMessagesFromValidator(fileName, OpenApiTypes.arm, MergeStates.composed)
    assertValidationRuleCount(messages, AllResourcesMustHaveGetOperation, 0)
  }
}
