import { useState, useCallback, useMemo, useRef } from 'react'
import { startingTile, endingTile, tiles as initialTiles, rotateRight } from './tiles'
import './App.css';
import Button from '@mui/material/Button'
import ButtonGroup from '@mui/material/ButtonGroup'
import Paper from '@mui/material/Paper'
import Container from '@mui/material/Container'
import Typography from '@mui/material/Typography'
import EditIcon from '@mui/icons-material/Edit'

import LinearProgress from './LinearProgress'
import FullMap from './FullMap'
import MapCell from './MapCell'
import MapExtendedCell from './MapExtendedCell'
import TileEditModal from './TileEditModal/TileEditModal'
import ErrorList from './ErrorList/ErrorList'
import { buildGraph, fitCellAt, getMapHash } from './astar' 
import HistoryPlayer from './HistoryPlayer/HistoryPlayer'
import { Candidate, Cell, Direction, GameMap, GraphErrorType, HistoryEntry, PointType, END_BLOCKED, END_UNREACHABLE, CANNOT_FIT, ErrorReasonType, GENERIC_ERROR, UNUSED_TILES, ExtendedCell, SavedTileSet, TOP_RIGHT, BOTTOM_LEFT, Point, EMPTY, SubCell, BOTTOM_RIGHT, TOP_LEFT } from './types';
import SaveLoadModal from './SaveLoadModal/SaveLoadModal'
import PointOfInterestEditor from './PointOfInterestEditor/PointOfInterestEditor';
import { createInitialMap } from './utils';

const LOCAL_STORAGE_KEY = 'savedSets'

const startingTestMap: GameMap = [
  [
    false,
    false,
    startingTile,
  ],
  [
    false,
    false,
    false,
  ],
  [
    false,
    false,
    false,
  ],
  [
    endingTile,
    false,
    false,
  ]
]

const approxRuns: Record<number, number> = {
  10: 61710330,
  9: 4576885,
  8: 883804, // 2097152
  7: 255259, // 262144
  6: 37784, // 32768
  5: 4329, // 4096 /?
  4: 489, // 512
  3: 63, /// 64
  2: 8, // 8
  1: 1, // 1
}

// Магические константы - зло
const START_TILE_INDEX = -1
const END_TILE_INDEX = -2

const targetCache: Record<number,Record<number, Record<string, PointType>>> = {}
const getTargetCoords = (direction: Direction, x: number, y: number): PointType => {
  if (x in targetCache && y in targetCache[x] && direction in targetCache[x][y]) {
    return targetCache[x][y][direction]
  }
  let result = undefined
  switch (direction) {
    case 'top': {
      result = { x, y: y - 1 }
      break
    }
    case 'left': {
      result = { x: x - 1, y }
      break
    }
    case 'bottom': {
      result = { x, y: y + 1 }
      break
    }
    case 'right': {
      result = { x: x + 1, y }
    }
  }
  if (!(x in targetCache)) {
    targetCache[x] = {}
  }
  if (!(y in targetCache[x])) {
    targetCache[x][y] = {}
  }
  targetCache[x][y][direction] = result
  return result
}

const mergeArrays = (arr1: PointType[], arr2: PointType[]): PointType[] => {
  const coords = new Set<string>()
  const result: PointType[] = []
  arr1.forEach(point => {
    if (!coords.has(`${point.x}:${point.y}`)) {
      result.push(point)
      coords.add(`${point.x}:${point.y}`)
    }
  })
  arr2.forEach(point => {
    if (!coords.has(`${point.x}:${point.y}`)) {
      result.push(point)
      coords.add(`${point.x}:${point.y}`)
    }
  })

  return result
}

const SubCellToCoord = ({cellX, cellY, subCell}: SubCell): string => `${cellX}:${cellY}:${subCell}`

