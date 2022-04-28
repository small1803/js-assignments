'use strict';

/**************************************************************************************************
 *                                                                                                *
 * Plese read the following tutorial before implementing tasks:                                   *
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Object_initializer *
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object        *
 *                                                                                                *
 **************************************************************************************************/


/**
 * Returns the rectangle object with width and height parameters and getArea() method
 *
 * @param {number} width
 * @param {number} height
 * @return {Object}
 *
 * @example
 *    var r = new Rectangle(10,20);
 *    console.log(r.width);       // => 10
 *    console.log(r.height);      // => 20
 *    console.log(r.getArea());   // => 200
 */
function Rectangle(width, height) {
    this.width = width;
    this.height = height;
}

Rectangle.prototype.getArea = function () {
    return this.width * this.height;
}


/**
 * Returns the JSON representation of specified object
 *
 * @param {object} obj
 * @return {string}
 *
 * @example
 *    [1,2,3]   =>  '[1,2,3]'
 *    { width: 10, height : 20 } => '{"height":10,"width":20}'
 */
function getJSON(obj) {
    return JSON.stringify(obj);
}


/**
 * Returns the object of specified type from JSON representation
 *
 * @param {Object} proto
 * @param {string} json
 * @return {object}
 *
 * @example
 *    var r = fromJSON(Rectangle.prototype, '{"width":10, "height":20}');
 *
 */
function fromJSON(proto, json) {
    const res = Object.create(proto);
    const jsonObj = JSON.parse(json);

    return Object.assign(res, jsonObj);
}


/**
 * Css selectors builder
 *
 * Each complex selector can consist of type, id, class, attribute, pseudo-class and pseudo-element selectors:
 *
 *    element#id.class[attr]:pseudoClass::pseudoElement
 *              \----/\----/\----------/
 *              Can be several occurences
 *
 * All types of selectors can be combined using the combinators ' ','+','~','>' .
 *
 * The task is to design a single class, independent classes or classes hierarchy and implement the functionality
 * to build the css selectors using the provided cssSelectorBuilder.
 * Each selector should have the stringify() method to output the string representation according to css specification.
 *
 * Provided cssSelectorBuilder should be used as facade only to create your own classes,
 * for example the first method of cssSelectorBuilder can be like this:
 *   element: function(value) {
 *       return new MySuperBaseElementSelector(...)...
 *   },
 *
 * The design of class(es) is totally up to you, but try to make it as simple, clear and readable as possible.
 *
 * @example
 *
 *  var builder = cssSelectorBuilder;
 *
 *  builder.id('main').class('container').class('editable').stringify()  => '#main.container.editable'
 *
 *  builder.element('a').attr('href$=".png"').pseudoClass('focus').stringify()  => 'a[href$=".png"]:focus'
 *
 *  builder.combine(
 *      builder.element('div').id('main').class('container').class('draggable'),
 *      '+',
 *      builder.combine(
 *          builder.element('table').id('data'),
 *          '~',
 *           builder.combine(
 *               builder.element('tr').pseudoClass('nth-of-type(even)'),
 *               ' ',
 *               builder.element('td').pseudoClass('nth-of-type(even)')
 *           )
 *      )
 *  ).stringify()        =>    'div#main.container.draggable + table#data ~ tr:nth-of-type(even)   td:nth-of-type(even)'
 *
 *  For more examples see unit tests.
 */

const SelectorsOrder = {
    Empty: 0,
    Element: 1,
    Id: 2,
    Class: 3,
    Attr: 4,
    PseudoClass: 5,
    PseudoElement: 6,
}

