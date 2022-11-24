import type { IFunctionResult } from "@stoplight/spectral-core"
import type { JsonPath } from "@stoplight/types"

// check if given propertyName is camel case
export function camelCase(propertyName: string, options: any, { path }: { path: JsonPath }): IFunctionResult[] {
  if (!propertyName) {
    return [] as IFunctionResult[]
  }
  const errors:IFunctionResult[] = []

  const camelCaseReg = /^[a-z0-9$-]+([A-Z]{1,3}[a-z0-9$-]+)+$|^[a-z0-9$-]+$|^[a-z0-9$-]+([A-Z]{1,3}[a-z0-9$-]+)*[A-Z]{1,3}$/

  if (!camelCaseReg.test(propertyName)) {
    errors.push({
      message:"",
      path
    })
  }
  return errors
}

export default camelCase