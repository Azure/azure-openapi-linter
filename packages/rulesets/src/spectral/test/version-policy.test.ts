import { Spectral } from "@stoplight/spectral-core"
import linterForRule from "./utils"

let linter: Spectral

beforeAll(async () => {
  linter = await linterForRule("VersionPolicy")
  return linter
})

test("VersionPolicy should find version in basePath", () => {
  const oasDoc = {
    swagger: "2.0",
    basePath: "/v3/api",
    paths: {
      "/test1": {
        get: {
          responses: {
            default: {
              description: "default",
            },
          },
        },
      },
    },
  }
  return linter.run(oasDoc).then((results) => {
    expect(results.length).toBe(2)
    expect(results[0].path.join(".")).toBe("basePath")
    expect(results[1].path.join(".")).toBe("paths./test1.get")
  })
})

test("VersionPolicy should find errors", () => {
  const oasDoc = {
    swagger: "2.0",
    paths: {
      "/v1/test1": {
        get: {
          responses: {
            default: {
              description: "default",
            },
          },
        },
      },
      "/test2": {
        get: {
          // no parameters
          responses: {
            default: {
              description: "default",
            },
          },
        },
      },
      "/test3": {
        get: {
          parameters: [
            {
              name: "p1",
              in: "query",
              type: "string",
            },
          ],
          responses: {
            default: {
              description: "default",
            },
          },
        },
      },
      "/test4": {
        get: {
          parameters: [
            {
              name: "api-version",
              in: "query",
              type: "string",
            },
          ],
          responses: {
            default: {
              description: "default",
            },
          },
        },
      },
    },
  }
  return linter.run(oasDoc).then((results) => {
    expect(results.length).toBe(5)
    expect(results[0].path.join(".")).toBe("paths./v1/test1")
    expect(results[1].path.join(".")).toBe("paths./v1/test1.get")
    expect(results[2].path.join(".")).toBe("paths./test2.get")
    expect(results[3].path.join(".")).toBe("paths./test3.get.parameters")
    expect(results[4].path.join(".")).toBe("paths./test4.get.parameters.0")
  })
})

test("VersionPolicy should find no errors", () => {
  const oasDoc = {
    swagger: "2.0",
    paths: {
      "/test1": {
        get: {
          parameters: [
            {
              name: "api-version",
              in: "query",
              type: "string",
              required: true,
            },
          ],
          responses: {
            default: {
              description: "default",
            },
          },
        },
      },
      "/test2": {
        parameters: [
          {
            name: "api-version",
            in: "query",
            type: "string",
            required: true,
          },
        ],
        get: {
          responses: {
            default: {
              description: "default",
            },
          },
        },
      },
    },
  }
  return linter.run(oasDoc).then((results) => {
    expect(results.length).toBe(0)
  })
})
