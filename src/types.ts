export const WALL = 'edges/wall'
export const DOOR = 'edges/door'
export const EMPTY = 'edges/empty'
export const DOORWAY = 'edges/doorway'

export type Edge = typeof WALL | typeof DOOR | typeof EMPTY | typeof DOORWAY

export const TOP_LEFT = 'top_left'
export const TOP_RIGHT = 'top_right'
export const BOTTOM_LEFT = 'bottom_left'
export const BOTTOM_RIGHT = 'bottom_right'

export type Direction = 'top' | 'left' | 'bottom' | 'right'

export const END_UNREACHABLE = 'end_unreachable'
export const END_BLOCKED = 'end_blocked'
export const CANNOT_FIT = 'cannot_fit'
export const GENERIC_ERROR = 'generic_error'
export const UNUSED_TILES = 'unused_tiles'

export type ErrorReasonType = typeof END_UNREACHABLE | typeof END_BLOCKED | typeof CANNOT_FIT | typeof GENERIC_ERROR | typeof UNUSED_TILES

export type Candidate = {
  cellX: number
  cellY: number
  subCell: typeof TOP_LEFT | typeof TOP_RIGHT | typeof BOTTOM_LEFT | typeof BOTTOM_RIGHT
  // node: Room
  direction: Direction
}

export type CellSide = {
    l: Edge
    c: Edge
    r: Edge
}

export type Cell = [CellSide, CellSide, CellSide, CellSide]

export type GameMap = (Cell|false)[][]

export type PointType = {
  x: number
  y: number
}

export type HistoryEntry = {
  map: GameMap
  visited: string[]
  openCells: PointType[]
  activeQueue: Candidate[]
  passingQueue: Candidate[]
}

export type GraphErrorType = {
  map: GameMap
  history: HistoryEntry[]
  tile: number
  pointX: number
  pointY: number
  reason: ErrorReasonType
}
