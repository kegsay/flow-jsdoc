import React from "react";

class Foo {

	/**
	 * @return {boolean} Always true
	 */
	canParseJsx() : boolean {
		return true;
	}

	render() {
		return <div>
		Hello world!
		<br />
		<a href="https://github.com">Click here!</a>
		</div>
	}
}

