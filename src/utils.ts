import { GameMap, Cell, Point } from "./types"

export function createInitialMap(
  width: number,
  height: number,
  startingTile: Cell,
  startingPos: Point,
  endingTile: Cell,
  endingPos: Point,
  ): GameMap {
  const map = Array(width).fill(false).map(() => Array(height).fill(false))
  
  map[startingPos.x][startingPos.y] = startingTile
  map[endingPos.x][endingPos.y] = endingTile
  return map
}