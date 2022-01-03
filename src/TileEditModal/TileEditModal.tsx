import Paper from '@mui/material/Paper'
import Modal from '@mui/material/Modal'
import Button from '@mui/material/Button'
import Box from '@mui/material/Box'
import CellEditor from '../CellEditor/CellEditor'
import { Cell } from '../types'

type TileEditModalProps = {
    tile: Cell
    open: boolean
    onSave: () => void
    onClose: () => void
    onChange: (cell: Cell) => void
}

export default function TileEditModal({ tile, open, onChange, onSave, onClose }: TileEditModalProps) {
  return (<Modal sx={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-around' }} open={open} onClose={onClose} onBackdropClick={onClose}>
    <Paper sx={{ width: 600, height: 600, alignSelf: 'center', backgroundColor: '#488DAC', display: 'flex', flexDirection: 'column', justifyContent: 'space-around' }}>
      <Box height={400} sx={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center' }}>
        <CellEditor cell={tile} x={0} y={0} onChange={onChange} />
      </Box>
      <Box height={100} sx={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center' }}>
        <Button variant="contained" onClick={onSave}>Сохранить</Button>
        <Button variant="contained" onClick={onClose}>Отмена</Button>
      </Box>
    </Paper>
  </Modal>)
}
