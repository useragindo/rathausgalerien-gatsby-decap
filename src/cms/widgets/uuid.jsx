import React, { Component, createRef } from "react";

const uuidv4 = () =>
	"xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
		const r = (Math.random() * 16) | 0;
		const v = c === "x" ? r : (r & 0x3) | 0x8;

		return v.toString(16);
	});

class UUID extends Component {
	_ref = createRef();

	componentDidMount() {
		const element = this._ref.current;

		if (element?.parentNode) {
			element.parentNode.style.display = "none";
		}

		this._initializeUuid(this.props);
	}

	componentDidUpdate() {
		this._initializeUuid(this.props);
	}

	render() {
		const { value } = this.props;

		return <span ref={this._ref}>{value}</span>;
	}

	_initializeUuid({ value, onChange }) {
		if (!value) {
			onChange(uuidv4());
		}
	}
}

export default UUID;
