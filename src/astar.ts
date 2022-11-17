import { rotateRight } from "./tiles"
import { BOTTOM_LEFT, BOTTOM_RIGHT, MIDDLE, Candidate, Cell, CellSide, DOOR, DOORWAY, Edge, EMPTY, ExtendedCell, GameMap, MiddleRoom, PointType, TOP_LEFT, TOP_RIGHT, WALL } from "./types"

const EDGE_TOP = 0
const EDGE_RIGHT = 1
const EDGE_BOTTOM = 2
const EDGE_LEFT = 3
const MIDDLE_ROOM = 4
const Q1 = 'q1'
const Q2 = 'q2'
const Q3 = 'q3'
const Q4 = 'q4'

const getCoordsQuarter = (x: number, y: number): QuarterType => {
  var quarter: QuarterType = Q1;
  if (x % 2 === 1 && y % 2 === 0) {
    quarter = Q2
  } else if (x % 2 === 0 && y % 2 === 1) {
    quarter = Q3
  } else if (x % 2 === 1 && y % 2 === 1) {
    quarter = Q4
  }
  return quarter
}

type QuarterType = typeof Q1 | typeof Q2 | typeof Q3 | typeof Q4

export const nodeAdjancedTo = (x1: number, y1: number, x2: number, y2: number, map: GameMap) => {
  const quarter1: QuarterType = getCoordsQuarter(x1, y1)
  const quarter2: QuarterType = getCoordsQuarter(x2, y2)

  const t1x = Math.floor(x1 / 2)
  const t1y = Math.floor(y1 / 2)

  const t2x = Math.floor(x2 / 2)
  const t2y = Math.floor(y2 / 2)

  const tile1 = map[t1x][t1y]
  const tile2 = map[t2x][t2y]

  if (tile1 === false || tile2 === false) return false

  if (t1x === t2x && t1y === t2y) {
    // Один тайл
    if ((quarter1 === Q1 && quarter2 === Q2) || (quarter1 === Q2 && quarter2 === Q1)) {
      return tile1[EDGE_TOP].c !== WALL
    }
    if ((quarter1 === Q3 && quarter2 === Q4) || (quarter1 === Q4 && quarter2 === Q3)) {
      return tile1[EDGE_BOTTOM].c !== WALL
    }
    if ((quarter1 === Q1 && quarter2 === Q3) || (quarter1 === Q3 && quarter2 === Q1)) {
      return tile1[EDGE_LEFT].c !== WALL
    }
    if ((quarter1 === Q2 && quarter2 === Q4) || (quarter1 === Q4 && quarter2 === Q2)) {
      return tile1[EDGE_RIGHT].c !== WALL
    }
  } else {
    // Разные тайлы
    // Верх
    if ((quarter1 === Q1 && quarter2 === Q3)) {
      return tile1[EDGE_TOP].l !== WALL && tile2[EDGE_BOTTOM].r !== WALL 
    }
    if ((quarter1 === Q2 && quarter2 === Q4)) {
      return tile1[EDGE_TOP].r !== WALL && tile2[EDGE_BOTTOM].l !== WALL 
    }
    // Правый край
    if ((quarter1 === Q2 && quarter2 === Q1)) {
      return tile1[EDGE_RIGHT].l !== WALL && tile2[EDGE_LEFT].r !== WALL 
    }
    if ((quarter1 === Q4 && quarter2 === Q3)) {
      return tile1[EDGE_RIGHT].r !== WALL && tile2[EDGE_LEFT].l !== WALL 
    }
    // Низ
    if ((quarter1 === Q3 && quarter2 === Q1)) {
      return tile1[EDGE_BOTTOM].r !== WALL && tile2[EDGE_TOP].l !== WALL 
    }
    if ((quarter1 === Q4 && quarter2 === Q2)) {
      return tile1[EDGE_BOTTOM].l !== WALL && tile2[EDGE_TOP].r !== WALL 
    }
    // Левый край
    if ((quarter1 === Q1 && quarter2 === Q2)) {
      return tile1[EDGE_LEFT].r !== WALL && tile2[EDGE_RIGHT].l !== WALL 
    }
    if ((quarter1 === Q3 && quarter2 === Q4)) {
      return tile1[EDGE_LEFT].l !== WALL && tile2[EDGE_RIGHT].r !== WALL 
    }
  }

  return false
}