function Selector() {
    this._element = undefined;
    this._id = undefined;
    this._classes = [];
    this._attrs = [];
    this._pseudoClasses = [];
    this._pseudoElement = undefined;
    this._combination = '';
    this.lastSelectorAdded = SelectorsOrder.Empty;


    this.element = function(value) {
        if (this._element) {
            throw new Error('Element, id and pseudo-element should not occur more then one time inside the selector');
        }
        if (this.lastSelectorAdded > SelectorsOrder.Empty) {
            throw new Error('Selector parts should be arranged in the following order: element, id, class, attribute, pseudo-class, pseudo-element');
        }

        this._element = value;
        this.lastSelectorAdded = SelectorsOrder.Element;

        return this;
    };

    this.id = function(value) {
        if (this._id) {
            throw new Error('Element, id and pseudo-element should not occur more then one time inside the selector');
        }
        if (this.lastSelectorAdded > SelectorsOrder.Element) {
            throw new Error('Selector parts should be arranged in the following order: element, id, class, attribute, pseudo-class, pseudo-element');
        }

        this._id = value;
        this.lastSelectorAdded = SelectorsOrder.Id;

        return this;
    };

    this.class = function(value) {
        if (this.lastSelectorAdded > SelectorsOrder.Class) {
            throw new Error('Selector parts should be arranged in the following order: element, id, class, attribute, pseudo-class, pseudo-element');
        }

        this._classes.push(value);
        this.lastSelectorAdded = SelectorsOrder.Class;

        return this;
    };

    this.attr = function(value) {
        if (this.lastSelectorAdded > SelectorsOrder.Attr) {
            throw new Error('Selector parts should be arranged in the following order: element, id, class, attribute, pseudo-class, pseudo-element');
        }

        this._attrs.push(value);
        this.lastSelectorAdded = SelectorsOrder.Attr;

        return this;
    };

    this.pseudoClass = function(value) {
        if (this.lastSelectorAdded > SelectorsOrder.PseudoClass) {
            throw new Error('Selector parts should be arranged in the following order: element, id, class, attribute, pseudo-class, pseudo-element');
        }

        this._pseudoClasses.push(value);
        this.lastSelectorAdded = SelectorsOrder.PseudoClass;

        return this;
    };

    this.pseudoElement = function(value) {
        if (this._pseudoElement) {
            throw new Error('Element, id and pseudo-element should not occur more then one time inside the selector');
        }
        this._pseudoElement = value;
        this.lastSelectorAdded = SelectorsOrder.PseudoElement;

        return this;
    };

    this.stringify = function () {
        if (this._combination) {
            return this._combination;
        }

        return _stringifyElement(this._element) + _stringifyId(this._id) +
                _stringifyClasses(this._classes) + _stringifyAttrs(this._attrs) +
                _stringifyPseudoClasses(this._pseudoClasses) + _stringifyPseudoElement(this._pseudoElement);
    };

    this.combine = function(selector1, combinator, selector2) {
        this._combination = `${selector1.stringify()} ${combinator} ${selector2.stringify()}`;

        return this;
    };

    function _stringifyElement(element) {
        return element || '';
    }

    function _stringifyId(id) {
        return id ? `#${id}`: '';
    }

    function _stringifyClasses(classes) {
        return classes.reduce((prev, curr) => prev + `.${curr}`, '');
    }

    function _stringifyAttrs(attrs) {
        return attrs.reduce((prev, curr) => prev + `[${curr}]`, '');
    }

    function _stringifyPseudoClasses(pseudoClasses) {
        return pseudoClasses.reduce((prev, curr) => prev + `:${curr}`, '');
    }

    function _stringifyPseudoElement(pseudoElement) {
        return pseudoElement ? `::${pseudoElement}` : '';
    }
}

const cssSelectorBuilder = {

    element: function(value) {
        return new Selector().element(value);
    },

    id: function(value) {
        return new Selector().id(value);
    },

    class: function(value) {
        return new Selector().class(value);
    },

    attr: function(value) {
        return new Selector().attr(value);
    },

    pseudoClass: function(value) {
        return new Selector().pseudoClass(value);
    },

    pseudoElement: function(value) {
        return new Selector().pseudoElement(value);
    },

    combine: function(selector1, combinator, selector2) {
        return new Selector().combine(selector1, combinator, selector2);
    },
};


module.exports = {
    Rectangle: Rectangle,
    getJSON: getJSON,
    fromJSON: fromJSON,
    cssSelectorBuilder: cssSelectorBuilder
};
