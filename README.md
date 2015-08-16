# flow-jsdoc
Use JSDoc to represent Flow annotations

# Usage

## Via imports
```javascript
 var flowJsdoc = require("flow-jsdoc");
 var fileContents = // extract your file contents e.g. via 'fs'
 var opts = {
 // no options yet!
 };
 var annotatedContents = flowJsdoc(fileContents, opts);
 // write out annotated contents to file
```

## CLI
```
 $ npm install
 $ npm install nopt
 $ node app.js -f path/to/file.js
# annotated file prints to stdout
```

# Mappings
Currently, this tool will only work on functions. It will handle functions represented in the following ways:
 * `function foo(bar) {}`
 * `var foo = function(bar) {}`
 * `ObjClass.prototype.foo = function(bar) {}` - ES5 Classes
 * `class ObjClass { foo(bar) {} }` - ES6 Classes

This will currently do the following mappings from JSDoc to Flow:
 * `{AnyThingHere}` => `: AnyThingHere`
 * `{String[]}` => `: Array<String>`
 * `{*}` => `: any`
 * `{Object|String}` => `: Object | String`
 * `{string=}` => `: ?string`

# Additions
There are plans for this tool to:
 * Handle module mappings (so you don't need to use Flow `import Foo from "../bar.js"` statements for types)
 * Handle callback type resolution (mapping `@callback` sensibly)
