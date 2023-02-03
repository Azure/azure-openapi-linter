# NoDuplicatePathsForScopeParameter

## Category

ARM Error

## Applies to

ARM OpenAPI(swagger) specs

## Related ARM Guideline Code

- RPC-Uri-V1-10

## Description

Swagger authors that use the `scope` parameter to indicate that an API is applicable to various scopes (Tenant, Management Group, Subscription, Resource Group), must not include API paths with explicitly defined scopes (e.g. subscription API path).

## How to fix

Either remove the path with the `scope` parameter, or remove all explicitly-scoped paths that duplicate the path with the `scope` parameter.