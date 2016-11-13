thingWithCallback(
    /**
     * @param {Foobar[]} bar A foobar array
     * @param {Function} baz
     * @return {number}
     */
    (bar: Array<Foobar>, baz: Function) : number => {
        return 42;
    }
);

const obj = {

    /**
     * @function
     * @param {string} a
     * @param {string} b
     * @return {number}
     */
    func: (a: string, b: string) : number => {
        return 1;
    },

};