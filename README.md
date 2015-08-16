# flow-jsdoc
Use JSDoc to represent Flow annotations

# Usage

*This tool will NOT apply* `/* @flow */` *to the file. You still need to do that!*

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

# What this does
Currently, this tool will only work on functions. It will handle functions represented in the following ways:
 * `function foo(bar) {}`
 * `var foo = function(bar) {}`
 * `ObjClass.prototype.foo = function(bar) {}` - ES5 Classes
 * `class ObjClass { foo(bar) {} }` - ES6 Classes

For each recognised function, the JSDoc tags `@param` and `@return` will be mapped to Flow annotations. This will currently do the following mappings from JSDoc to Flow:
 * `{AnyThingHere}` => `: AnyThingHere` (Name expressions)
 * `{String[]}` => `: Array<String>` (Type applications)
 * `{*}` => `: any` (Any type)
 * `{Object|String}` => `: Object | String` (Type unions)
 * `{string=}` => `: ?string` (Optional params)

This tool will then produce the whole file again with flow annotations included (JSDoc preserved).

# Additions
There are plans for this tool to:
 * Handle module mappings (so you don't need to use `import Foo from "../bar.js"` statements for Flow to recognise imported types)
 * Handle record types `{{a: number, b: string, c}}`
 * Handle nullable types `{?Object}`
 * Handle type definitions `@typedef`
 * Handle the idiom:
 
   ```javascript
    var obj = {
      foo: function(bar) {
        // stuff
      }
    }
   ```
 * Handle callback type resolution (mapping `@callback` sensibly)
 * Add a `-d` option and `--outDir` to the CLI to map entire directories across. 
