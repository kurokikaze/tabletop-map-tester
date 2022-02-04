import Box from '@mui/material/Box'
import MapCell from '../MapCell'
import MapExtendedCell from '../MapExtendedCell'
import { Cell, ExtendedCell, SavedTileSet } from '../types'

import './styles.less'

function UniversalPreview({ cell }: { cell: Cell | ExtendedCell}) {
    return cell.length === 4 ? <MapCell cell={cell} x={0} y={0} /> : <MapExtendedCell cell={cell} />
}

type TilesPreviewProps = {
    tileset: SavedTileSet
}

export default function TilesPreview({ tileset }: TilesPreviewProps) {
  return(<Box className="smallPreview">
    <UniversalPreview cell={tileset.startingTile} />
    <>
      {tileset.tiles.map((tile, index) => <UniversalPreview cell={tile} key={index} />)}
    </>
    <UniversalPreview cell={tileset.endingTile} />
  </Box>)
}
