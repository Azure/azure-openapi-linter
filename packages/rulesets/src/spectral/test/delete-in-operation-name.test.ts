import { Spectral } from "@stoplight/spectral-core"
import linterForRule from "./utils"

let linter: Spectral

beforeAll(async () => {
  linter = await linterForRule("DeleteInOperationName")
  return linter
})

test("DeleteInOperationName should find errors", () => {
  const myOpenApiDocument = {
    swagger: "2.0",
    paths: {
      "/api/Paths": {
        delete: {
          operationId: "Noun_NotNamedDelete",
          responses: {
            default: {
              description: "Unexpected error",
            },
          },
        },
      },
    },
  }
  return linter.run(myOpenApiDocument).then((results) => {
    expect(results.length).toBe(1)
    expect(results[0].path.join(".")).toBe("paths./api/Paths.delete.operationId")
  })
})

test("DeleteInOperationName should find no errors", () => {
  const myOpenApiDocument = {
    swagger: "2.0",
    paths: {
      "/api/Paths": {
        delete: {
          operationId: "Noun_Delete",
          responses: {
            default: {
              description: "Unexpected error",
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
