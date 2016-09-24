//: (string, string, Promise<Foo>)   :   number
function foo(a, b, c) {
  return 99;
}


//: () : Person
var bar = function() {
  return {};
}


// (number, string): NoColon
var ignore = function(a, b) {

}

/*:(string)*/
function quuz(a) {

}

var obj = {

    //: (string): number
    bar: function(undocumented) {
    	return 42;
    }
};
