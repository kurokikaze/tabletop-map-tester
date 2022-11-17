import { useCallback, useState, useRef, useMemo, useEffect } from 'react'
import { Box } from '@mui/material'
import { HistoryEntry } from "../types"

import './styles.less'

type VisitMapProps = {
  history: HistoryEntry
}

const coordMap = {
  '0:0': 'top_left',
  '0:1': 'bottom_left',
  '1:0': 'top_right',
  '1:1': 'bottom_right',
}

export default function VisitMap({ history }: VisitMapProps) {
  const mapRef = useRef<HTMLElement>()
  const visitedSetCopy = useMemo<string[]>(() => [...(history.visited || [])], [history])
  let interval = useRef<NodeJS.Timer>()
  const handleAdvanceFrame = useCallback(() => {
    if (visitedSetCopy.length) {
      const id = visitedSetCopy.shift()
      mapRef.current?.querySelector(`[data-cell-id="${id}"]`)?.classList.add('active')
    } else if (interval.current) {
      clearInterval(interval.current)
    }
  }, [visitedSetCopy])

  useEffect(() => {
    if (interval.current) {
      clearInterval(interval.current)
      interval.current = setInterval(handleAdvanceFrame, 900 / (history.visited?.length || 1))
    }
    mapRef.current?.querySelectorAll(`[data-cell-id]`).forEach(element => element.classList.remove('active'))
  }, [history, handleAdvanceFrame])

  interval.current = setInterval(handleAdvanceFrame, 100)

  const width = history.map.length * 2
  const height = history.map[0].length * 2
  const rows: string[][] = []
  for (let y = 0; y < height; y++) {
    rows[y] = []
    for (let x = 0; x < width; x++) {
      const cellX = Math.floor(x/2)
      const cellY = Math.floor(y/2)
      const subCell = coordMap[`${x % 2}:${y % 2}` as keyof typeof coordMap]
      rows[y][x] = history.visited?.includes(`${cellX}:${cellY}:${subCell}`) ? `${cellX}:${cellY}:${subCell}` : ''
    }
  }
  return <Box className="visitMap" ref={mapRef}>
    {rows.map((row, rowId) => <Box className="subrow" key={`row_${rowId}`}>
      {row.map((cell, cellId) => <Box className="subcell" data-cell-id={cell} key={`cell_${rowId}_${cellId}`}>&nbsp;</Box>)}
    </Box>)}
    </Box>
}