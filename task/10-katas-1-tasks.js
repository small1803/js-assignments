'use strict';

/**
 * Returns the array of 32 compass points and heading.
 * See details here:
 * https://en.wikipedia.org/wiki/Points_of_the_compass#32_cardinal_points
 *
 * @return {array}
 *
 * Example of return :
 *  [
 *     { abbreviation : 'N',     azimuth : 0.00 ,
 *     { abbreviation : 'NbE',   azimuth : 11.25 },
 *     { abbreviation : 'NNE',   azimuth : 22.50 },
 *       ...
 *     { abbreviation : 'NbW',   azimuth : 348.75 }
 *  ]
 */
function createCompassPoints() {
    const sides = ['N','E','S','W'];

    let isDirect = true;
    const getPrimarySecondarySides = (first, second) => {
        const result = isDirect ? [first, second] : [second, first];
        isDirect = !isDirect;

        return result;
    };

    let i = 0;
    while (i < 16) {
        const current = sides[i];
        const next = sides[i + 1] || sides[0];
        const [primary, secondary] = getPrimarySecondarySides(current, next);
        sides.splice(i + 1, 0, `${current}b${next}`, `${primary}${secondary}`, `${next}b${current}`);
        i += 4;
    }

    i = 2;
    while (i < 32) {
        const current = sides[i];
        const prev = sides[i - 2];
        const next = sides[i + 2] || sides[0];
        sides.splice(i + 1, 0, `${current}b${next}`, `${next}${current}`);
        sides.splice(i, 0, `${prev}${current}`, `${current}b${prev}`);
        i += 8;
    }

    return sides.map((side, index) => ({ abbreviation : side, azimuth: 11.25 * index}));
}


/**
 * Expand the braces of the specified string.
 * See https://en.wikipedia.org/wiki/Bash_(Unix_shell)#Brace_expansion
 *
 * In the input string, balanced pairs of braces containing comma-separated substrings
 * represent alternations that specify multiple alternatives which are to appear at that position in the output.
 *
 * @param {string} str
 * @return {Iterable.<string>}
 *
 * NOTE: The order of output string does not matter.
 *
 * Example:
 *   '~/{Downloads,Pictures}/*.{jpg,gif,png}'  => '~/Downloads/*.jpg',
 *                                                '~/Downloads/*.gif'
 *                                                '~/Downloads/*.png',
 *                                                '~/Pictures/*.jpg',
 *                                                '~/Pictures/*.gif',
 *                                                '~/Pictures/*.png'
 *
 *   'It{{em,alic}iz,erat}e{d,}, please.'  => 'Itemized, please.',
 *                                            'Itemize, please.',
 *                                            'Italicized, please.',
 *                                            'Italicize, please.',
 *                                            'Iterated, please.',
 *                                            'Iterate, please.'
 *
 *   'thumbnail.{png,jp{e,}g}'  => 'thumbnail.png'
 *                                 'thumbnail.jpeg'
 *                                 'thumbnail.jpg'
 *
 *   'nothing to do' => 'nothing to do'
 */
function* expandBraces(str) {
    const regex = new RegExp(/{[^{}]+}/g);
    const processed = [str];

    while (processed.length) {
        let str = processed.shift();
        let match = str.match(regex);
        if (match) {
            let alternations = match[0].slice(1, -1).split(',');

            for (const alternation of alternations) {
                let replaced = str.replace(match[0], alternation);
                if (!processed.includes(replaced)) {
                    processed.push(replaced)
                }
            }
        } else {
            yield str;
        }
    }
}


/**
 * Returns the ZigZag matrix
 *
 * The fundamental idea in the JPEG compression algorithm is to sort coefficient of given image by zigzag path and encode it.
 * In this task you are asked to implement a simple method to create a zigzag square matrix.
 * See details at https://en.wikipedia.org/wiki/JPEG#Entropy_coding
 * and zigzag path here: https://upload.wikimedia.org/wikipedia/commons/thumb/4/43/JPEG_ZigZag.svg/220px-JPEG_ZigZag.svg.png
 *
 * @param {number} n - matrix dimension
 * @return {array}  n x n array of zigzag path
 *
 * @example
 *   1  => [[0]]
 *
 *   2  => [[ 0, 1 ],
 *          [ 2, 3 ]]
 *
 *         [[ 0, 1, 5 ],
 *   3  =>  [ 2, 4, 6 ],
 *          [ 3, 7, 8 ]]
 *
 *         [[ 0, 1, 5, 6 ],
 *   4 =>   [ 2, 4, 7,12 ],
 *          [ 3, 8,11,13 ],
 *          [ 9,10,14,15 ]]
 *
 */
