import { nodeAdjancedTo } from './astar'
import { startingTile, endingTile, tiles } from './tiles'

describe('nodeAdjancedTo', () => {
    it('Same tile', () => {
        const testMap = [
            [
                startingTile,
            ],
        ]
        expect(nodeAdjancedTo(0, 0, 0, 1, testMap)).toEqual(true)
        expect(nodeAdjancedTo(0, 1, 1, 1, testMap)).toEqual(false)
        expect(nodeAdjancedTo(0, 0, 1, 0, testMap)).toEqual(true)
        expect(nodeAdjancedTo(1, 0, 1, 1, testMap)).toEqual(true)
    })

    it('Different tile', () => {
        const testMap = [
            [
              tiles[0],
              startingTile,
            ],
            [
              endingTile,
              tiles[1],
            ]
          ]
        // u
        expect(nodeAdjancedTo(2, 2, 2, 1, testMap)).toEqual(false)
        expect(nodeAdjancedTo(1, 2, 1, 1, testMap)).toEqual(true)

        // r
        expect(nodeAdjancedTo(0, 1, 0, 2, testMap)).toEqual(true)
        expect(nodeAdjancedTo(1, 1, 1, 2, testMap)).toEqual(true)

        // d
        expect(nodeAdjancedTo(3, 1, 3, 2, testMap)).toEqual(false)
        expect(nodeAdjancedTo(0, 1, 0, 2, testMap)).toEqual(true)
    })
})