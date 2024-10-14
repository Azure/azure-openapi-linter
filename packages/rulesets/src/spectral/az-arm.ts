import { oas2 } from "@stoplight/spectral-formats"
import { falsy, pattern, truthy } from "@stoplight/spectral-functions"
import common from "./az-common"
import verifyArmPath from "./functions/arm-path-validation"
import bodyParamRepeatedInfo from "./functions/body-param-repeated-info"
import { camelCase } from "./functions/camel-case"
import collectionObjectPropertiesNaming from "./functions/collection-object-properties-naming"
import { consistentPatchProperties } from "./functions/consistent-patch-properties"
import consistentResponseSchemaForPut from "./functions/consistent-response-schema-for-put"
import { DeleteResponseCodes } from "./functions/delete-response-codes"
import { getCollectionOnlyHasValueAndNextLink } from "./functions/get-collection-only-has-value-and-next-link"
import { getResponseCodes } from "./functions/get-response-codes"
import hasApiVersionParameter from "./functions/has-api-version-parameter"
import hasheader from "./functions/has-header"
import httpsSupportedScheme from "./functions/https-supported-scheme"
import { latestVersionOfCommonTypesMustBeUsed } from "./functions/latest-version-of-common-types-must-be-used"
import locationMustHaveXmsMutability from "./functions/location-must-have-xms-mutability"
import validateOriginalUri from "./functions/lro-original-uri"
import { lroPatch202 } from "./functions/lro-patch-202"
import provisioningStateSpecifiedForLROPatch from "./functions/lro-patch-provisioning-state-specified"
import provisioningStateSpecifiedForLROPut from "./functions/lro-put-provisioning-state-specified"
import { missingSegmentsInNestedResourceListOperation } from "./functions/missing-segments-in-nested-resource-list-operation"
import noDuplicatePathsForScopeParameter from "./functions/no-duplicate-paths-for-scope-parameter"
import { noErrorCodeResponses } from "./functions/no-error-code-responses"
import operationsApiSchema from "./functions/operations-api-schema"
import { operationsApiTenantLevelOnly } from "./functions/operations-api-tenant-level-only"
import { parameterNotDefinedInGlobalParameters } from "./functions/parameter-not-defined-in-global-parameters"
import { parameterNotUsingCommonTypes } from "./functions/parameter-not-using-common-types"
import { parametersInPointGet } from "./functions/parameters-in-point-get"
import { parametersInPost } from "./functions/parameters-in-post"
import patchBodyParameters from "./functions/patch-body-parameters"
import { patchPropertiesCorrespondToPutProperties } from "./functions/patch-properties-correspond-to-put-properties"
import { patchResponseCodes } from "./functions/patch-response-codes"
import pathForTrackedResourceTypes from "./functions/path-for-tracked-resource-types"
import pathSegmentCasing from "./functions/path-segment-casing"
import { PostResponseCodes } from "./functions/post-response-codes"
import { propertiesTypeObjectNoDefinition } from "./functions/properties-type-object-no-definition"
import provisioningState from "./functions/provisioning-state"
import { provisioningStateMustBeReadOnly } from "./functions/provisioning-state-must-be-read-only"
import putGetPatchSchema from "./functions/put-get-patch-schema"
import { putRequestResponseScheme } from "./functions/put-request-response-scheme"
import { PutResponseCodes } from "./functions/put-response-codes"
import { queryParametersInCollectionGet } from "./functions/query-parameters-in-collection-get"
import { requestBodyMustExistForPutPatch } from "./functions/request-body-must-exist-for-put-patch"
import { reservedResourceNamesModelAsEnum } from "./functions/reserved-resource-names-model-as-enum"
import resourceNameRestriction from "./functions/resource-name-restriction"
import responseSchemaSpecifiedForSuccessStatusCode from "./functions/response-schema-specified-for-success-status-code"
import { securityDefinitionsStructure } from "./functions/security-definitions-structure"
import skuValidation from "./functions/sku-validation"
import { systemDataInPropertiesBag } from "./functions/system-data-in-properties-bag"
import { tagsAreNotAllowedForProxyResources } from "./functions/tags-are-not-allowed-for-proxy-resources"
import { tenantLevelAPIsNotAllowed } from "./functions/tenant-level-apis-not-allowed"
import { trackedExtensionResourcesAreNotAllowed } from "./functions/tracked-extension-resources-are-not-allowed"
import trackedResourceTagsPropertyInRequest from "./functions/trackedresource-tags-property-in-request"
import { validQueryParametersForPointOperations } from "./functions/valid-query-parameters-for-point-operations"
import { validatePatchBodyParamProperties } from "./functions/validate-patch-body-param-properties"
import withXmsResource from "./functions/with-xms-resource"
import verifyXMSLongRunningOperationProperty from "./functions/xms-long-running-operation-property"
import xmsPageableForListCalls from "./functions/xms-pageable-for-list-calls"

