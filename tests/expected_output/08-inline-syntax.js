//: (string, string, Promise<Foo>)   :   number
function foo(a: string, b: string, c: Promise<Foo>) : number {
  return 99;
}


//: () : Person
var bar = function() : Person {
  return {};
}


// (number, string): NoColon
var ignore = function(a, b) {

}

/*:(string)*/
function quuz(a: string) {

}

var obj = {

    //: (string): number
    bar: function(undocumented: string) : number {
    	return 42;
    }
};