function App() {
  const [cellX, setCellX] = useState<number>()
  const [cellY, setCellY] = useState<number>()

  const [testMap, setTestMap] = useState<GameMap>(startingTestMap)

  const maxX = testMap.length - 1
  const maxY = testMap[0].length - 1

  const [startingCoord, setStartingCoord] = useState<SubCell>({cellX: 0, cellY: maxY, subCell: BOTTOM_RIGHT})
  const [endingCoord, setEndingCoord] = useState<SubCell>({cellX: maxX, cellY:0, subCell: TOP_RIGHT})
  const [poiEditorOpen, setPoiEditorOpen] = useState<boolean>(false)

  const [map, setMap] = useState<GameMap>([...testMap])

  const [tiles, setTiles] = useState<(Cell|ExtendedCell)[]>([...initialTiles])
  const [currentTiles, setCurrentTiles] = useState<(Cell|ExtendedCell)[]>([...initialTiles])
  const [selectedPiece, setSelectedPiece] = useState<number>(0)

  const setsInStorage = localStorage ? localStorage.getItem(LOCAL_STORAGE_KEY) : false
    
  const initialSavedSets = setsInStorage ? JSON.parse(setsInStorage) : []

  const [savedSets, setSavedSets] = useState<SavedTileSet[]>(initialSavedSets)
  const [saveLoadOpen, setSaveLoadOpen] = useState<boolean>(false)

  const [editedTileIndex, setEditedTileIndex] = useState<number>()
  const [editedTile, setEditedTile] = useState<Cell | ExtendedCell>()
  const [editModalOpen, setEditModalOpen] = useState<boolean>(false)

  const [errors, setErrors] = useState<GraphErrorType[]>([])
  const [errorsOpen, setErrorsOpen] = useState<boolean>(false)
  const [historyLoaded, setHistoryLoaded] = useState<boolean>(false)
  const [selectedError, setSelectedError] = useState<number>()

  const [alternateStartingTile, setAlternateStartingTile] = useState<Cell|ExtendedCell|false>(false)
  const [alternateEndingTile, setAlternateEndingTile] = useState<Cell|ExtendedCell|false>(false)

  const [calculating, setCalculating] = useState<boolean>(false)
  const [runsDone, setRunsDone] = useState(0)
  const [expectedRuns, setExpectedRuns] = useState(1)

  const flags = useRef<{ stop: boolean }>({ stop: false })

  const startingMap: GameMap = useMemo(() => {
    const result = [...map.map(row => [...row])]
    const maxX = map.length - 1
    const maxY = map[0].length - 1

    if (alternateStartingTile) {
      result[0][maxY] = alternateStartingTile
    }

    if (alternateEndingTile) {
      result[maxX][0] = alternateEndingTile
    }
    return result
  }, [map, alternateStartingTile, alternateEndingTile])


  const handlePieceFit = useCallback((selectedIndex: number) => {
    if (cellX !== undefined && cellY !== undefined) {
      const [newMap, result] = fitCellAt(currentTiles[selectedIndex], cellX, cellY, startingMap)
      if (result) {
        setMap(newMap)
        setCurrentTiles(currentTiles.filter((_tile, i) => i !== selectedIndex))
        setSelectedPiece(0)
        setCellX(undefined)
        setCellY(undefined)
      }
    }
  }, [cellX, cellY, currentTiles, startingMap])

  const handleRandomPieceFit = useCallback(() => {
    if (cellX !== undefined && cellY !== undefined) {
      const selectedIndex = Math.floor(Math.random() * currentTiles.length)
      const [newMap, result] = fitCellAt(currentTiles[selectedIndex], cellX, cellY, startingMap)
      if (result) {
        setMap(newMap)
        setCurrentTiles(currentTiles.filter((_tile, i) => i !== selectedIndex))
        setSelectedPiece(0)
        setCellX(undefined)
        setCellY(undefined)
      }
    }
  }, [cellX, cellY, currentTiles, startingMap])

  const handleResetStartTile = useCallback(() => setAlternateStartingTile(false), [])
  const handleResetEndTile = useCallback(() => setAlternateEndingTile(false), [])

  // const handleMapSetup = () => {
  //   const [openCells] = buildGraph(map, [], [])
  //   if (openCells.length && tiles.length) {
  //     const randomPointId = Math.floor(Math.random() * openCells.length)
  //     const selectedIndex = Math.floor(Math.random() * tiles.length)
  //     const randomPoint = openCells[randomPointId]
  //     let tile = tiles[selectedIndex]
  //     let tryNumber: number = 0
  //     let newOpenCells: PointType[] = []
  //     let result = false
  //     let newMap: GameMap = [[false, false, false],[false, false, false],[false, false, false]]
  //     while ((newOpenCells.length === 0 || !result) && tryNumber < 5) {
  //       let [newMap, result] = fitCellAt(tiles[selectedIndex], randomPoint.x, randomPoint.y, map)
  //       let [newOpenCells] = buildGraph(newMap, [], [])
  //       tryNumber = tryNumber + 1
  //       if (newOpenCells.length === 0) {
  //         tile = rotateRight(tile)
  //       } else if (result) {

  //       }
  //     } 

  //     if (result) {
  //       setMap(newMap)
  //       setTiles(tiles => tiles.filter((_tile, i) => i !== selectedIndex))
  //     }
  //   }
  // }

  type WorkEntry = {
      map: GameMap
      tiles: (Cell| ExtendedCell)[]
      visitedSet: string[]
      openCells: PointType[]
      initialQueue: {
        active: Candidate[]
        passing: Candidate[]
      }
      history: HistoryEntry[]
      tile: number
      pointX: number
      pointY: number
  }

  const calcEveryTiling = useCallback(() => {
    setCalculating(true)
    const workQueue: WorkEntry[] = []

    const usedCombinations = new Set()
    let combinations = 0
    let errors: GraphErrorType[] = []
    let reportedCombinations = 0

    const [openCells] = buildGraph([...startingMap], [SubCellToCoord(startingCoord)], [{
      ...startingCoord,
      direction: 'left',
    }])
    setExpectedRuns(approxRuns[currentTiles.length])
    setHistoryLoaded(false)
    setErrorsOpen(false)
    setSelectedError(undefined)

    currentTiles.forEach((_, tileIndex) => {
      openCells.forEach(({x, y}) => {
        workQueue.unshift({
          map: [...startingMap],
          tiles: [...currentTiles],
          visitedSet: [SubCellToCoord(startingCoord)],
          initialQueue: {
            active: [{
              ...startingCoord,
              subCell: TOP_LEFT,
              direction: 'top',
            }],
            passing: [],
          },
          openCells: openCells.filter(openCell => openCell.x !== x && openCell.y !== y),
          history: [{ map: startingMap, visited: [], openCells, activeQueue:[], passingQueue: [] }],
          tile: tileIndex,
          pointX: x,
          pointY: y,
        })
      })
    })

    const doTheWork = () => {
      while (workQueue.length) {
        combinations = combinations + 1
  
        if (combinations >= (reportedCombinations + 1000)) {
          reportedCombinations = combinations
          if (workQueue.length && !flags.current.stop) {
            setTimeout(doTheWork, 200)
          } else {
            flags.current.stop = false
            setCalculating(false)
          }
          setRunsDone(combinations)
          setErrors(errors)
          return true
        }
  
        const {map, tiles, history, initialQueue, visitedSet, openCells, tile, pointX, pointY} = workQueue.shift() as WorkEntry
        let newMap: GameMap = []
        let newHistory = [...history]
        let result = false
        let newOpenCells: PointType[] = []
        let newVisitedSet: string[] = []
        let newInitialQueue: Candidate[] = []
        let tries = 4
        let newTiles = tiles.filter((_tile, i) => i !== tile)
        let currentTile = tiles[tile]

        let endIsBlocked = true

        while (
          (
            // Крутим тайл пока выход заблокирован
            endIsBlocked
            // Или тайл не подходит,
            || (newTiles.length && (!result || (newOpenCells.length + initialQueue.passing.length === 0)))
            // или выход заблокирован
            || (!newTiles.length && !newVisitedSet.includes(SubCellToCoord(endingCoord)))
          )
          && tries > 0) {
          if (tries < 4) {
            currentTile = rotateRight(currentTile)
          }
          [newMap, result] = fitCellAt(currentTile, pointX, pointY, map)
          const graphResult = buildGraph(newMap, visitedSet, initialQueue.active)
          newOpenCells = mergeArrays(graphResult[0], openCells)
          newInitialQueue = graphResult[1]
          newVisitedSet = graphResult[2]

          // console.log(`EndingCoord: ${JSON.stringify(endingCoord, null, 2)}`)
          // Проверим не заблокирован ли выход
          if (
            result
            && !newVisitedSet.includes(SubCellToCoord(endingCoord))
          ) {
            const [openEndCells] = buildGraph(newMap, [SubCellToCoord(endingCoord)], [{
              ...endingCoord,
              direction: 'left'
            }])

            endIsBlocked = (openEndCells.length === 0)
          } else {
            endIsBlocked = false
          }

          tries--
          newHistory.push({ map: [...newMap], openCells: newOpenCells, visited: newVisitedSet, passingQueue: initialQueue.passing })
        }
  
        if (!usedCombinations.has(getMapHash(newMap))) {
          // Ошибочным размещение считается в трёх случаях
          if (tries === 0 &&
            (
              // Конечный тайл заблокирован
              endIsBlocked ||
              // Либо у нас ещё остались тайлы для размещения, но размещать некуда (нет новых открытых тайлов и нет проходящих открытых workEntries)
              (newTiles.length && (!result || (newOpenCells.length + initialQueue.passing.length === 0))) ||
              // Либо тайлов у нас не осталось, но мы не можем достигнуть выхода
              (!newTiles.length && !(newVisitedSet.includes(SubCellToCoord(endingCoord))))
            )
          ) {
            let reason: ErrorReasonType = GENERIC_ERROR
            if (endIsBlocked) {
              reason = END_BLOCKED
            } else if (!newTiles.length && !(newVisitedSet.includes(SubCellToCoord(endingCoord)))) {
              reason = END_UNREACHABLE
            } else if (!result) {
              reason = CANNOT_FIT
            } else if (newOpenCells.length + initialQueue.passing.length === 0) {
              reason = UNUSED_TILES
            }

            errors.push({ map, history: newHistory, tile, pointX, pointY, reason })
          } else if (newTiles.length) {
            // Объединяем очереди (будут по разному разделены для разных тайлов)
            const newTotalQueue = [...newInitialQueue, ...initialQueue.passing]

            type ExpandedCandidate = Candidate & {
              targetCell: PointType
            }
            // Сразу вычисляем целевые координаты для каждой записи в очереди
            const expandedQueue: ExpandedCandidate[] = newTotalQueue.map(queueItem => ({
              ...queueItem,
              targetCell: getTargetCoords(queueItem.direction, queueItem.cellX, queueItem.cellY)
            }))
            // Для каждого нового тайла попробовать его размещение в каждой из новых открытых клеток
            for (let newTileIndex = 0; newTileIndex < newTiles.length; newTileIndex++) {
            // newTiles.forEach((_, newTileIndex) => {
              for (let cellId = 0; cellId < newOpenCells.length; cellId++) {
                
              // newOpenCells.forEach(({ x, y }, cellId) => {
                const { x, y } = newOpenCells[cellId]
                const active: Candidate[] = []
                const passing: Candidate[] = []

                // Разделяем общую очередь на активную и проходящую для этого сочетания тайлов
                expandedQueue.forEach((entry) => {
                  const { targetCell } = entry
                  
                  if (targetCell.x === x && targetCell.y === y) {
                    active.push(entry)
                  } else {
                    passing.push(entry)
                  }
                })

                workQueue.unshift({
                  map: newMap,
                  tiles: newTiles,
                  history: newHistory,
                  initialQueue: {
                    active,
                    passing,
                  },
                  openCells: newOpenCells.filter((_cell, id) => id !== cellId),
                  visitedSet: newVisitedSet,
                  tile: newTileIndex,
                  pointX: x,
                  pointY: y,
                })
              }
            }
          }

          usedCombinations.add(getMapHash(newMap))
        }
      }
  
      setRunsDone(combinations)
      setCalculating(false)
      setExpectedRuns(0)
      setErrors(errors)
    }
    doTheWork()
  }, [currentTiles, startingMap, endingCoord, startingCoord])

  const handleEditTile = useCallback((tileIndex: number) => {
    setEditedTile(currentTiles[tileIndex])
    setEditedTileIndex(tileIndex)
    setEditModalOpen(true)
  }, [currentTiles])

  const handleEditStartTile = useCallback(() => {
    setEditedTile(alternateStartingTile || startingTile)
    setEditedTileIndex(START_TILE_INDEX)
    setEditModalOpen(true)
  }, [alternateStartingTile])

  const handleEditEndTile = useCallback(() => {
    setEditedTile(alternateEndingTile || endingTile)
    setEditedTileIndex(END_TILE_INDEX)
    setEditModalOpen(true)
  }, [alternateEndingTile])

  const handleMapSetup = useCallback((newWidth: number, newHeight: number, startingTilePos: Point, endingTilePos: Point) => {
    const newMap = createInitialMap(newWidth, newHeight, startingTile, startingTilePos, endingTile, endingTilePos)

    setTestMap(newMap)
    setMap(newMap)
    setPoiEditorOpen(false)
    setStartingCoord({
      cellX: startingTilePos.x,
      cellY: startingTilePos.y,
      subCell: BOTTOM_LEFT,
    })
    console.log(`Starting coords: ${startingTilePos.x}:${startingTilePos.y}`)
    setEndingCoord({
      cellX: endingTilePos.x,
      cellY: endingTilePos.y,
      subCell: TOP_RIGHT,
    })
    const neededTiles = newWidth * newHeight - 2
    console.log(`Number of current tiles: ${tiles.length}`)
    console.log(`Number of current edited tiles: ${currentTiles.length}`)
    console.log(`Number of tiles needed for the map: ${neededTiles}`)
    if (neededTiles < tiles.length) {
      setTiles(tiles.slice(0, neededTiles))
      setCurrentTiles(currentTiles.slice(0, neededTiles))
    } else if (neededTiles > tiles.length) {
      const missingTilesNumber = neededTiles - tiles.length
      const missingTiles = new Array(missingTilesNumber).fill([{ l: EMPTY, c: EMPTY, r: EMPTY, }, { l: EMPTY, c: EMPTY, r: EMPTY }, { l: EMPTY, c: EMPTY, r: EMPTY }, { l: EMPTY, c: EMPTY, r: EMPTY }])
      const missingCurrentTiles = new Array(missingTilesNumber).fill([{ l: EMPTY, c: EMPTY, r: EMPTY, }, { l: EMPTY, c: EMPTY, r: EMPTY }, { l: EMPTY, c: EMPTY, r: EMPTY }, { l: EMPTY, c: EMPTY, r: EMPTY }])
      setTiles([...tiles, ...missingTiles])
      setCurrentTiles([...tiles, ...missingCurrentTiles])
    }
  }, [tiles, currentTiles])

  const handlePoiCancel = useCallback(() => setPoiEditorOpen(false), [])

  const handleSave = useCallback(() => {
    if (editedTile) {
      if (editedTileIndex === START_TILE_INDEX) {
        setAlternateStartingTile(editedTile)
      } else if (editedTileIndex === END_TILE_INDEX) {
        setAlternateEndingTile(editedTile)
      } else {
        setCurrentTiles(currentTiles.map((tile, i) => i === editedTileIndex ? editedTile : tile))
        setTiles(tiles.map((tile, i) => i === editedTileIndex ? editedTile : tile))
      }
    }
    setEditModalOpen(false)
  }, [editedTile, editedTileIndex, currentTiles, tiles])

  const handleReset = useCallback(() => {
    setCurrentTiles([...tiles])
    setMap([...testMap])
    setHistoryLoaded(false)
    setErrorsOpen(false)
  }, [tiles, testMap])

  const handleCellReset = useCallback(() => {
    setTiles([...initialTiles])
    handleReset()
    setCurrentTiles([...initialTiles])
  }, [handleReset])

  const loadHistoryIntoPlayer = useCallback((index: number) => {
    setHistoryLoaded(true)
    setSelectedError(index)
    // @ts-ignore
    window.selectedError = errors[index]
  }, [errors])

  const handleOpenSaveLoadModal = useCallback(() => setSaveLoadOpen(true), [])

  const handleSaveSet = useCallback((newSavedSet, index) => {
    const newSavedSets = [...savedSets]
    newSavedSets[index] = newSavedSet
    setSavedSets(newSavedSets)
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newSavedSets));
  }, [savedSets])

  const handleLoadSet = useCallback((index) => {
    if (index in savedSets) {
      const loadedSet = savedSets[index]
      setTiles([...loadedSet.tiles])
      handleReset()
      setCurrentTiles([...loadedSet.tiles])

      setAlternateStartingTile(loadedSet.startingTile)
      setAlternateEndingTile(loadedSet.endingTile)
    }
    setSaveLoadOpen(false)
  }, [savedSets, handleReset])

  return (
    <div className="App">
      <Typography id="modal-modal-title" variant="h3" component="h2">
      Resident Map
    </Typography>
      <Container sx={{
        display: 'flex',
        justifyContent: 'space-around',
        marginBottom: 2,
      }}>
        <Paper style={{ width: 'fit-content' }}>
          {
          historyLoaded && selectedError !== undefined && selectedError in errors
            ? <HistoryPlayer onClose={() => setHistoryLoaded(false)} history={errors[selectedError].history} />
            : <FullMap map={startingMap} selectedCell={(cellX !== undefined && cellY !== undefined) ? { x: cellX, y: cellY } : null} onCellSelect={(x, y) => {
              setCellX(x)
              setCellY(y)
            }} />
          }
        </Paper>
      </Container>
      <Container sx={{
        display: 'flex',
        justifyContent: 'space-between',
        maxWidth: 1100,
        marginBottom: 2,
      }}>
        <ButtonGroup variant="contained">
          <Button variant="contained" disabled={cellX === undefined || cellY === undefined} onClick={() => handlePieceFit(selectedPiece)}>Вставить выбранный тайл</Button>
          <Button variant="contained" disabled={cellX === undefined || cellY === undefined} onClick={handleRandomPieceFit}>Вставить случайный тайл</Button>
        </ButtonGroup>
        {calculating ? <Button variant="contained" onClick={() => { flags.current.stop = true }}>Остановить</Button> : <Button variant="contained" onClick={calcEveryTiling}>Проверить все варианты</Button>}
        <Button variant="contained" onClick={handleReset}>Сброс</Button>
        <Button variant="contained" onClick={handleCellReset}>Сброс тайлов</Button>
      </Container>
      <Container sx={{
        display: 'flex',
        justifyContent: 'space-between',
        maxWidth: 1100,
        marginBottom: 2,
      }}>
        <Button variant="contained" onClick={handleEditStartTile}>Редактировать начальный тайл</Button>
        <Button variant="contained" onClick={handleEditEndTile}>Редактировать конечный тайл</Button>
        <Button disabled={alternateStartingTile === false} variant="contained" onClick={handleResetStartTile}>Вернуть начальный тайл</Button>
        <Button disabled={alternateEndingTile === false} variant="contained" onClick={handleResetEndTile}>Вернуть конечный тайл</Button>
      </Container>
      <Container sx={{
        display: 'flex',
        justifyContent: 'space-between',
        maxWidth: 1100,
        marginBottom: 2,
      }}>
        <Button variant="contained" onClick={handleOpenSaveLoadModal}>Сохранить/Загрузить наборы тайлов</Button>
        <Button variant="contained" disabled={calculating} onClick={() => setPoiEditorOpen(true)}>Настройка карты</Button>
      </Container>
      {runsDone > 0 ? <div style={{ marginBottom: 50 }}>
        {expectedRuns > 0 && <LinearProgress value={100 * (runsDone / expectedRuns)}/>}
        <div><h4>Комбинаций проверено:</h4> {runsDone}</div>
      {!errorsOpen && <div><h4>Из них ошибочных:</h4> {errors.length} {errors.length ? <Button variant="contained" onClick={() => setErrorsOpen(true)}>Раскрыть</Button> : null}</div>}
        {errorsOpen && <div style={{ display: 'flex', justifyContent: 'space-around' }}>
          <div style={{ display: 'flex', flexDirection: 'column', width: 600, justifyContent: 'space-around' }}>
            <div><Button variant="contained" onClick={() => setErrorsOpen(false)}>Свернуть</Button></div>
            <div><ErrorList errors={errors} onAction={loadHistoryIntoPlayer} selected={selectedError} /></div>
          </div>
        </div>}
      </div> : null}
      <div style={{ width: '90%', display: 'flex', flexDirection: 'row', maxWidth: '100%', overflowX: 'scroll', justifyContent: 'space-between', marginBottom: 50 }}>
        {currentTiles.map((tile, i) => <Paper key={i} sx={{ backgroundColor: selectedPiece === i ? '#98E98D' : '#ccc' }}><div
          style={{ padding: 5 }}
          onClick={() => setSelectedPiece(i)}
        >
            {tile.length === 4 ? <MapCell cell={tile} x={0} y={0} /> : <MapExtendedCell cell={tile} />}
            {currentTiles.length === tiles.length ? <EditIcon sx={{ color: '#5F6C86', cursor: 'pointer' }} onClick={() => handleEditTile(i)}/> : null}
          </div>
        </Paper>)}
      </div>
      <TileEditModal
        open={editModalOpen}
        onClose={() => setEditModalOpen(false)} 
        onSave={handleSave} 
        tile={editedTile || tiles[selectedPiece]}
        onChange={(tile) => setEditedTile(tile)}
      />
      <SaveLoadModal
        savedSets={savedSets}
        open={saveLoadOpen}
        onClose={() => setSaveLoadOpen(false)}
        onLoad={handleLoadSet}
        onSave={handleSaveSet}
        currentSet={{
          tiles,
          startingTile: alternateStartingTile || startingTile,
          endingTile: alternateEndingTile || endingTile,
        }}
      />
      <PointOfInterestEditor
        open={poiEditorOpen}
        onClose={handlePoiCancel}
        mapWidth={maxX}
        mapHeight={maxY}
        onSave={handleMapSetup}
        start={{ x: 0, y: maxY - 1, subCell: BOTTOM_LEFT }}
        end={{ x: maxX - 1, y: 0, subCell: TOP_RIGHT }}
      />
    </div>
  );
}

export default App;
