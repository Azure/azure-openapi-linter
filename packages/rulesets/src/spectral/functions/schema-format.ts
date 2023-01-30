// Check that format is valid for a schema type.
// Valid formats are those defined in the OpenAPI spec and extensions in autorest.
// - https://github.com/OAI/OpenAPI-Specification/blob/main/versions/2.0.md#data-types
// - https://github.com/Azure/autorest/blob/main/packages/libs/openapi/src/v3/formats.ts

import type { IFunctionResult } from "@stoplight/spectral-core"
import type { JsonPath } from "@stoplight/types"

// `input` is the schema
function checkSchemaFormat(schema: any, options: any, { path }: { path: JsonPath }): IFunctionResult[] {
  if (schema === null || typeof schema !== "object") {
    return [] as IFunctionResult[]
  }

  const errors: IFunctionResult[] = []

  const schemaFormats = [
    // number format
    "int32",
    "int64",
    "float",
    "double",
    "unixtime",
    // OAS-defined formats
    "byte",
    "binary",
    "date",
    "date-time",
    "password",
    // Additional formats recognized by autorest
    "char",
    "time",
    "date-time-rfc1123",
    "duration",
    "uuid",
    "base64url",
    "url",
    "odata-query",
    "certificate",

    // ajv supported format
    "uri",
    "uri-reference",
    "uri-template",
    "email",
    "hostname",
    "ipv4",
    "ipv6",
    "regex",
    "json-pointer",
    "relative-json-pointer",
    // for arm id purpose
    "arm-id",
  ]

  if (schema.type && schema.format) {
    if (!schemaFormats.includes(schema.format)) {
      errors.push({
        message: `${schema.format}`,
        path: [...path, "format"],
      })
    }
  }
  return errors
}

export default checkSchemaFormat
