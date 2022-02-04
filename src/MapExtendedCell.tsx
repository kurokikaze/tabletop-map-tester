import { Edge, WALL, DOOR, DOORWAY, EMPTY, ExtendedCell } from './types'
import './mapExtendedCell.less'

type MapCellProps = {
    cell: ExtendedCell
}

const edgeTypeToClass:Record<Edge, string> = {
    [WALL]: 'wall',
    [DOOR]: 'door',
    [DOORWAY]: 'doorway',
    [EMPTY]: 'empty',
}

export default function MapExtendedCell({ cell }: MapCellProps) {
    return (
        <div className="extendedCell">
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

            <div className={`middle-top-left-edge ${edgeTypeToClass[cell[4].tl]}`}></div>
            <div className={`middle-top-right-edge ${edgeTypeToClass[cell[4].tr]}`}></div>
            <div className={`middle-bottom-left-edge ${edgeTypeToClass[cell[4].bl]}`}></div>
            <div className={`middle-bottom-right-edge ${edgeTypeToClass[cell[4].br]}`}></div>
        </div>
    )
}