import path from "path"
import { readFileSync } from "fs"

import { APP_ROOT_PATH } from "@/config"
import arrayWrap from "@/utils/array-wrap"

/**
 * Usage:
 *   - `testDataPath('path/to/my-file.json')`
 *   - `testDataPath('path', 'to', 'my-file.json')`
 */
export function testDataPath(pathOrPathSegment: string | string[]): string {
  const pathSegments = arrayWrap(pathOrPathSegment)
  return path.join(APP_ROOT_PATH, "tests", "data", ...pathSegments)
}

/**
 * Usage:
 *   - `specData('path/to/my-file.json')`
 *   - `specData('path', 'to', 'my-file.json')`
 *
 * Returns:
 *   - JSON parsed object if file is a JSON file
 *   - Raw file content otherwise
 */
export function loadTestData(pathOrPathSegment: string | string[]): string | object {
  const filePath = testDataPath(pathOrPathSegment)
  const rawData = readFileSync(filePath)

  const extension = path.extname(filePath)
  switch (extension) {
    case ".json":
      return JSON.parse(rawData.toString())
    default:
      return rawData.toString()
  }
}

export default loadTestData