function eqSet(as: Set<Edge>, bs: Set<Edge>) {
  if (as.size !== bs.size) return false;
  return ![...as.values()].some(el => !bs.has(el))
}

const CONFLICT_ONE = new Set<Edge>([WALL, DOOR])
const CONFLICT_TWO = new Set<Edge>([WALL, DOORWAY])

export const nodeConflictsAt = (x1: number, y1: number, x2: number, y2: number, map: GameMap) => {
  const quarter1: QuarterType = getCoordsQuarter(x1, y1)
  const quarter2: QuarterType = getCoordsQuarter(x2, y2)

  const t1x = Math.floor(x1 / 2)
  const t1y = Math.floor(y1 / 2)

  const t2x = Math.floor(x2 / 2)
  const t2y = Math.floor(y2 / 2)

  const tile1 = map[t1x][t1y]
  const tile2 = map[t2x][t2y]
  if (tile1 === false || tile2 === false) return false

  if (t1x === t2x && t1y === t2y) {
    return false // Тайл не конфликтует с собой никогда
  } else {
    // Разные тайлы
    // Верх
    if ((quarter1 === Q1 && quarter2 === Q3)) {
      const edgeSet = new Set<Edge>([tile1[EDGE_TOP].l, tile2[EDGE_BOTTOM].r])
      return eqSet(edgeSet, CONFLICT_ONE) || eqSet(edgeSet, CONFLICT_TWO)
    }
    if ((quarter1 === Q2 && quarter2 === Q4)) {
      const edgeSet = new Set<Edge>([tile1[EDGE_TOP].r, tile2[EDGE_BOTTOM].l]) 
      return eqSet(edgeSet, CONFLICT_ONE) || eqSet(edgeSet, CONFLICT_TWO)
    }
    // Правый край
    if ((quarter1 === Q2 && quarter2 === Q1)) {
      const edgeSet = new Set<Edge>([tile1[EDGE_RIGHT].l, tile2[EDGE_LEFT].r]) 
      return eqSet(edgeSet, CONFLICT_ONE) || eqSet(edgeSet, CONFLICT_TWO)
    }
    if ((quarter1 === Q4 && quarter2 === Q3)) {
      const edgeSet = new Set<Edge>([tile1[EDGE_RIGHT].r, tile2[EDGE_LEFT].l]) 
      return eqSet(edgeSet, CONFLICT_ONE) || eqSet(edgeSet, CONFLICT_TWO)
    }
    // Низ
    if ((quarter1 === Q3 && quarter2 === Q1)) {
      const edgeSet = new Set<Edge>([tile1[EDGE_BOTTOM].r, tile2[EDGE_TOP].l])
      return eqSet(edgeSet, CONFLICT_ONE) || eqSet(edgeSet, CONFLICT_TWO)
    }
    if ((quarter1 === Q4 && quarter2 === Q2)) {
      const edgeSet = new Set<Edge>([tile1[EDGE_BOTTOM].l, tile2[EDGE_TOP].r]) 
      return eqSet(edgeSet, CONFLICT_ONE) || eqSet(edgeSet, CONFLICT_TWO)
    }
    // Левый край
    if ((quarter1 === Q1 && quarter2 === Q2)) {
      const edgeSet = new Set<Edge>([tile1[EDGE_LEFT].r, tile2[EDGE_RIGHT].l]) 
      return eqSet(edgeSet, CONFLICT_ONE) || eqSet(edgeSet, CONFLICT_TWO)
    }
    if ((quarter1 === Q3 && quarter2 === Q4)) {
      const edgeSet = new Set<Edge>([tile1[EDGE_LEFT].l, tile2[EDGE_RIGHT].r])
      return eqSet(edgeSet, CONFLICT_ONE) || eqSet(edgeSet, CONFLICT_TWO)
    }
  }

  return false
}

const Symbols: Record<Edge, string> = {
  [WALL]: 'W',
  [DOORWAY]: 'd',
  [DOOR]: 'D',
  [EMPTY]: ' ',
}

const cellToBits = (edge: CellSide) => Symbols[edge.l] + Symbols[edge.c] + Symbols[edge.r]
const roomToBits = (edge: MiddleRoom) => Symbols[edge.tl] + Symbols[edge.tr] + Symbols[edge.bl] + Symbols[edge.br]

