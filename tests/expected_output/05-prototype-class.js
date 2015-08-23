function Foo() {
	this.data = {}
}

/**
 * Bar
 * @param {boolean} baz
 * @return {Object}
 */
Foo.prototype.bar = function(baz: boolean) : Object {
	return this.data;
};
