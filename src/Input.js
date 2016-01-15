import React, { Component } from 'react';
import Dom from './dom';

const sizerStyle = {
	position: 'absolute',
	visibility: 'hidden',
	height: 0,
	width: 0,
	overflow: 'scroll',
	whiteSpace: 'nowrap'
};

const inputRef = "input";
const sizerRef = "sizer";
const placeholderRef = "placeholder";

export default class Input extends Component {
	
	constructor(props) {
    	super(props);
    	this.state = {
    		mounted: false,
    		inputWidth: props.minWidth
    	};
    }

	componentDidMount() {
		this.setState({ mounted: true });
		this.copyInputStyles();
		this.updateInputWidth();
	}

	componentWillUnmount() {
		this.setState({ mounted: false });
	}

	componentDidUpdate() {
		this.updateInputWidth();
	}

	copyInputStyles() {

		if (!this.state.mounted || !window.getComputedStyle) {
			return;
		}

		let inputStyle = window.getComputedStyle(Dom(this, inputRef));
		let {fontSize, fontFamily} = inputStyle;

		let widthNode = Dom(this, sizerRef);
		Object.assign(widthNode.style, {
			fontSize: fontSize,
			fontFamily: fontFamily
		});

		if (this.props.placeholder) {
			let placeholderNode = Dom(this, placeholderRef);
			Object.assign(placeholderNode.style, {
				fontSize: fontSize,
				fontFamily: fontFamily
			});
		}
	}

	updateInputWidth() {

		if (!this.state.mounted || typeof Dom(this, sizerRef).scrollWidth === 'undefined') {
			return;
		}

		let newInputWidth;
		if (this.props.placeholder) {
			newInputWidth = Math.max(Dom(this, sizerRef).scrollWidth, Dom(this, placeholderRef).scrollWidth) + 2;
		} else {
			newInputWidth = Dom(this, sizerRef).scrollWidth + 2;
		}

		if (newInputWidth < this.props.minWidth) {
			newInputWidth = this.props.minWidth;
		}

		if (newInputWidth !== this.state.inputWidth) {
			this.setState({
				inputWidth: newInputWidth
			});
		}
	}

	focus() {
		Dom(this, inputRef).focus();
	}

	select() {
		Dom(this, inputRef).select();
	}

	render() {

		let escapedValue = (this.props.value || '').replace(/\&/g, '&amp;').replace(/ /g, '&nbsp;').replace(/\</g, '&lt;').replace(/\>/g, '&gt;');
		
		let wrapperStyle = Object.assign(this.props.style || {}, {
			display: 'inline-block'
		});

		let inputStyle = Object.assign(this.props.inputStyle || {}, {
			width: this.state.inputWidth
		});

		return (
			<div className={this.props.className} style={wrapperStyle}>
				<input {...this.props} ref={inputRef} className={this.props.inputClassName} style={inputStyle} />
				<div ref={sizerRef} style={sizerStyle} dangerouslySetInnerHTML={{ __html: escapedValue }} />
				{this.props.placeholder ? <div ref={placeholderRef} style={sizerStyle}>{this.props.placeholder}</div> : null}
			</div>
		);
	}
}

Input.propTypes = {
	value: React.PropTypes.any,                 // field value
	defaultValue: React.PropTypes.any,          // default field value
	onChange: React.PropTypes.func,             // onChange handler: function(newValue) {}
	style: React.PropTypes.object,              // css styles for the outer element
	className: React.PropTypes.string,          // className for the outer element
	minWidth: React.PropTypes.oneOfType([       // minimum width for input element
		React.PropTypes.number,
		React.PropTypes.string
	]),
	inputStyle: React.PropTypes.object,         // css styles for the input element
	inputClassName: React.PropTypes.string      // className for the input element
};

Input.defaultProps = {minWidth: 1};