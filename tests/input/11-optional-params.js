/**
 * @param {string} foo
 * @param {string} [bar]
 * @param {string=} baz some blurb
 * @param {string} [quuz=Nope Nope Nope] more blurb
 * @return {number}
 */
function allTheOptionalForms(foo, bar, baz, quuz) {
	return 4;
};

/**
 * @param {string} foo
 * @param {string} [bar]
 * @param {string=} baz some blurb
 * @param {string} [quuz=Nope Nope Nope] more blurb
 * @return {number}
 */
function allTheOptionalFormsWithDefaults(foo, bar, baz = 'Nope', quuz = 'Nope Nope Nope') {
	return 4;
};

/**
 * @param {number} foo
 * @return {number}
 */
function optionalParamWithWrongJSdoc(foo = '4') {
	return Number(foo);
};