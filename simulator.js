"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
exports.__esModule = true;
exports.Simulator = exports.addShadowsToMap = exports.setMainMap = exports.coordinatesMap = void 0;
function setCharAt(str, index, chr) {
    if (index > str.length - 1)
        return str;
    return str.substring(0, index) + chr + str.substring(index + 1);
}
function clone(obj) {
    if (obj === null || typeof (obj) !== 'object' || 'isActiveClone' in obj)
        return obj;
    // @ts-ignore
    var temp = obj.constructor();
    for (var key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
            //@ts-ignore
            obj['isActiveClone'] = null;
            //@ts-ignore
            temp[key] = clone(obj[key]);
            //@ts-ignore
            delete obj['isActiveClone'];
        }
    }
    return temp;
}
exports.coordinatesMap = {
    0: { q: 0, r: 0 },
    1: { q: 1, r: 0 },
    2: { q: 1, r: -1 },
    3: { q: 0, r: -1 },
    4: { q: -1, r: 0 },
    5: { q: -1, r: 1 },
    6: { q: 0, r: 1 },
    7: { q: 2, r: 0 },
    8: { q: 2, r: -1 },
    9: { q: 2, r: -2 },
    10: { q: 1, r: -2 },
    11: { q: 0, r: -2 },
    12: { q: -1, r: -1 },
    13: { q: -2, r: 0 },
    14: { q: -2, r: 1 },
    15: { q: -2, r: 2 },
    16: { q: -1, r: 2 },
    17: { q: 0, r: 2 },
    18: { q: 1, r: 1 },
    19: { q: 3, r: 0 },
    20: { q: 3, r: -1 },
    21: { q: 3, r: -2 },
    22: { q: 3, r: -3 },
    23: { q: 2, r: -3 },
    24: { q: 1, r: -3 },
    25: { q: 0, r: -3 },
    26: { q: -1, r: -2 },
    27: { q: -2, r: -1 },
    28: { q: -3, r: 0 },
    29: { q: -3, r: 1 },
    30: { q: -3, r: 2 },
    31: { q: -3, r: 3 },
    32: { q: -2, r: 3 },
    33: { q: -1, r: 3 },
    34: { q: 0, r: 3 },
    35: { q: 1, r: 2 },
    36: { q: 2, r: 1 }
};
function axial_distance(a, b) {
    return (Math.abs(a.q - b.q)
        + Math.abs(a.q + a.r - b.q - b.r)
        + Math.abs(a.r - b.r)) / 2;
}
function axial_add(hex, vec) {
    return { q: hex.q + vec.q, r: hex.r + vec.r };
}
var growthCost = {
    0: 1,
    1: 3,
    2: 7
};
var richnessBonus = {
    0: 0,
    1: 0,
    2: 2,
    3: 4
};
var emptyMap = [];
var mainMap = [];
var _loop_1 = function (q) {
    var _loop_2 = function (r) {
        if (!(q in mainMap)) {
            mainMap[q] = [];
            emptyMap[q] = [];
        }
        //@ts-ignore
        var cell = Object.entries(exports.coordinatesMap).find(function (_a) {
            var _index = _a[0], coords = _a[1];
            return coords.q === q && coords.r === r;
        });
        if (cell) {
            mainMap[q][r] = {
                richness: 1,
                index: parseInt(cell[0], 10)
            };
        }
        else {
            mainMap[q][r] = null;
        }
        emptyMap[q][r] = 0;
    };
    for (var r = -3; r <= 3; r++) {
        _loop_2(r);
    }
};
for (var q = -3; q <= 3; q++) {
    _loop_1(q);
}
var treeStateHash = {
    trees: {}
};
var setMainMap = function (map) {
    mainMap = map;
};
exports.setMainMap = setMainMap;
var sortByRichness = function (sp1, sp2) { return mainMap[sp1.q][sp1.r].richness - mainMap[sp2.q][sp2.r].richness; };
var findByCellIndex = function (target) { return function (_a) {
    var cellIndex = _a.cellIndex;
    return cellIndex === target;
}; };
var setNotDormant = function (tree) { return (__assign(__assign({}, tree), { isDormant: false })); };
var dormantTreeSymbols = {
    0: 'a',
    1: 'b',
    2: 'c',
    3: 'd'
};
var normalTreeSymbols = {
    0: 'A',
    1: 'B',
    2: 'C',
    3: 'D'
};
var shadowLengths = [
    // 0
    [
        { q: 1, r: 0 },
        { q: 2, r: 0 },
        { q: 3, r: 0 },
    ],
    // 1
    [
        { q: 1, r: -1 },
        { q: 2, r: -2 },
        { q: 3, r: -3 },
    ],
    // 2
    [
        { q: 0, r: -1 },
        { q: 0, r: -2 },
        { q: 0, r: -3 },
    ],
    // 3
    [
        { q: -1, r: 0 },
        { q: -2, r: 0 },
        { q: -3, r: 0 },
    ],
    // 4
    [
        { q: -1, r: 1 },
        { q: -2, r: 2 },
        { q: -3, r: 3 },
    ],
    // 5
    [
        { q: 0, r: 1 },
        { q: 0, r: 2 },
        { q: 0, r: 3 },
    ]
];
var addShadowsToMap = function (trees, sunPosition) {
    // Reset shadows
    var shadowMap = [];
    for (var q = -3; q <= 3; q++) {
        if (!shadowMap[q]) {
            shadowMap[q] = [];
        }
        for (var r = -3; r <= 3; r++) {
            shadowMap[q][r] = 0;
        }
    }
    var shadowPresets = shadowLengths[sunPosition];
    for (var _i = 0, trees_1 = trees; _i < trees_1.length; _i++) {
        var tree = trees_1[_i];
        for (var i = 0; i < tree.size; i++) {
            var _a = axial_add(exports.coordinatesMap[tree.cellIndex], shadowPresets[i]), q = _a.q, r = _a.r;
            if (q in shadowMap && r in shadowMap[q]) {
                shadowMap[q][r] = Math.max(shadowMap[q][r], tree.size);
            }
        }
    }
    return shadowMap;
};
exports.addShadowsToMap = addShadowsToMap;
var Simulator = /** @class */ (function () {
    function Simulator(trees, sunDirection, sunPoints, points, nutrients) {
        this.sunDirection = sunDirection;
        this.trees = trees;
        this.sunPoints = sunPoints;
        this.points = points;
        this.nutrients = nutrients;
        this.actionChain = [];
        this.day = 0;
        this.mainMap = [];
        var hash = this.getTreeHash();
        if (!(hash in treeStateHash)) {
            treeStateHash.trees[hash] = Object.freeze(this.trees);
        }
        this.treeSet = new Set();
        for (var _i = 0, trees_2 = trees; _i < trees_2.length; _i++) {
            var cellIndex = trees_2[_i].cellIndex;
            var _a = exports.coordinatesMap[cellIndex], q = _a.q, r = _a.r;
            this.treeSet.add(q + ':' + r);
        }
    }
    Simulator.prototype.setActionChain = function (actions) {
        this.actionChain = actions;
    };
    Simulator.prototype.setDay = function (day) {
        this.day = day;
    };
    Simulator.prototype.getHash = function () {
        return this.sunDirection.toString() + this.getTreeHash();
    };
    Simulator.prototype.setMap = function (map) {
        this.mainMap = map;
    };
    Simulator.prototype.getTreeHash = function () {
        var hash = '_____________________________________';
        for (var _i = 0, _a = this.trees; _i < _a.length; _i++) {
            var tree = _a[_i];
            if (tree.isDormant) {
                hash = setCharAt(hash, tree.cellIndex, dormantTreeSymbols[tree.size]);
            }
            else {
                hash = setCharAt(hash, tree.cellIndex, normalTreeSymbols[tree.size]);
            }
        }
        return hash;
    };
    Simulator.prototype.getSettings = function () {
        var hash = this.getTreeHash();
        if (!(hash in treeStateHash.trees)) {
            treeStateHash.trees[hash] = Object.freeze(this.trees);
        }
        return {
            trees: hash,
            day: this.day,
            sunPoints: this.sunPoints,
            points: this.points,
            nutrients: this.nutrients,
            actionChain: __spreadArray([], this.actionChain, true)
        };
    };
    Simulator.prototype.clone = function () {
        var newSim = new Simulator(this.trees, this.sunDirection, this.sunPoints, this.points, this.nutrients);
        newSim.setActionChain(__spreadArray([], this.actionChain, true));
        newSim.setDay(this.day);
        return newSim;
    };
    Simulator.prototype.advanceDay = function () {
        this.day = this.day + 1;
        this.sunDirection = this.day % 6;
        var shadows = (0, exports.addShadowsToMap)(this.trees, this.sunDirection);
        this.sunPoints += this.calculatePoints(shadows);
        this.trees = this.trees.map(setNotDormant);
    };
    Simulator.prototype.applySettings = function (settings) {
        if (!(settings.trees in treeStateHash.trees)) {
            throw new Error('Unknown tree hash:' + settings.trees);
        }
        this.trees = treeStateHash.trees[settings.trees];
        this.sunDirection = settings.day % 6;
        this.setDay(settings.day);
        this.points = settings.points;
        this.sunPoints = settings.sunPoints;
        this.nutrients = settings.nutrients;
        this.setActionChain(settings.actionChain);
        this.treeSet = new Set();
        for (var _i = 0, _a = this.trees; _i < _a.length; _i++) {
            var cellIndex = _a[_i].cellIndex;
            var _b = exports.coordinatesMap[cellIndex], q = _b.q, r = _b.r;
            this.treeSet.add(q + ':' + r);
        }
    };
    Simulator.prototype.getSeedTargets = function (_a, distance) {
        var _this = this;
        var q = _a.q, r = _a.r;
        var results = [];
        for (var vq = -distance; vq <= distance; vq++) {
            for (var vr = Math.max(-distance, -vq - distance); vr <= Math.min(distance, -vq + distance); vr++) {
                results.push({ q: q + vq, r: r + vr });
            }
        }
        return results.filter(function (_a) {
            var q = _a.q, r = _a.r;
            return (-q - r) >= -3 && (-q - r) <= 3
                && q >= -3 && q <= 3
                && r >= -3 && r <= 3
                && _this.mainMap[q][r]
                // @ts-ignore
                && _this.mainMap[q][r].richness
                && !_this.treeSet.has(q + ':' + r);
        });
    };
    Simulator.prototype.getActions = function () {
        var commands = [];
        var growBaseCosts = {
            0: 0,
            1: 0,
            2: 0,
            3: 0
        };
        for (var _i = 0, _a = this.trees; _i < _a.length; _i++) {
            var tree = _a[_i];
            if (tree.isMine) {
                growBaseCosts[tree.size] += 1;
            }
        }
        for (var _b = 0, _c = this.trees; _b < _c.length; _b++) {
            var tree = _c[_b];
            // SEED
            var treePoint = exports.coordinatesMap[tree.cellIndex];
            if (!tree.isDormant && tree.isMine) {
                if (this.sunPoints >= growBaseCosts[0]) {
                    if (tree.size > 0 && tree.size <= 3 && growBaseCosts[0] < 2) {
                        var seedPoints = this.getSeedTargets(treePoint, tree.size);
                        seedPoints.sort(sortByRichness);
                        for (var _d = 0, seedPoints_1 = seedPoints; _d < seedPoints_1.length; _d++) {
                            var seedPoint = seedPoints_1[_d];
                            var cell = this.mainMap[seedPoint.q][seedPoint.r];
                            if (cell && tree.cellIndex !== cell.index) {
                                if (tree.cellIndex === cell.index) {
                                    console.log('Same seed:', seedPoint.q, seedPoint.r);
                                    console.dir(this.treeSet.values());
                                }
                                commands.push('SEED ' + tree.cellIndex + ' ' + cell.index);
                            }
                        }
                    }
                }
                if (tree.size < 3 && growBaseCosts[tree.size + 1] < 3) {
                    var cost = growthCost[tree.size] + growBaseCosts[tree.size + 1];
                    if (this.sunPoints >= cost) {
                        commands.push('GROW ' + tree.cellIndex);
                    }
                }
                else if (tree.size === 3 && this.sunPoints >= 4) {
                    commands.push('COMPLETE ' + tree.cellIndex);
                }
            }
        }
        var lastTwoCommandsWaited = this.actionChain.length > 1 && this.actionChain[this.actionChain.length - 1] === 'WAIT' && this.actionChain[this.actionChain.length - 2] === 'WAIT';
        if (this.day < 10 && !lastTwoCommandsWaited) {
            commands.push('WAIT');
        }
        return commands;
    };
    Simulator.prototype.calculatePoints = function (shadows) {
        var sun = 0;
        for (var _i = 0, _a = this.trees; _i < _a.length; _i++) {
            var tree = _a[_i];
            if (tree.isMine) {
                var _b = exports.coordinatesMap[tree.cellIndex], q = _b.q, r = _b.r;
                var cell = shadows[q][r];
                if (cell !== null && cell < tree.size) {
                    sun += tree.size;
                }
            }
        }
        return sun;
    };
    Simulator.prototype.apply = function (wholeCommand) {
        // SEED from to
        // GROW n
        // COMPLETE n
        // WAIT
        var matches = wholeCommand.split(' ');
        var command = matches[0];
        this.actionChain.push(wholeCommand);
        switch (command) {
            case 'SEED': {
                var source = parseInt(matches[1], 10);
                var target = parseInt(matches[2], 10);
                var sourceTree_1 = this.trees.find(findByCellIndex(source));
                var _a = exports.coordinatesMap[target], q = _a.q, r = _a.r;
                var sunCost = this.trees.filter(function (_a) {
                    var isMine = _a.isMine, size = _a.size;
                    return isMine && size === 0;
                }).length;
                var cell = this.mainMap[q][r];
                if (sourceTree_1
                    && !sourceTree_1.isDormant // Tree is not dormant
                    && !this.treeSet.has(q + ':' + r) // No tree at the point of seeding
                    && cell
                    && cell.richness > 0
                    && axial_distance({ q: q, r: r }, exports.coordinatesMap[sourceTree_1.cellIndex]) <= sourceTree_1.size // We're not throwing too far
                    && this.sunPoints >= sunCost) {
                    this.trees = __spreadArray(__spreadArray([], this.trees.map(function (tree) { return tree.cellIndex === sourceTree_1.cellIndex ? __assign(__assign({}, tree), { isDormant: true }) : tree; }), true), [
                        { cellIndex: target, size: 0, isDormant: true, isMine: true }
                    ], false);
                    this.treeSet.add(q + ':' + r);
                    this.sunPoints = this.sunPoints - sunCost;
                }
                else {
                    throw new Error('Cannot execute ' + wholeCommand);
                }
                break;
            }
            case 'GROW': {
                var target = parseInt(matches[1], 10);
                var targetTree_1 = this.trees.find(findByCellIndex(target));
                if (targetTree_1) {
                    var existingTrees = this.trees.filter(function (_a) {
                        var size = _a.size, isMine = _a.isMine;
                        return isMine && size === targetTree_1.size + 1;
                    }).length;
                    var sunCost = growthCost[targetTree_1.size] + existingTrees;
                    if (targetTree_1.size < 3 && !targetTree_1.isDormant && this.sunPoints >= sunCost) {
                        this.trees = this.trees.map(function (tree) { return tree.cellIndex === targetTree_1.cellIndex ? __assign(__assign({}, tree), { size: tree.size + 1, isDormant: true }) : tree; });
                        // targetTree.size = targetTree.size + 1
                        // targetTree.isDormant = true
                        this.sunPoints = this.sunPoints - sunCost;
                    }
                    else {
                        var cause = 'cause unknown';
                        if (targetTree_1.size >= 3) {
                            cause = 'tree is too big';
                        }
                        if (targetTree_1.isDormant) {
                            cause = 'tree is dormant';
                        }
                        if (this.sunPoints < sunCost) {
                            cause = 'not enough sun points';
                        }
                        console.dir(this.trees);
                        throw new Error('Cannot complete command ' + wholeCommand + ': ' + cause);
                    }
                }
                break;
            }
            case 'COMPLETE': {
                var target = parseInt(matches[1], 10);
                var targetTree_2 = this.trees.find(findByCellIndex(target));
                if (!targetTree_2) {
                    throw new Error('Bad command:' + wholeCommand);
                }
                else if (targetTree_2 && !targetTree_2.isDormant && targetTree_2.size === 3 && this.sunPoints >= 4) {
                    this.trees = this.trees.filter(function (_a) {
                        var cellIndex = _a.cellIndex;
                        return cellIndex !== targetTree_2.cellIndex;
                    });
                    var _b = exports.coordinatesMap[targetTree_2.cellIndex], q = _b.q, r = _b.r;
                    var mapPoint = this.mainMap[q][r];
                    this.treeSet["delete"](q + ':' + r);
                    this.sunPoints = this.sunPoints - 4;
                    var pointsWon = this.nutrients + (mapPoint ? richnessBonus[mapPoint.richness] : 0);
                    this.points = this.points + pointsWon;
                    this.nutrients = this.nutrients - 1;
                }
                else {
                    throw new Error('Cannot complete command ' + wholeCommand);
                }
                break;
            }
            case 'WAIT': {
                this.advanceDay();
                break;
            }
        }
    };
    return Simulator;
}());
exports.Simulator = Simulator;