function getZigZagMatrix(n) {
    let i = 0, j = 0;
    let counter = 0;
    let diagonalLength = 1;
    let remainingInDiagonal = 1
    let isDirectionUp = true;
    let isBeforeBiggestDiagonal = true;
    const matrix = [...new Array(n)].map(() => [...new Array(n)].map(() => 0));

    do {
        matrix[i][j] = counter++;
        remainingInDiagonal--;

        if (!remainingInDiagonal) {
            isDirectionUp ? (isBeforeBiggestDiagonal ? j++ : i++) : (isBeforeBiggestDiagonal ? i++ : j++);
            isBeforeBiggestDiagonal ? diagonalLength++ : diagonalLength--;
            if (isBeforeBiggestDiagonal && diagonalLength === n) {
                isBeforeBiggestDiagonal = false;
            }
            remainingInDiagonal = diagonalLength;
            isDirectionUp = !isDirectionUp;
        } else if (isDirectionUp) {
            i--;
            j++;
        } else if (!isDirectionUp) {
            i++;
            j--;
        }
    } while (counter < n * n);

    return matrix;
}


/**
 * Returns true if specified subset of dominoes can be placed in a row according to the game rules.
 * Dominoes details see at: https://en.wikipedia.org/wiki/Dominoes
 *
 * Each domino tile presented as an array [x,y] of tile value.
 * For example, the subset [1, 1], [2, 2], [1, 2] can be arranged in a row (as [1, 1] followed by [1, 2] followed by [2, 2]),
 * while the subset [1, 1], [0, 3], [1, 4] can not be arranged in one row.
 * NOTE that as in usual dominoes playing any pair [i, j] can also be treated as [j, i].
 *
 * @params {array} dominoes
 * @return {boolean}
 *
 * @example
 *
 * [[0,1],  [1,1]] => true
 * [[1,1], [2,2], [1,5], [5,6], [6,3]] => false
 * [[1,3], [2,3], [1,4], [2,4], [1,5], [2,5]]  => true
 * [[0,0], [0,1], [1,1], [0,2], [1,2], [2,2], [0,3], [1,3], [2,3], [3,3]] => false
 *
 */
function canDominoesMakeRow(dominoes) {
    let next = (list, n) => {
        return list.map((a, b) => ({ i: b, v: a })).filter(a => a.v[0] === n || a.v[1] === n)
    };
    let test = (list, n) => {
        return next(list, n).some(a => {
            let clone = [...list];
            clone.splice(a.i, 1);
            return !clone.length || test(clone, a.v[0] === n ? a.v[1] : a.v[0])
        });
    };

    return dominoes.some((a, b) => {
        let clone = [...dominoes];
        clone.splice(b, 1);
        return test(clone, a[0]) || test(clone, a[1]);
    });
}


/**
 * Returns the string expression of the specified ordered list of integers.
 *
 * A format for expressing an ordered list of integers is to use a comma separated list of either:
 *   - individual integers
 *   - or a range of integers denoted by the starting integer separated from the end integer in the range by a dash, '-'.
 *     (The range includes all integers in the interval including both endpoints)
 *     The range syntax is to be used only for, and for every range that expands to more than two values.
 *
 * @params {array} nums
 * @return {string}
 *
 * @example
 *
 * [ 0, 1, 2, 3, 4, 5 ]   => '0-5'
 * [ 1, 4, 5 ]            => '1,4,5'
 * [ 0, 1, 2, 5, 7, 8, 9] => '0-2,5,7-9'
 * [ 1, 2, 4, 5]          => '1,2,4,5'
 */
function extractRanges(nums) {
    function Range() {
        this.list = [];
    }
    Range.prototype.add = function(n) {
        this.list.push(n);
    }
    Range.prototype.toString = function() {
        return this.list.length > 2 ? this.list[0] + '-' + this.list[this.list.length - 1] : this.list.join();
    }

    let prev, ranges = [], range = new Range();
    nums.forEach(a => {
        if (prev && prev + 1 !== a) {
            ranges.push(range);
            range = new Range();
        }
        range.add(a);
        prev = a;
    });
    ranges.push(range);
    return ranges.join();
}

module.exports = {
    createCompassPoints : createCompassPoints,
    expandBraces : expandBraces,
    getZigZagMatrix : getZigZagMatrix,
    canDominoesMakeRow : canDominoesMakeRow,
    extractRanges : extractRanges
};
