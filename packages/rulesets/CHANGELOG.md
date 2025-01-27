# Change Log - @microsoft.azure/openapi-validator-rulesets

## 2.1.6

### Patches

- [AllTrackedResourcesMustHaveDelete][TrackedResourcePatchOperation] Skip the api paths if it has PrivateEndpointConnectionProxy
- [PatchBodyParametersSchema] Skip validation for MSI (managed service identity) as it is being referenced from common-types and has the required field & is being referenced in patch body parameter schema by several RP's who are having to get an exception.

### Patches

## 2.1.5
Tue, 14 Jan 2025 19:10:00 GMT

### Patches

- [AvoidMsdnReferences] Fix addition of "docs.microsoft.com" to disallow list

## 2.1.4
Tue, 14 Jan 2025 19:10:00 GMT

### Patches

- [AvoidMsdnReferences] Disallow "docs.microsoft.com", recommend "learn.microsft.com"

## 1.3.4
Thu, 01 Feb 2024 23:08:29 GMT

### Patches

- Gracefully handle lack of section.value["x-ms-enum"].name in UniqueXmsEnumName. Solves https://github.com/Azure/azure-openapi-validator/issues/654

## 1.3.3
Tue, 30 Jan 2024 18:28:15 GMT

### Patches

- Fix a false positive in NoDuplicatePathsForScopeParameter where the rule would flag list and point GETs as the same path
- Add rpcGuidelineCode to linter rules in azARM rulesets
- Fix ResourceNameRestriction rule to exclude validation for system-defined parameters
- Update latestVersionOfCommonTypesMustBeUsed rule to check for latest version(V5) of all common types
- Upgrade version to 1.3.2
- Add RPC code to ProvisioningStateMustBeReadOnly and fix documentation
- Fix a false alarm with the ParameterNotUsingCommonTypes rule that resulted in errors being flagged even when common-types were being referenced correctly.
- Fix an issue where PropertiesTypeObjectNoDefinition must verify the existence of the allOf property in the definition object.

## 1.3.2
Tue, 19 Dec 2023 21:25:29 GMT

### Patches

- Disable falsely flagging rules(RequestBodyMustExistForPutPatch, PatchPropertiesCorrespondToPutProperties, PropertiesTypeObjectNoDefinition) in PROD
- Fix RequestBodyMustExistForPutPatch rule to not check the body param name to be 'body'
- Fix null check for latestVersionOfCommonTypesMustBeUsed
- Fix trackedExtensionResourcesAreNotAllowed from flagging false positives
- Add linter rules to production pipeline and update version to 1.3.0
- Make XmsIdentifierValidation a warning as it isn't truly blocking and there could be valid cases when 'x-ms-identifier' isn't present in the array.
- Modify the rule AllTrackedResourcesMustHaveDelete to flag an error even when a Put operation is not specified for Tracked resources
- Fix documentation and add tests for the AvoidNestedProperties rule
- Update UnsupportedPatchProperties rule to include a check for properties.provisioningState property. The change is to ensure that provisioningState property is not updatable via a patch operation.

## 1.3.0
Tue, 05 Dec 2023 20:03:59 GMT

### Patches

- Fix fatal error caused by undefined parameters in ParametersInPointGet rule
- Update get-collection-only-has-value-nextlink.md to get-collection-only-has-value-and-next-link.md in order to match the rule name getCollectionOnlyHasValueAndNextLink
- Update docs and output message for PathForNestedResource rule to include details about the exception for extension resources and file a suppression request
- Update RPC-GET-V1-01(GetResponseCodes) to allow GET with 202 response code if the GET represents the location header polling url. Update RPC-Post-V1-09(LroExtension) to exclude GET from x-ms-long-running-operation presence validation
- Implement TenantLevelAPIsNotAllowed rule to check the existence of tenant level paths for PUT operation and guide through the process to get an exception 
- Fix resourceNameRestriction to handle missing operation parameters
- Fix an issue where PatchPropertiesCorrespondToPutProperties rule checks if the path has both PUT and PATCH calls.
- Add ConsistentResponseSchemaForPut (RPC-Put-V1-29) rule. The response schema of the 200 and 201 status codes of Put operation must be the same.
- Fix an issue with AvoidAdditionalProperties rule. This rule is checking the additionalProperties defined from common-types or other predefined references, when it shouldn't.
- Fix an issue where propertiesTypeObjectNoDefinition rules needs to check additional properties.
- Add XmsPageableForListCalls (RPC-Get-V1-13) rule which ensures that all LIST APIs must contain the ‘x-ms-pageable’ extension
- Modify ValidateSegmentsInNestedResourceListOperation rule name to MissingSegmentsInNestedResourceListOperation

## 1.2.2
Wed, 04 Oct 2023 17:01:43 GMT

### Patches

