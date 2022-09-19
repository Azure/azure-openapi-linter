import { oas2 } from "@stoplight/spectral-formats"
import { pattern, falsy, truthy } from "@stoplight/spectral-functions"
import { deleteInOperationName } from "./functions/delete-in-operation-name"
import {
  longRunningOperationsOptionsValidator
} from "./functions/Extensions/long-running-operations-options-validator";
import { mutabilityWithReadOnly } from "./functions/Extensions/mutability-with-read-only";
import { nextLinkPropertyMustExist } from "./functions/Extensions/next-link-property-must-exist";
import { xmsClientName } from "./functions/Extensions/xms-client-name";
import { xmsPathsMustOverloadPaths } from "./functions/Extensions/xms-paths-must-overload-paths";
import { getInOperationName } from "./functions/get-in-operation-name"
import { lroStatusCodesReturnTypeSchema } from "./functions/lro-status-codes-return-type-schema"
import { namePropertyDefinitionInParameter } from "./functions/name-property-definition-in-parameter"
import { operationIdSingleUnderscore } from "./functions/one-underscore-in-operation-id"
import { operationIdNounConflictingModelNames } from "./functions/operation-id-noun-conflicting-model-names"
import { operationIdNounVerb } from "./functions/operation-id-noun-verb"
import paramLocation from "./functions/parameter-location"
import { parameterNotDefinedInGlobalParameters } from "./functions/parameter-not-defined-in-global-parameters"
import { patchInOperationName } from "./functions/patch-in-operation-name"
import { putInOperationName } from "./functions/put-in-operation-name"
import { putRequestResponseScheme } from "./functions/put-request-response-scheme"
import { requiredReadOnlyProperties } from "./functions/required-read-only-properties"
import checkSchemaFormat from "./functions/schema-format"
import checkSummaryAndDescription from "./functions/summary-description-must-not-be-same"

