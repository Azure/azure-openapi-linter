// Synchronous DELETE must have 200 & 204 return codes and LRO DELETE must have 202 & 204 return codes.
// RPC Code: RPC-Delete-V1-01

const SYNC_DELETE_RESPONSES = ["200", "204", "default"]
const LR_DELETE_RESPONSES = ["202", "204", "default"]
const SYNC_ERROR =
  "Synchronous delete operations must have responses with 200, 204 and default return codes. They also must have no other response codes."
const LR_ERROR =
  "Long-running delete operations must have responses with 202, 204 and default return codes. They also must have no other response codes."
const EmptyResponse_ERROR =
  "Delete operation response codes must be non-empty. It must have response codes 200, 204 and default if it is sync or 202, 204 and default if it is long running."

export const DeleteResponseCodes = (deleteOp: any, _opts: any, ctx: any) => {
  if (deleteOp === null || typeof deleteOp !== "object") {
    return []
  }
  const path = ctx.path
  const errors = []

  const responses = Object.keys(deleteOp?.responses ?? {})

  if (responses.length == 0) {
    errors.push({
      message: EmptyResponse_ERROR,
      path: path,
    })
    return errors
  }

  const isAsyncOperation =
    deleteOp.responses["202"] ||
    (deleteOp["x-ms-long-running-operation"] && deleteOp["x-ms-long-running-operation"] === true) ||
    deleteOp["x-ms-long-running-operation-options"]

  if (isAsyncOperation) {
    if (!deleteOp["x-ms-long-running-operation"]) {
      errors.push({
        message: "An async DELETE operation must set '\"x-ms-long-running-operation\" : true'.",
        path: path,
      })
      return errors
    }

    if (responses.length !== LR_DELETE_RESPONSES.length || !LR_DELETE_RESPONSES.every((value) => responses.includes(value))) {
      errors.push({
        message: LR_ERROR,
        path: path,
      })
    }
  } else {
    if (responses.length !== SYNC_DELETE_RESPONSES.length || !SYNC_DELETE_RESPONSES.every((value) => responses.includes(value))) {
      errors.push({
        message: SYNC_ERROR,
        path: path,
      })
    }
  }

  return errors
}