- Add EvenSegmentedPathForPutOperation rule that flags paths with PUT operation defined that do not end in {resourceType}/{resourceName}
- Add test cases for path-for-resource-action rule
- Add trackedExtensionResourcesAreNotAllowed rule that flags tracked extension resources, as extension resources may only be proxy
- Exclude not fully qualified extension resource paths in TopLevelResourcesListBySubscription linter rule
- Update PatchPropertiesCorrespondsToPutProperties to run in staging only
- Delete RPC-POST-V1-02(SyncPostReturn) linter rule as it is covered by RPC-Async-V1-11(PostReturnCodes)
- Change OperationsApiTenantLevelOnly to error for the path level instead of the operation level (#577)
- Change ReservedResourceNamesAsEnum from an error to a warning and make it warn for the path level instead of the operation level (#575)
- Add RPC codes to some existing rules
- Change severity of PatchSkuProperty and PatchIdentityProperty to warning
- Add a new rule RequestBodyMustExistForPutPatch that checks for the existence of a request body for a put or a patch operation.
- Add new rule MissingSegmentsInNestedResourceListOperation, this rules checks if the nested resource type's List operation includes all the parent segments in its api path.
- Modify PathForTrackedResourceTypes, this rule will check the path must be under a subscription and resource group for tracked resource types only.
- Disable rule PropertiesTypeObjectNoDefinition in production pipeline
- Add GetOperationMustNotBeLongRunning, this rule makes sure GET calls must not have LRO properties as GET calls are synchronous
- Removed LroPostReturn (RPC-Post-V1-03) rule and updated PostResponseCodes rule with logic to flag POST 202 responses that have schemas
- Add XmsLongRunningOperationProperty as new rule. This rules checks if any reponses headers have Location or Azure-AsyncOperation properties, then it must have x-ms-long-running-operation set to true.

## 1.2.0
Wed, 16 Aug 2023 22:39:14 GMT

### Minor changes

- Added rule to check that parameters already defined in common-types are not being redefined.
- Remove RequiredReadOnlyProperties rule
- Update to 1.1.0

### Patches

- Add support for rfc7231 datetime
- Add test for RPC-POST-V1-01
- test
- fix wrong changes from a merge conflict
- implement RPC-PATCH-V1-01
- Added rule to detect additionalProperties(RPC-Policy-V1-05)
- re-implement rule ImplementPrivateEndpointApis
- disable recent unverified rules (since 5/10/2023) from running in production
- Disable few rules known to be buggy: ResourceMustReferenceCommonTypes, LROPostFinalStateViaProperty, ProvisioningStateMustBeReadOnly
- Add test for ProvisioingStateMustBeReadOnly 
- Fix leftover changes for 'rush build' and 'rush regen-ruleindex'
- implement rule to validate if provisioingState is readOnly
- implement rule to flag usage of obsolete versions of common-types
- Implement RPC-Async-V1-02
- implement rpc_patch_v1_06
- implement RPC-POST-V1-05
- implement RPC_delete_v1_01
- implement RPC-GET-V1-08
- impelement rpc-post-v1-09
- Implement RPC-PUT-V1-11
- Added rule to detect non-default error codes.
- update PatchResponseCodes
- Implement PostResponseCodes(RPC-ASYNC-V1-11)
- Implement PutResponseCodes(RPC-Async-V1-01) 
- Make RPC-Put-V1-25 as an Error for ARM
- Add rule to check that resource definitions are using the common types references for ProxyResource or TrackedResource
- Revert PR 494
- merging linter rules DeleteOperationAsyncResponseValidation and delete-response-codes and removing the checks from long-running-response-status-code as they have conflicting implementations
- fixing documenation and error message for CreateOperationAsyncResponseValidation to be in sync with the implementation
- fixing PutRequestResponseSchemeArm for the case where a model has a property that is empty
- fixing rush build inconsistency
- fix verifyArmPath to account for third party RP namespaces
- removing all code related to ProvisioningStateSpecifiedForLRODelete
- removing dead code for ResourceMustReferenceCommonTypes and LROPostFinalStateViaProperty
- Modified category from warning to error for linter rules LroExtension, LroStatusCodesReturnTypeSchema, DescriptiveDescriptionRequired, ParameterDescriptionRequired
- fixing rpc_patch_v1_02
- fixing generated files due to missed prior rush build
- Added linter rule for RPC-Common-V1-05 and updated documentation for parameter common types rule.
- Add rule that checks for service-defined resource names and ensures they are represented as an enum type with modelAsString set to true, not as a static string in the path
- Added linter rule for RPC-Get-V1-09 that ensures collection GET endpoints have properties `value` and `nextLink`, and no other properties.
- Add a linter rule for RPC-Operations-V1-01 and RPC-Operations-V1-02 to check for operations API at levels other than tenant level (e.g., subscription level).
- Added a linter rule for using the common types operations API response.
- implement RPC-POST-V1-02 and RPC-POST-V1-03 rules"
- Add rt1/rt2/{resourceName} to invalid patterns for RPC-URI-V1-06/RPC-Put-V1-02
- Adding ARM RPC rule RPC-Put-V1-07
- implement rpc-v1-11
- Add linter rule for RPC-SystemData-V1-01
- Add linter rule for RPC-Uri-V1-10 to detect path duplication when using the scope parameter.
- update APIVersionPattern & ValidFormat
- bugfix for 4 rules
- refactor internal names
- Added rule to detect additionalProperties(RPC-Policy-V1-05)
- Added rule to detect PropertiesTypeObjectNoDefinition (RPC-Policy-V1-03)
- Deleted files and context related to rule RPC-Put-V1-11
- Updated linter rule for RPC-Get-V1-09 that ensures collection GET endpoints have properties `value` and `nextLink`, and no other properties.
- Removed the check which is not required as the part of "CreateOperationAsyncResponseValidation" amd removed the RPC-Async-V1-06 rule
- updated existing rule to address FPS RPC-Policy-V1-03

## 1.0.1
Thu, 24 Nov 2022 04:00:42 GMT

### Patches

- fix rule DefinitionsPropertiesNamesCamelCase & validFormats

