import Paper from '@mui/material/Paper'
import Modal from '@mui/material/Modal'
import Button from '@mui/material/Button'
import Switch from '@mui/material/Switch'
import FormControlLabel from '@mui/material/FormControlLabel'
import Box from '@mui/material/Box'
import CellEditor from '../CellEditor/CellEditor'
import ExtendedCellEditor from '../ExtendedCellEditor/ExtendedCellEditor'
import { Cell, WALL, ExtendedCell, MiddleRoom } from '../types'

type TileEditModalProps = {
    tile: Cell | ExtendedCell
    open: boolean
    onSave: () => void
    onClose: () => void
    onChange: (cell: Cell | ExtendedCell) => void
}

const DEFAULT_MIDDLE_ROOM: MiddleRoom = { tl: WALL, tr: WALL, bl: WALL, br: WALL }

export default function TileEditModal({ tile, open, onChange, onSave, onClose }: TileEditModalProps) {
  const handleChangeType = () => onChange(tile.length === 4 ? [tile[0], tile[1], tile[2], tile[3], DEFAULT_MIDDLE_ROOM] : [tile[0], tile[1], tile[2], tile[3]])

  return (<Modal sx={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-around' }} open={open} onClose={onClose} onBackdropClick={onClose}>
    <Paper sx={{ width: 600, height: 600, alignSelf: 'center', backgroundColor: '#488DAC', display: 'flex', flexDirection: 'column', justifyContent: 'space-around' }}>
      <pre>{tile.length}</pre>
      <Box height={400} sx={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center' }}>
        {tile.length === 4 ? <CellEditor cell={tile} x={0} y={0} onChange={onChange} /> : <ExtendedCellEditor cell={tile} x={0} y={0} onChange={onChange} />}
      </Box>
      <Box height={100} sx={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center' }}>
        <FormControlLabel control={<Switch value={tile.length === 5} onChange={handleChangeType} />} label="Расширенный тайл" />
        <Button variant="contained" onClick={onSave}>Сохранить</Button>
        <Button variant="contained" onClick={onClose}>Отмена</Button>
      </Box>
    </Paper>
  </Modal>)
}
