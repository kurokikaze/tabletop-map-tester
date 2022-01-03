import { Cell, Edge, WALL, DOOR, DOORWAY, EMPTY } from './types'
import './mapCell.less'

type MapCellProps = {
    cell: Cell;
    x: number | null;
    y: number | null;
}

const edgeTypeToClass:Record<Edge, string> = {
    [WALL]: 'wall',
    [DOOR]: 'door',
    [DOORWAY]: 'doorway',
    [EMPTY]: 'empty',
}

export default function MapCell({ cell, x = null, y = null }: MapCellProps) {
    return (
        <div className="cell">
            <div className={`top-left-edge ${edgeTypeToClass[cell[0].l]}`}></div>
            <div className={`top-center-edge ${edgeTypeToClass[cell[0].c]}`}></div>
            <div className={`top-right-edge ${edgeTypeToClass[cell[0].r]}`}></div>

            <div className={`right-left-edge ${edgeTypeToClass[cell[1].l]}`}></div>
            <div className={`right-center-edge ${edgeTypeToClass[cell[1].c]}`}></div>
            <div className={`right-right-edge ${edgeTypeToClass[cell[1].r]}`}></div>

            <div className={`bottom-left-edge ${edgeTypeToClass[cell[2].l]}`}></div>
            <div className={`bottom-center-edge ${edgeTypeToClass[cell[2].c]}`}></div>
            <div className={`bottom-right-edge ${edgeTypeToClass[cell[2].r]}`}></div>

            <div className={`left-left-edge ${edgeTypeToClass[cell[3].l]}`}></div>
            <div className={`left-center-edge ${edgeTypeToClass[cell[3].c]}`}></div>
            <div className={`left-right-edge ${edgeTypeToClass[cell[3].r]}`}></div>
            {x !== null && y !== null ?
            <>
                <div className="coords coords-ul">{x * 2}:{y * 2}</div>
                <div className="coords coords-ur">{x * 2 + 1}:{y * 2}</div>
                <div className="coords coords-dl">{x * 2}:{y * 2 + 1}</div>
                <div className="coords coords-dr">{x * 2 + 1}:{y * 2 + 1}</div>
            </> : null}
        </div>
    )
}