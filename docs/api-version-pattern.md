# APIVersionPattern

## Category

ARM Error

## Applies to

ARM OpenAPI(swagger) specs

## Output Message

API Version must be in the format: yyyy-MM-dd, optionally followed by -preview, or 'canonical' for canonical swagger.

## Description

The API Version parameter MUST be in the Year-Month-Date format (i.e. 2016-07-04.) or 'canonical' for canonical swagger. NOTE that this is the en-US ordering of month and date.

The date MAY optionally be followed by one of:
* -preview - Indicates the API version is in (public) preview

## Why the rule is important

Per [ARM guidelines](https://github.com/Azure/azure-resource-manager-rpc/blob/master/v1.0/resource-api-reference.md), API version should follow a consistent date format.

## How to fix the violation

Adopt API version format as indicated by the rule.

## Impact on generated code

The API version specified wil be used by the generated client.

## Good Examples

Examples of valid version patterns include:
* 2016-07-04
* 2016-07-04-preview
* canonical (for canonical swagger)

## Bad Examples

The following would be invalid:
* 97-07-04 - Date should be YYYY, not YY
* 2016/07/04 - Date should use "-", not "/"
* 1842-07-04 - Year should be accurate; we didn't have Azure in 1842 :(
* 2150-07-04 - Year should be current, not in the future; though we'll hopefully get here eventually :)
* 2016-07-04-publicpreview - Use "-preview" to indicate a public preview
* 2016-07-04-rc0 - Just use "rc", not "rc" + number
