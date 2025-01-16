const apiVersionPatternValidation = (info: any, opts: any, paths: any) => {
  if (info === null || typeof info !== "object") {
    return []
  }

  const path = paths.path || []
  const canonicalEmitter = "@azure-tools/typespec-autorest-canonical"

  if (info["x-typespec-generated"] && info["x-typespec-generated"][0].emitter == canonicalEmitter) {
    if (info.version != "canonical") {
      return [
        {
          message: `Canonical swagger version should be 'canonical.`,
          path: [...path, "version"],
        },
      ]
    }
  } else {
    const apiVersionPattern = /^(20\d{2})-(0[1-9]|1[0-2])-((0[1-9])|[12][0-9]|3[01])(-preview)?$/gi

    if (!apiVersionPattern.test(info.version)) {
      return [
        {
          message: `The API Version parameter MUST be in the Year-Month-Date format (i.e. 2016-07-04.). NOTE that this is the en-US ordering of month and date.`,
          path: [...path, "version"],
        },
      ]
    }
  }

  return []
}

export default apiVersionPatternValidation