export const getTileHash = (tile: Cell | ExtendedCell): string =>
  (tile.length === 4)
  ? cellToBits(tile[EDGE_LEFT]) + cellToBits(tile[EDGE_TOP]) + cellToBits(tile[EDGE_RIGHT]) + cellToBits(tile[EDGE_BOTTOM])
  : cellToBits(tile[EDGE_LEFT]) + cellToBits(tile[EDGE_TOP]) + cellToBits(tile[EDGE_RIGHT]) + cellToBits(tile[EDGE_BOTTOM]) + roomToBits(tile[MIDDLE_ROOM])

export const getMapHash = (map: GameMap): string => {
  return map.map(col => col.map(cell => cell ? getTileHash(cell) : '?').join('')).join('')
}

export const buildGraph = (map: GameMap, initialVisitedSet: string[], initialQueue: Candidate[]): [PointType[], Candidate[], string[]] => {
  const maxX = map.length - 1
  const maxY = (map[0] || []).length - 1

  const cellQueue: Candidate[] = []

  const visitedSet = new Set<string>()

  if (initialVisitedSet.length && initialQueue.length) {
    cellQueue.push(...initialQueue)
    initialVisitedSet.forEach(value => visitedSet.add(value))
  } else {
  
    /*if (startingCell && startingCell[EDGE_LEFT].c !== WALL) {
      cellQueue.push({
        cellX: 0,
        cellY: 2,
        subCell: TOP_LEFT,
        // node: startingNode,
        direction: 'top'
      })
    }
  
    if (startingCell && startingCell[EDGE_BOTTOM].c !== WALL) {
      cellQueue.push({
        cellX: 0,
        cellY: 2,
        subCell: BOTTOM_RIGHT,
        // node: startingNode,
        direction: 'right'
      })
    }*/
    cellQueue.push({
      cellX: 0,
      cellY: maxY,
      subCell: BOTTOM_LEFT,
      // node: startingNode,
      direction: 'right'
    })
  
    visitedSet.add(`0:${maxY}:${BOTTOM_LEFT}`)
    console.log('Default queue values')
  }

  // const visitedRooms: Record<string, Room> = {}
  // visitedRooms[`0:3:${BOTTOM_LEFT}`] = startingNode

  const futureCandidates: Candidate[] = []

  const openCells: PointType[] = []

  while (cellQueue.length) {
    const candidate = cellQueue.pop()
    if (candidate) {
      const { cellX, cellY, subCell } = candidate
      visitedSet.add(`${cellX}:${cellY}:${subCell}`)

      // const newNode: Room = {
      //   id: `${cellX}:${cellY}:${subCell}`,
      //   top: null,
      //   right: null,
      //   bottom: null,
      //   left: null,
      // }

      // visitedRooms[`${cellX}:${cellY}:${subCell}`] = newNode

      // node[direction as Direction] = newNode
      // newNode[inverse[direction as Direction]] = node

      const cell = map[cellX][cellY]

      switch (subCell) {
        // [X][ ]
        // [ ][ ]
        case TOP_LEFT: {
          // Going left
          if (cell && cell[EDGE_LEFT].r !== WALL) {
            // The path is open, at least
            if (cellX > 0) {
              if (cellX > maxX) {
                console.error('Map column empty')
              }
              const destinationCell = map[cellX - 1][cellY]
              if (destinationCell) {
                if (destinationCell[EDGE_RIGHT].l !== WALL) {
                  if (visitedSet.has(`${cellX - 1}:${cellY}:${TOP_RIGHT}`)) {
                    // visitedRooms[`${cellX - 1}:${cellY}:${TOP_RIGHT}`].right = newNode
                  } else {
                    cellQueue.unshift({
                      cellX: cellX - 1,
                      cellY,
                      subCell: TOP_RIGHT,
                      // node: newNode,
                      direction: 'left',
                    })
                  }
                }
              } else {
                if (!openCells.some(({x, y}) => x === cellX - 1 && y === cellY)) {
                  openCells.push({x: cellX - 1, y: cellY })
                }
                futureCandidates.push({ cellX, cellY, subCell, /*node,*/ direction: 'left' })
              }
            }
          }
          // Going up
          if (cell && cell[EDGE_TOP].l !== WALL) {
            // The path is open, at least
            if (cellY > 0) {
              const destinationCell = map[cellX][cellY - 1]
              if (destinationCell) {
                if (destinationCell[EDGE_BOTTOM].r !== WALL) {
                  if (visitedSet.has(`${cellX}:${cellY - 1}:${BOTTOM_LEFT}`)) {
                    // visitedRooms[`${cellX}:${cellY - 1}:${BOTTOM_LEFT}`].bottom = newNode
                  } else {
                    cellQueue.unshift({
                      cellX,
                      cellY: cellY - 1,
                      subCell: BOTTOM_LEFT,
                      // node: newNode,
                      direction: 'top',
                    })
                  }
                }
              } else {
                if (!openCells.some(({x, y}) => x === cellX && y === cellY - 1)) {
                  openCells.push({x: cellX, y: cellY - 1 })
                }
                futureCandidates.push({ cellX, cellY, subCell, /*node,*/ direction: 'top' })
              }
            }
          }
          // Going right
          if (cell && cell[EDGE_TOP].c !== WALL) {
            if (visitedSet.has(`${cellX}:${cellY}:${TOP_RIGHT}`)) {
              // visitedRooms[`${cellX}:${cellY}:${TOP_RIGHT}`].left = newNode
            } else {
              cellQueue.unshift({
                cellX,
                cellY,
                subCell: TOP_RIGHT,
                // node: newNode,
                direction: 'right',
              })
            }
          }
          // Going down
          if (cell && cell[EDGE_LEFT].c !== WALL) {
            if (visitedSet.has(`${cellX}:${cellY}:${BOTTOM_LEFT}`)) {
              // visitedRooms[`${cellX}:${cellY}:${BOTTOM_LEFT}`].top = newNode
            } else {
              cellQueue.unshift({
                cellX,
                cellY,
                subCell: BOTTOM_LEFT,
                // node: newNode,
                direction: 'bottom',
              })
            }
          }
          // Going centerwise
          if (cell && cell.length === 5 && cell[MIDDLE_ROOM].tl !== WALL) {
            if (visitedSet.has(`${cellX}:${cellY}:${MIDDLE}`)) {
              // visitedRooms[`${cellX}:${cellY}:${BOTTOM_LEFT}`].top = newNode
            } else {
              cellQueue.unshift({
                cellX,
                cellY,
                subCell: MIDDLE,
                // node: newNode,
                direction: 'bottom',
              })
            }
          }
          break;
        }
        case TOP_RIGHT: {
          // Going left
          if (cell && cell[EDGE_TOP].c !== WALL) {
            if (visitedSet.has(`${cellX}:${cellY}:${TOP_LEFT}`)) {
              // visitedRooms[`${cellX}:${cellY}:${TOP_LEFT}`].right = newNode
            } else {
              cellQueue.unshift({
                cellX,
                cellY,
                subCell: TOP_LEFT,
                // node: newNode,
                direction: 'left',
              })
            }
          }
          // Going up
          if (cell && cell[EDGE_TOP].r !== WALL) {
            // The path is open, at least
            if (cellY > 0) {
              const destinationCell = map[cellX][cellY - 1]
              if (destinationCell) {
                if (destinationCell[EDGE_BOTTOM].l !== WALL) {
                  if (visitedSet.has(`${cellX}:${cellY - 1}:${BOTTOM_RIGHT}`)) {
                    // visitedRooms[`${cellX}:${cellY - 1}:${BOTTOM_RIGHT}`].bottom = newNode
                  } else {
                    cellQueue.unshift({
                      cellX,
                      cellY: cellY - 1,
                      subCell: BOTTOM_RIGHT,
                      // node: newNode,
                      direction: 'top',
                    })
                  }
                }
              } else {
                if (!openCells.some(({x, y}) => x === cellX && y === cellY - 1)) {
                  openCells.push({x: cellX, y: cellY - 1 })
                }
                futureCandidates.push({ cellX, cellY, subCell, /*node,*/ direction: 'top' })
              }
            }
          }
          // Going right
          if (cell && cell[EDGE_RIGHT].l !== WALL) {
            // The path is open, at least
            if (cellX < maxX) {
              const destinationCell = map[cellX + 1][cellY]
              if (destinationCell) {
                if (destinationCell[EDGE_LEFT].r !== WALL) {
                  if (visitedSet.has(`${cellX + 1}:${cellY}:${TOP_LEFT}`)) {
                    // visitedRooms[`${cellX + 1}:${cellY}:${TOP_LEFT}`].left = newNode
                  } else {
                    cellQueue.unshift({
                      cellX: cellX + 1,
                      cellY: cellY,
                      subCell: TOP_LEFT,
                      // node: newNode,
                      direction: 'right',
                    })
                  }
                }
              } else {
                if (!openCells.some(({x, y}) => x === cellX + 1 && y === cellY)) {
                  openCells.push({ x: cellX + 1, y: cellY })
                }
                futureCandidates.push({ cellX, cellY, subCell, /*node,*/ direction: 'right' })
              }
            }
          }
          // Going down
          if (cell && cell[EDGE_RIGHT].c !== WALL) {
            if (visitedSet.has(`${cellX}:${cellY}:${BOTTOM_RIGHT}`)) {
              // visitedRooms[`${cellX}:${cellY}:${BOTTOM_RIGHT}`].top = newNode
            } else {
              cellQueue.unshift({
                cellX,
                cellY,
                subCell: BOTTOM_RIGHT,
                // node: newNode,
                direction: 'bottom',
              })
            }
          }
          // Going centerwise
          if (cell && cell.length === 5 && cell[MIDDLE_ROOM].tr !== WALL) {
            if (visitedSet.has(`${cellX}:${cellY}:${MIDDLE}`)) {
              // visitedRooms[`${cellX}:${cellY}:${BOTTOM_LEFT}`].top = newNode
            } else {
              cellQueue.unshift({
                cellX,
                cellY,
                subCell: MIDDLE,
                // node: newNode,
                direction: 'bottom',
              })
            }
          }
          break;
        }
        case BOTTOM_LEFT: {
          // Going left
          if (cell && cell[EDGE_LEFT].l !== WALL) {
            // The path is open, at least
            if (cellX > 0) {
              const destinationCell = map[cellX - 1][cellY]
              if (destinationCell) {
                if (destinationCell[EDGE_RIGHT].r !== WALL) {
                  if (visitedSet.has(`${cellX - 1}:${cellY}:${BOTTOM_RIGHT}`)) {
                    // visitedRooms[`${cellX - 1}:${cellY}:${BOTTOM_RIGHT}`].right = newNode
                  } else {
                    cellQueue.unshift({
                      cellX: cellX - 1,
                      cellY,
                      subCell: BOTTOM_RIGHT,
                      // node: newNode,
                      direction: 'left',
                    })
                  }
                }
              } else {
                if (!openCells.some(({x, y}) => x === cellX - 1 && y === cellY)) {
                  openCells.push({x: cellX - 1, y: cellY })
                }
                futureCandidates.push({ cellX, cellY, subCell, /*node,*/ direction: 'left' })
              }
            }
          }
          // Going up
          if (cell && cell[EDGE_LEFT].c !== WALL) {
            if (visitedSet.has(`${cellX}:${cellY}:${TOP_LEFT}`)) {
              // visitedRooms[`${cellX}:${cellY}:${TOP_LEFT}`].bottom = newNode
            } else {
              cellQueue.unshift({
                cellX,
                cellY,
                subCell: TOP_LEFT,
                // node: newNode,
                direction: 'top',
              })
            }
          }
          // Going down
          if (cell && cell[EDGE_BOTTOM].r !== WALL) {
            // The path is open, at least
            if (cellY < maxY) {
              const destinationCell = map[cellX][cellY + 1]
              if (destinationCell) {
                if (destinationCell[EDGE_TOP].l !== WALL) {
                  if (visitedSet.has(`${cellX}:${cellY + 1}:${TOP_LEFT}`)) {
                    // visitedRooms[`${cellX}:${cellY + 1}:${TOP_LEFT}`].top = newNode
                  } else {
                    cellQueue.unshift({
                      cellX,
                      cellY: cellY + 1,
                      subCell: TOP_LEFT,
                      // node: newNode,
                      direction: 'bottom',
                    })
                  }
                }
              } else {
                if (!openCells.some(({x, y}) => x === cellX && y === cellY + 1)) {
                  openCells.push({x: cellX, y: cellY + 1 })
                }
                futureCandidates.push({ cellX, cellY, subCell, /*node,*/ direction: 'bottom' })
              }
            }
          }
          // Going right
          if (cell && cell[EDGE_BOTTOM].c !== WALL) {
            if (visitedSet.has(`${cellX}:${cellY}:${BOTTOM_RIGHT}`)) {
              // visitedRooms[`${cellX}:${cellY}:${BOTTOM_RIGHT}`].left = newNode
            } else {
              cellQueue.unshift({
                cellX,
                cellY,
                subCell: BOTTOM_RIGHT,
                // node: newNode,
                direction: 'right',
              })
            }
          }
          // Going centerwise
          if (cell && cell.length === 5 && cell[MIDDLE_ROOM].bl !== WALL) {
            if (visitedSet.has(`${cellX}:${cellY}:${MIDDLE}`)) {
              // visitedRooms[`${cellX}:${cellY}:${BOTTOM_LEFT}`].top = newNode
            } else {
              cellQueue.unshift({
                cellX,
                cellY,
                subCell: MIDDLE,
                // node: newNode,
                direction: 'bottom',
              })
            }
          }
          break;
        }
        case BOTTOM_RIGHT: {
          // Going left
          if (cell && cell[EDGE_BOTTOM].c !== WALL) {
            if (visitedSet.has(`${cellX}:${cellY}:${BOTTOM_LEFT}`)) {
              // visitedRooms[`${cellX}:${cellY}:${BOTTOM_LEFT}`].right = newNode
            } else {
              cellQueue.unshift({
                cellX,
                cellY,
                subCell: BOTTOM_LEFT,
                // node: newNode,
                direction: 'left',
              })
            }
          }
          // Going up
          if (cell && cell[EDGE_RIGHT].c !== WALL) {
            if (visitedSet.has(`${cellX}:${cellY}:${TOP_RIGHT}`)) {
              // visitedRooms[`${cellX}:${cellY}:${TOP_RIGHT}`].bottom = newNode
            } else {
              cellQueue.unshift({
                cellX,
                cellY,
                subCell: TOP_RIGHT,
                // node: newNode,
                direction: 'top',
              })
            }
          }
          // Going right
          if (cell && cell[EDGE_RIGHT].r !== WALL) {
            // The path is open, at least
            if (cellX < maxX) {
              const destinationCell = map[cellX + 1][cellY]
              if (destinationCell) {
                if (destinationCell[EDGE_LEFT].l !== WALL) {
                  if (visitedSet.has(`${cellX + 1}:${cellY}:${BOTTOM_LEFT}`)) {
                    // visitedRooms[`${cellX + 1}:${cellY}:${BOTTOM_LEFT}`].left = newNode
                  } else {
                    cellQueue.unshift({
                      cellX: cellX + 1,
                      cellY: cellY,
                      subCell: BOTTOM_LEFT,
                      // node: newNode,
                      direction: 'right',
                    })
                  }
                }
              } else {
                if (!openCells.some(({x, y}) => x === cellX + 1 && y === cellY)) {
                  openCells.push({x: cellX + 1, y: cellY })
                }
                futureCandidates.push({ cellX, cellY, subCell, /*node,*/ direction: 'right' })
              }
            }
          }
          // Going down
          if (cell && cell[EDGE_BOTTOM].l !== WALL) {
            // The path is open, at least
            if (cellY < maxY) {
              const destinationCell = map[cellX][cellY + 1]
              if (destinationCell) {
                if (destinationCell[EDGE_TOP].r !== WALL) {
                  if (visitedSet.has(`${cellX}:${cellY + 1}:${TOP_RIGHT}`)) {
                    // visitedRooms[`${cellX}:${cellY + 1}:${TOP_RIGHT}`].top = newNode
                  } else {
                    cellQueue.unshift({
                      cellX,
                      cellY: cellY + 1,
                      subCell: TOP_RIGHT,
                      // node: newNode,
                      direction: 'bottom',
                    })  
                  }
                }
              } else {
                if (!openCells.some(({x, y}) => x === cellX && y === cellY + 1)) {
                  openCells.push({x: cellX, y: cellY + 1 })
                }
                futureCandidates.push({ cellX, cellY, subCell, /*node,*/ direction: 'bottom' })
              }
            }
          }
          // Going centerwise
          if (cell && cell.length === 5 && cell[MIDDLE_ROOM].br !== WALL) {
            if (visitedSet.has(`${cellX}:${cellY}:${MIDDLE}`)) {
              // visitedRooms[`${cellX}:${cellY}:${BOTTOM_LEFT}`].top = newNode
            } else {
              cellQueue.unshift({
                cellX,
                cellY,
                subCell: MIDDLE,
                // node: newNode,
                direction: 'bottom',
              })
            }
          }
          break
        }
        case MIDDLE: {
          // Going top-left
          if (cell && cell.length === 5 && cell[MIDDLE_ROOM].tl !== WALL) {
            if (visitedSet.has(`${cellX}:${cellY}:${TOP_LEFT}`)) {
              // visitedRooms[`${cellX}:${cellY}:${BOTTOM_LEFT}`].top = newNode
            } else {
              cellQueue.unshift({
                cellX,
                cellY,
                subCell: TOP_LEFT,
                // node: newNode,
                direction: 'bottom',
              })
            }
          }
          // Going top-right
          if (cell && cell.length === 5 && cell[MIDDLE_ROOM].tr !== WALL) {
            if (visitedSet.has(`${cellX}:${cellY}:${TOP_RIGHT}`)) {
              // visitedRooms[`${cellX}:${cellY}:${BOTTOM_LEFT}`].top = newNode
            } else {
              cellQueue.unshift({
                cellX,
                cellY,
                subCell: TOP_RIGHT,
                // node: newNode,
                direction: 'bottom',
              })
            }
          }
          // Going bottom-left
          if (cell && cell.length === 5 && cell[MIDDLE_ROOM].bl !== WALL) {
            if (visitedSet.has(`${cellX}:${cellY}:${BOTTOM_LEFT}`)) {
              // visitedRooms[`${cellX}:${cellY}:${BOTTOM_LEFT}`].top = newNode
            } else {
              cellQueue.unshift({
                cellX,
                cellY,
                subCell: BOTTOM_LEFT,
                // node: newNode,
                direction: 'bottom',
              })
            }
          }
          // Going bottom-right
          if (cell && cell.length === 5 && cell[MIDDLE_ROOM].br !== WALL) {
            if (visitedSet.has(`${cellX}:${cellY}:${BOTTOM_RIGHT}`)) {
              // visitedRooms[`${cellX}:${cellY}:${BOTTOM_LEFT}`].top = newNode
            } else {
              cellQueue.unshift({
                cellX,
                cellY,
                subCell: BOTTOM_RIGHT,
                // node: newNode,
                direction: 'bottom',
              })
            }
          }
          break;
        }
      }
    }
  }

  return [openCells, futureCandidates, [...visitedSet.values()]]
}

