import {useState} from 'react';
import Box from '@mui/material/Box';
import ListItem from '@mui/material/ListItem';
import Button from '@mui/material/Button';
import ListItemText from '@mui/material/ListItemText';
import { FixedSizeList } from 'react-window';
import { CANNOT_FIT, END_BLOCKED, END_UNREACHABLE, ErrorReasonType, GENERIC_ERROR, GraphErrorType, UNUSED_TILES } from '../types';
import { breadcrumbsClasses, Checkbox } from '@mui/material';

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
  const [errorsToInclude, setErrorsToInclude] = useState<ErrorReasonType[]>([GENERIC_ERROR, CANNOT_FIT, END_BLOCKED, END_UNREACHABLE, UNUSED_TILES]);
  const filteredErrors = errors.filter(e => errorsToInclude.includes(e.reason));
  let numberOfGenericErrors = 0;
  let numberOfCannotFit = 0;
  let numberOfEndBlocked = 0;
  let numberOfEndUnreachable = 0;
  let numberOfTilesUnused = 0;
  for (let {reason} of errors) {
    switch (reason){
      case GENERIC_ERROR: {
        numberOfGenericErrors++;
        break;
      }
      case CANNOT_FIT: {
        numberOfCannotFit++;
        break;
      }
      case END_BLOCKED: {
        numberOfEndBlocked++;
        break;
      }
      case END_UNREACHABLE: {
        numberOfEndUnreachable++;
        break;
      }
      case UNUSED_TILES: {
        numberOfTilesUnused++;
        break;
      }
    }
  } 

  return (
    <Box
      sx={{ width: '100%', height: 800, maxWidth: 600, bgcolor: '#5f6c86' }}
    >
      <Box sx={{ width: '100%', bgcolor: 'rgb(167, 202, 237)', display: 'flex', flexDirection: 'column' }}>
        <label><Checkbox checked={errorsToInclude.includes(GENERIC_ERROR)} onChange={() => setErrorsToInclude(errorsToInclude.includes(GENERIC_ERROR) ? errorsToInclude.filter(e => e !== GENERIC_ERROR) : [...errorsToInclude, GENERIC_ERROR])}/>Общие ошибки ({numberOfGenericErrors})</label>
        <label><Checkbox checked={errorsToInclude.includes(CANNOT_FIT)} onChange={() => setErrorsToInclude(errorsToInclude.includes(CANNOT_FIT) ? errorsToInclude.filter(e => e !== CANNOT_FIT) : [...errorsToInclude, CANNOT_FIT])}/>Не удалось разместить тайл ({numberOfCannotFit})</label>
        <label><Checkbox checked={errorsToInclude.includes(END_BLOCKED)} onChange={() => setErrorsToInclude(errorsToInclude.includes(END_BLOCKED) ? errorsToInclude.filter(e => e !== END_BLOCKED) : [...errorsToInclude, END_BLOCKED])}/>Конечный тайл заблокирован ({numberOfEndBlocked})</label>
        <label><Checkbox checked={errorsToInclude.includes(END_UNREACHABLE)} onChange={() => setErrorsToInclude(errorsToInclude.includes(END_UNREACHABLE) ? errorsToInclude.filter(e => e !== END_UNREACHABLE) : [...errorsToInclude, END_UNREACHABLE])}/>Конечный тайл недоступен ({numberOfEndUnreachable})</label>
        <label><Checkbox checked={errorsToInclude.includes(UNUSED_TILES)} onChange={() => setErrorsToInclude(errorsToInclude.includes(UNUSED_TILES) ? errorsToInclude.filter(e => e !== UNUSED_TILES) : [...errorsToInclude, UNUSED_TILES])}/>Остались неиспользованные тайлы ({numberOfTilesUnused})</label>
      </Box>
      <FixedSizeList
        height={800}
        width={600}
        itemSize={80}
        itemCount={filteredErrors.length}
        overscanCount={5}
      >
        {renderRow(filteredErrors, onAction, selected)}
      </FixedSizeList>
    </Box>
  );
}
