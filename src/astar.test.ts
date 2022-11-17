import { buildGraph, nodeAdjancedTo } from './astar'
import { startingTile, endingTile, tiles } from './tiles'
import { GameMap, TOP_LEFT } from './types'

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

describe('buildGraph', () => {
  it('graph of 2x3', () => {
    const map: GameMap = [
        [
            [
                {
                    "l": "edges/empty",
                    "c": "edges/empty",
                    "r": "edges/empty"
                },
                {
                    "l": "edges/empty",
                    "c": "edges/empty",
                    "r": "edges/empty"
                },
                {
                    "l": "edges/wall",
                    "c": "edges/wall",
                    "r": "edges/empty"
                },
                {
                    "l": "edges/empty",
                    "c": "edges/empty",
                    "r": "edges/wall"
                }
            ],
            [
                {
                    "l": "edges/empty",
                    "c": "edges/empty",
                    "r": "edges/empty"
                },
                {
                    "l": "edges/empty",
                    "c": "edges/door",
                    "r": "edges/wall"
                },
                {
                    "l": "edges/wall",
                    "c": "edges/wall",
                    "r": "edges/wall"
                },
                {
                    "l": "edges/wall",
                    "c": "edges/empty",
                    "r": "edges/wall"
                }
            ]
        ],
        [
            [
                {
                    "l": "edges/wall",
                    "c": "edges/wall",
                    "r": "edges/empty"
                },
                {
                    "l": "edges/empty",
                    "c": "edges/door",
                    "r": "edges/door"
                },
                {
                    "l": "edges/wall",
                    "c": "edges/door",
                    "r": "edges/empty"
                },
                {
                    "l": "edges/empty",
                    "c": "edges/door",
                    "r": "edges/wall"
                }
            ],
            [
                {
                    "l": "edges/door",
                    "c": "edges/wall",
                    "r": "edges/empty"
                },
                {
                    "l": "edges/wall",
                    "c": "edges/door",
                    "r": "edges/empty"
                },
                {
                    "l": "edges/empty",
                    "c": "edges/doorway",
                    "r": "edges/empty"
                },
                {
                    "l": "edges/empty",
                    "c": "edges/doorway",
                    "r": "edges/wall"
                }
            ]
        ],
        [
            [
                {
                    "l": "edges/wall",
                    "c": "edges/door",
                    "r": "edges/wall"
                },
                {
                    "l": "edges/door",
                    "c": "edges/wall",
                    "r": "edges/wall"
                },
                {
                    "l": "edges/wall",
                    "c": "edges/door",
                    "r": "edges/empty"
                },
                {
                    "l": "edges/empty",
                    "c": "edges/door",
                    "r": "edges/wall"
                }
            ],
            [
                {
                    "l": "edges/wall",
                    "c": "edges/door",
                    "r": "edges/empty"
                },
                {
                    "l": "edges/empty",
                    "c": "edges/empty",
                    "r": "edges/empty"
                },
                {
                    "l": "edges/empty",
                    "c": "edges/wall",
                    "r": "edges/wall"
                },
                {
                    "l": "edges/door",
                    "c": "edges/door",
                    "r": "edges/wall"
                }
            ]
        ]
    ]
    const visitedSet: string[] = [
      "0:1:bottom_left",
      "0:1:top_left",
      "0:1:top_right",
      "0:1:bottom_right",
      "0:0:bottom_left",
      "0:0:top_left",
      "0:0:top_right",
      "0:0:bottom_right",
      "1:0:bottom_left",
      "1:0:top_left",
      "1:1:top_left",
      "1:0:bottom_right",
      "1:1:bottom_left",
      "1:0:top_right",
      "2:0:bottom_left",
      "1:1:bottom_right",
      "2:0:top_left",
      "2:0:bottom_right",
      "1:1:top_right",
      "2:0:top_right",
      "2:1:bottom_left",
      "2:1:top_left",
      "2:1:top_right",
      "2:1:bottom_right"
    ]

    console.dir(buildGraph(map, [`0:3:top_right`], [{
      cellX: 2,
      cellY: 0,
      subCell: TOP_LEFT,
      direction: 'left'
    }]))
  })
})