# PatchBodyParametersSchema

## Category

ARM Error

## Applies to

ARM and Data plane OpenAPI(swagger) specs

## Related ARM Guideline Code

- RPC-Patch-V1-10

## Description

A request parameter of the Patch Operation must not have a required/default/'x-ms-mutability:"create"' value.

## Why the rule is important

A PATCH operation is used to update properties of a resource. Therefore, if the resource has 'X' number of properties and the purpose is to update one of them, then a PATCH request could be sent with a value for that specified property. Considering all properties in the PATCH request are to be updated, if any of values in PATCH request are marked as required/default, the updates are forced to happen although it may not be the intention of the PATCH operation.

## How to fix

Ensure that the request parameter of the Patch Operation does not have a required/default/'x-ms-mutability:"create"' value.A recommended way is to define a new model that only contains the patchable properties to replace the original parameter in request body.

## Good Examples

The following is a good example:

```json
......
......
  "patch": {
    "tags": [
      "SampleTag"
    ],
    "operationId": "Foo_Update",
    "description": "Test Description",
    "parameters": [
      {
        "name": "foo_patch",
        "in": "body",
        "schema": {
          "$ref": "#/definitions/FooRequestParams"
        },
        "description": "foo patch request"
      }
    ]
 }
......
......
  "definitions": {
    "FooRequestParams": {
      "properties": {
        "prop0": {
          "type": "string"
        }
      },
      "required": []
    }
  }
......
......
```
