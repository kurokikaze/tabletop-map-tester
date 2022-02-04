import { useCallback } from 'react'
import { Edge, WALL, DOOR, DOORWAY, EMPTY, ExtendedCell } from '../types'
import './style.less'

const EDGE_TOP = 0
const EDGE_RIGHT = 1
const EDGE_BOTTOM = 2
const EDGE_LEFT = 3
const MIDDLE_ROOM = 4

type MapCellProps = {
    cell: ExtendedCell
    x: number | null
    y: number | null
    onChange: (cell: ExtendedCell) => void
}

const edgeTypeToClass:Record<Edge, string> = {
    [WALL]: 'wall',
    [DOOR]: 'door',
    [DOORWAY]: 'doorway',
    [EMPTY]: 'empty',
}

const rotationOrder = {
    [EMPTY]: WALL,
    [WALL]: DOOR,
    [DOOR]: EMPTY,
    [DOORWAY]: EMPTY,
}

type EdgeType = typeof EDGE_LEFT | typeof EDGE_TOP | typeof EDGE_RIGHT | typeof EDGE_BOTTOM
type LineType = 'l' | 'r' | 'c'
type RoomLineType = 'tl' | 'tr' | 'bl' | 'br'

export default function ExtendedCellEditor({ cell, onChange }: MapCellProps) {
    const handleEdit = useCallback((edge: EdgeType, line: LineType) => onChange(
        // @ts-ignore
        cell.map((value, index) => index === edge ? {
            ...value,
            [line]: rotationOrder[cell[edge][line]],
        } : value),
    ), [cell, onChange])

    const handleEditRoom = useCallback((line: RoomLineType) => onChange(
        // @ts-ignore
        cell.map((value, index) => index === 4 ? {
            ...value,
            [line]: rotationOrder[cell[MIDDLE_ROOM][line]],
        } : value),
    ), [cell, onChange])

    return (
        <div className="extendedCellEditor">
            <div className={`top-left-edge ${edgeTypeToClass[cell[EDGE_TOP].l]}`} onClick={() => handleEdit(EDGE_TOP, 'l')}></div>
            <div className={`top-center-edge ${edgeTypeToClass[cell[EDGE_TOP].c]}`} onClick={() => handleEdit(EDGE_TOP, 'c')}></div>
            <div className={`top-right-edge ${edgeTypeToClass[cell[EDGE_TOP].r]}`} onClick={() => handleEdit(EDGE_TOP, 'r')}></div>

            <div className={`right-left-edge ${edgeTypeToClass[cell[EDGE_RIGHT].l]}`} onClick={() => handleEdit(EDGE_RIGHT, 'l')}></div>
            <div className={`right-center-edge ${edgeTypeToClass[cell[EDGE_RIGHT].c]}`} onClick={() => handleEdit(EDGE_RIGHT, 'c')}></div>
            <div className={`right-right-edge ${edgeTypeToClass[cell[EDGE_RIGHT].r]}`} onClick={() => handleEdit(EDGE_RIGHT, 'r')}></div>

            <div className={`bottom-left-edge ${edgeTypeToClass[cell[EDGE_BOTTOM].l]}`} onClick={() => handleEdit(EDGE_BOTTOM, 'l')}></div>
            <div className={`bottom-center-edge ${edgeTypeToClass[cell[EDGE_BOTTOM].c]}`} onClick={() => handleEdit(EDGE_BOTTOM, 'c')}></div>
            <div className={`bottom-right-edge ${edgeTypeToClass[cell[EDGE_BOTTOM].r]}`} onClick={() => handleEdit(EDGE_BOTTOM, 'r')}></div>

            <div className={`left-left-edge ${edgeTypeToClass[cell[EDGE_LEFT].l]}`} onClick={() => handleEdit(EDGE_LEFT, 'l')}></div>
            <div className={`left-center-edge ${edgeTypeToClass[cell[EDGE_LEFT].c]}`} onClick={() => handleEdit(EDGE_LEFT, 'c')}></div>
            <div className={`left-right-edge ${edgeTypeToClass[cell[EDGE_LEFT].r]}`} onClick={() => handleEdit(EDGE_LEFT, 'r')}></div>

            <div className={`middle-top-left-edge ${edgeTypeToClass[cell[MIDDLE_ROOM].tl]}`} onClick={() => handleEditRoom('tl')}></div>
            <div className={`middle-top-right-edge ${edgeTypeToClass[cell[MIDDLE_ROOM].tr]}`} onClick={() => handleEditRoom('tr')}></div>
            <div className={`middle-bottom-left-edge ${edgeTypeToClass[cell[MIDDLE_ROOM].bl]}`} onClick={() => handleEditRoom('bl')}></div>
            <div className={`middle-bottom-right-edge ${edgeTypeToClass[cell[MIDDLE_ROOM].br]}`} onClick={() => handleEditRoom('br')}></div>
        </div>
    )
}
