import { Spectral } from "@stoplight/spectral-core"
import linterForRule from "./utils"

let linter: Spectral

beforeAll(async () => {
  linter = await linterForRule("PatchBodyParametersSchema")
  return linter
})

test("PatchBodyParametersSchema should find errors for default value body parameter", () => {
  const oasDoc = {
    swagger: "2.0",
    paths: {
      "/foo": {
        patch: {
          tags: ["SampleTag"],
          operationId: "Foo_Update",
          description: "Test Description",
          parameters: [
            {
              name: "foo_patch",
              in: "body",
              schema: {
                $ref: "#/definitions/FooRequestParams",
              },
            },
          ],
          responses: {},
        },
      },
    },
    definitions: {
      FooRequestParams: {
        allOf: [
          {
            $ref: "#/definitions/FooProps",
          },
        ],
      },
      FooProps: {
        properties: {
          prop0: {
            type: "string",
            default: "my def val",
          },
        },
      },
    },
  }
  return linter.run(oasDoc).then((results) => {
    expect(results.length).toBe(1)
    expect(results[0].path.join(".")).toBe("paths./foo.patch.parameters.0.schema")
    expect(results[0].message).toContain("Properties of a PATCH request body must not have default value, property:prop0.")
  })
})

test("PatchBodyParametersSchema should find errors for required/create value", () => {
  const oasDoc = {
    swagger: "2.0",
    paths: {
      "/foo": {
        patch: {
          tags: ["SampleTag"],
          operationId: "Foo_Update",
          description: "Test Description",
          parameters: [
            {
              name: "foo_patch",
              in: "body",
              schema: {
                $ref: "#/definitions/FooRequestParams",
              },
            },
          ],
          responses: {},
        },
      },
    },
    definitions: {
      FooRequestParams: {
        allOf: [
          {
            $ref: "#/definitions/FooProps",
          },
        ],
      },
      FooProps: {
        properties: {
          prop0: {
            type: "string",
          },
          prop1: {
            type: "string",
            "x-ms-mutability": ["create"],
          },
        },
        required: ["prop0"],
      },
    },
  }
  return linter.run(oasDoc).then((results) => {
    expect(results.length).toBe(2)
    expect(results[0].path.join(".")).toBe("paths./foo.patch.parameters.0.schema")
    expect(results[0].message).toContain("Properties of a PATCH request body must not be required, property:prop0.")
    expect(results[1].path.join(".")).toBe("paths./foo.patch.parameters.0.schema")
    expect(results[1].message).toContain('Properties of a PATCH request body must not be x-ms-mutability: ["create"], property:prop1.')
  })
})

test("PatchBodyParametersSchema should skip errors for MSI though has required value", () => {
  const oasDoc = {
    swagger: "2.0",
    paths: {
      "/foo": {
        patch: {
          tags: ["SampleTag"],
          operationId: "Foo_Update",
          description: "Test Description",
          parameters: [
            {
              name: "foo_patch",
              in: "body",
              schema: {
                $ref: "#/definitions/OpenShiftClusterUpdate",
              },
            },
          ],
          responses: {},
        },
      },
    },
    definitions: {
      OpenShiftClusterUpdate: {
        description: "OpenShiftCluster represents an Azure Red Hat OpenShift cluster.",
        type: "object",
        properties: {
          tags: {
            $ref: "#/definitions/Tags",
            description: "The resource tags.",
          },
          identity: {
            $ref: "#/definitions/ManagedServiceIdentity",
            description: "Identity stores information about the cluster MSI(s) in a workload identity cluster.",
          },
        },
      },
      ManagedServiceIdentity: {
        description: "Managed service identity (system assigned and/or user assigned identities)",
        type: "object",
        properties: {
          principalId: {
            readOnly: true,
            format: "uuid",
            type: "string",
            description:
              "The service principal ID of the system assigned identity. This property will only be provided for a system assigned identity.",
          },
          tenantId: {
            readOnly: true,
            format: "uuid",
            type: "string",
            description:
              "The tenant ID of the system assigned identity. This property will only be provided for a system assigned identity.",
          },
          type: {
            description: "Type of managed service identity (where both SystemAssigned and UserAssigned types are allowed).",
            type: "string",
          },
          userAssignedIdentities: {
            description:
              "The set of user assigned identities associated with the resource. The userAssignedIdentities dictionary keys will be ARM resource ids in the form: '/subscriptions/{subscriptionId}/resourceGroups/{resourceGroupName}/providers/Microsoft.ManagedIdentity/userAssignedIdentities/{identityName}. The dictionary values can be empty objects ({}) in requests.",
            type: "object",
          },
        },
        required: ["type"],
      },
      Tags: {
        description: "Tags represents an OpenShift cluster's tags.",
        type: "object",
      },
    },
  }
  return linter.run(oasDoc).then((results) => {
    expect(results.length).toBe(0)
  })
})

test("PatchBodyParametersSchema should find errors for default value in nested body parameter", () => {
  const oasDoc = {
    swagger: "2.0",
    paths: {
      "/foo": {
        patch: {
          parameters: [
            {
              name: "foo_patch",
              in: "body",
              schema: {
                $ref: "#/definitions/FooRequestParams",
              },
            },
          ],
          responses: {},
        },
      },
      "/bar": {
        patch: {
          parameters: [
            {
              name: "bar_patch",
              in: "body",
              schema: {
                $ref: "#/definitions/BarRequestParams",
              },
            },
          ],
          responses: {},
        },
      },
    },
    definitions: {
      FooRequestParams: {
        properties: {
          type: "object",
          properties: {
            $ref: "#/definitions/FooProps",
          },
        },
      },
      FooProps: {
        type: "object",
        properties: {
          prop0: {
            type: "string",
            default: "my def val",
          },
        },
      },
      BarRequestParams: {
        properties: {
          properties: {
            $ref: "#/definitions/BarProps",
          },
        },
      },
      BarProps: {
        properties: {
          prop0: {
            type: "string",
            default: "my def val",
          },
        },
      },
    },
  }
  return linter.run(oasDoc).then((results) => {
    expect(results.length).toBe(2)
    results.sort((a, b) => a.path.join(".").localeCompare(b.path.join(".")))
    expect(results[0].path.join(".")).toBe("paths./bar.patch.parameters.0.schema.properties.properties")
    expect(results[0].message).toContain("Properties of a PATCH request body must not have default value, property:prop0.")
    expect(results[1].path.join(".")).toBe("paths./foo.patch.parameters.0.schema.properties.properties")
    expect(results[1].message).toContain("Properties of a PATCH request body must not have default value, property:prop0.")
  })
})

test("PatchBodyParametersSchema should find no errors", () => {
  const oasDoc = {
    swagger: "2.0",
    paths: {
      "/foo": {
        patch: {
          tags: ["SampleTag"],
          operationId: "Foo_Update",
          description: "Test Description",
          parameters: [
            {
              name: "foo_patch",
              in: "body",
              schema: {
                $ref: "#/definitions/FooRequestParams",
              },
            },
          ],
          responses: {},
        },
      },
    },
    definitions: {
      FooRequestParams: {
        allOf: [
          {
            $ref: "#/definitions/FooProps",
          },
        ],
      },
      FooProps: {
        properties: {
          prop0: {
            type: "string",
          },
          prop1: {
            type: "string",
          },
        },
      },
    },
  }
  return linter.run(oasDoc).then((results) => {
    expect(results.length).toBe(0)
  })
})
