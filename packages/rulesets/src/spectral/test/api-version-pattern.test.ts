import { Spectral } from "@stoplight/spectral-core"
import linterForRule from "./utils"

let linter: Spectral

beforeAll(async () => {
  linter = await linterForRule("APIVersionPattern")
  return linter
})

test("APIVersionPattern should find no errors", () => {
  const myOpenApiDocument = {
    swagger: "2.0",
    info: {
      version: "2021-07-01",
    },
  }
  return linter.run(myOpenApiDocument).then((results) => {
    expect(results.length).toBe(0)
  })
})

test("APIVersionPattern should find errors", () => {
  const myOpenApiDocument = {
    swagger: "2.0",
    info: {
      version: "3.0.1",
    },
  }
  return linter.run(myOpenApiDocument).then((results) => {
    expect(results.length).toBe(1)
    expect(results[0].path.join(".")).toBe("info.version")
  })
})

test("APIVersionPattern should find errors 2", () => {
  const myOpenApiDocument = {
    swagger: "2.0",
    info: {
      version: "canonical",
    },
  }
  return linter.run(myOpenApiDocument).then((results) => {
    expect(results.length).toBe(1)
    expect(results[0].path.join(".")).toBe("info.version")
  })
})

test("APIVersionPattern should find no errors for autorest generated swagger", () => {
  const myOpenApiDocument = {
    swagger: "2.0",
    info: {
      version: "2021-07-01",
      "x-typespec-generated": [
        {
          emitter: "@azure-tools/typespec-autorest",
        },
      ],
    },
  }
  return linter.run(myOpenApiDocument).then((results) => {
    expect(results.length).toBe(0)
  })
})

test("APIVersionPattern should find errors for autorest generated swagger", () => {
  const myOpenApiDocument = {
    swagger: "2.0",
    info: {
      version: "3.0.1",
      "x-typespec-generated": [
        {
          emitter: "@azure-tools/typespec-autorest",
        },
      ],
    },
  }
  return linter.run(myOpenApiDocument).then((results) => {
    expect(results.length).toBe(1)
    expect(results[0].path.join(".")).toBe("info.version")
  })
})

test("APIVersionPattern should find errors for autorest-canonical generated swagger", () => {
  const myOpenApiDocument = {
    swagger: "2.0",
    info: {
      version: "3.0.1",
      "x-typespec-generated": [
        {
          emitter: "@azure-tools/typespec-autorest-canonical",
        },
      ],
    },
  }
  return linter.run(myOpenApiDocument).then((results) => {
    expect(results.length).toBe(1)
    expect(results[0].path.join(".")).toBe("info.version")
  })
})

test("APIVersionPattern should find errors for autorest-canonical generated swagger 2", () => {
  const myOpenApiDocument = {
    swagger: "2.0",
    info: {
      version: "2021-07-01",
      "x-typespec-generated": [
        {
          emitter: "@azure-tools/typespec-autorest-canonical",
        },
      ],
    },
  }
  return linter.run(myOpenApiDocument).then((results) => {
    expect(results.length).toBe(1)
    expect(results[0].path.join(".")).toBe("info.version")
  })
})

test("APIVersionPattern should find no errors for autorest-canonical generated swagger", () => {
  const myOpenApiDocument = {
    swagger: "2.0",
    info: {
      version: "canonical",
      "x-typespec-generated": [
        {
          emitter: "@azure-tools/typespec-autorest-canonical",
        },
      ],
    },
  }
  return linter.run(myOpenApiDocument).then((results) => {
    expect(results.length).toBe(0)
  })
})

test("APIVersionPattern should find no errors with -preview", () => {
  const myOpenApiDocument = {
    swagger: "2.0",
    info: {
      version: "2021-07-01-preview",
    },
  }
  return linter.run(myOpenApiDocument).then((results) => {
    expect(results.length).toBe(0)
  })
})

test("APIVersionPattern should find no errors for autorest generated swagger with -preview", () => {
  const myOpenApiDocument = {
    swagger: "2.0",
    info: {
      version: "2021-07-01-preview",
      "x-typespec-generated": [
        {
          emitter: "@azure-tools/typespec-autorest",
        },
      ],
    },
  }
  return linter.run(myOpenApiDocument).then((results) => {
    expect(results.length).toBe(0)
  })
})

test("APIVersionPattern should find errors for autorest-canonical generated swagger with -preview 2", () => {
  const myOpenApiDocument = {
    swagger: "2.0",
    info: {
      version: "2021-07-01-preview",
      "x-typespec-generated": [
        {
          emitter: "@azure-tools/typespec-autorest-canonical",
        },
      ],
    },
  }
  return linter.run(myOpenApiDocument).then((results) => {
    expect(results.length).toBe(1)
    expect(results[0].path.join(".")).toBe("info.version")
  })
})
