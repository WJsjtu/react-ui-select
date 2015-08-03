var sizerStyle = { position: 'absolute', visibility: 'hidden', height: 0, width: 0, overflow: 'scroll', whiteSpace: 'nowrap' };

module.exports = React.createClass({
	propTypes: {
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
	},
	getDefaultProps: function () {
		return {
			minWidth: 1
		};
	},
	getInitialState: function () {
		return {
			inputWidth: this.props.minWidth
		};
	},
	componentDidMount: function () {
		this.copyInputStyles();
		this.updateInputWidth();
	},
	componentDidUpdate: function () {
		this.updateInputWidth();
	},
	copyInputStyles: function () {
		var self = this;
		if (!self.isMounted() || !window.getComputedStyle) {
			return;
		}
		var inputStyle = window.getComputedStyle(React.findDOMNode(this.refs.input));
		var widthNode = React.findDOMNode(this.refs.sizer);
		widthNode.style.fontSize = inputStyle.fontSize;
		widthNode.style.fontFamily = inputStyle.fontFamily;
		if (self.props.placeholder) {
			var placeholderNode = React.findDOMNode(this.refs.placeholderSizer);
			placeholderNode.style.fontSize = inputStyle.fontSize;
			placeholderNode.style.fontFamily = inputStyle.fontFamily;
		}
	},
	updateInputWidth: function () {
		var self = this;
		if (!self.isMounted() || typeof React.findDOMNode(this.refs.sizer).scrollWidth === 'undefined') {
			return;
		}
		var newInputWidth;
		if (self.props.placeholder) {
			newInputWidth = Math.max(React.findDOMNode(this.refs.sizer).scrollWidth, React.findDOMNode(this.refs.placeholderSizer).scrollWidth) + 2;
		} else {
			newInputWidth = React.findDOMNode(this.refs.sizer).scrollWidth + 2;
		}
		if (newInputWidth < self.props.minWidth) {
			newInputWidth = self.props.minWidth;
		}
		if (newInputWidth !== self.state.inputWidth) {
			self.setState({
				inputWidth: newInputWidth
			});
		}
	},
	getInput: function () {
		return this.refs.input;
	},
	focus: function () {
		React.findDOMNode(this.refs.input).focus();
	},
	select: function () {
		React.findDOMNode(this.refs.input).select();
	},
	render: function () {
		var escapedValue = (this.props.value || '').replace(/\&/g, '&amp;')
													.replace(/ /g, '&nbsp;')
													.replace(/\</g, '&lt;')
													.replace(/\>/g, '&gt;');
		var wrapperStyle = this.props.style || {};
		wrapperStyle.display = 'inline-block';
		var inputStyle = this.props.inputStyle || {};
		inputStyle.width = this.state.inputWidth;
		var placeholder = this.props.placeholder ? <div ref="placeholderSizer" style={sizerStyle}>{this.props.placeholder}</div> : null;
		return (
			<div className={this.props.className} style={wrapperStyle}>
				<input {...this.props} ref="input" className={this.props.inputClassName} style={inputStyle} />
				<div ref="sizer" style={sizerStyle} dangerouslySetInnerHTML={{ __html: escapedValue }} />
				{placeholder}
			</div>
		);
	}
});
