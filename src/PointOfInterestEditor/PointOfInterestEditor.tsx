import { useState } from "react"
import { Modal, Paper, Box, Input, Button, Tooltip } from "@mui/material"
import PointEditor from './Point'
import Warning from './Warning.svg'
import ShapePreview from './ShapePreview'
import { Point } from '../types'

type PointsOfInterestEditorProps = {
  open: boolean
  onClose: () => void
  mapWidth: number
  mapHeight: number
  start: Point
  end: Point
  intermediate?: Point[]
  onSave?: (width: number, heigth: number, start: Point, end: Point) => void
}

export default function PointOfInterestEditor({ open, onClose, onSave, mapWidth, mapHeight, start, end, intermediate = [] }: PointsOfInterestEditorProps) {
  const [width, setWidth] = useState<number>(mapWidth)
  const [height, setHeight] = useState<number>(mapHeight)

  const [startingPoint, setStartingPoint] = useState<Point>(start)
  const [endingPoint, setEndingPoint] = useState<Point>(end)
  const [points, setPoints] = useState<Point[]>(intermediate)

  const errors = []
  if (startingPoint.x >= width) {
    errors.push(`стартовая координата x должна лежать между 0 и ${width - 1}`)
  }
  if (startingPoint.y >= width) {
    errors.push(`стартовая координата y должна лежать между 0 и ${height - 1}`)
  }
  if (endingPoint.x >= width) {
    errors.push(`конечная координата x должна лежать между 0 и ${width - 1}`)
  }
  if (startingPoint.x >= width) {
    errors.push(`конечная координата y должна лежать между 0 и ${height - 1}`)
  }

  const tooltipText = errors.length ? errors.join(', ') : 'Всё в порядке'
  const submitDisabled = (startingPoint.x >= width) || (startingPoint.y >= height) || (endingPoint.x >= width) || (endingPoint.y >= height)

  return (<Modal sx={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-around' }} open={open} onClose={onClose} onBackdropClick={onClose}>
    <Paper sx={{ width: 500, height: 600, alignSelf: 'center', backgroundColor: '#488DAC', display: 'flex', flexDirection: 'column', justifyContent: 'space-around', marginTop: 40, marginBottom: 40 }}>
      <Box
        sx={{ width: '100%', height: 60, maxWidth: 650, bgcolor: '#5f6c86', display: 'flex', justifyContent: 'space-around', alignItems: 'center' }}
      >
        <label>Ширина<Input value={width} type="number" style={{ backgroundColor: '#ccc', width: 70, marginLeft: 50 }} onChange={e => setWidth(parseInt(e.target.value, 10) || 0)} /></label>
        <label>Высота<Input value={height} type="number" style={{ backgroundColor: '#ccc', width: 70, marginLeft: 50 }} onChange={e => setHeight(parseInt(e.target.value, 10) || 0)} /></label>
      </Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center' }}>
        <ShapePreview width={width} height={height} startingPoint={startingPoint} endingPoint={endingPoint} />
      </Box>
      <Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center' }}>
          Координаты начального тайла
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Box sx={{ bgcolor: '#ffff00', width: 10, height: 10, margin: '25px' }}>&nbsp;</Box><PointEditor x={startingPoint.x} y={startingPoint.y} setCoords={(x, y) => setStartingPoint({ ...startingPoint, x, y })} maxX={width - 1} maxY={height - 1} />
        </Box>      
      </Box>
      <Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center' }}>
          Координаты конечного тайла
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Box sx={{ bgcolor: '#00ccff', width: 10, height: 10, margin: '25px' }}>&nbsp;</Box><PointEditor x={endingPoint.x} y={endingPoint.y} setCoords={(x, y) => setEndingPoint({ ...startingPoint, x, y })} maxX={width - 1} maxY={height - 1} />
        </Box>
      </Box>
      <Box
        sx={{ width: '100%', height: 40, maxWidth: 650, bgcolor: '#5f6c86', display: 'flex', justifyContent: 'space-around' }}
      >
        <Tooltip title={tooltipText}>
          <span>
            <Button
              variant="contained"
              onClick={() => onSave && onSave(width, height, startingPoint, endingPoint)}
              disabled={submitDisabled}
            >
              Сохранить
              {submitDisabled ? <Warning bright /> : null}
            </Button>
          </span>
        </Tooltip>
        <span>
          <Button variant="contained" onClick={onClose}>Отмена</Button>
        </span>      
      </Box>
    </Paper>
  </Modal>)
}
