import React from "react";

class Foo {

	/**
	 * @return {boolean} Always true
	 */
	canParseJsx() {
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

