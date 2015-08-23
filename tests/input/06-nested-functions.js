
/**
 * @param {string} bar
 * @param {Function} fn
 * @return {Function}
 */
function makeMoreFunctions(bar, fn) {
	/**
	 * @param {Object} baz
	 * @return {string}
	 */
	return function(baz) {
		fn();
		/**
		 * @return {string}
		 */
		return function() {
			return bar;
		};
	};
}