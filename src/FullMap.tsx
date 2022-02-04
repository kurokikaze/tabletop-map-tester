import MapCell from './MapCell'
import { GameMap } from './types'

import './fullMap.css'
import MapExtendedCell from './MapExtendedCell'

type FullMapProps = {
    map: GameMap
    onCellSelect?: (x: number, y: number) => void
    selectedCell: null | { x :number, y: number }
}

export default function FullMap({ map, onCellSelect, selectedCell }: FullMapProps) {
    return (<div className="fullMap">
        {map.map((column, x) =>
            <div className="mapRow" key={x}>{column.map((cell, y) => (cell !== false
                ? (cell.length === 4 ?
                    <MapCell key={`${x}:${y}`} cell={cell} x={x} y={y}/> : <MapExtendedCell key={`${x}:${y}`} cell={cell} />)
            : <div key={`${x}:${y}`} style={{ width: 200, height: 200, backgroundColor: (selectedCell && selectedCell.x === x && selectedCell.y === y)? '#98E98D': '#fff' }} onClick={() => onCellSelect && onCellSelect(x, y)}>&nbsp;</div>))
            }</div>,
        )}
    </div>)
}
