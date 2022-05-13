import { oas2 } from "@stoplight/spectral-formats";
import { falsy, truthy } from "@stoplight/spectral-functions";
import { oas } from "@stoplight/spectral-rulesets"
import common from "./az-common"
import hasApiVersionParameter from "./functions/has-api-version-parameter";
import validateOriginalUri from "./functions/lro-orginal-uri";
import pathBodyParameters from "./functions/patch-body-parameters";
import pathSegmentCasing from "./functions/path-segment-casing";
const ruleset:any = {
  extends:[
    [common,"all"],
    [oas,"off"] 
  ],
  rules: {
    "oas2-api-host": true,
    "ApiVersionParameterRequired":{
      "description": "All operations should have api-version query parameter.",
      "message": "{{error}}",
      "severity": "error",
      "resolved": true,
      "formats": [oas2],
      "given": ["$.paths.*", "$.x-ms-paths.*"],
      "then": {
        "function": hasApiVersionParameter,
        "functionOptions":{
          methods: ["get","put","patch","post","delete"]
        }
      }
    },
    "PathSegementSubscriptionsAndResoureGroups":{
      "description": "The suscriptions and resourceGroup segments should follow lower camel case.",
      "message": "{{error}}",
      "severity": "error",
      "resolved": false,
      "formats": [oas2],
      "given": ["$.paths", "$.x-ms-paths"],
      "then": {
        "function": pathSegmentCasing,
        "functionOptions":{
          segments: ["resourceGroups","subscriptions"]
        }
      }
    },
    "PatchBodyParametersSchema":{
      "description": "A request parameter of the Patch Operation must not have a required/default/'x-ms-mutability: [\"create\"]' value.",
      "message": "{{error}}",
      "severity": "error",
      "resolved": true,
      "formats": [oas2],
      "given": ["$.paths.*.patch.parameters[?(@.in === 'body')]"],
      "then": {
        "function": pathBodyParameters,
      }
    },
    "ArrayMustHaveType":{
      "description": "Aarry type must have a type except for any type.",
      "message": "{{error}}",
      "severity": "warn",
      "resolved": true,
      "formats": [oas2],
      "given": ["$.definitions..items[?(@object())]^"],
      "then": {
        "function": truthy,
        "filed": "type"
      }
    },
    "LroWithOriginalUriAsFinalState":{
      "description": "The long running operation with final-state-via:original-uri has slibing 'get' operation.",
      "message": "{{description}}",
      "severity": "warn",
      "resolved": true,
      "formats": [oas2],
      "given": ["$[paths,'x-ms-paths'].*[put,patch,delete].x-ms-long-running-operation-options[?(@property === 'final-state-via' && @ === 'original-uri')]^"],
      "then": {
        "function": validateOriginalUri
      }
    },
    "LROPostMustNotUseOriginalUriAsFinalState":{
      "description": "The long running post operation must not use final-stat-via:original-uri.",
      "message": "{{description}}",
      "severity": "warn",
      "resolved": true,
      "formats": [oas2],
      "given": ["$[paths,'x-ms-paths'].*.post.x-ms-long-running-operation-options[?(@property === 'final-state-via' && @ === 'original-uri')]^"],
      "then": {
        "function": falsy
      }
    }
  }
};

export default ruleset