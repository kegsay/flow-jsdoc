# flow-jsdoc
Use JSDoc to represent Flow annotations. The goal of this project is to make type checking as easy as running a linter, so you can take any project and run the following to get type errors:
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
Currently, this tool will only work on functions. It will handle functions represented in the following ways:
 * `function foo(bar) {}`
 * `var foo = function(bar) {}`
 * `var obj = { foo: function(bar) {}`
 * `ObjClass.prototype.foo = function(bar) {}` - ES5 Classes
 * `class ObjClass { foo(bar) {} }` - ES6 Classes

For each recognised function, the JSDoc tags `@param` and `@return` will be mapped to Flow annotations. This will currently do the following mappings from JSDoc to Flow:
 * `{AnyThingHere}` => `: AnyThingHere` (Name expressions)
 * `{String[]}` => `: Array<String>` (Type applications)
 * `{*}` => `: any` (Any type)
 * `{Object|String}` => `: Object | String` (Type unions)
 * `{string=}` => `: ?string` (Optional params)
 * `{?string}` => `: ?string` (Nullable types)

This tool will then produce the whole file again with flow annotations included (JSDoc preserved).

# Additions
There are plans for this tool to (roughly in priority order):
 * **Support ES5 prototype classes.** Flow has limited support for prototype classes. It handles stuff assigned to the `prototype` but not properties which are assigned to `this`. Flow has "field type declarations" which declares the set of properties which will appear on `this`. However, their syntax only supports ES6 classes. JSDoc already has a syntax for setting properties: `@name Class#member`. This tool should be able to convert those docs into something parsable by Flow.
 * Handle record types `{{a: number, b: string, c}}`
 * **Auto-require()ing types you reference in other files if you don't import them yourself.** When you start type-annotating, sometimes you'll declare a type that is defined in another file but you won't need to require() it manually (e.g. because it's just passed as a function argument). Flow *needs* to know where the type is declared, so you need to import it somehow even if it's a no-op in the code. This tool should be able to automatically do this.
 * Handle type definitions `@typedef`
 * Handle callback type resolution (mapping `@callback` sensibly)
