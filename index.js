"use strict";

var falafel = require("./lib/falafel");
var doctrine = require("doctrine"); // JSDoc parsing
var fs = require("fs");
var util = require("util");

function jsdocTagToFlowTag(tag) {
    // console.log(util.inspect(tag));
    return {
        loc: tag.title, //param|return
        name: tag.name, // the parameter name
        type: jsdocTypeToFlowType(tag.type) // the parameter type
    };
}

/**
 * Extract formatted JSDoc from a comment.
 * @param {String} comment The comment which may have JSDoc in it.
 * @return {Object} With 'params' and 'return' arrays which have 'loc', 'name'
 * and 'type' elements.
 */
function extractJsdoc(comment) {
    var docAst = doctrine.parse(comment, { unwrap: true });
    if (!docAst.tags) {
        return null;
    }
    // only interested in @param @property, and @return
    var paramTags = docAst.tags.filter(function(tag) {
        return tag.title === "param";
    }).map(jsdocTagToFlowTag);

    var returnTags = docAst.tags.filter(function(tag) {
        return tag.title === "return";
    }).map(jsdocTagToFlowTag);

    var propTags = docAst.tags.filter(function(tag) {
        return tag.title === "property" || tag.title === "prop";
    }).map(jsdocTagToFlowTag);

    return {
        params: paramTags,
        returns: returnTags,
        props: propTags
    };
}

function jsdocTypeToFlowType(jsdocType) {
    if (!jsdocType || !jsdocType.type) {
        return;
    }
    switch(jsdocType.type) {
        case "NameExpression": // {string}
            return jsdocType.name;
        case "TypeApplication": // {Foo<Bar>}
            // e.g. 'Array' in Array<String>
            var baseType = jsdocTypeToFlowType(jsdocType.expression);
            // Flow only supports single types for generics
            var specificType = jsdocTypeToFlowType(jsdocType.applications[0]);
            if (baseType && specificType) {
                return baseType + "<" + specificType + ">";
            }
            break;
        case "UnionType": // {(Object|String)}
            var types = jsdocType.elements.map(function(t) {
                return jsdocTypeToFlowType(t);
            });
            return types.join(" | ");
        case "AllLiteral": // {*}
            return "any";
        case "OptionalType": // {string=}
        case "NullableType": // {?string}
            return "?" + jsdocTypeToFlowType(jsdocType.expression);
        default:
            // console.log("Unknown jsdoc type: %s", JSON.stringify(jsdocType));
            break;
    }
}

/**
 * Retrieve a function node along with parsed JSDoc comments for it.
 * @param {Node} node The node to inspect.
 * @return {?Object} An object with "jsdoc" and "node" keys, or null.
 */
function getCommentedFunctionNode(node) {
    if (!node.leadingComments) {
        // JSDoc comments are always before the function, so if there is
        // nothing here, we ain't interested.
        return null;
    }
    // console.log("=================");
    // console.log("type: " + node.type);
    // console.log(util.inspect(node));
    /*
     * We handle 5 different function representations:
     *
     *     Type               Path to Function              Example
     * ==========================================================================================
     * FunctionDeclaration           -                  function foo(bar) {}
     * VariableDeclaration   .declarations[0].init      var foo = function(bar) {}
     * ExpressionStatement   .expression.right          ObjClass.prototype.foo = function(bar) {}
     * MethodDefinition      .value                     class ObjClass { foo(bar) {} }
     * Property              .value                     var obj = { key: function(bar) {} }
     * ReturnStatement       .argument                  return function(foo, bar) {}
     */
    var nodeTypes = [
        "FunctionDeclaration", "ExpressionStatement", "VariableDeclaration",
        "MethodDefinition", "Property", "ReturnStatement"
    ];
    if (nodeTypes.indexOf(node.type) === -1) {
        return null;
    }
    var funcNode = null;
    switch (node.type) {
        case "FunctionDeclaration":
            funcNode = node;
            break;
        case "VariableDeclaration":
            funcNode = node.declarations[0].init;
            break;
        case "ExpressionStatement":
            funcNode = node.expression.right;
            break;
        case "MethodDefinition":
            funcNode = node.value;
            break;
        case "Property":
            funcNode = node.value;
            break;
        case "ReturnStatement":
            funcNode = node.argument;
            break;
    }
    var funcNodeTypes = ["FunctionDeclaration", "FunctionExpression"];
    if (!funcNode || funcNodeTypes.indexOf(funcNode.type) === -1) {
        // We can't find a function here which can map to leadingComments.
        return null;
    }
    var funcDocs = null;
    for (var i=0; i<node.leadingComments.length; i++) {
        if (node.leadingComments[i].type === "Block") {
            funcDocs = extractJsdoc(node.leadingComments[i].value);
            break;
        }
    }

    return {
        node: funcNode,
        jsdoc: funcDocs
    };
}

