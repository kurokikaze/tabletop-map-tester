import Box from '@mui/material/Box';
import ListItem from '@mui/material/ListItem';
import Button from '@mui/material/Button';
import ListItemText from '@mui/material/ListItemText';
import { FixedSizeList } from 'react-window';
import { CANNOT_FIT, END_BLOCKED, END_UNREACHABLE, ErrorReasonType, GENERIC_ERROR, GraphErrorType, UNUSED_TILES } from '../types';

type RenderRowProps = {
    index: number
    style: React.CSSProperties
}
const reasonMessages: Record<ErrorReasonType, string> = {
  [GENERIC_ERROR]: 'Ошибка',
  [CANNOT_FIT]: 'Не смог разместить тайл',
  [END_BLOCKED]: 'Конечный тайл заблокирован',
  [END_UNREACHABLE]: 'Конечный тайл недоступен',
  [UNUSED_TILES]: 'Остались тайлы которые невозможно использовать',
}

const renderRow  = (errors: GraphErrorType[], onAction: (i: number) => void, selected: number | undefined) => ({ index, style }: RenderRowProps) => {
  const { history, reason } = errors[index]
  return (
    <ListItem selected={selected !== undefined && selected === index} sx={style} key={index} component="div" disablePadding>
      <ListItemText primary={`${reasonMessages[reason]} на ${history.length} шаге размещения тайла.`} />
      <Button variant="contained" disabled={selected === index} onClick={() => onAction(index)}>Загрузить в плеер</Button>
    </ListItem>
  );
}

type VirtualizedListProps = {
    errors: GraphErrorType[]
    onAction: (i: number) => void
    selected?: number
}

export default function VirtualizedList({ errors, onAction, selected }: VirtualizedListProps) {
  return (
    <Box
      sx={{ width: '100%', height: 800, maxWidth: 600, bgcolor: '#5f6c86' }}
    >
      <FixedSizeList
        height={800}
        width={600}
        itemSize={80}
        itemCount={errors.length}
        overscanCount={5}
      >
        {renderRow(errors, onAction, selected)}
      </FixedSizeList>
    </Box>
  );
}
