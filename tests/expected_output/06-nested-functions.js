
/**
 * @param {string} bar
 * @param {Function} fn
 * @return {Function}
 */
function makeMoreFunctions(bar: string, fn: Function) : Function {
	/**
	 * @param {Object} baz
	 * @return {string}
	 */
	return function(baz: Object) : string {
		fn();
		/**
		 * @return {string}
		 */
		return function() : string {
			return bar;
		};
	};
}