'use strict';

/********************************************************************************************
 *                                                                                          *
 * Please read the following tutorial before implementing tasks:                             *
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Iterators_and_Generators   *
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/yield        *
 *                                                                                          *
 ********************************************************************************************/


/**
 * Returns the lines sequence of "99 Bottles of Beer" song:
 *
 *  '99 bottles of beer on the wall, 99 bottles of beer.'
 *  'Take one down and pass it around, 98 bottles of beer on the wall.'
 *  '98 bottles of beer on the wall, 98 bottles of beer.'
 *  'Take one down and pass it around, 97 bottles of beer on the wall.'
 *  ...
 *  '1 bottle of beer on the wall, 1 bottle of beer.'
 *  'Take one down and pass it around, no more bottles of beer on the wall.'
 *  'No more bottles of beer on the wall, no more bottles of beer.'
 *  'Go to the store and buy some more, 99 bottles of beer on the wall.'
 *
 * See the full text at
 * http://99-bottles-of-beer.net/lyrics.html
 *
 * NOTE: Please try to complete this task faster than original song finished:
 * https://www.youtube.com/watch?v=Z7bmyjxJuVY   :)
 *
 *
 * @return {Iterable.<string>}
 *
 */
function* get99BottlesOfBeer() {
    let bottles = 99;

    const getBottlesOfBeerString = (isFirstLetterUpperCase = false) => {
        if (!bottles) {
            return `${isFirstLetterUpperCase ? 'N' : 'n'}o more bottles of beer`;
        }
        return `${bottles} bottle${bottles !== 1 ? 's' : ''} of beer`
    };

    while (bottles) {
        yield `${getBottlesOfBeerString(true)} on the wall, ${getBottlesOfBeerString()}.`
        bottles--;
        yield `Take one down and pass it around, ${getBottlesOfBeerString()} on the wall.`
    }

    yield `${getBottlesOfBeerString(true)} on the wall, ${getBottlesOfBeerString()}.`
    yield 'Go to the store and buy some more, 99 bottles of beer on the wall.';
}


/**
 * Returns the Fibonacci sequence:
 *   0, 1, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89, 144, 233, ...
 *
 * See more at: https://en.wikipedia.org/wiki/Fibonacci_number
 *
 * @return {Iterable.<number>}
 *
 */
function* getFibonacciSequence() {
    let prev = 0;
    let next = 1;

    yield prev;
    yield next;

    while (true) {
        const res = prev + next;
        yield res;

        prev = next;
        next = res;
    }

}


/**
 * Traverses a tree using the depth-first strategy
 * See details: https://en.wikipedia.org/wiki/Depth-first_search
 *
 * Each node have child nodes in node.children array.
 * The leaf nodes do not have 'children' property.
 *
 * @params {object} root the tree root
 * @return {Iterable.<object>} the sequence of all tree nodes in depth-first order
 * @example
 *
 *   var node1 = { n:1 }, node2 = { n:2 }, node3 = { n:3 }, node4 = { n:4 },
 *       node5 = { n:5 }, node6 = { n:6 }, node7 = { n:7 }, node8 = { n:8 };
 *   node1.children = [ node2, node6, node7 ];
 *   node2.children = [ node3, node4 ];
 *   node4.children = [ node5 ];
 *   node7.children = [ node8 ];
 *
 *     source tree (root = 1):
 *            1
 *          / | \
 *         2  6  7
 *        / \     \            =>    { 1, 2, 3, 4, 5, 6, 7, 8 }
 *       3   4     8
 *           |
 *           5
 *
 *  depthTraversalTree(node1) => node1, node2, node3, node4, node5, node6, node7, node8
 *
 */
function* depthTraversalTree(root) {
    const stack = [root];

    while (stack.length) {
        const node = stack[stack.length - 1];

        if (!node.isDiscovered) {
            yield node;
            node.isDiscovered = true;
        }

        if (!node.children || !node.children.length) {
            stack.pop();
            continue;
        }

        stack.push(node.children.shift());
    }
}


/**
 * Traverses a tree using the breadth-first strategy
 * See details: https://en.wikipedia.org/wiki/Breadth-first_search
 *
 * Each node have child nodes in node.children array.
 * The leaf nodes do not have 'children' property.
 *
 * @params {object} root the tree root
 * @return {Iterable.<object>} the sequence of all tree nodes in breadth-first order
 * @example
 *     source tree (root = 1):
 *
 *            1
 *          / | \
 *         2  3  4
 *        / \     \            =>    { 1, 2, 3, 4, 5, 6, 7, 8 }
 *       5   6     7
 *           |
 *           8
 *
 */
function* breadthTraversalTree(root) {
    const queue = [root];

    while (queue.length) {
        const node = queue[0];

        if (!node.isDiscovered) {
            yield node;
            node.isDiscovered = true;
        }

        if (!node.children || !node.children.length) {
            queue.shift();
            continue;
        }

        queue.push(node.children.shift());
    }
}


/**
 * Merges two yield-style sorted sequences into the one sorted sequence.
 * The result sequence consists of sorted items from source iterators.
 *
 * @params {Iterable.<number>} source1
 * @params {Iterable.<number>} source2
 * @return {Iterable.<number>} the merged sorted sequence
 *
 * @example
 *   [ 1, 3, 5, ... ], [2, 4, 6, ... ]  => [ 1, 2, 3, 4, 5, 6, ... ]
 *   [ 0 ], [ 2, 4, 6, ... ]  => [ 0, 2, 4, 6, ... ]
 *   [ 1, 3, 5, ... ], [ -1 ] => [ -1, 1, 3, 5, ...]
 */
function* mergeSortedSequences(source1, source2) {
    let source1LastItem;
    let source2LastItem;
    const source1Iterator = source1();
    const source2Iterator = source2();
    while (!source1LastItem?.done || !source2LastItem?.done) {
        if (!source1LastItem || source1LastItem?.isYielded) {
            source1LastItem = source1Iterator.next();
        }
        if (!source2LastItem || source2LastItem?.isYielded) {
            source2LastItem = source2Iterator.next()
        }

        if (source1LastItem.value < source2LastItem.value || source2LastItem.done && !source1LastItem.isYielded && !source1LastItem.done) {
            source1LastItem.isYielded = true;
            yield source1LastItem.value;
        } else if (!source2LastItem.isYielded && !source2LastItem.done) {
            source2LastItem.isYielded = true;
            yield source2LastItem.value;
        }
    }
}


module.exports = {
    get99BottlesOfBeer: get99BottlesOfBeer,
    getFibonacciSequence: getFibonacciSequence,
    depthTraversalTree: depthTraversalTree,
    breadthTraversalTree: breadthTraversalTree,
    mergeSortedSequences: mergeSortedSequences
};
