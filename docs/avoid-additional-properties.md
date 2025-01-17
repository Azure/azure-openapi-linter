# AvoidAdditionalProperties

## Category

ARM Error

## Applies to

ARM OpenAPI(swagger) specs

## Related ARM Guideline Code

- RPC-Policy-V1-05, RPC-Put-V1-23

## Description

Definitions must not have properties named "additionalProperties".

The following are the only scenarios where "additionalProperties" are allowed

 1. User defined tags.

```json
...
"properties": {
    "tags": {
        "additionalProperties": {
            "type": "object"
        }
    }
}
...
```

 2. Predefined references such as common-types.

```json
...
"properties": {
    "identity": {
        "$ref": "../../../../../common-types/resource-management/v5/managedidentity.json#/definitions/ManagedServiceIdentity"
    },
}
...
```

## How to fix

Remove the additionalProperties type from the payload. If you believe you still need this, please book an API modeling office hours slot to go over your scenario and get an exception. Please visit aka.ms\armofficehoursinfo to book a meeting slot. 

```json
...
"properties": {
    "additionalProperties": {
        "type": "object"
    }
}
...
```

The above payload is considered invalid because ARM requires Resource provider teams to define the types explicitly. This is to ensure good customer experience in terms of the discoverability of concrete type definitions. If you believe your scenario requires the use of additionalProperties please book an ARM modeling office hours slot to explain the reasoning. Visit aka.ms\armofficehoursinfo to book the meeting.