const ruleset: any = {
  extends: [],
  rules: {
    docLinkLocale: {
      description: "This rule is to ensure the documentation link in the description does not contains any locale.",
      message: "The documentation link in the description contains locale info, please change it to the link without locale.",
      severity: "error",
      resolved: false,
      formats: [oas2],
      given: ["$..[?(@property === 'description')]^"],
      then: {
        function: pattern,
        functionOptions: {
          match: "https://docs.microsoft.com/\\w+\\-\\w+/azure/.*",
        },
      },
    },
    InvalidVerbUsed: {
      description: `Each operation definition must have a HTTP verb and it must be DELETE/GET/PUT/PATCH/HEAD/OPTIONS/POST/TRACE.`,
      message: "Permissible values for HTTP Verb are DELETE, GET, PUT, PATCH, HEAD, OPTIONS, POST, TRACE.",
      severity: "error",
      resolved: false,
      given: "$[paths,'x-ms-paths'].*[?(!@property.match(/^(DELETE|GET|PUT|PATCH|HEAD|OPTIONS|POST|TRACE|PARAMETERS)$/i))]",
      then: {
        function: falsy,
      },
    },
    LroStatusCodesReturnTypeSchema: {
      description: "The '200'/'201' responses of the long running operation must have a schema definition.",
      message: "{{error}}",
      severity: "warn",
      resolved: true,
      formats: [oas2],
      given: ["$[paths,'x-ms-paths'].*[put][?(@property === 'x-ms-long-running-operation' && @ === true)]^"],
      then: {
        function: lroStatusCodesReturnTypeSchema,
      },
    },
    NamePropertyDefinitionInParameter: {
      description: "A parameter must have a `name` property for the SDK to be properly generated.",
      message: "{{error}}",
      severity: "error",
      resolved: true,
      formats: [oas2],
      given: ["$.parameters", "$.paths.*.parameters", "$.paths.*.*.parameters"],
      then: {
        function: namePropertyDefinitionInParameter,
      },
    },
    OperationIdNounConflictingModelNames: {
      description:
        "The first part of an operation Id separated by an underscore i.e., `Noun` in a `Noun_Verb` should not conflict with names of the models defined in the definitions section. If this happens, AutoRest appends `Model` to the name of the model to resolve the conflict (`NounModel` in given example) with the name of the client itself (which will be named as `Noun` in given example). This can result in an inconsistent user experience.",
      message: "{{error}}",
      severity: "warn",
      resolved: true,
      formats: [oas2],
      given: ["$[paths,'x-ms-paths'].*.*[?(@property === 'operationId')]"],
      then: {
        function: operationIdNounConflictingModelNames,
      },
    },
    OperationIdNounVerb: {
      description: "OperationId should be of the form `Noun_Verb`.",
      message: "{{error}}",
      severity: "error",
      resolved: true,
      formats: [oas2],
      given: ["$[paths,'x-ms-paths'].*.*[?(@property === 'operationId')]"],
      then: {
        function: operationIdNounVerb,
      },
    },
    OperationIdSingleUnderscore: {
      description: "An operationId can have exactly one underscore, not adhering to it can cause errors in code generation.",
      message: "{{error}}",
      severity: "error",
      resolved: true,
      formats: [oas2],
      given: ["$[paths,'x-ms-paths'].*.*[?(@property === 'operationId')]"],
      then: {
        function: operationIdSingleUnderscore,
      },
    },
    GetInOperationName: {
      description: "Verifies whether value for `operationId` is named as per ARM guidelines.",
      message: "{{error}}",
      severity: "warn",
      resolved: true,
      formats: [oas2],
      given: ["$[paths,'x-ms-paths'].*[get][?(@property === 'operationId')]"],
      then: {
        function: getInOperationName,
      },
    },
    PutInOperationName: {
      description: "Verifies whether value for `operationId` is named as per ARM guidelines.",
      message: "{{error}}",
      severity: "warn",
      resolved: true,
      formats: [oas2],
      given: ["$[paths,'x-ms-paths'].*[put][?(@property === 'operationId')]"],
      then: {
        function: putInOperationName,
      },
    },
    PatchInOperationName: {
      description: "Verifies whether value for `operationId` is named as per ARM guidelines.",
      message: "{{error}}",
      severity: "warn",
      resolved: true,
      formats: [oas2],
      given: ["$[paths,'x-ms-paths'].*[patch][?(@property === 'operationId')]"],
      then: {
        function: patchInOperationName,
      },
    },
    DeleteInOperationName: {
      description: "Verifies whether value for `operationId` is named as per ARM guidelines.",
      message: "{{error}}",
      severity: "warn",
      resolved: true,
      formats: [oas2],
      given: ["$[paths,'x-ms-paths'].*[delete][?(@property === 'operationId')]"],
      then: {
        function: deleteInOperationName,
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
    PutRequestResponseScheme: {
      description: "The request & response('200') schema of the PUT operation must be same.",
      message: "{{error}}",
      severity: "warn",
      resolved: true,
      formats: [oas2],
      given: ["$[paths,'x-ms-paths'].*[put][responses][?(@property === '200' || @property === '201')]^^"],
      then: {
        function: putRequestResponseScheme,
      },
    },
    RequiredReadOnlyProperties: {
      description:
        "A model property cannot be both `readOnly` and `required`. A `readOnly` property is something that the server sets when returning the model object while `required` is a property to be set when sending it as a part of the request body.",
      message: "{{error}}",
      severity: "error",
      resolved: false,
      formats: [oas2],
      given: ["$..?(@property === 'required')^"],
      then: {
        function: requiredReadOnlyProperties,
      },
    },
    SummaryAndDescriptionMustNotBeSame: {
      description: `Each operation has a summary and description values. They must not be same.`,
      message: "The summary and description values should not be same.",
      severity: "warn",
      resolved: false,
      given: "$[paths,'x-ms-paths'].*.*",
      then: {
        function: checkSummaryAndDescription,
      },
    },
    ValidFormats: {
      description: `Only valid types are allowed for properties.`,
      message: "'{{error}}' is not a known format.",
      severity: "error",
      resolved: false,
      given: "$..[?(@property === 'format')]^",
      then: {
        function: checkSchemaFormat,
      },
    },
    XmsParameterLocation: {
      description: `SDKs generated by AutoRest have two types of operation parameters: method arguments and client fields. The 'x-ms-parameter-location' extension gives the Swagger author control of how an operation-parameter will be interpreted by AutoRest, and as such is one of few things in a Swagger document that has semantic value only relevant to the shape of the generated SDKs.
    Some parameters, such as API Version and Subscription ID will make sense as part of nearly every request. For these, having developers specify them for each method call would be burdensome; attaching them to the client and automatically including them in each request makes way more sense. Other parameters will be very operation specific and should be provided each time the method is called.`,
      message:
        'The parameter \'{{property}}\' is defined in global parameters section without \'x-ms-parameter-location\' extension. This would add the parameter as the client property. Please ensure that this is exactly you want. If so, apply the extension "x-ms-parameter-location": "client". Else, apply the extension "x-ms-parameter-location": "method".',
      severity: "error",
      resolved: false,
      given: "$.parameters.*[?(@property === 'name' && @.match(/^(subscriptionid|subscription-id|api-version|apiversion)$/i))]^",
      then: {
        function: paramLocation,
      },
    },
    LongRunningOperationsOptionsValidator: {
      description: "A LRO Post operation with return schema must have \"x-ms-long-running-operation-options\" extension enabled.",
      message: "{{error}}",
      severity: "warn",
      resolved: true,
      formats: [oas2],
      given: ["$[paths,'x-ms-paths'].*[post][?(@property === 'x-ms-long-running-operation' && @ === true)]^"],
      then: {
        function: longRunningOperationsOptionsValidator,
      },
    },
    MutabilityWithReadOnly: {
      description: "Verifies whether a model property which has a readOnly property set has the appropriate `x-ms-mutability` options. If `readonly: true`, `x-ms-mutability` must be `[\"read\"]`. If `readonly: false`, `x-ms-mutability` can be any of the `x-ms-mutability` options.",
      message: "{{error}}",
      severity: "error",
      resolved: true,
      formats: [oas2],
      given: ["$[paths,'x-ms-paths']..?(@property === 'readOnly')^"],
      then: {
        function: mutabilityWithReadOnly,
      },
    },
    NextLinkPropertyMustExist: {
      description: "Per definition of AutoRest x-ms-pageable extension, the property specified by nextLinkName must exist in the 200 response schema.",
      message: "{{error}}",
      severity: "error",
      resolved: true,
      formats: [oas2],
      given: ["$[paths,'x-ms-paths'].*.*[?(@property === 'x-ms-pageable')]^"],
      then: {
        function: nextLinkPropertyMustExist,
      },
    },
    NonEmptyClientName: {
      description: "The 'x-ms-client-name' extension is used to change the name of a parameter or property in the generated code.",
      message: "Empty x-ms-client-name property.",
      severity: "error",
      resolved: true,
      formats: [oas2],
      given: ["$[paths,'x-ms-paths']..?(@property === 'x-ms-client-name')"],
      then: {
        function: truthy,
      },
    },
    PageableRequires200Response: {
      description: "Per definition of AutoRest x-ms-pageable extension, the response schema must contain a 200 response schema.",
      message: "A response for the 200 HTTP status code must be defined to use x-ms-pageable.",
      severity: "error",
      resolved: true,
      formats: [oas2],
      given: ["$[paths,'x-ms-paths'].*.*[?(@property === 'x-ms-pageable')]^"],
      then: {
        field: "[responses][200]",
        function: truthy,
      },
    },
    ResourceHasXMsResourceEnabled: {
      description: "A 'Resource' definition must have x-ms-azure-resource extension enabled and set to true. This will indicate that the model is an Azure resource.",
      message: "A 'Resource' definition must have x-ms-azure-resource extension enabled and set to true.",
      severity: "error",
      resolved: true,
      formats: [oas2],
      given: ["$.definitions[?(@property === 'Resource')]"],
      then: {
        field: "[x-ms-azure-resource]",
        function: truthy,
      },
    },
    XmsClientName: {
      description: "The 'x-ms-client-name' extension is used to change the name of a parameter or property in the generated code. By using the 'x-ms-client-name' extension, a name can be defined for use specifically in code generation, separately from the name on the wire. It can be used for query parameters and header parameters, as well as properties of schemas. This name is case sensitive.",
      message: "{{error}}",
      severity: "error",
      resolved: true,
      formats: [oas2],
      given: ["$[paths,'x-ms-paths']..?(@property === 'x-ms-client-name')^"],
      then: {
        function: xmsClientName,
      },
    },
    XmsPathsMustOverloadPaths: {
      description: "The `x-ms-paths` extension allows us to overload an existing path based on path parameters. We cannot specify an `x-ms-paths` without a path that already exists in the `paths` section.",
      message: "{{error}}",
      severity: "error",
      resolved: true,
      formats: [oas2],
      given: ["$['x-ms-paths']"],
      then: {
        function: xmsPathsMustOverloadPaths,
      },
    },
  },
}
export default ruleset
