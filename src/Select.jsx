if(__BUNDLE__){
	require("./../build/style.css");
}
var classPrefix = require("./classPrefix.js");
var Input = require("./AutosizeInput.jsx");
var classes = require("./ClassNames.js");


var bindEvent = function (name, cb) {
	var doc = document;
	if (!doc.addEventListener && doc.attachEvent) {
		doc.attachEvent("on"+ name, cb);
	} else {
		doc.addEventListener(name, cb);
	}
};

var unbindEvent = function(name, cb){
	var doc = document;
	if (!doc.removeEventListener && doc.detachEvent) {
		doc.detachEvent("on" + name, cb);
	} else {
		doc.removeEventListener(name, cb);
	}
};

var clickedOutsideElement = function(elements, event) {
	var eventTarget = (event.target) ? event.target : event.srcElement;
	if(eventTarget.parentElement== null && eventTarget != document.body.parentElement){
		return false;
	}
	while (eventTarget != null) {
		if (elements.indexOf(eventTarget) != -1) return false;
		eventTarget = eventTarget.parentElement;
	}
	return true;
};

var _closeMenuIfClickedOutside = function(event) {
	var self = this;
	if (!self.state.isOpen) {
		return;
	}
	// Hide dropdown menu if click occurred outside of menu
	if (clickedOutsideElement([React.findDOMNode(self.refs.wrapper)],event)) {
		self.setState({
			isOpen: false
		}, self._unbindCloseMenuIfClickedOutside);
	}
};

