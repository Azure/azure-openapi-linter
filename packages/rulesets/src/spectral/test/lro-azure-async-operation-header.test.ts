import { Spectral } from "@stoplight/spectral-core"
import linterForRule from "./utils"

let linter: Spectral

beforeAll(async () => {
  linter = await linterForRule("LroAzureAsyncOperationHeader")
  return linter
})

const ERROR_MESSAGE = "Azure-AsyncOperation header must be supported for all async operations that return 202."

test("LroAzureAsyncOperationHeader should find no errors", () => {
  const myOpenApiDocument = {
    swagger: "2.0",
    paths: {
      "/foo1/operations": {
        get: {
          operationId: "foo_get",
          responses: {
            200: {
              description: "Success",
            },
            202: {
              description: "Accepted",
              headers: {
                "Azure-AsyncOperation": {
                  description: "The URL where the status of the asynchronous operation can be checked.",
                  type: "string",
                },
              },
            },
            default: {
              description: "Error",
            },
          },
        },
        post: {
          operationId: "foo_post",
          responses: {
            200: {
              description: "Success",
            },
            202: {
              description: "Accepted",
              headers: {
                "Azure-asyncoperation": {
                  description: "The URL where the status of the asynchronous operation can be checked.",
                  type: "string",
                },
              },
            },
            default: {
              description: "Error",
            },
          },
        },
        put: {
          operationId: "foo_put",
          responses: {
            200: {
              description: "Success",
            },
            202: {
              description: "Accepted",
              headers: {
                "azure-asyncOperation": {
                  description: "The URL where the status of the asynchronous operation can be checked.",
                  type: "string",
                },
              },
            },
            default: {
              description: "Error",
            },
          },
        },
      },
    },
  }
  return linter.run(myOpenApiDocument).then((results) => {
    expect(results.length).toBe(0)
  })
})

test("LroAzureAsyncOperationHeader should find errors with no Azure-AsyncOperation header", () => {
  const myOpenApiDocument = {
    swagger: "2.0",
    paths: {
      "/foo1/operations": {
        get: {
          operationId: "foo_get",
          responses: {
            200: {
              description: "Success",
            },
            202: {
              description: "Accepted",
              headers: {
                Location: {
                  description: "The URL where the status of the asynchronous operation can be checked.",
                  type: "string",
                },
              },
            },
            default: {
              description: "Error",
            },
          },
        },
        post: {
          operationId: "foo_post",
          responses: {
            200: {
              description: "Success",
            },
            202: {
              description: "Accepted",
              headers: {},
            },
            default: {
              description: "Error",
            },
          },
        },
        put: {
          operationId: "foo_put",
          responses: {
            200: {
              description: "Success",
            },
            202: {
              description: "Accepted",
              headers: {
                azureasyncOperation: {
                  description: "The URL where the status of the asynchronous operation can be checked.",
                  type: "string",
                },
              },
            },
            default: {
              description: "Error",
            },
          },
        },
      },
    },
  }
  return linter.run(myOpenApiDocument).then((results) => {
    expect(results.length).toBe(3)
    expect(results[0].path.join(".")).toBe("paths./foo1/operations.get.responses.202.headers")
    expect(results[0].message).toEqual(ERROR_MESSAGE)
    expect(results[1].path.join(".")).toBe("paths./foo1/operations.post.responses.202.headers")
    expect(results[1].message).toEqual(ERROR_MESSAGE)
    expect(results[2].path.join(".")).toBe("paths./foo1/operations.put.responses.202.headers")
    expect(results[2].message).toEqual(ERROR_MESSAGE)
  })
})
