import { Box, Input } from "@mui/material"

type PointProps = {
  x: number
  y: number
  maxX: number
  maxY: number
  setCoords: (x: number, y: number) => void
}

export default function Point({ x, y, maxX, maxY, setCoords }: PointProps) {
  return (<Box
    sx={{ width: '100%', height: 60, maxWidth: 650, bgcolor: '#5f6c86', display: 'flex', justifyContent: 'space-around', alignItems: 'center' }}
  >
    <label>X: <Input value={x} type="number" style={{ backgroundColor: '#ccc' }} error={x > maxX || x < 0} onChange={e => setCoords(parseInt(e.target.value, 10) || 0, y)} /></label>
    <label>Y: <Input value={y} type="number" style={{ backgroundColor: '#ccc' }} error={y > maxY || y < 0} onChange={e => setCoords(x, parseInt(e.target.value, 10) || 0)} /></label>
  </Box>)
}
