import { Spectral } from "@stoplight/spectral-core"
import linterForRule from "./utils"

let linter: Spectral

beforeAll(async () => {
  linter = await linterForRule("AvoidFreeFormObjects")
  return linter
})

test("AvoidFreeFormObjects referencing definitions from same swagger should find errors", () => {
  const oasDoc = {
    swagger: "2.0",
    paths: {
      "/foo": {
        put: {
          operationId: "Foo_Update_put",
          description: "Test Description",
          parameters: [
            {
              name: "foo_put",
              in: "body",
              schema: {
                $ref: "#/definitions/FooRequestParams",
              },
            },
          ],
          responses: {
            "200": {
              description: "Success",
              schema: {
                $ref: "#/definitions/FooProps",
              },
            },
            "201": {
              schema: {
                $ref: "#/definitions/FooRule",
              },
            },
          },
          "x-ms-long-running-operation": true,
          "x-ms-long-running-operation-options": {
            "final-state-via": "azure-async-operation",
          },
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
      FooResource: {
        "x-ms-azure-resource": true,
        properties: {
          provisioningState: {
            type: "string",
            description: "Provisioning state of the foo rule.",
            enum: ["Creating", "Canceled", "Deleting", "Failed"],
          },
        },
      },
      FooRule: {
        type: "object",
        properties: {
          properties: {
            $ref: "#/definitions/FooResource",
            "x-ms-client-flatten": true,
          },
        },
        required: ["properties"],
      },
      FooProps: {
        properties: {
          servicePrecedence: {
            description:
              "A precedence value that is used to decide between services when identifying the QoS values to use for a particular SIM. A lower value means a higher priority. This value should be unique among all services configured in the mobile network.",
            type: "integer",
            format: "int32",
            minimum: 0,
            maximum: 255,
          },
          id: {
            type: "string",
          },
        },
      },
    },
  }
  return linter.run(oasDoc).then((results) => {
    expect(results.length).toBe(1)
    expect(results[0].path.join(".")).toBe("paths./foo.put")
    expect(results[0].message).toContain(
      "200 response schema in long running PUT operation is missing ProvisioningState property. A LRO PUT operations response schema must have ProvisioningState specified for the 200 and 201 status codes."
    )
  })
})

// test("ProvisioningStateSpecifiedForLROPut with a properties property but no provisioningState property inside properties should find errors", () => {
//   const oasDoc = {
//     swagger: "2.0",
//     paths: {
//       "/foo": {
//         put: {
//           tags: ["SampleTag"],
//           operationId: "Foo_Update_put",
//           description: "Test Description",
//           parameters: [
//             {
//               name: "foo_put",
//               in: "body",
//               schema: {
//                 $ref: "#/definitions/FooRequestParams",
//               },
//             },
//           ],
//           responses: {
//             "200": {
//               description: "Success",
//               schema: {
//                 $ref: "#/definitions/FooProps",
//               },
//             },
//             "201": {
//               schema: {
//                 $ref: "#/definitions/FooRule",
//               },
//             },
//           },
//           "x-ms-long-running-operation": true,
//           "x-ms-long-running-operation-options": {
//             "final-state-via": "azure-async-operation",
//           },
//         },
//       },
//     },
//     definitions: {
//       FooRequestParams: {
//         allOf: [
//           {
//             $ref: "#/definitions/FooProps",
//           },
//         ],
//       },
//       FooResource: {
//         "x-ms-azure-resource": true,
//         properties: {
//           provisioningState: {
//             type: "string",
//             description: "Provisioning state of the foo rule.",
//             enum: ["Creating", "Canceled", "Deleting", "Failed"],
//           },
//         },
//       },
//       FooRule: {
//         type: "object",
//         properties: {
//           properties: {
//             $ref: "#/definitions/FooResource",
//             "x-ms-client-flatten": true,
//           },
//         },
//         required: ["properties"],
//       },
//       FooProps: {
//         properties: {
//           id: {
//             type: "string",
//           },
//           properties: {
//             "x-ms-azure-resource": true,
//             "x-ms-client-flatten": true,
//           },
//         },
//       },
//     },
//   }
//   return linter.run(oasDoc).then((results) => {
//     expect(results.length).toBe(1)
//     expect(results[0].path.join(".")).toBe("paths./foo.put")
//     expect(results[0].message).toContain(
//       "200 response schema in long running PUT operation is missing ProvisioningState property. A LRO PUT operations response schema must have ProvisioningState specified for the 200 and 201 status codes."
//     )
//   })
// })

// test("ProvisioningStateSpecified referencing definitions from different swagger should find errors", () => {
//   const oasDoc = {
//     swagger: "2.0",
//     paths: {
//       "/foo": {
//         put: {
//           operationId: "Foo_Update",
//           description: "Test Description",
//           parameters: [
//             {
//               name: "foo_patch",
//               in: "body",
//               schema: {
//                 $ref: "#/definitions/FooRequestParams",
//               },
//             },
//           ],
//           responses: {
//             "200": {
//               description: "Success",
//               schema: {
//                 $ref: "#/definitions/FooProps",
//               },
//             },
//             "201": {
//               schema: {
//                 $ref: "src/spectral/test/resources/lro-provisioning-state-specified.json#/definitions/PrivateEndpointConnection",
//               },
//             },
//           },
//           "x-ms-long-running-operation": true,
//           "x-ms-long-running-operation-options": {
//             "final-state-via": "azure-async-operation",
//           },
//         },
//         patch: {
//           tags: ["SampleTag"],
//           operationId: "Foo_Update",
//           description: "Test Description",
//           parameters: [
//             {
//               name: "foo_patch",
//               in: "body",
//               schema: {
//                 $ref: "#/definitions/FooRequestParams",
//               },
//             },
//           ],
//           responses: {
//             "200": {
//               description: "Success",
//               schema: {
//                 $ref: "#/definitions/FooProps",
//               },
//             },
//           },
//           "x-ms-long-running-operation": true,
//           "x-ms-long-running-operation-options": {
//             "final-state-via": "azure-async-operation",
//           },
//         },
//       },
//     },
//     definitions: {
//       FooRequestParams: {
//         allOf: [
//           {
//             $ref: "#/definitions/FooProps",
//           },
//         ],
//       },
//       FooResource: {
//         "x-ms-azure-resource": true,
//         properties: {
//           provisioningState: {
//             type: "string",
//             description: "Provisioning state of the foo rule.",
//             enum: ["Creating", "Canceled", "Deleting", "Failed"],
//           },
//         },
//       },
//       FooRule: {
//         type: "object",
//         properties: {
//           properties: {
//             $ref: "#/definitions/FooResource",
//             "x-ms-client-flatten": true,
//           },
//         },
//         required: ["properties"],
//       },
//       FooProps: {
//         properties: {
//           servicePrecedence: {
//             description:
//               "A precedence value that is used to decide between services when identifying the QoS values to use for a particular SIM. A lower value means a higher priority. This value should be unique among all services configured in the mobile network.",
//             type: "integer",
//             format: "int32",
//             minimum: 0,
//             maximum: 255,
//           },
//           id: {
//             type: "string",
//           },
//         },
//       },
//     },
//   }
//   return linter.run(oasDoc).then((results) => {
//     expect(results.length).toBe(1)
//     expect(results[0].path.join(".")).toBe("paths./foo.put")
//     expect(results[0].message).toContain(
//       "200 response schema in long running PUT operation is missing ProvisioningState property. A LRO PUT operations response schema must have ProvisioningState specified for the 200 and 201 status codes."
//     )
//   })
// })

// test("ProvisioningStateSpecified referencing definitions from different swagger should find no errors", () => {
//   const oasDoc = {
//     swagger: "2.0",
//     paths: {
//       "/foo": {
//         put: {
//           tags: ["SampleTag"],
//           operationId: "Foo_Update",
//           description: "Test Description",
//           parameters: [
//             {
//               name: "foo_put",
//               in: "body",
//               schema: {
//                 $ref: "#/definitions/FooRequestParams",
//               },
//             },
//           ],
//           responses: {
//             "200": {
//               description: "Success",
//               schema: {
//                 $ref: "src/spectral/test/resources/lro-provisioning-state-specified.json#/definitions/PrivateEndpointConnection",
//               },
//             },
//             "201": {
//               schema: {
//                 $ref: "#/definitions/FooRule",
//               },
//             },
//           },
//           "x-ms-long-running-operation": true,
//           "x-ms-long-running-operation-options": {
//             "final-state-via": "azure-async-operation",
//           },
//         },
//       },
//     },
//     definitions: {
//       FooRequestParams: {
//         allOf: [
//           {
//             $ref: "#/definitions/FooProps",
//           },
//         ],
//       },
//       FooResource: {
//         "x-ms-azure-resource": true,
//         properties: {
//           provisioningState: {
//             type: "string",
//             description: "Provisioning state of the foo rule.",
//             enum: ["Creating", "Canceled", "Deleting", "Failed"],
//           },
//         },
//       },
//       FooRule: {
//         type: "object",
//         properties: {
//           properties: {
//             $ref: "#/definitions/FooResource",
//             "x-ms-client-flatten": true,
//           },
//         },
//         required: ["properties"],
//       },
//       FooProps: {
//         properties: {
//           servicePrecedence: {
//             description:
//               "A precedence value that is used to decide between services when identifying the QoS values to use for a particular SIM. A lower value means a higher priority. This value should be unique among all services configured in the mobile network.",
//             type: "integer",
//             format: "int32",
//             minimum: 0,
//             maximum: 255,
//           },
//           id: {
//             type: "string",
//           },
//         },
//       },
//     },
//   }
//   return linter.run(oasDoc).then((results) => {
//     expect(results.length).toBe(0)
//   })
// })

// test("ProvisioningStateSpecifiedForLROPut should find no errors", () => {
//   const oasDoc = {
//     swagger: "2.0",
//     paths: {
//       "/foo": {
//         put: {
//           operationId: "Foo_Update",
//           description: "Test Description",
//           parameters: [
//             {
//               name: "foo_patch",
//               in: "body",
//               schema: {
//                 $ref: "#/definitions/FooRequestParams",
//               },
//             },
//           ],
//           responses: {
//             "200": {
//               description: "Success",
//               schema: {
//                 $ref: "#/definitions/FooRule",
//               },
//             },
//             "201": {
//               schema: {
//                 $ref: "#/definitions/FooRule",
//               },
//             },
//           },
//           "x-ms-long-running-operation": true,
//           "x-ms-long-running-operation-options": {
//             "final-state-via": "azure-async-operation",
//           },
//         },
//       },
//     },
//     definitions: {
//       FooRequestParams: {
//         allOf: [
//           {
//             $ref: "#/definitions/FooProps",
//           },
//         ],
//       },
//       FooProps: {
//         properties: {
//           servicePrecedence: {
//             description:
//               "A precedence value that is used to decide between services when identifying the QoS values to use for a particular SIM. A lower value means a higher priority. This value should be unique among all services configured in the mobile network.",
//             type: "integer",
//             format: "int32",
//             minimum: 0,
//             maximum: 255,
//           },
//           id: {
//             type: "string",
//           },
//         },
//       },
//       FooResource: {
//         "x-ms-azure-resource": true,
//         properties: {
//           provisioningState: {
//             type: "string",
//             enum: ["Creating", "Canceled", "Deleting", "Failed"],
//           },
//         },
//       },
//       FooRule: {
//         type: "object",
//         properties: {
//           properties: {
//             $ref: "#/definitions/FooResource",
//             "x-ms-client-flatten": true,
//           },
//         },
//         required: ["properties"],
//       },
//     },
//   }
//   return linter.run(oasDoc).then((results) => {
//     expect(results.length).toBe(0)
//   })
// })

// test("ProvisioningStateSpecifiedForSyncPut- without provisioning state should find no errors", () => {
//   const oasDoc = {
//     swagger: "2.0",
//     paths: {
//       "/foo": {
//         put: {
//           operationId: "Foo_Update",
//           description: "Test Description",
//           parameters: [
//             {
//               name: "foo_patch",
//               in: "body",
//               schema: {
//                 $ref: "#/definitions/FooRequestParams",
//               },
//             },
//           ],
//           responses: {
//             "200": {
//               description: "Success",
//               schema: {
//                 $ref: "#/definitions/FooRequestParams",
//               },
//             },
//             "201": {
//               schema: {
//                 $ref: "#/definitions/FooProps",
//               },
//             },
//           },
//         },
//       },
//     },
//     definitions: {
//       FooRequestParams: {
//         allOf: [
//           {
//             $ref: "#/definitions/FooProps",
//           },
//         ],
//       },
//       FooProps: {
//         properties: {
//           servicePrecedence: {
//             description:
//               "A precedence value that is used to decide between services when identifying the QoS values to use for a particular SIM. A lower value means a higher priority. This value should be unique among all services configured in the mobile network.",
//             type: "integer",
//             format: "int32",
//             minimum: 0,
//             maximum: 255,
//           },
//           id: {
//             type: "string",
//           },
//         },
//       },
//       FooResource: {
//         "x-ms-azure-resource": true,
//         properties: {
//           provisioningState: {
//             type: "string",
//             enum: ["Creating", "Canceled", "Deleting", "Failed"],
//           },
//         },
//       },
//       FooRule: {
//         type: "object",
//         properties: {
//           properties: {
//             $ref: "#/definitions/FooResource",
//             "x-ms-client-flatten": true,
//           },
//         },
//         required: ["properties"],
//       },
//     },
//   }
//   return linter.run(oasDoc).then((results) => {
//     expect(results.length).toBe(0)
//   })
// })

// test("ProvisioningStateSpecifiedForSyncPut- with provisioning state should find no errors", () => {
//   const oasDoc = {
//     swagger: "2.0",
//     paths: {
//       "/foo": {
//         put: {
//           operationId: "Foo_Update",
//           description: "Test Description",
//           parameters: [
//             {
//               name: "foo_patch",
//               in: "body",
//               schema: {
//                 $ref: "#/definitions/FooRequestParams",
//               },
//             },
//           ],
//           responses: {
//             "200": {
//               description: "Success",
//               schema: {
//                 $ref: "#/definitions/FooRequestParams",
//               },
//             },
//             "201": {
//               schema: {
//                 $ref: "#/definitions/FooRule",
//               },
//             },
//           },
//         },
//       },
//     },
//     definitions: {
//       FooRequestParams: {
//         allOf: [
//           {
//             $ref: "#/definitions/FooProps",
//           },
//         ],
//       },
//       FooProps: {
//         properties: {
//           servicePrecedence: {
//             description:
//               "A precedence value that is used to decide between services when identifying the QoS values to use for a particular SIM. A lower value means a higher priority. This value should be unique among all services configured in the mobile network.",
//             type: "integer",
//             format: "int32",
//             minimum: 0,
//             maximum: 255,
//           },
//           id: {
//             type: "string",
//           },
//         },
//       },
//       FooResource: {
//         "x-ms-azure-resource": true,
//         properties: {
//           provisioningState: {
//             type: "string",
//             enum: ["Creating", "Canceled", "Deleting", "Failed"],
//           },
//         },
//       },
//       FooRule: {
//         type: "object",
//         properties: {
//           properties: {
//             $ref: "#/definitions/FooResource",
//             "x-ms-client-flatten": true,
//           },
//         },
//         required: ["properties"],
//       },
//     },
//   }
//   return linter.run(oasDoc).then((results) => {
//     expect(results.length).toBe(0)
//   })
// })
