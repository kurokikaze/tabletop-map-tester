import { Box } from '@mui/material'
import { Point } from '../types'

type ShapePreviewProps = {
  width: number
  height: number
  startingPoint: Point
  endingPoint: Point
}

export default function ShapePreview({ width, height, startingPoint, endingPoint }: ShapePreviewProps) {
  const isStart = (x: number, y: number): boolean => x === startingPoint.x && y === startingPoint.y
  const isEnd = (x: number, y: number): boolean => x === endingPoint.x && y === endingPoint.y
  
  const getColor = (x: number, y: number): string => {
    if (isStart(x, y)) {
      return '#ffff00'
    }
    if (isEnd(x, y)) {
      return '#00ccff'
    }
    return '#5f6c86'
  }

  return (<Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', width: width * 10 + (width - 1) * 2 }}>
  {Array(height).fill(false).map((_, y) =>
    <Box key={`row${y}`} sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', height: 10, width: width * 10 + (width - 1) * 2, marginBottom: '2px' }}>
      {Array(width).fill(false).map((_, x) =>
        <Box key={`cell${x}:${y}`} sx={{ width: 10, height: 10, bgcolor: getColor(x, y) }}>&nbsp;</Box>
      )}
    </Box>)}
  </Box>)
}