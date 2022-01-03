import {Cell, WALL, DOOR,  EMPTY, DOORWAY} from './types'

export const tiles: Cell[] = [
    [{ l: WALL, c: DOOR, r: EMPTY, }, { l: EMPTY, c: EMPTY, r: EMPTY, }, { l: EMPTY, c: WALL, r: WALL }, { l: DOOR, c: DOOR, r: WALL, }],
    [{ l: EMPTY, c: DOOR, r: DOOR, }, { l: WALL, c: DOOR, r: EMPTY }, { l: EMPTY, c: DOOR, r: WALL, }, { l: WALL, c: WALL, r: EMPTY }],
    [{ l: EMPTY, c: EMPTY, r: EMPTY, }, { l: EMPTY, c: EMPTY, r: EMPTY }, { l: WALL, c: WALL, r: EMPTY }, { l: EMPTY, c: EMPTY, r: WALL }],
    [{ l: DOOR, c: WALL, r: EMPTY, }, { l: WALL, c: DOOR, r: EMPTY, }, { l: EMPTY, c: DOORWAY, r: EMPTY }, { l: EMPTY, c: DOORWAY, r: WALL }],
    [{ l: EMPTY, c: DOORWAY, r: WALL }, { l: DOORWAY, c: DOOR, r: EMPTY, }, { l: EMPTY, c: WALL, r: EMPTY, }, { l: EMPTY, c: EMPTY, r: EMPTY, }, ],
    [{ l: EMPTY, c: EMPTY, r: EMPTY, }, { l: EMPTY, c: EMPTY, r: EMPTY, }, { l: EMPTY, c: WALL, r: WALL, }, { l: WALL, c: DOORWAY, r: EMPTY, }],
    [{ l: EMPTY, c: DOOR, r: WALL, }, { l: WALL, c: WALL, r: EMPTY }, { l: WALL, c: EMPTY, r: EMPTY }, { l: WALL, c: EMPTY, r: EMPTY, }],
    // [{ l: DOORWAY, c: WALL, r: EMPTY, }, { l: EMPTY, c: DOORWAY, r: EMPTY, }, { l: EMPTY, c: DOORWAY, r: EMPTY }, { l: EMPTY, c: DOOR, r: WALL, }],
    // [{ l: WALL, c: DOOR, r: EMPTY, }, { l: EMPTY, c: EMPTY, r: EMPTY }, { l: EMPTY, c: WALL, r: DOORWAY, }, { l: DOORWAY, c: DOOR, r: WALL }],
    // [{ l: EMPTY, c: EMPTY, r: EMPTY, }, { l: WALL, c: EMPTY, r: EMPTY }, { l: EMPTY, c: WALL, r: EMPTY }, { l: EMPTY, c: EMPTY, r: WALL }],
    // [{ l: WALL, c: DOORWAY, r: DOORWAY, }, { l: WALL, c: DOOR, r: EMPTY, }, { l: EMPTY, c: DOORWAY, r: EMPTY }, { l: EMPTY, c: WALL, r: WALL }],
    // [{ l: EMPTY, c: DOOR, r: WALL, }, { l: WALL, c: WALL, r: EMPTY }, { l: EMPTY, c: EMPTY, r: WALL }, { l: WALL, c: EMPTY, r: EMPTY, }],
    // [{ l: EMPTY, c: EMPTY, r: EMPTY, }, { l: EMPTY, c: EMPTY, r: EMPTY, }, { l: EMPTY, c: WALL, r: WALL, }, { l: WALL, c: DOORWAY, r: EMPTY, }],
    // [{ l: EMPTY, c: DOORWAY, r: WALL }, { l: DOORWAY, c: DOOR, r: EMPTY, }, { l: EMPTY, c: WALL, r: EMPTY, }, { l: EMPTY, c: EMPTY, r: EMPTY, }, ],
]

export const rotateRight = (cell: Cell): Cell => [cell[3], cell[0], cell[1], cell[2]]

export const startingTile: Cell = [{ l: EMPTY, c: EMPTY, r: EMPTY, }, { l: EMPTY, c: DOOR, r: WALL }, { l: WALL, c: WALL, r: WALL }, { l: WALL, c: EMPTY, r: WALL }]
export const endingTile: Cell = [{ l: WALL, c: DOOR, r: WALL }, {l: DOOR, c: WALL, r: WALL }, { l: WALL, c: DOOR, r: EMPTY }, { l: EMPTY, c: DOOR, r: WALL }]
