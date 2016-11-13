thingWithCallback(
    /**
     * @param {Foobar[]} bar A foobar array
     * @param {Function} baz
     * @return {number}
     */
    (bar, baz) => {
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
    func: (a, b) => {
        return 1;
    },

};