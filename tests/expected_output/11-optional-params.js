/**
 * @param {string} foo
 * @param {string} [bar]
 * @param {string=} baz some blurb
 * @param {string} [quuz=Nope Nope Nope] more blurb
 * @return {number}
 */
function allTheOptionalForms(foo: string, bar: ?string, baz: ?string, quuz: ?string) : number {
	return 4;
};

/**
 * @param {string} foo
 * @param {string} [bar]
 * @param {string=} baz some blurb
 * @param {string} [quuz=Nope Nope Nope] more blurb
 * @return {number}
 */
function allTheOptionalFormsWithDefaults(foo: string, bar: ?string, baz: string = 'Nope', quuz: string = 'Nope Nope Nope') : number {
	return 4;
};

/**
 * @param {number} foo
 * @return {number}
 */
function optionalParamWithWrongJSdoc(foo: number = '4') : number {
	return Number(foo);
};