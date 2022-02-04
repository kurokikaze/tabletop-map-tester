import { useState, useCallback, useMemo } from 'react'
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
import { Candidate, Cell, Direction, GameMap, GraphErrorType, HistoryEntry, PointType, TOP_LEFT, END_BLOCKED, END_UNREACHABLE, CANNOT_FIT, ErrorReasonType, GENERIC_ERROR, UNUSED_TILES, ExtendedCell, SavedTileSet } from './types';
import SaveLoadModal from './SaveLoadModal/SaveLoadModal'

const LOCAL_STORAGE_KEY = 'savedSets'

const testMap: GameMap = [
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
    endingTile,
    false,
    false,
  ]
]

const approxRuns: Record<number, number> = {
  7: 255259,
  6: 37784,
  5: 4329,
  4: 489,
  3: 63,
  2: 8,
  1: 1,
}

// Магические константы - зло
const START_TILE_INDEX = -1
const END_TILE_INDEX = -2

const getTargetCoords = (direction: Direction, x: number, y: number): PointType => {
  switch (direction) {
    case 'top': {
      return { x, y: y - 1 }
    }
    case 'left': {
      return { x: x - 1, y }
    }
    case 'bottom': {
      return { x, y: y + 1 }
    }
    case 'right': {
      return { x: x + 1, y }
    }
  }
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

function App() {
  const [cellX, setCellX] = useState<number>()
  const [cellY, setCellY] = useState<number>()
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

  const [runsDone, setRunsDone] = useState(0)
  const [expectedRuns, setExpectedRuns] = useState(1)

  const startingMap: GameMap = useMemo(() => {
    const result = [...map.map(row => [...row])]

    if (alternateStartingTile) {
      result[0][2] = alternateStartingTile
    }

    if (alternateEndingTile) {
      result[2][0] = alternateEndingTile
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
    const workQueue: WorkEntry[] = []

    const usedCombinations = new Set()
    let combinations = 0
    let errors: GraphErrorType[] = []
    let reportedCombinations = 0

    const [openCells] = buildGraph([...startingMap], [], [])
    setExpectedRuns(approxRuns[currentTiles.length])
    setHistoryLoaded(false)
    setErrorsOpen(false)
    setSelectedError(undefined)

    currentTiles.forEach((_, tileIndex) => {
      openCells.forEach(({x, y}) => {
        workQueue.unshift({
          map: [...startingMap],
          tiles: [...currentTiles],
          visitedSet: [],
          initialQueue: {
            active: [],
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
          // console.log(`Проверено ${combinations} комбинаций, найдено ${errors.length} ошибочных, очередь: ${workQueue.length}`)
          reportedCombinations = combinations
          if (workQueue.length) {
            setTimeout(doTheWork, 200)
          }
          setRunsDone(combinations)
          setErrors(errors)
          return true
        }
  
        const {map, tiles, history, initialQueue, visitedSet, openCells, tile, pointX, pointY} = workQueue.pop() as WorkEntry
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
            endIsBlocked
            || (newTiles.length && (!result || (newOpenCells.length + initialQueue.passing.length === 0)))
            || (!newTiles.length && !newVisitedSet.includes('2:0:top_right'))
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

          // Проверим не заблокирован ли выход
          if (
            ( result &&
              (newMap[1][0] && newMap[2][1])
            )
            && !newVisitedSet.includes('2:0:top_right')
          ) {
            const [openEndCells] = buildGraph(newMap, ['2:0:top_right'], [{
              cellX: 2,
              cellY: 0,
              subCell: TOP_LEFT,
              direction: 'left'
            }])

            endIsBlocked = (openEndCells.length === 0)
          } else {
            endIsBlocked = false
          }

          tries--
          newHistory.push({ map: [...newMap], visited: [...newVisitedSet], openCells: newOpenCells, activeQueue: initialQueue.active, passingQueue: initialQueue.passing })
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
              (!newTiles.length && !(newVisitedSet.includes('2:0:top_right')))
            )
          ) {
            let reason: ErrorReasonType = GENERIC_ERROR
            if (endIsBlocked) {
              reason = END_BLOCKED
            } else if (!newTiles.length && !(newVisitedSet.includes('2:0:top_right'))) {
              reason = END_UNREACHABLE
            } else if (!result) {
              reason = CANNOT_FIT
            } else if (newOpenCells.length + initialQueue.passing.length === 0) {
              reason = UNUSED_TILES
            }

            errors.push({ map, history: newHistory, tile, pointX, pointY, reason })
          } else if (newTiles.length) {
            const newTotalQueue = [...newInitialQueue, ...initialQueue.passing]
            newTiles.forEach((_, newTileIndex) => {
              newOpenCells.forEach(({ x, y }, cellId) => {
                const active: Candidate[] = []
                const passing: Candidate[] = []

                newTotalQueue.forEach((entry) => {
                  const { cellX, cellY, direction } = entry
                  const targetCell = getTargetCoords(direction, cellX, cellY)
                  
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
              })
            })
          }

          usedCombinations.add(getMapHash(newMap))
        }
      }
  
      setRunsDone(combinations)
      setExpectedRuns(0)
      setErrors(errors)
    }
    doTheWork()
  }, [currentTiles, startingMap])

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
  }, [tiles])

  const handleCellReset = useCallback(() => {
    setTiles([...initialTiles])
    handleReset()
    setCurrentTiles([...initialTiles])
  }, [handleReset])

  const loadHistoryIntoPlayer = useCallback((index: number) => {
    setHistoryLoaded(true)
    setSelectedError(index)
  }, [])

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
        <Paper style={{ width: 600 }}>
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
        {/* <Button variant="contained" onClick={handleMapSetup}>Начать процесс</Button> */}
        <Button variant="contained" onClick={calcEveryTiling}>Проверить все варианты</Button>
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
      </Container>
      {runsDone > 0 ? <div style={{ marginBottom: 50 }}>
        {expectedRuns > 0 && <LinearProgress value={100 * (runsDone / expectedRuns)}/>}
        <div><h4>Комбинаций проверено:</h4> {runsDone}</div>
      {!errorsOpen && <div><h4>Из них ошибочных:</h4> {errors.length} {errors.length ? <Button variant="contained" onClick={() => setErrorsOpen(true)}>Раскрыть</Button> : null}</div>}
        {errorsOpen && <div style={{ display: 'flex', justifyContent: 'space-around' }}>
          <ErrorList errors={errors} onAction={loadHistoryIntoPlayer} selected={selectedError} />
        </div>}
      </div> : null}
      <div style={{ width: '90%', display: 'flex', flexDirection: 'row', maxWidth: '100%', overflowX: 'scroll', justifyContent: 'space-between', marginBottom: 50 }}>
        {currentTiles.map((tile, i) => <Paper key={i} sx={{ backgroundColor: selectedPiece === i ? '#98E98D' : '#ccc' }}><div
          style={{ padding: 5 }}
          onClick={() => setSelectedPiece(i)}
        >
            {tile.length === 4 ? <MapCell cell={tile} x={0} y={0} /> : <MapExtendedCell cell={tile} />}
            {currentTiles.length === 7 ? <EditIcon sx={{ color: '#5F6C86', cursor: 'pointer' }} onClick={() => handleEditTile(i)}/> : null}
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
    </div>
  );
}

export default App;