/**
 * Retrieve an ES6 class node along with parsed JSDoc comments from the constructor().
 * @param {Node} node The node to inspect.
 * @return {?Object} An object with "jsdoc" and "node" keys, or null.
 */
function getCommentedClassNode(node) {
    if (node.type !== "ClassBody") {
        return null;
    }
    // look for a constructor() and then look for property tags which we can annotate with.
    var constructNode = null;
    for (var i = 0; i < node.body.length; i++) {
        if (node.body[i].kind === "constructor" && node.body[i].type === "MethodDefinition") {
            constructNode = node.body[i];
        }
    }

    if (!constructNode) {
        return null;
    }

    // check for @property JSDoc
    var constructDocs = null;
    for (var i=0; i<constructNode.leadingComments.length; i++) {
        if (constructNode.leadingComments[i].type === "Block") {
            constructDocs = extractJsdoc(constructNode.leadingComments[i].value);
            break;
        }
    }
    return {
        node: node,
        jsdoc: constructDocs
    };
}

function decorateFunctions(node) {
    var i;
    var funcNode = getCommentedFunctionNode(node);
    if (!funcNode || !funcNode.jsdoc) {
        return;
    }

    // Pair up the function params with the JSDoc params (if they exist)
    funcNode.node.params.forEach(function(param) {
        for (i = 0; i < funcNode.jsdoc.params.length; i++) {
            if (funcNode.jsdoc.params[i].name === param.name &&
                    funcNode.jsdoc.params[i].type) {
                // replace the function param name with the type annotated param
                param.update(
                    param.source() + ": " + funcNode.jsdoc.params[i].type
                );
            }
        }
    });

    // Pair up the return value if possible
    // we only support 1 return type currently
    var returnDoc = funcNode.jsdoc.returns[0];
    if (returnDoc && returnDoc.type && funcNode.node.body) {
        funcNode.node.body.update(
            ": " + returnDoc.type + " " + funcNode.node.body.source()
        );
    }
}

function decorateClasses(node) {
    // check for class nodes
    var clsNode = getCommentedClassNode(node);
    if (!clsNode || !clsNode.jsdoc || clsNode.jsdoc.props.length === 0) {
        return;
    }

    var clsSrc = clsNode.node.source();
    if (clsSrc[0] !== "{") {
        // something isn't right, bail.
        return;
    }

    // work out line endings (find first \n and see if it has \r before it)
    var nl = "\n";
    var newlineIndex = clsSrc.indexOf("\n");
    if (clsSrc[newlineIndex-1] === "\r") {
        nl = "\r\n";
    }

    // use the same indent as the next non-blank line
    var indent = "";
    var lines = clsSrc.split(nl);
    for (var i = 1; i < lines.length; i++) { //i=1 to skip the starting {
        if (lines[i].length > 0) {
            var whitespaceMatch = /^[ \t]+/.exec(lines[i]); // match spaces or tabs
            if (whitespaceMatch) {
                indent = whitespaceMatch[0];
                break;
            }
        }
    }

    // work out what to inject into the class definition
    var fieldTypeDecls = clsNode.jsdoc.props.map(function(p) {
        return indent + p.name + ": " + p.type + ";";
    }).join(nl);

    clsNode.node.update("{" + nl + fieldTypeDecls + clsSrc.substr(1));
    return;
}

module.exports = function(src, opts) {
    opts = opts || {};

    // Esprima has an undocumented 'attachComment' option which binds comments
    // to the nodes in the AST
    var output = falafel(src, {attachComment: true}, function (node) {
        decorateFunctions(node);
        decorateClasses(node);
    });

    return output;
};