const ruleset: any = {
  extends: [common],
  rules: {
    ApiHost: {
      description: "The host is required for management plane specs.",
      message: "{{description}}",
      severity: "error",
      resolved: false,
      formats: [oas2],
      given: ["$.host"],
      then: {
        function: truthy,
      },
    },
    SubscriptionsAndResourceGroupCasing: {
      description: "The subscriptions and resourceGroup in resource uri should follow lower camel case.",
      message: "{{error}}",
      severity: "error",
      resolved: false,
      formats: [oas2],
      given: ["$.paths", "$.x-ms-paths"],
      then: {
        function: pathSegmentCasing,
        functionOptions: {
          segments: ["resourceGroups", "subscriptions"],
        },
      },
    },

    ///
    /// ARM RPC rules for Async patterns
    ///

    // RPC Code: RPC-Async-V1-01, RPC-Put-V1-11
    PutResponseCodes: {
      rpcGuidelineCode: "RPC-Async-V1-01, RPC-Put-V1-11",
      description: "LRO and Synchronous PUT must have 200 & 201 return codes.",
      severity: "error",
      disableForTypeSpecDataPlane: true,
      disableForTypeSpecDataPlaneReason:
        "Covered by TSP's '@azure-tools/typespec-azure-resource-manager/arm-put-operation-response-codes' rule.",
      message: "{{error}}",
      resolved: true,
      formats: [oas2],
      given: ["$[paths,'x-ms-paths'].*[put]"],
      then: {
        function: PutResponseCodes,
      },
    },

    // RPC Code: RPC-Async-V1-02
    //PUT
    ProvisioningStateSpecifiedForLROPut: {
      rpcGuidelineCode: "RPC-Async-V1-02",
      description:
        'A LRO PUT operation\'s response schema must have "ProvisioningState" property specified for the 200 and 201 status codes.',
      message: "{{error}}",
      severity: "error",
      resolved: true,
      formats: [oas2],
      given: ["$[paths,'x-ms-paths'].*[put][?(@property === 'x-ms-long-running-operation' && @ === true)]^"],
      then: {
        function: provisioningStateSpecifiedForLROPut,
      },
    },
    //Patch
    ProvisioningStateSpecifiedForLROPatch: {
      rpcGuidelineCode: "RPC-Async-V1-02",
      description:
        'A long running Patch operation\'s response schema must have "ProvisioningState" property specified for the 200 status code.',
      message: "{{error}}",
      severity: "error",
      resolved: true,
      formats: [oas2],
      given: [
        "$[paths,'x-ms-paths'].*[patch][?(@property === 'x-ms-long-running-operation' && @ === true)]^.responses[?(@property == '200')]",
      ],
      then: {
        function: provisioningStateSpecifiedForLROPatch,
      },
    },

    // https://github.com/Azure/azure-openapi-validator/issues/332
    // RPC Code: RPC-Async-V1-03
    ProvisioningStateValidation: {
      rpcGuidelineCode: "RPC-Async-V1-03",
      description: "ProvisioningState must have terminal states: Succeeded, Failed and Canceled.",
      message: "{{error}}",
      severity: "error",
      disableForTypeSpecDataPlane: true,
      disableForTypeSpecDataPlaneReason:
        "Covered by TSP's '@azure-tools/typespec-azure-resource-manager/arm-resource-provisioning-state' rule.",
      resolved: false,
      formats: [oas2],
      given: ["$.definitions..provisioningState[?(@property === 'enum')]^", "$.definitions..ProvisioningState[?(@property === 'enum')]^"],
      then: {
        function: provisioningState,
      },
    },

    // RPC Code: RPC-Async-V1-06
    LroAzureAsyncOperationHeader: {
      rpcGuidelineCode: "RPC-Async-V1-06",
      description: "Azure-AsyncOperation header must be supported for all async operations that return 202.",
      message: "{{description}}",
      severity: "error",
      formats: [oas2],
      given: "$.paths[*][*].responses[?(@property == '202')]",
      then: {
        function: hasheader,
        functionOptions: {
          name: "Azure-AsyncOperation",
        },
      },
    },

    // RPC Code: RPC-Async-V1-07
    LroLocationHeader: {
      rpcGuidelineCode: "RPC-Async-V1-07",
      description: "Location header must be supported for all async operations that return 202.",
      message: "A 202 response should include an Location response header.",
      severity: "error",
      disableForTypeSpecDataPlane: true,
      disableForTypeSpecDataPlaneReason: "Covered by TSP's '@azure-tools/typespec-azure-resource-manager/arm-location-header' rule.",
      formats: [oas2],
      given: "$.paths[*][*].responses[?(@property == '202')]",
      then: {
        function: hasheader,
        functionOptions: {
          name: "Location",
        },
      },
    },

    // RPC Code: RPC-Async-V1-11, RPC-Async-V1-14
    PostResponseCodes: {
      rpcGuidelineCode: "RPC-Async-V1-11, RPC-Async-V1-14",
      description:
        "Synchronous POST must have either 200 or 204 return codes and LRO POST must have 202 return code. LRO POST should also have a 200 return code only if the final response is intended to have a schema",
      severity: "error",
      disableForTypeSpecDataPlane: true,
      disableForTypeSpecDataPlaneReason:
        "Covered by TSP's '@azure-tools/typespec-azure-resource-manager/arm-post-operation-response-codes' rule.",
      message: "{{error}}",
      resolved: true,
      formats: [oas2],
      given: ["$[paths,'x-ms-paths'].*[post]"],
      then: {
        function: PostResponseCodes,
      },
    },

    // RPC Code: RPC-Async-V1-15
    XMSLongRunningOperationProperty: {
      rpcGuidelineCode: "RPC-Async-V1-15",
      description:
        "If an operation's (PUT/POST/PATCH/DELETE) responses have `Location` or `Azure-AsyncOperation` headers then it MUST have the property `x-ms-long-running-operation` set to `true`",
      message:
        "If an operation's (PUT/POST/PATCH/DELETE) responses have `Location` or `Azure-AsyncOperation` headers then it MUST have the property `x-ms-long-running-operation` set to `true`",
      severity: "error",
      formats: [oas2],
      resolved: true,
      given: "$[paths,'x-ms-paths'].*[put,patch,post,delete]",
      then: {
        function: verifyXMSLongRunningOperationProperty,
      },
    },

    // RPC Code: RPC-Async-V1-16
    ProvisioningStateMustBeReadOnly: {
      rpcGuidelineCode: "RPC-Async-V1-16",
      description: "This is a rule introduced to validate if provisioningState property is set to readOnly or not.",
      message: "{{error}}",
      severity: "error",
      disableForTypeSpecDataPlane: true,
      disableForTypeSpecDataPlaneReason:
        "Covered by TSP's '@azure-tools/typespec-azure-resource-manager/arm-resource-provisioning-state' rule.",
      resolved: true,
      formats: [oas2],
      given: ["$[paths,'x-ms-paths'].*.*.responses.*.schema"],
      then: {
        function: provisioningStateMustBeReadOnly,
      },
    },

    // RPC Code: RPC-Common-V1-05
    LroErrorContent: {
      rpcGuidelineCode: "RPC-Common-V1-05",
      description:
        "Error response content of long running operations must follow the error schema provided in the common types v2 and above.",
      message: "{{description}}",
      severity: "error",
      resolved: false,
      formats: [oas2],
      given:
        "$[paths,'x-ms-paths'].*.*[?(@property === 'x-ms-long-running-operation' && @ === true)]^.responses[?(@property === 'default' || @property.startsWith('5') || @property.startsWith('4'))].schema.$ref",
      then: {
        function: pattern,
        functionOptions: {
          match: ".*/common-types/resource-management/v(([1-9]\\d+)|[2-9])/types.json#/definitions/ErrorResponse",
        },
      },
    },

    ///
    /// ARM RPC rules for Delete patterns
    ///

    // RPC Code: RPC-Delete-V1-01, RPC-Async-V1-09
    DeleteResponseCodes: {
      rpcGuidelineCode: "RPC-Delete-V1-01, RPC-Async-V1-09",
      description: "Synchronous DELETE must have 200 & 204 return codes and LRO DELETE must have 202 & 204 return codes.",
      severity: "error",
      message: "{{error}}",
      disableForTypeSpecDataPlane: true,
      disableForTypeSpecDataPlaneReason:
        "Covered by TSP's '@azure-tools/typespec-azure-resource-manager/arm-delete-operation-response-codes' rule.",
      resolved: true,
      formats: [oas2],
      given: ["$[paths,'x-ms-paths'].*[delete]"],
      then: {
        function: DeleteResponseCodes,
      },
    },

    // RPC Code: RPC-Delete-V1-02
    DeleteMustNotHaveRequestBody: {
      rpcGuidelineCode: "RPC-Delete-V1-02",
      description: "The delete operation must not have a request body.",
      severity: "error",
      message: "{{description}}",
      resolved: true,
      formats: [oas2],
      given: "$.paths.*.delete.parameters[?(@.in === 'body')]",
      then: {
        function: falsy,
      },
    },
    //https://github.com/Azure/azure-openapi-validator/issues/330
    // RPC Code: RPC-Delete-V1-04
    DeleteResponseBodyEmpty: {
      rpcGuidelineCode: "RPC-Delete-V1-04",
      description: "The delete response body must be empty.",
      message: "{{description}}",
      severity: "error",
      resolved: true,
      formats: [oas2],
      given: ["$[paths,'x-ms-paths'].*[delete].responses['200','204'].schema"],
      then: {
        function: falsy,
      },
    },

    ///
    /// ARM RPC rules for Policy Guidelines
    ///

    // RPC Code: RPC-Policy-V1-05, RPC-Put-V1-23
    AvoidAdditionalProperties: {
      rpcGuidelineCode: "RPC-Policy-V1-05, RPC-Put-V1-23",
      description: "Definitions must not have properties named additionalProperties except for user defined tags or predefined references.",
      severity: "error",
      message: "{{description}}",
      disableForTypeSpecDataPlane: true,
      disableForTypeSpecDataPlaneReason: "Covered by TSP's '@azure-tools/typespec-azure-resource-manager/no-record' rule.",
      // Only report errors at the source, not from inside $refs (the resolved document)
      resolved: false,
      formats: [oas2],
      // In some cases, variable "@" will be "null" when evaluating the expression, so it must be checked before dereferencing
      given:
        "$.definitions..[?(@property !== 'tags' && @property !== 'delegatedResources' && @property !== 'userAssignedIdentities' && @ && @.additionalProperties)]",
      then: {
        function: falsy,
      },
    },

    // RPC Code: RPC-Policy-V1-03
    PropertiesTypeObjectNoDefinition: {
      rpcGuidelineCode: "RPC-Policy-V1-03",
      description:
        "Properties with type:object that don't reference a model definition are not allowed. ARM doesn't allow generic type definitions as this leads to bad customer experience.",
      severity: "error",
      stagingOnly: true,
      message: "{{error}}",
      resolved: true,
      formats: [oas2],
      given: [
        "$.definitions..[?(@property === 'type' && @ ==='object')]^",
        "$.definitions..[?(@property === 'type' && @ === '')]^",
        "$.definitions..[?(@property === 'undefined')]^",
      ],
      then: {
        function: propertiesTypeObjectNoDefinition,
      },
    },

    ///
    /// ARM RPC rules for Get patterns
    ///

    // github issue https://github.com/Azure/azure-openapi-validator/issues/331
    // Get operation should return 200
    // already have rule to check if operation returns non 2XX, it should mark it as 'x-ms-error-response' explicitly
    // https://github.com/Azure/azure-openapi-validator/issues/549
    // GET can return 202 only if it is a polling action & has Location header defined. LroLocationHeader rule already checks if 202 response has Location header
    // so here just check for non 200, 202 response codes i.e, '201','203','204'
    // RPC Code: RPC-Get-V1-01
    GetResponseCodes: {
      rpcGuidelineCode: "RPC-Get-V1-01",
      description: 'The GET operation should only return 200. In addition, it can return 202 only if it has "Location" header defined',
      message: "{{error}}",
      severity: "error",
      resolved: true,
      formats: [oas2],
      given: ["$[paths,'x-ms-paths'].*[get]"],
      then: {
        function: getResponseCodes,
      },
    },

    // RPC Code: RPC-Get-V1-02
    GetMustNotHaveRequestBody: {
      rpcGuidelineCode: "RPC-Get-V1-02",
      description: "The Get operation must not have a request body.",
      severity: "error",
      message: "{{description}}",
      resolved: true,
      formats: [oas2],
      given: "$[paths,'x-ms-paths'].*.get.parameters[?(@.in === 'body')]",
      then: {
        function: falsy,
      },
    },

    // RPC Codes: RPC-Get-V1-09, RPC-Arg-V1-01, RPC-Get-V1-06
    GetCollectionOnlyHasValueAndNextLink: {
      rpcGuidelineCode: "RPC-Get-V1-09, RPC-Arg-V1-01, RPC-Get-V1-06",
      description: "Get endpoints for collections of resources must only have the `value` and `nextLink` properties in their model.",
      message: "{{description}}",
      severity: "error",
      resolved: true,
      formats: [oas2],
      given:
        "$[paths,'x-ms-paths'][?(!@property.endsWith('}') && !@property.endsWith('operations') && !@property.endsWith('default'))][get].responses.200.schema.properties",
      then: {
        function: getCollectionOnlyHasValueAndNextLink,
      },
    },

    // RPC Code: RPC-Get-V1-08
    ParametersInPointGet: {
      rpcGuidelineCode: "RPC-Get-V1-08",
      description: "Point Get's MUST not have query parameters other than api version.",
      severity: "error",
      message: "{{error}}",
      resolved: true,
      formats: [oas2],
      given: "$[paths,'x-ms-paths']",
      then: {
        function: parametersInPointGet,
      },
    },

    // RPC Code: RPC-Get-V1-11
    MissingSegmentsInNestedResourceListOperation: {
      rpcGuidelineCode: "RPC-Get-V1-11",
      description: "A nested resource type's List operation must include all the parent segments in its api path.",
      severity: "warn",
      message: "{{error}}",
      resolved: true,
      formats: [oas2],
      given: "$[paths,'x-ms-paths'].*[get]^~",
      then: {
        function: missingSegmentsInNestedResourceListOperation,
      },
    },

    // RPC Code: RPC-Get-V1-11
    XmsPageableForListCalls: {
      rpcGuidelineCode: "RPC-Get-V1-11",
      description: "`x-ms-pageable` extension must be specified for LIST APIs.",
      severity: "error",
      message: "{{error}}",
      resolved: true,
      formats: [oas2],
      given: "$[paths,'x-ms-paths'][?(!@property.endsWith('}') && !@property.endsWith('/default'))].get",
      then: {
        function: xmsPageableForListCalls,
      },
    },

    // RPC Code: RPC-Get-V1-14
    GetOperationMustNotBeLongRunning: {
      rpcGuidelineCode: "RPC-Get-V1-14",
      description:
        "The GET operation cannot be long running. It must not have the `x-ms-long-running-operation` and `x-ms-long-running-operation-options` properties defined.",
      severity: "error",
      message: "{{description}}",
      resolved: true,
      formats: [oas2],
      given: [
        "$[paths,'x-ms-paths'].*[get].x-ms-long-running-operation-options",
        "$[paths,'x-ms-paths'].*[get][?(@property === 'x-ms-long-running-operation' && @ === true)]",
      ],
      then: {
        function: falsy,
      },
    },

    // RPC Code: RPC-Get-V1-15
    QueryParametersInCollectionGet: {
      rpcGuidelineCode: "RPC-Get-V1-15",
      description: "Collection Get's/List operations MUST not have query parameters other than api-version & OData filter.",
      severity: "error",
      message: "{{error}}",
      stagingOnly: true,
      resolved: true,
      formats: [oas2],
      given: "$[paths,'x-ms-paths']",
      then: {
        function: queryParametersInCollectionGet,
      },
    },

    ///
    /// ARM RPC rules for Patch patterns
    ///

    // RPC Code: RPC-Patch-V1-01
    PatchPropertiesCorrespondToPutProperties: {
      rpcGuidelineCode: "RPC-Patch-V1-01",
      description:
        "PATCH request body must only contain properties present in the corresponding PUT request body, and must contain at least one property.",
      message: "{{error}}",
      severity: "error",
      stagingOnly: true,
      resolved: true,
      formats: [oas2],
      given: ["$[paths,'x-ms-paths'].*"],
      then: {
        function: patchPropertiesCorrespondToPutProperties,
      },
    },

    //https://github.com/Azure/azure-openapi-validator/issues/324
    // RPC Code: RPC-Patch-V1-01
    ConsistentPatchProperties: {
      rpcGuidelineCode: "RPC-Patch-V1-01",
      description: "The properties in the patch body must be present in the resource model and follow json merge patch.",
      message: "{{error}}",
      severity: "error",
      resolved: true,
      formats: [oas2],
      given: ["$.paths.*.patch"],
      then: {
        function: consistentPatchProperties,
      },
    },

    // RPC Code: RPC-Patch-V1-02
    UnSupportedPatchProperties: {
      rpcGuidelineCode: "RPC-Patch-V1-02",
      description: "Patch may not change the name, location, or type of the resource.",
      message: "{{error}}",
      severity: "error",
      resolved: true,
      formats: [oas2],
      given: ["$[paths,'x-ms-paths'].*.patch"],
      then: {
        function: validatePatchBodyParamProperties,
        functionOptions: {
          shouldNot: ["id", "name", "type", "location"],
          propertiesThatMustNotBeInPropertiesBagAsWritable: ["provisioningState"],
        },
      },
    },

    // RPC Code: RPC-Patch-V1-06
    PatchResponseCodes: {
      rpcGuidelineCode: "RPC-Patch-V1-06",
      description: "Synchronous PATCH must have 200 return code and LRO PATCH must have 200 and 202 return codes.",
      message: "{{error}}",
      severity: "error",
      resolved: true,
      formats: [oas2],
      given: ["$[paths,'x-ms-paths'].*[patch]"],
      then: {
        function: patchResponseCodes,
      },
    },

    //https://github.com/Azure/azure-openapi-validator/issues/335
    // RPC Code: RPC-Patch-V1-06, RPC-Async-V1-08
    LroPatch202: {
      rpcGuidelineCode: "RPC-Patch-V1-06, RPC-Async-V1-08",
      description: "Async PATCH should return 202.",
      message: "{{error}}",
      severity: "error",
      resolved: true,
      formats: [oas2],
      given: ["$[paths,'x-ms-paths'].*[patch][?(@property === 'x-ms-long-running-operation' && @ === true)]^"],
      then: {
        function: lroPatch202,
      },
    },
    // RPC Code: RPC-Patch-V1-09
    PatchSkuProperty: {
      rpcGuidelineCode: "RPC-Patch-V1-09",
      description:
        "RP should consider implementing Patch for the 'SKU' envelope property if it's defined in the resource model and the service supports its updation.",
      message: "{{error}}",
      severity: "warn",
      resolved: true,
      formats: [oas2],
      given: ["$[paths,'x-ms-paths'].*.patch"],
      then: {
        function: validatePatchBodyParamProperties,
        functionOptions: {
          should: ["sku"],
        },
      },
    },
    // RPC Code: RPC-Patch-V1-10
    PatchBodyParametersSchema: {
      rpcGuidelineCode: "RPC-Patch-V1-10",
      description: "A request parameter of the Patch Operation must not have a required/default/'x-ms-mutability: [\"create\"]' value.",
      message: "{{error}}",
      severity: "error",
      resolved: true,
      formats: [oas2],
      given: ["$.paths.*.patch.parameters[?(@.in === 'body')]"],
      then: {
        function: patchBodyParameters,
      },
    },
    // RPC Code: RPC-Patch-V1-11
    PatchIdentityProperty: {
      rpcGuidelineCode: "RPC-Patch-V1-11",
      description: "RP must implement PATCH for the 'identity' envelope property If it's defined in the resource model.",
      message: "{{error}}",
      severity: "error",
      resolved: true,
      formats: [oas2],
      given: ["$[paths,'x-ms-paths'].*.patch"],
      then: {
        function: validatePatchBodyParamProperties,
        functionOptions: {
          should: ["identity"],
        },
      },
    },

    ///
    /// ARM RPC rules for Put patterns
    ///

    // RPC Code: RPC-Put-V1-01, RPC-Get-V1-11
    PathForTrackedResourceTypes: {
      rpcGuidelineCode: "RPC-Put-V1-01, RPC-Get-V1-11",
      description: "The path must be under a subscription and resource group for tracked resource types.",
      message: "{{description}}",
      severity: "error",
      resolved: true,
      formats: [oas2],
      given: ["$[paths,'x-ms-paths'].*[get,put]^"],
      then: {
        function: pathForTrackedResourceTypes,
      },
    },

    // RPC Code: RPC-Put-V1-02
    EvenSegmentedPathForPutOperation: {
      rpcGuidelineCode: "RPC-Put-V1-02",
      description:
        "API path with PUT operation defined MUST have even number of segments (i.e. end in {resourceType}/{resourceName} segments).",
      message: "{{description}}",
      severity: "error",
      resolved: true,
      formats: [oas2],
      given: "$[paths,'x-ms-paths'].*.put^~",
      then: {
        function: pattern,
        functionOptions: {
          match: ".*/providers/\\w+.\\w+(/\\w+/(default|{\\w+}))+$",
        },
      },
    },

    // RPC Code: RPC-Put-V1-05
    RepeatedPathInfo: {
      rpcGuidelineCode: "RPC-Put-V1-05",
      description:
        "Information in the Path should not be repeated in the request body (i.e. subscription ID, resource group name, resource name).",
      message: "The '{{error}}' already appears in the path, please don't repeat it in the request body.",
      severity: "error",
      resolved: true,
      formats: [oas2],
      given: "$[paths,'x-ms-paths'].*.put^",
      then: {
        function: bodyParamRepeatedInfo,
      },
    },
    // RPC Code: RPC-Put-V1-07
    RequestSchemaForTrackedResourcesMustHaveTags: {
      rpcGuidelineCode: "RPC-Put-V1-07",
      description: "A tracked resource MUST always have tags as a top level optional property",
      message: "{{description}}. {{error}}",
      severity: "error",
      resolved: true,
      formats: [oas2],
      given: "$[paths,'x-ms-paths'].*.put^",
      then: {
        function: trackedResourceTagsPropertyInRequest,
      },
    },

    // RPC Code: RPC-Put-V1-12
    PutGetPatchResponseSchema: {
      rpcGuidelineCode: "RPC-Put-V1-12",
      description: `For a given path with PUT, GET and PATCH operations, the schema of the response must be the same.`,
      message:
        "{{property}} has different responses for PUT/GET/PATCH operations. The PUT/GET/PATCH operations must have same schema response.",
      severity: "error",
      resolved: false,
      given: ["$[paths,'x-ms-paths'].*.put^"],
      then: {
        function: putGetPatchSchema,
      },
    },
    // RPC Code: RPC-Put-V1-12
    XmsResourceInPutResponse: {
      rpcGuidelineCode: "RPC-Put-V1-12",
      description: `The 200 response model for an ARM PUT operation must have x-ms-azure-resource extension set to true in its hierarchy.`,
      message: "{{error}}",
      severity: "error",
      resolved: true,
      given: ["$[paths,'x-ms-paths'].*.put"],
      then: {
        function: withXmsResource,
      },
    },
    // RPC Code: RPC-Put-V1-14
    LocationMustHaveXmsMutability: {
      rpcGuidelineCode: "RPC-Put-V1-14",
      description: "A tracked resource's location property must have the x-ms-mutability properties set as read, create.",
      message: 'Property `location` must have `"x-ms-mutability":["read", "create"]` extension defined.',
      severity: "warn",
      resolved: false,
      formats: [oas2],
      given: ["$.definitions[*].properties.location"],
      then: {
        function: locationMustHaveXmsMutability,
      },
    },
    // RPC Code: RPC-Put-V1-24
    ResponseSchemaSpecifiedForSuccessStatusCode: {
      rpcGuidelineCode: "RPC-Put-V1-24",
      description: "The 200 and 201 success status codes for an ARM PUT operation must have a response schema specified.",
      message: "{{error}}",
      severity: "error",
      resolved: false,
      formats: [oas2],
      given: ["$[paths,'x-ms-paths'].*.put"],
      then: {
        function: responseSchemaSpecifiedForSuccessStatusCode,
      },
    },
    // RPC Code: RPC-Put-V1-25
    PutRequestResponseSchemeArm: {
      rpcGuidelineCode: "RPC-Put-V1-25",
      description: "The request & response('200') schema of the PUT operation must be same.",
      message: "{{error}}",
      severity: "error",
      resolved: true,
      formats: [oas2],
      given: ["$[paths,'x-ms-paths'].*[put][responses][?(@property === '200' || @property === '201')]^^"],
      then: {
        function: putRequestResponseScheme,
      },
    },

    // RPC Code: RPC-Put-V1-28, RPC-Patch-V1-12
    RequestBodyMustExistForPutPatch: {
      rpcGuidelineCode: "RPC-Put-V1-28, RPC-Patch-V1-12",
      description: "Every Put and Patch operation must have a request body",
      message: "{{error}}",
      severity: "error",
      stagingOnly: true,
      resolved: true,
      formats: [oas2],
      given: "$[paths,'x-ms-paths'].*[put,patch].parameters",
      then: {
        function: requestBodyMustExistForPutPatch,
      },
    },

    // RPC Code: RPC-Put-V1-29
    ConsistentResponseSchemaForPut: {
      rpcGuidelineCode: "RPC-Put-V1-29",
      description: "A Put operation must return the same schema for 200 and 201 response codes",
      message: "{{error}}",
      severity: "error",
      stagingOnly: true,
      resolved: true,
      formats: [oas2],
      given: "$.paths.*",
      then: {
        function: consistentResponseSchemaForPut,
      },
    },

    // RPC Code: RPC-Put-V1-31
    TagsAreNotAllowedForProxyResources: {
      rpcGuidelineCode: "RPC-Put-V1-31",
      description: "Tags should not be specified in the properties bag for proxy resources. Consider using a Tracked resource instead.",
      severity: "error",
      stagingOnly: true,
      message: "{{error}}",
      resolved: true,
      formats: [oas2],
      given: ["$.definitions.*.properties^"],
      then: {
        function: tagsAreNotAllowedForProxyResources,
      },
    },

    ///
    /// ARM RPC rules for Post patterns
    ///

    // RPC Code: RPC-POST-V1-05
    ParametersInPost: {
      rpcGuidelineCode: "RPC-POST-V1-05",
      description: "For a POST action parameters MUST be in the payload and not in the URI.",
      message: "{{error}}",
      severity: "error",
      resolved: true,
      formats: [oas2],
      given: "$[paths,'x-ms-paths'].*[post][parameters]",
      then: {
        function: parametersInPost,
      },
    },

    ///
    /// ARM RPC rules for Arg
    ///

    // RPC Code: RPC-Arg-V1-01
    ParametersSchemaAsTypeObject: {
      rpcGuidelineCode: "RPC-POST-V1-05",
      description: "The schema for body parameters must specify type:object and include a definition for its reference model.",
      message: "{{description}}",
      severity: "error",
      resolved: true,
      formats: [oas2],
      given: "$[paths,'x-ms-paths'].*.*.parameters.*.schema[?(@property === 'type' && @ !=='object')]",
      then: {
        function: falsy,
      },
    },

    ///
    /// ARM RPC rules for Uri path patterns
    ///

    // RPC Code: RPC-Uri-V1-01
    PathContainsSubscriptionId: {
      rpcGuidelineCode: "RPC-Uri-V1-01",
      description: "Path for resource group scoped CRUD methods MUST contain a subscriptionId parameter.",
      message: "{{error}}",
      severity: "error",
      resolved: false,
      formats: [oas2],
      given: "$[paths,'x-ms-paths'].*[get,patch,put,delete]^~",
      then: {
        function: verifyArmPath,
        functionOptions: {
          segmentToCheck: "subscriptionIdParam",
        },
      },
    },
    // RPC Code: RPC-Uri-V1-02
    PathContainsResourceGroup: {
      rpcGuidelineCode: "RPC-Uri-V1-02",
      description: "Path for resource group scoped CRUD methods MUST contain a resourceGroupName parameter.",
      message: "{{error}}",
      severity: "error",
      resolved: false,
      formats: [oas2],
      given: ["$[paths,'x-ms-paths'].*[get,patch,put,delete]^~"],
      then: {
        function: verifyArmPath,
        functionOptions: {
          segmentToCheck: "resourceGroupParam",
        },
      },
    },
    // RPC Code: RPC-Uri-V1-04
    PathContainsResourceType: {
      rpcGuidelineCode: "RPC-Uri-V1-04",
      description: "Path for resource CRUD methods MUST contain a resource type.",
      message: "{{error}}",
      severity: "error",
      resolved: false,
      formats: [oas2],
      given: "$[paths,'x-ms-paths'].*[get,patch,put,delete]^~",
      then: {
        function: verifyArmPath,
        functionOptions: {
          segmentToCheck: "resourceType",
        },
      },
    },
    // RPC Code: RPC-Uri-V1-05
    ResourceNameRestriction: {
      rpcGuidelineCode: "RPC-Uri-V1-05",
      description: "This rule ensures that the authors explicitly define these restrictions as a regex on the resource name.",
      message: "{{error}}",
      severity: "error",
      disableForTypeSpecDataPlane: true,
      disableForTypeSpecDataPlaneReason: "Covered by TSP's '@azure-tools/typespec-azure-resource-manager/arm-resource-name-pattern' rule.",
      resolved: true,
      formats: [oas2],
      given: "$[paths,'x-ms-paths'].*.^",
      then: {
        function: resourceNameRestriction,
      },
    },
    // RPC Code: RPC-Uri-V1-06
    PathForNestedResource: {
      rpcGuidelineCode: "RPC-Uri-V1-06",
      description: "Path for CRUD methods on a nested resource type MUST follow valid resource naming.",
      message: "{{error}}",
      severity: "error",
      resolved: false,
      formats: [oas2],
      given: "$[paths,'x-ms-paths'].*[get,patch,delete,put]^~",
      then: {
        function: verifyArmPath,
        functionOptions: {
          segmentToCheck: "nestedResourceType",
        },
      },
    },
    // RPC Code: RPC-Uri-V1-07, RPC-POST-V1-01, RPC-POST-V1-07
    PathForResourceAction: {
      rpcGuidelineCode: "RPC-Uri-V1-07, RPC-POST-V1-01, RPC-POST-V1-07",
      description: "Path for 'post' method on a resource type MUST follow valid resource naming.",
      message: "{{description}}",
      severity: "error",
      resolved: false,
      formats: [oas2],
      given: "$[paths,'x-ms-paths'].*.post^~",
      then: {
        function: pattern,
        functionOptions: {
          match: ".*/providers/[\\w\\.]+(?:/\\w+/(default|{\\w+}))*/\\w+$",
        },
      },
    },
    // RPC Code: RPC-Uri-V1-08
    ApiVersionParameterRequired: {
      rpcGuidelineCode: "RPC-Uri-V1-08",
      description: "All operations should have api-version query parameter.",
      message: "{{error}}",
      severity: "error",
      resolved: true,
      formats: [oas2],
      given: ["$.paths.*", "$.x-ms-paths.*"],
      then: {
        function: hasApiVersionParameter,
        functionOptions: {
          methods: ["get", "put", "patch", "post", "delete", "options", "head", "trace"],
        },
      },
    },
    // RPC Code: RPC-Uri-V1-10
    NoDuplicatePathsForScopeParameter: {
      rpcGuidelineCode: "RPC-Uri-V1-10",
      description: 'Paths with explicitly defined scope should not be present if there is an equivalent path with the "scope" parameter.',
      message: "{{error}}",
      severity: "error",
      resolved: true,
      formats: [oas2],
      given: ["$.paths[?(@property.match(/.*{scope}.*/))]~))", "$.x-ms-paths[?(@property.match(/.*{scope}.*/))]~))"],
      then: {
        function: noDuplicatePathsForScopeParameter,
      },
    },
    // RPC Code: RPC-Uri-V1-11
    TenantLevelAPIsNotAllowed: {
      rpcGuidelineCode: "RPC-Uri-V1-11",
      description:
        "Tenant level APIs are strongly discouraged and subscription or resource group level APIs are preferred instead. Design presentation and getting an exception from the PAS team is needed if APIs cannot be modelled at subscription or resource group level.",
      message: "{{error}}",
      severity: "error",
      resolved: true,
      formats: [oas2],
      given: "$[paths,'x-ms-paths']",
      then: {
        function: tenantLevelAPIsNotAllowed,
      },
    },
    // RPC Code: RPC-Uri-V1-12
    TrackedExtensionResourcesAreNotAllowed: {
      rpcGuidelineCode: "RPC-Uri-V1-12",
      description: "Extension resources are always considered to be proxy and must not be of the type tracked.",
      message: "{{error}}",
      severity: "error",
      resolved: true,
      formats: [oas2],
      given: "$[paths,'x-ms-paths'].*~",
      then: {
        function: trackedExtensionResourcesAreNotAllowed,
      },
    },
    // RPC Code: RPC-Uri-V1-13
    ValidQueryParametersForPointOperations: {
      rpcGuidelineCode: "RPC-Uri-V1-13",
      description: "Point operations (GET, PUT, PATCH, DELETE) must not include any query parameters other than api-version.",
      message: "{{error}}",
      stagingOnly: true,
      severity: "error",
      resolved: true,
      formats: [oas2],
      given: "$[paths,'x-ms-paths']",
      then: {
        function: validQueryParametersForPointOperations,
      },
    },

    ///
    /// ARM RPC rules for SystemData
    ///

    // RPC Code: RPC-SystemData-V1-01 and RPC-SystemData-V1-02
    // This rule is only applicable for specs that are not using the common-types resource definition.
    // However, we need this rule because not all RP teams can switch to the common-types resource definition.
    SystemDataDefinitionsCommonTypes: {
      rpcGuidelineCode: "RPC-SystemData-V1-01, RPC-SystemData-V1-02",
      description: "System data references must utilize common types.",
      message: "{{description}}",
      severity: "error",
      resolved: false,
      formats: [oas2],
      given: "$.definitions.*.properties.[systemData,SystemData].$ref",
      then: {
        function: pattern,
        functionOptions: {
          match: ".*/common-types/resource-management/v\\d+/types.json#/definitions/systemData",
        },
      },
    },

    // RPC Code: RPC-SystemData-V1-01 and RPC-SystemData-V1-02
    // Ensure systemData is not in the properties bag
    SystemDataInPropertiesBag: {
      rpcGuidelineCode: "RPC-SystemData-V1-01, RPC-SystemData-V1-02",
      description: "System data must be defined as a top-level property, not in the properties bag.",
      message: "{{description}}",
      severity: "error",
      resolved: true,
      formats: [oas2],
      // given definitions that have the properties bag
      given: ["$.definitions.*.properties[?(@property === 'properties')]^"],
      then: {
        function: systemDataInPropertiesBag,
      },
    },

    ///
    /// ARM RPC rules for constrained resource collections
    ///

    // RPC Code: RPC-ConstrainedCollections-V1-04
    ReservedResourceNamesModelAsEnum: {
      rpcGuidelineCode: "RPC-ConstrainedCollections-V1-04",
      description:
        "Service-defined (reserved) resource names should be represented as an enum type with modelAsString set to true, not as a static string in the path.",
      message: "{{error}}",
      severity: "warn",
      resolved: true,
      formats: [oas2],
      given: ["$[paths,'x-ms-paths']"],
      then: {
        function: reservedResourceNamesModelAsEnum,
      },
    },

    ///
    /// ARM RPC rules for operations API
    ///

    // RPC Code: RPC-Operations-V1-01
    OperationsApiSchemaUsesCommonTypes: {
      rpcGuidelineCode: "RPC-Operations-V1-01",
      description: "Operations API path must follow the schema provided in the common types.",
      message: "{{description}}",
      severity: "error",
      resolved: false,
      formats: [oas2],
      given: "$[paths,'x-ms-paths'][?(@property.match(/\\/providers\\/\\w+\\.\\w+\\/operations$/i))].get.responses.200.schema.$ref",
      then: {
        function: pattern,
        functionOptions: {
          match: ".*/common-types/resource-management/v\\d+/types.json#/definitions/OperationListResult",
        },
      },
    },

    // RPC Code: RPC-Operations-V1-02
    OperationsApiTenantLevelOnly: {
      rpcGuidelineCode: "RPC-Operations-V1-02",
      description: "The get operations endpoint must only be at the tenant level.",
      message: "{{error}}",
      severity: "error",
      resolved: true,
      formats: [oas2],
      given: "$.[paths,'x-ms-paths']",
      then: {
        function: operationsApiTenantLevelOnly,
      },
    },

    ///
    /// ARM rules without an RPC code
    ///

    LatestVersionOfCommonTypesMustBeUsed: {
      description: "This rule checks for references that aren't using latest version of common-types.",
      message: "{{error}}",
      severity: "warn",
      resolved: false,
      formats: [oas2],
      given: "$..['$ref']",
      then: {
        function: latestVersionOfCommonTypesMustBeUsed,
      },
    },
    ArrayMustHaveType: {
      description: "Array type must have a type except for any type.",
      message: "{{error}}",
      severity: "error",
      resolved: false,
      formats: [oas2],
      given: ["$.definitions..items[?(@object())]^"],
      then: {
        function: truthy,
        field: "type",
      },
    },
    NoErrorCodeResponses: {
      description: "Invalid status code specified. Please refer to the documentation for the allowed set.",
      message: "{{description}}",
      severity: "error",
      resolved: false,
      formats: [oas2],
      given: ["$.paths.*.*.responses.*~"],
      then: {
        function: noErrorCodeResponses,
      },
    },
    LroWithOriginalUriAsFinalState: {
      description: "The long running operation with final-state-via:original-uri should have a sibling 'get' operation.",
      message: "{{description}}",
      severity: "error",
      resolved: true,
      formats: [oas2],
      given: [
        "$[paths,'x-ms-paths'].*[put,patch,delete].x-ms-long-running-operation-options[?(@property === 'final-state-via' && @ === 'original-uri')]^",
      ],
      then: {
        function: validateOriginalUri,
      },
    },
    LroPostMustNotUseOriginalUriAsFinalState: {
      description: "The long running post operation must not use final-stat-via:original-uri.",
      message: "{{description}}",
      severity: "error",
      resolved: true,
      formats: [oas2],
      given: [
        "$[paths,'x-ms-paths'].*.post.x-ms-long-running-operation-options[?(@property === 'final-state-via' && @ === 'original-uri')]^",
      ],
      then: {
        function: falsy,
      },
    },
    APIVersionPattern: {
      description:
        "The API Version parameter MUST be in the Year-Month-Date format (i.e. 2016-07-04.)  NOTE that this is the en-US ordering of month and date.",
      severity: "error",
      message: "{{description}}",
      resolved: true,
      formats: [oas2],
      given: "$.info.version",
      then: {
        function: pattern,
        functionOptions: {
          match: "^(20\\d{2})-(0[1-9]|1[0-2])-((0[1-9])|[12][0-9]|3[01])(-(preview))?$",
        },
      },
    },
    ParameterNotDefinedInGlobalParameters: {
      description:
        "Per ARM guidelines, if `subscriptionId` is used anywhere as a path parameter, it must always be defined as global parameter. `api-version` is almost always an input parameter in any ARM spec and must also be defined as a global parameter.",
      message: "{{error}}",
      severity: "warn",
      resolved: false,
      formats: [oas2],
      given: ["$[paths,'x-ms-paths'].*.*[?(@property === 'parameters')]"],
      then: {
        function: parameterNotDefinedInGlobalParameters,
      },
    },
    ParameterNotUsingCommonTypes: {
      description: "This rule checks for parameters defined in common-types that are not using the common-types definition.",
      message: "{{error}}",
      severity: "warn",
      resolved: false,
      formats: [oas2],
      given: ["$[paths,'x-ms-paths'].*.*.parameters.*.name", "$[parameters].*.name"],
      then: {
        function: parameterNotUsingCommonTypes,
      },
    },
    CollectionObjectPropertiesNaming: {
      description:
        "Per ARM guidelines, a model returned by an `x-ms-pageable` operation must have a property named `value`. This property indicates what type of array the object is.",
      severity: "error",
      message: "{{error}}",
      resolved: true,

      formats: [oas2],
      given: "$.paths.*[get,post]",
      then: {
        function: collectionObjectPropertiesNaming,
      },
    },
    // this rule covers BodyPropertiesNamesCamelCase and DefinitionsPropertiesNamesCamelCase
    DefinitionsPropertiesNamesCamelCase: {
      description: "Property names should be camel case.",
      message: "Property name should be camel case.",
      severity: "error",
      resolved: false,
      given: "$.definitions..[?(@property === 'type' && @ === 'object')]^.properties[?(@property.match(/^[^@].+$/))]~",
      then: {
        function: camelCase,
      },
    },
    GuidUsage: {
      description: `Verifies whether format is specified as "uuid" or not.`,
      message:
        "Usage of Guid is not recommended. If GUIDs are absolutely required in your service, please get sign off from the Azure API review board.",
      severity: "error",
      resolved: false,
      given: "$..[?(@property === 'format' && @ === 'uuid')]",
      then: {
        function: falsy,
      },
    },
    InvalidSkuModel: {
      description: `A Sku model must have 'name' property. It can also have 'tier', 'size', 'family', 'capacity' as optional properties.`,
      message: "{{error}}",
      severity: "warn",
      resolved: true,
      given: "$.definitions[?(@property.match(/^sku$/i))]",
      then: {
        function: skuValidation,
      },
    },
    NonApplicationJsonType: {
      description: `Verifies whether operation supports "application/json" as consumes or produces section.`,
      message: "Only content-type 'application/json' is supported by ARM",
      severity: "warn",
      resolved: true,
      given: ["$[produces,consumes].*", "$[paths,'x-ms-paths'].*.*[produces,consumes].*"],
      then: {
        function: pattern,
        functionOptions: {
          match: "application/json",
        },
      },
    },
    SecurityDefinitionsStructure: {
      description: `Each OpenAPI json document must contain a security definitions section and the section must adhere to a certain format.`,
      message: "{{error}}",
      severity: "error",
      resolved: true,
      given: ["$"],
      then: {
        function: securityDefinitionsStructure,
      },
    },
    SubscriptionIdParameterInOperations: {
      description: `'subscriptionId' must not be an operation parameter and must be declared in the global parameters section.`,
      message:
        "Parameter 'subscriptionId' is not allowed in the operations section, define it in the global parameters section instead/Parameter '{{path}}' is referenced but not defined in the global parameters section of Service Definition",
      severity: "error",
      resolved: false,
      given: [
        "$[paths,'x-ms-paths'].*.*.parameters.*[?(@property === 'name' && @.match(/^subscriptionid$/i))]^",
        "$[paths,'x-ms-paths'].*.parameters.*[?(@property === 'name' && @.match(/^subscriptionid$/i))]^",
      ],
      then: {
        function: falsy,
      },
    },
    OperationsApiResponseSchema: {
      severity: "error",
      message: "The response schema of operations API '{{error}}' does not match the ARM specification. Please standardize the schema.",
      resolved: true,
      given: "$.paths[?(@property.match(/\\/providers\\/\\w+\\.\\w+\\/operations$/i))].get.responses.200.schema",
      then: {
        function: operationsApiSchema,
      },
    },
    HttpsSupportedScheme: {
      description: "Verifies whether specification supports HTTPS scheme or not.",
      message: "Azure Resource Management only supports HTTPS scheme.",
      severity: "warn",
      resolved: false,
      formats: [oas2],
      given: ["$.schemes"],
      then: {
        function: httpsSupportedScheme,
      },
    },
    MissingDefaultResponse: {
      description: "All operations should have a default (error) response.",
      message: "Operation is missing a default response.",
      severity: "error",
      given: "$.paths.*.*.responses.*~",
      then: {
        field: "default",
        function: truthy,
      },
    },
  },
}
export default ruleset
