/* ************************************************************************************************
 *                                                                                                *
 * Please read the following tutorial before implementing tasks:                                   *
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Object_initializer *
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object        *
 *                                                                                                *
 ************************************************************************************************ */

/**
 * Returns the rectangle object with width and height parameters and getArea() method
 *
 * @param {number} width
 * @param {number} height
 * @return {Object}
 *
 * @example
 *    const r = new Rectangle(10,20);
 *    console.log(r.width);       // => 10
 *    console.log(r.height);      // => 20
 *    console.log(r.getArea());   // => 200
 */
function Rectangle(width, height) {
  this.width = width;
  this.height = height;
}

Rectangle.prototype.getArea = function calculateArea() {
  return this.width * this.height;
};

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
 *    const r = fromJSON(Circle.prototype, '{"radius":10}');
 *
 */
function fromJSON(proto, json) {
  return Object.setPrototypeOf(JSON.parse(json), proto);
}

/**
 * Css selectors builder
 *
 * Each complex selector can consists of type, id, class, attribute, pseudo-class
 * and pseudo-element selectors:
 *
 *    element#id.class[attr]:pseudoClass::pseudoElement
 *              \----/\----/\----------/
 *              Can be several occurrences
 *
 * All types of selectors can be combined using the combination ' ','+','~','>' .
 *
 * The task is to design a single class, independent classes or classes hierarchy
 * and implement the functionality to build the css selectors using the provided cssSelectorBuilder.
 * Each selector should have the stringify() method to output the string representation
 * according to css specification.
 *
 * Provided cssSelectorBuilder should be used as facade only to create your own classes,
 * for example the first method of cssSelectorBuilder can be like this:
 *   element: function(value) {
 *       return new MySuperBaseElementSelector(...)...
 *   },
 *
 * The design of class(es) is totally up to you, but try to make it as simple,
 * clear and readable as possible.
 *
 * @example
 *
 *  const builder = cssSelectorBuilder;
 *
 *  builder.id('main').class('container').class('editable').stringify()
 *    => '#main.container.editable'
 *
 *  builder.element('a').attr('href$=".png"').pseudoClass('focus').stringify()
 *    => 'a[href$=".png"]:focus'
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
 *  ).stringify()
 *    => 'div#main.container.draggable + table#data ~ tr:nth-of-type(even)   td:nth-of-type(even)'
 *
 *  For more examples see unit tests.
 */

function Selector() {
  this.element = null;
  this.id = null;
  this.classes = [];
  this.attributes = [];
  this.pseudoClasses = [];
  this.pseudoElement = null;
  this.stringify = () => {
    let result = '';
    if (this.element) result += this.element;
    if (this.id) result += `#${this.id}`;
    if (this.classes.length) result += `.${this.classes.join('.')}`;
    if (this.attributes.length) result += `[${this.attributes.join('][')}]`;
    if (this.pseudoClasses.length) result += `:${this.pseudoClasses.join(':')}`;
    if (this.pseudoElement) result += `::${this.pseudoElement}`;
    this.element = null;
    this.id = null;
    this.classes = [];
    this.attributes = [];
    this.pseudoClasses = [];
    this.pseudoElement = null;
    return result;
  };
}

class Builder {
  constructor() {
    this.order = -1;
    this.current = new Selector();
    this.combined = '';
  }

  stringify() {
    const result = this.combined || this.current.stringify();
    this.order = -1;
    this.combined = '';
    return result;
  }

  element(value) {
    const weight = 0;
    if (this.order > weight) this.throwOrderError();
    this.checkPropertyExistance('element');
    this.current.element = value;
    this.order = weight;
    return this;
  }

  id(value) {
    const weight = 1;
    if (this.order > weight) this.throwOrderError();
    this.checkPropertyExistance('id');
    this.current.id = value;
    this.order = weight;
    return this;
  }

  class(value) {
    const weight = 2;
    if (this.order > weight) this.throwOrderError();
    this.current.classes.push(value);
    this.order = weight;
    return this;
  }

  attr(value) {
    const weight = 3;
    if (this.order > weight) this.throwOrderError();
    this.current.attributes.push(value);
    this.order = weight;
    return this;
  }

  pseudoClass(value) {
    const weight = 4;
    if (this.order > weight) this.throwOrderError();
    this.current.pseudoClasses.push(value);
    this.order = weight;
    return this;
  }

  pseudoElement(value) {
    const weight = 5;
    if (this.order > weight) this.throwOrderError();
    this.checkPropertyExistance('pseudoElement');
    this.current.pseudoElement = value;
    this.order = weight;
    return this;
  }

  combine(selector1, combinator, selector2) {
    this.combined = `${selector1.stringify()} ${combinator} ${selector2.stringify()}`;
    return this;
  }

  checkPropertyExistance(prop) {
    if (this.current[prop]) {
      this.order = -1;
      this.current = new Selector();
      throw Error('Element, id and pseudo-element should not occur more then one time inside the selector');
    }
  }

  throwOrderError() {
    this.order = -1;
    this.current = new Selector();
    throw Error('Selector parts should be arranged in the following order: element, id, class, attribute, pseudo-class, pseudo-element');
  }
}

const cssSelectorBuilder = {
  element(value) {
    return new Builder().element(value);
  },

  id(value) {
    return new Builder().id(value);
  },

  class(value) {
    return new Builder().class(value);
  },

  attr(value) {
    return new Builder().attr(value);
  },

  pseudoClass(value) {
    return new Builder().pseudoClass(value);
  },

  pseudoElement(value) {
    return new Builder().pseudoElement(value);
  },

  combine(selector1, combinator, selector2) {
    return new Builder().combine(selector1, combinator, selector2);
  },
};

module.exports = {
  Rectangle,
  getJSON,
  fromJSON,
  cssSelectorBuilder,
};
