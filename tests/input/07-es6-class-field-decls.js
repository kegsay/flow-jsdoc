class Foo {


    /**
     * Oh no a function before the constructor!
     * @param {string=} key Optional key
     * @prop {number} trap It's a trap! This isn't a constructor!
     * @return {?Object}
     */
    baz(key) {
        return null;
    }

    /**
     * Construct a Foo.
     * @property {string} bar
     * @prop {Object[]} bars Support prop tag alias
     */
    constructor(bar) {
        this.bar = bar;
    }

    
}
