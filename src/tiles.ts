import {Cell, WALL, DOOR,  EMPTY, DOORWAY, ExtendedCell, MiddleRoom} from './types'

export const tiles: Cell[] = [
    [{ l: WALL, c: DOOR, r: EMPTY, }, { l: EMPTY, c: EMPTY, r: EMPTY, }, { l: EMPTY, c: WALL, r: WALL }, { l: DOOR, c: DOOR, r: WALL, }],
    [{ l: EMPTY, c: DOOR, r: DOOR, }, { l: WALL, c: DOOR, r: EMPTY }, { l: EMPTY, c: DOOR, r: WALL, }, { l: WALL, c: WALL, r: EMPTY }],
    [{ l: EMPTY, c: EMPTY, r: EMPTY, }, { l: EMPTY, c: EMPTY, r: EMPTY }, { l: WALL, c: WALL, r: EMPTY }, { l: EMPTY, c: EMPTY, r: WALL }],
    [{ l: DOOR, c: WALL, r: EMPTY, }, { l: WALL, c: DOOR, r: EMPTY, }, { l: EMPTY, c: DOORWAY, r: EMPTY }, { l: EMPTY, c: DOORWAY, r: WALL }],
    [{ l: EMPTY, c: DOORWAY, r: WALL }, { l: DOORWAY, c: DOOR, r: EMPTY, }, { l: EMPTY, c: WALL, r: EMPTY, }, { l: EMPTY, c: EMPTY, r: EMPTY, }, ],
    [{ l: EMPTY, c: EMPTY, r: EMPTY, }, { l: EMPTY, c: EMPTY, r: EMPTY, }, { l: EMPTY, c: WALL, r: WALL, }, { l: WALL, c: DOORWAY, r: EMPTY, }],
    [{ l: EMPTY, c: DOOR, r: WALL, }, { l: WALL, c: WALL, r: EMPTY }, { l: WALL, c: EMPTY, r: EMPTY }, { l: WALL, c: EMPTY, r: EMPTY, }],
    [{ l: EMPTY, c: EMPTY, r: EMPTY, }, { l: EMPTY, c: EMPTY, r: EMPTY, }, { l: EMPTY, c: WALL, r: WALL, }, { l: WALL, c: DOORWAY, r: EMPTY, }],
    [{ l: EMPTY, c: DOOR, r: WALL, }, { l: WALL, c: WALL, r: EMPTY }, { l: WALL, c: EMPTY, r: EMPTY }, { l: WALL, c: EMPTY, r: EMPTY, }],
    [{ l: EMPTY, c: DOOR, r: WALL, }, { l: WALL, c: WALL, r: EMPTY }, { l: WALL, c: EMPTY, r: EMPTY }, { l: WALL, c: EMPTY, r: EMPTY, }],
]

const rotateRoomRight = (room: MiddleRoom): MiddleRoom => ({ tl: room.tr, tr: room.br, br: room.bl, bl: room.tr })
export const rotateRight = (cell: (Cell|ExtendedCell)): (Cell|ExtendedCell) => cell.length === 4
    ? [cell[3], cell[0], cell[1], cell[2]]
    : [cell[3], cell[0], cell[1], cell[2], rotateRoomRight(cell[4])]

export const startingTile: Cell = [{ l: EMPTY, c: EMPTY, r: EMPTY, }, { l: EMPTY, c: DOOR, r: WALL }, { l: WALL, c: WALL, r: WALL }, { l: WALL, c: EMPTY, r: WALL }]
export const endingTile: Cell = [{ l: WALL, c: DOOR, r: WALL }, {l: DOOR, c: WALL, r: WALL }, { l: WALL, c: DOOR, r: EMPTY }, { l: EMPTY, c: DOOR, r: WALL }]
