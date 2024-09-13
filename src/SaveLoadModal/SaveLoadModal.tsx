import { useState } from 'react'
import Paper from '@mui/material/Paper'
import Modal from '@mui/material/Modal'
import Button from '@mui/material/Button'
import Box from '@mui/material/Box'
import Input from '@mui/material/Input'
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import { FixedSizeList } from 'react-window';
import { Cell, ExtendedCell, SavedTileSet } from '../types'
import TilesPreview from './TilesPreview'

type CurrentTiles = {
  tiles: (Cell|ExtendedCell)[]
  startingTile: Cell|ExtendedCell
  endingTile: Cell|ExtendedCell
}

type SaveLoadModalProps = {
    open: boolean
    savedSets: SavedTileSet[]
    currentSet: CurrentTiles
    onLoad: (index: number) => void
    onSave: (tileset: SavedTileSet, index: number) => void
    onClose: () => void
}

type RenderRowProps = {
  index: number
  style: React.CSSProperties
}

const ROW_HEIGHT = 140

const renderRow  = (sets: SavedTileSet[], onLoad: (i: number) => void, onSave: (i: number) => void) => ({ index, style }: RenderRowProps) => {
  const { name } = sets[index]
  return (
    <ListItem sx={style} key={index} component="div" disablePadding>
      <div style={{ display: 'flex', flexDirection: 'column', height: ROW_HEIGHT }}>
        <ListItemText primary={name} />
        <TilesPreview tileset={sets[index]} />
        <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-around', marginLeft: '50%', marginTop: 5 }}>
          <Button variant="contained" onClick={() => onSave(index)}>Сохранить</Button>
          <Button variant="contained" onClick={() => onLoad(index)}>Загрузить</Button>
        </div>
      </div>
    </ListItem>
  );
}

export default function SaveLoadModal({ savedSets, open, onSave, onLoad, onClose, currentSet }: SaveLoadModalProps) {
  const [newName, setNewName] = useState<string>('Новый набор')

  return (<Modal sx={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-around' }} open={open} onClose={onClose}>
    <Paper sx={{ width: 650, height: 800, alignSelf: 'center', backgroundColor: '#488DAC', display: 'flex', flexDirection: 'column', justifyContent: 'space-around' }}>
      <Box
        sx={{ width: '100%', height: 600, maxWidth: 650, bgcolor: '#5f6c86' }}
      >
        <FixedSizeList
            height={800}
            width={650}
            itemSize={ROW_HEIGHT}
            itemCount={savedSets.length}
            overscanCount={5}
        >
            {renderRow(savedSets, onLoad, (index) => onSave({
              ...savedSets[index],
              ...currentSet,
            }, index))}
        </FixedSizeList>
      </Box>
      <Box sx={{ padding: '0 80px' }}>
        <Input value={newName} style={{ backgroundColor: '#ccc' }} onChange={e => setNewName(e.target.value)} />
        <Button variant="contained" onClick={() => onSave({
          name: newName,
          ...currentSet,
        }, savedSets.length)}>Сохранить новый набор</Button>
      </Box>
      
    </Paper>
  </Modal>)
}
