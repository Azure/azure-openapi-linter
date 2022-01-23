import { readFileSync } from "fs"
import { JsonPath } from "./typeDeclaration"
import { JsonInstance, JsonParser } from "./jsonParser"
import { Resolver } from "./resolver"
import { fileURLToPath, pathToFileURL, URL } from "url"

export class OpenapiDocument {
  private _specPath = undefined
  private _content = undefined
  private _doc = undefined
  private jsonInstance: JsonInstance
  private resolver
  private parser: JsonParser
  constructor(specPath: string, parser: JsonParser) {
    this.parser = parser
    this._specPath = specPath
  }
  async resolve() {
    this._content = readFileSync(this._specPath).toString()
    this.jsonInstance = this.parser.parse(this._content)
    this._doc = this.jsonInstance.getValue()
    this.resolver = new Resolver(this._doc, this._specPath)
    await this.resolver.resolve()
  }
  getObj() {
    return this._doc
  }
  getContent() {
    return this._content
  }

  getReferences() {
    return this.resolver.getReferences()
  }
  getDocumentPath() {
    return this._specPath
  }
  getPositionFromJsonPath(jsonPath: JsonPath) {
    return this.jsonInstance.getLocation(jsonPath)
  }
}

export const normalizePath = (path: string) => {
  let urlPath = fileURLToPath(pathToFileURL(path)).replace(/\\/g,"/")
  if (urlPath.slice(1,3) === ":/") { // for windows
    return urlPath.charAt(0).toUpperCase() + urlPath.slice(1)
  }
  return urlPath
}

export const parseJsonRef = (ref: string): string[] => {
  return ref.split("#")
}