export const floodFill = (startPoint: PointType, endPoint: PointType, gameMap: GameMap) => {
  const potentialPoints: PointType[] = []
  const checkedPoints: PointType[] = []

  potentialPoints.push(startPoint)
  while(potentialPoints.length) {
    const currentPoint = potentialPoints.pop()
    if (!currentPoint) {
      return false
    }
    if (currentPoint.x === endPoint.x && currentPoint.y ===  endPoint.y) {
      return true
    }
    checkedPoints.push(currentPoint)
    const neighbors = getNeighbors(currentPoint, gameMap)
    for (let neighbor of neighbors) {
      if (
        !checkedPoints.some(p => p.x === neighbor.x && p.y === neighbor.y)
        && !potentialPoints.some(p => p.x === neighbor.x && p.y === neighbor.y)
        ) {
          potentialPoints.push(neighbor)
        }
    }
  }
  return false
}

const doorAdjancedToEdge = (edge: CellSide): boolean => (edge.l === DOOR || edge.r === DOOR || edge.l === DOORWAY || edge.r === DOORWAY)

export const nodeConflictsWithBorders = (cell: Cell|ExtendedCell, x: number, y: number, maxX: number, maxY: number): boolean => {
  // Top conflicts
  if (y === 0 && doorAdjancedToEdge(cell[EDGE_TOP])) {
    return true
  } 

  // Left conflicts
  if (x === 0 && doorAdjancedToEdge(cell[EDGE_LEFT])
  ) { 
    return true
  }

  // Bottom conflicts
  if (y === maxY && doorAdjancedToEdge(cell[EDGE_BOTTOM])
  ) { 
    return true
  }

  // Right conflicts
  if (x === maxX && doorAdjancedToEdge(cell[EDGE_RIGHT])
  ) { 
    return true
  }

  return false
}

