# flow-jsdoc
[![Build Status](https://travis-ci.org/Kegsay/flow-jsdoc.svg?branch=master)](https://travis-ci.org/Kegsay/flow-jsdoc)

This is a CLI tool to convert [JSDoc](http://usejsdoc.org/index.html) annotations into standard [Flow](https://flowtype.org/) type annotations. This means:
 - You only need to document your types once: in JSDoc.
 - You can get the benefits of Flow without having to go through a [transpiler](http://babeljs.io/), and without having to use [ugly looking comment syntax](https://flowtype.org/blog/2015/02/20/Flow-Comments.html).
 - You can do tiny in-line type comments for those functions which don't have JSDoc but you still want types.

```javascript
// Converts this:

/**
 * @param {Foobar[]} bar A foobar array
 * @param {Function} baz
 * @return {number}
 */
function foo(bar, baz) {
    return 42;
}

// Into this:

/**
 * @param {Foobar[]} bar A foobar array
 * @param {Function} baz
 * @return {number}
 */
function foo(bar: Array<Foobar>, baz: Function) : number {
    return 42;
}
```

Furthermore, a short in-line style is also supported:

```js
// Converts this:

//: (string, number) : Object
function foo(a, b) {
  return {};
}

// Into this:

function foo(a: string, b: number) : Object {
  return {};
}

// NB: The ":" at the start of the comment is REQUIRED.
// NBB: The in-line comment is REMOVED in the output to avoid Flow re-interpreting it..
```

The goal of this project is to make type checking as easy as running a linter, so you can take any project and run the following to get type errors:
```
 $ flow-jsdoc -d ./lib -o ./annotated
 $ flow check --all ./annotated
```

# Usage

*This tool will NOT apply* `/* @flow */` *to the file. You still need to do that!*

## CLI
```
 $ npm install -g flow-jsdoc
 $ flow-jsdoc -f path/to/file.js
# annotated file prints to stdout

 $ flow-jsdoc -d path/to/lib -o path/to/output
# every file in path/to/lib is processed and output to path/to/output (directory structure preserved)
```

## JS
```javascript
 var flowJsdoc = require("flow-jsdoc");
 var fileContents = // extract your file contents e.g. via 'fs' - this should be a string
 var opts = {
 // no options yet!
 };
 var annotatedContents = flowJsdoc(fileContents, opts);
 // write out annotated contents to file
```



# What this does
Currently, this tool will only work on functions and ES6 classes. It will handle functions represented in the following ways:
 * `function foo(bar) {}`
 * `var foo = function(bar) {}`
 * `var obj = { foo: function(bar) {} }`
 * `ObjClass.prototype.foo = function(bar) {}` - ES5 Classes
 * `class ObjClass { foo(bar) {} }` - ES6 Classes
 * `(foo, bar) => { }` - ES6 "fat arrow" functions

For each recognised function, the JSDoc tags `@param` and `@return` will be mapped to Flow annotations. This will currently do the following mappings from JSDoc to Flow:
 * `{AnyThingHere}` => `: AnyThingHere` (Name expressions)
 * `{String[]}` => `: Array<String>` (Type applications)
 * `{*}` => `: any` (Any type)
 * `{Object|String}` => `: Object | String` (Type unions)
 * `{string=}` => `: ?string` (Optional params)
 * `{?string}` => `: ?string` (Nullable types)

ES6 classes will include [field declarations](https://flowtype.org/docs/classes.html#_) via the `@prop` and `@property` tags like so:

```javascript
// Converts this ES6 Class:

class Foo {
  /**
   * Construct a Foo.
   * @property {string} bar
   * @prop {number} baz
   */
  constructor(bar, baz) {
    this.bar = bar;
    this.baz = baz;
  }
}

// Into this:

class Foo {
  bar: string;
  baz: number;

  /**
   * Construct a Foo.
   * @property {string} bar
   * @prop {number} baz
   */
  constructor(bar, baz) {
    this.bar = bar;
    this.baz = baz;
  }
}
```

This tool will then produce the whole file again with flow annotations included (JSDoc preserved).

# Additions
There are plans for this tool to (roughly in priority order):
 * Handle record types `{{a: number, b: string, c}}`
 * **Auto-require()ing types you reference in other files if you don't import them yourself.** When you start type-annotating, sometimes you'll declare a type that is defined in another file but you won't need to require() it manually (e.g. because it's just passed as a function argument). Flow *needs* to know where the type is declared, so you need to import it somehow even if it's a no-op in the code. This tool should be able to automatically do this.
 * Handle type definitions `@typedef`
 * Handle callback type resolution (mapping `@callback` sensibly)