window.Select = React.createClass({
	created: [],
	selected: [],
	options: [],
	propTypes: {
		isFocused: React.PropTypes.bool,
		isOpen: React.PropTypes.bool,
		searchable: React.PropTypes.bool,
		disabled: React.PropTypes.bool,
		multi: React.PropTypes.bool,
		menu: React.PropTypes.func,
		match: React.PropTypes.func,
		item: React.PropTypes.func,
		options: React.PropTypes.array,
		selected: React.PropTypes.array,
		created: React.PropTypes.array,
		onChange: React.PropTypes.func,

		placeholderPrompt: React.PropTypes.string,
		nonMatchPrompt: React.PropTypes.string,
	},
	getDefaultProps: function() {
		return {
			menu: function(obj, index){
				return obj.label;
			},
			match: function(obj, index, matchStr){
				return (obj.label.indexOf(matchStr) !== -1) || (obj.value.indexOf(matchStr) !== -1);
			},
			item: function(obj){
				return obj.label;
			},
			isFocused: false,
			isOpen: false,
			searchable: true,
			multi: true,
			disabled: false,
			options: [],
			selected: [],
			created: [],

			placeholderPrompt: "请选择...",
			nonMatchPrompt: "没有查找结果"
		};
	},
	getInitialState: function() {
		var self = this, propArgs = self.props;
		self.selected = self.dealSelected(propArgs.selected, true);
		self.created = propArgs.created;
		return {
			isFocused: propArgs.isFocused,
			isLoading: propArgs.isOpen,
			inputValue: "",
			options: propArgs.options
		};
	},
	componentWillReceiveProps: function(newProps) {
		var self = this, propArgs = self.props;
		if (JSON.stringify(newProps.options) !== JSON.stringify(propArgs.options)) {
			self.selected = self.dealSelected(propArgs.selected, true);
			self.created = propArgs.created;
		}
		self.forceUpdate();
	},
	dealSelected: function(selected, retIndex){
		var self = this, res = [];
		selected.forEach(function(index, i){
			if(typeof index === "number"){
				index = index % self.props.options.length;
				res.push(retIndex ? index : self.props.options[index]);
			} else if(typeof index === "object"){
				var _i = self.props.options.indexOf(index);
				if(_i!==-1){
					res.push(retIndex ? _i : index);
				}
			}
		});
		return res;
	},
	creatMenu: function(matchStr){
		var self = this, matches = [];
		matchStr = matchStr || "";
		self.props.options.forEach(function(value, index){
			if(self.selected.indexOf(index) === -1 && (!matchStr.length || self.props.match(value, index, matchStr))){
				matches.push(<div className={classPrefix + "option"} key={index} onClick={self.selectOption.bind(self, value, index)}>
							{self.props.menu(value, index)}
						</div>);
			}
		});
		return <div className={classPrefix + "menu-outer"}>
					<div className={classPrefix + "menu"}>
					{matches.length ? matches : <div className={classPrefix + "noresults"}>{self.props.nonMatchPrompt}</div>}
					</div>
				</div>
	},
	selectOption: function(value, index, event){
		event.stopPropagation();
		event.preventDefault();
		var self = this;
		if (self.props.disabled) return;
		if(self.props.multi) {
			self.selected.push(index);
		} else {
			self.selected = [index];
		}
		self.setState({
			inputValue : ""
		});
		self.dealChange();
	},
	dealChange: function(){
		var self = this;
		self.props.onChange(JSON.parse(JSON.stringify(self.dealSelected(self.selected))), JSON.parse(JSON.stringify(self.created)));
	},
	createItems: function(){
		var self = this;
		var selected = self.selected.map(function(value, index){
			var item = self.props.options[value];
			return <div className={classPrefix + "item"} key={index} onClick={self.inputFocus}>
						<span className={classPrefix + "item-icon"} onClick={self.removeItem.bind(self, item, index)}>×</span>
						<span className={classPrefix + "item-label"}>{self.props.item(item)}</span>
					</div>;
		}, self);
		var created = self.created.map(function(item, index){
			return <div className={classPrefix + "item"} key={index} onClick={self.inputFocus}>
						<span className={classPrefix + "item-icon"} onClick={self.removeCreate.bind(self, item, index)}>×</span>
						<span className={classPrefix + "item-label"}>{self.props.item(item)}</span>
					</div>;
		}, self);
		return selected.concat(created);
	},
	removeItem: function(item, index, event){
		event.stopPropagation();
		event.preventDefault();
		var self = this;
		if (self.props.disabled) return;
		self.selected.splice(index,1);
		self.forceUpdate();
		self.dealChange();
	},
	removeCreate: function(item, index, event){
		event.stopPropagation();
		event.preventDefault();
		var self = this;
		if (self.props.disabled) return;
		self.created.splice(index,1);
		self.forceUpdate();
	},
	inputFocus: function(event){
		event.stopPropagation();
		event.preventDefault();
		var self = this;
		if (self.props.disabled) return;
		if(self.props.searchable){
			self.refs.input.focus();
		} else {
			self.setState({
				isFocused: self.props.searchable,
				isOpen: true
			}, self.bindOutside);
		}
	},
	bindOutside: function() {
		bindEvent("click", _closeMenuIfClickedOutside.bind(this));
	},

	unbindOutside: function() {
		unbindEvent("click", _closeMenuIfClickedOutside.bind(this));
	},
	createInput: function(){
		var self = this;
		return <Input value={self.state.inputValue} 
					ref="input"
					onChange={self.onInputChange} 
					onFocus={function(){
						self.setState({
							isFocused: true,
							isOpen: true
						}, self.bindOutside);
					}}
					onBlur={function(){
						if(!self.state.inputValue.length){
							self.setState({
								isFocused: false
							});
						}
					}}
					className={classPrefix + "input"}
					tabIndex={self.props.tabIndex || 0}
					minWidth="5" />;
	},
	onInputChange: function(event){
		var self = this;
		if (self.props.disabled) return;
		var value = event.target.value;
		self.setState({
			inputValue: React.findDOMNode(self.refs.input.refs.input).value
		});
	},
	createDummyInput: function(){
		return <div ref="input" className={classPrefix + "input"} onClick={this.inputFocus} style={{display:"inline-block"}}>
					&nbsp;
				</div>;
	},
	createHolder: function(str){
		str = str || this.props.placeholderPrompt;
		return <div className={classPrefix + "placeholder"} onClick={this.inputFocus} dangerouslySetInnerHTML={{ __html: str }}></div>;
	},
	clearValue: function(event){
		event.stopPropagation();
		event.preventDefault();
		var self = this;
		if (self.props.disabled) return;
		self.selected = [];
		self.created = [];
		self.setState({
			inputValue: ""
		});
		self.dealChange();
	},
	menuToggle: function(event){
		event.stopPropagation();
		event.preventDefault();
		var self = this;
		if (self.props.disabled) return;
		self.setState({
			isOpen: !self.state.isOpen
		});
	},
	handleKeyDown: function(event){
		var self = this;
		if (self.props.disabled) return;

		switch (event.keyCode) {

			case 8: // backspace
				if(!self.state.inputValue.length){
					self.selected.splice(self.selected.length - 1, 1);
					self.forceUpdate();
				}
				return;

			case 9: // tab
				if (event.shiftKey || !self.state.isOpen || !self.state.focusedOption) {
					return;
				}
				break;

			case 13: // enter
				if (!self.state.isOpen) return;
				break;

			case 27: // escape
				if(self.state.isFocused){
					self.clearValue(event);
				}
				break;

			case 38: // up
				if(self.state.isFocused){
					
				}
				break;

			case 40: // down
				if(self.state.isFocused){
					
				}
				break;

			case 188: // ,
				if (self.state.isFocused && self.props.allowCreate && self.props.multi) {
					event.preventDefault();
					event.stopPropagation();
					
				} else {
					return;
				}
				break;

			default: return;
		}

		event.preventDefault();
	},
	render:function(){
		var self = this, propArgs = self.props, stateArgs = self.state;
		var control, hasValue = self.selected.length + self.created.length;
		var selectClass = classes('select', self.props.className, {
			'is-multi': propArgs.multi && hasValue,
			'is-searchable': propArgs.searchable,
			'is-open': stateArgs.isOpen,
			'is-focused': stateArgs.isFocused,
			'is-loading': stateArgs.isLoading,
			'is-disabled': propArgs.disabled,
			'has-value': self.selected.length + self.created.length
		});
		if(propArgs.multi){
			control = <div className={classPrefix + "control"} onClick={self.inputFocus} onKeyDown={self.handleKeyDown}>
				{hasValue ? self.createItems() : null}
				{propArgs.searchable ? self.createInput() : self.createDummyInput()}
				{hasValue || stateArgs.inputValue.length ? null : self.createHolder()}
				<span className={classPrefix + "arrow"} onClick={self.menuToggle}></span>
				{hasValue ? <span className={classPrefix + "clear"} onClick={self.clearValue}>×</span> : null}
			</div>;
		} else {
			var value = self.selected.length ? propArgs.item(propArgs.options[self.selected[0]]) : (
					self.created.length ? propArgs.item(propArgs.options[self.created[0]]) : null
				);
			control = <div className={classPrefix + "control"} onClick={self.inputFocus} onKeyDown={self.handleKeyDown}>
				{hasValue ? self.createHolder(stateArgs.inputValue.length ? "&nbsp;" : value) : null}
				{propArgs.searchable ? self.createInput() : self.createDummyInput()}
				{hasValue || stateArgs.inputValue.length ? null : self.createHolder()}
				<span className={classPrefix + "arrow"} onClick={self.menuToggle}></span>
				{hasValue ? <span className={classPrefix + "clear"} onClick={self.clearValue}>×</span> : null}
			</div>;
		}
		return <div className={selectClass} ref="wrapper">
					{control}
					{stateArgs.isOpen ? self.creatMenu(stateArgs.inputValue): null}
				</div>;
	}
});