export const fitCellAt = (cell: Cell | ExtendedCell, x: number, y: number, map: GameMap): [GameMap, boolean] => {
  if (!map[x][y]) {
    const rotations = [cell, rotateRight(cell), rotateRight(rotateRight(cell)), rotateRight(rotateRight(rotateRight(cell)))]
    for (let rotation of rotations) {
      const newMap = map.map(col => [...col])
      newMap[x][y] = rotation

      if (!nodeConflictsWithBorders(rotation, x, y, map.length - 1, map[0].length - 1)) {
        return [newMap, true]
      }
    }
    return [map, false]
  }

  return [map, false]
}

/*
export const aStar = (startPoint: PointType, endPoint: PointType, gameMap: GameMap) => {
  const getH = (p: PointType) => Math.abs(endPoint.x - p.x) + Math.abs(endPoint.y + p.y)
  const getF = (p: ExtendedPointType) => getH(p) + p.g

  var openList: ExtendedPointType[] = [{ ...startPoint, g: 0, f: getH(startPoint), parent: null }]
  var closedList: ExtendedPointType[] = []
// push startNode onto openList
  while (openList.length) {
// while(openList is not empty) {
//  currentNode = find lowest f in openList
    var lowestF = openList[0]
    for (let p of openList) {
      if (getF(p) < getF(lowestF)) {
        lowestF = p
      }
    }
//  if currentNode is final, return the successful path
    if (lowestF.x === endPoint.x && lowestF.y === endPoint.y) {
      return true
    }
//  push currentNode onto closedList and remove from openList
    closedList.push(lowestF)
    openList = openList.filter(p => p.x !== lowestF.x && p.y !== lowestF.y)

    let neighbors: PointType[] = getNeighbors(lowestF, gameMap)

    for (let neighbor of neighbors) {
      if (closedList.some(p => p.x === neighbor.x && p.y === neighbor.y)) {
        continue;
      }

      var gScore = lowestF.g + 1 // 1 is the distance from a node to it's neighbor
      var gScoreIsBest = false

      const neighborPoint = {
        ...neighbor,
        g: gScore,
        h: getH(neighbor),
      }

      if (!openList.some(p => p.x === neighbor.x && p.y === neighbor.y)) {
        gScoreIsBest = true
        neighbor.h = getH(neighbor)
      } else {
        gScoreIsBest = true
      }

      if(gScoreIsBest) {
        // Found an optimal (so far) path to this node.   Store info on how we got here and
        //  just how good it really is...
        neighborPoint.parent = currentNode;
        neighborPoint.g = gScore;
        neighborPoint.f = neighbor.g + neighbor.h;
        neighborPoint.debug = "F: " + neighbor.f + "<br />G: " + neighbor.g + "<br />H: " + neighbor.h;
      }

//  foreach neighbor of currentNode {
//      if neighbor is not in openList {
//             save g, h, and f then save the current parent
//             add neighbor to openList
//      }
//      if neighbor is in openList but the current g is better than previous g {
//              save g and f, then save the current parent
//      }
//  }
    }
  }
}
*/

function getNeighbors(node: PointType, gameMap: GameMap): PointType[] {
  var ret = [];
  var x = node.x;
  var y = node.y;

  if (x > 0 && nodeAdjancedTo(x, y, x - 1, y, gameMap)) {
    ret.push({ x: x - 1, y });
  }
  if(x < 6 && nodeAdjancedTo(x, y, x + 1, y, gameMap)) {
    ret.push({ x: x + 1, y });
  }
  if(y > 0 && nodeAdjancedTo(x, y, x, y - 1, gameMap)) {
    ret.push({ x, y: y - 1 });
  }
  if(y < 6 && nodeAdjancedTo(x, y, x, y + 1, gameMap)) {
    ret.push({ x, y: y + 1 });
  }
  return ret;
}
