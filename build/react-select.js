/**
 * react-ui-select v0.1.0 A flexible select component using Facebook React.
 * Repository git@github.com:WJsjtu/react-ui-select.git
 * Homepage http://wjsjtu.github.io/react-ui-select/
 * Copyright 2015 王健（Jason Wang）
 * Licensed under the MIT License
 */

/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	if (false) {
		require("./../build/style.css");
	}
	var classPrefix = __webpack_require__(1);
	var Input = __webpack_require__(2);
	var classes = __webpack_require__(3);

	var bindEvent = function bindEvent(name, cb) {
		var doc = document;
		if (!doc.addEventListener && doc.attachEvent) {
			doc.attachEvent("on" + name, cb);
		} else {
			doc.addEventListener(name, cb);
		}
	};

	var unbindEvent = function unbindEvent(name, cb) {
		var doc = document;
		if (!doc.removeEventListener && doc.detachEvent) {
			doc.detachEvent("on" + name, cb);
		} else {
			doc.removeEventListener(name, cb);
		}
	};

	var clickedOutsideElement = function clickedOutsideElement(elements, event) {
		var eventTarget = event.target ? event.target : event.srcElement;
		if (eventTarget.parentElement == null && eventTarget != document.body.parentElement) {
			return false;
		}
		while (eventTarget != null) {
			if (elements.indexOf(eventTarget) != -1) return false;
			eventTarget = eventTarget.parentElement;
		}
		return true;
	};

	var _closeMenuIfClickedOutside = function _closeMenuIfClickedOutside(event) {
		var self = this;
		if (!self.state.isOpen) {
			return;
		}
		// Hide dropdown menu if click occurred outside of menu
		if (clickedOutsideElement([React.findDOMNode(self.refs.wrapper)], event)) {
			self.setState({
				isOpen: false
			}, self._unbindCloseMenuIfClickedOutside);
		}
	};

	window.Select = React.createClass({
		displayName: "Select",

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
			nonMatchPrompt: React.PropTypes.string
		},
		getDefaultProps: function getDefaultProps() {
			return {
				menu: function menu(obj, index) {
					return obj.label;
				},
				match: function match(obj, index, matchStr) {
					return obj.label.indexOf(matchStr) !== -1 || obj.value.indexOf(matchStr) !== -1;
				},
				item: function item(obj) {
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
		getInitialState: function getInitialState() {
			var self = this,
			    propArgs = self.props;
			self.selected = self.dealSelected(propArgs.selected, true);
			self.created = propArgs.created;
			return {
				isFocused: propArgs.isFocused,
				isLoading: propArgs.isOpen,
				inputValue: "",
				options: propArgs.options
			};
		},
		componentWillReceiveProps: function componentWillReceiveProps(newProps) {
			var self = this,
			    propArgs = self.props;
			if (JSON.stringify(newProps.options) !== JSON.stringify(propArgs.options)) {
				self.selected = self.dealSelected(propArgs.selected, true);
				self.created = propArgs.created;
			}
			self.forceUpdate();
		},
		dealSelected: function dealSelected(selected, retIndex) {
			var self = this,
			    res = [];
			selected.forEach(function (index, i) {
				if (typeof index === "number") {
					index = index % self.props.options.length;
					res.push(retIndex ? index : self.props.options[index]);
				} else if (typeof index === "object") {
					var _i = self.props.options.indexOf(index);
					if (_i !== -1) {
						res.push(retIndex ? _i : index);
					}
				}
			});
			return res;
		},
		creatMenu: function creatMenu(matchStr) {
			var self = this,
			    matches = [];
			matchStr = matchStr || "";
			self.props.options.forEach(function (value, index) {
				if (self.selected.indexOf(index) === -1 && (!matchStr.length || self.props.match(value, index, matchStr))) {
					matches.push(React.createElement(
						"div",
						{ className: classPrefix + "option", key: index, onClick: self.selectOption.bind(self, value, index) },
						self.props.menu(value, index)
					));
				}
			});
			return React.createElement(
				"div",
				{ className: classPrefix + "menu-outer" },
				React.createElement(
					"div",
					{ className: classPrefix + "menu" },
					matches.length ? matches : React.createElement(
						"div",
						{ className: classPrefix + "noresults" },
						self.props.nonMatchPrompt
					)
				)
			);
		},
		selectOption: function selectOption(value, index, event) {
			event.stopPropagation();
			event.preventDefault();
			var self = this;
			if (self.props.disabled) return;
			if (self.props.multi) {
				self.selected.push(index);
			} else {
				self.selected = [index];
			}
			self.setState({
				inputValue: ""
			});
			self.dealChange();
		},
		dealChange: function dealChange() {
			var self = this;
			self.props.onChange(JSON.parse(JSON.stringify(self.dealSelected(self.selected))), JSON.parse(JSON.stringify(self.created)));
		},
		createItems: function createItems() {
			var self = this;
			var selected = self.selected.map(function (value, index) {
				var item = self.props.options[value];
				return React.createElement(
					"div",
					{ className: classPrefix + "item", key: index, onClick: self.inputFocus },
					React.createElement(
						"span",
						{ className: classPrefix + "item-icon", onClick: self.removeItem.bind(self, item, index) },
						"×"
					),
					React.createElement(
						"span",
						{ className: classPrefix + "item-label" },
						self.props.item(item)
					)
				);
			}, self);
			var created = self.created.map(function (item, index) {
				return React.createElement(
					"div",
					{ className: classPrefix + "item", key: index, onClick: self.inputFocus },
					React.createElement(
						"span",
						{ className: classPrefix + "item-icon", onClick: self.removeCreate.bind(self, item, index) },
						"×"
					),
					React.createElement(
						"span",
						{ className: classPrefix + "item-label" },
						self.props.item(item)
					)
				);
			}, self);
			return selected.concat(created);
		},
		removeItem: function removeItem(item, index, event) {
			event.stopPropagation();
			event.preventDefault();
			var self = this;
			if (self.props.disabled) return;
			self.selected.splice(index, 1);
			self.forceUpdate();
			self.dealChange();
		},
		removeCreate: function removeCreate(item, index, event) {
			event.stopPropagation();
			event.preventDefault();
			var self = this;
			if (self.props.disabled) return;
			self.created.splice(index, 1);
			self.forceUpdate();
		},
		inputFocus: function inputFocus(event) {
			event.stopPropagation();
			event.preventDefault();
			var self = this;
			if (self.props.disabled) return;
			if (self.props.searchable) {
				self.refs.input.focus();
			} else {
				self.setState({
					isFocused: self.props.searchable,
					isOpen: true
				}, self.bindOutside);
			}
		},
		bindOutside: function bindOutside() {
			bindEvent("click", _closeMenuIfClickedOutside.bind(this));
		},

		unbindOutside: function unbindOutside() {
			unbindEvent("click", _closeMenuIfClickedOutside.bind(this));
		},
		createInput: function createInput() {
			var self = this;
			return React.createElement(Input, { value: self.state.inputValue,
				ref: "input",
				onChange: self.onInputChange,
				onFocus: function () {
					self.setState({
						isFocused: true,
						isOpen: true
					}, self.bindOutside);
				},
				onBlur: function () {
					if (!self.state.inputValue.length) {
						self.setState({
							isFocused: false
						});
					}
				},
				className: classPrefix + "input",
				tabIndex: self.props.tabIndex || 0,
				minWidth: "5" });
		},
		onInputChange: function onInputChange(event) {
			var self = this;
			if (self.props.disabled) return;
			var value = event.target.value;
			self.setState({
				inputValue: React.findDOMNode(self.refs.input.refs.input).value
			});
		},
		createDummyInput: function createDummyInput() {
			return React.createElement(
				"div",
				{ ref: "input", className: classPrefix + "input", onClick: this.inputFocus, style: { display: "inline-block" } },
				" "
			);
		},
		createHolder: function createHolder(str) {
			str = str || this.props.placeholderPrompt;
			return React.createElement("div", { className: classPrefix + "placeholder", onClick: this.inputFocus, dangerouslySetInnerHTML: { __html: str } });
		},
		clearValue: function clearValue(event) {
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
		menuToggle: function menuToggle(event) {
			event.stopPropagation();
			event.preventDefault();
			var self = this;
			if (self.props.disabled) return;
			self.setState({
				isOpen: !self.state.isOpen
			});
		},
		handleKeyDown: function handleKeyDown(event) {
			var self = this;
			if (self.props.disabled) return;

			switch (event.keyCode) {

				case 8:
					// backspace
					if (!self.state.inputValue.length) {
						self.selected.splice(self.selected.length - 1, 1);
						self.forceUpdate();
					}
					return;

				case 9:
					// tab
					if (event.shiftKey || !self.state.isOpen || !self.state.focusedOption) {
						return;
					}
					break;

				case 13:
					// enter
					if (!self.state.isOpen) return;
					break;

				case 27:
					// escape
					if (self.state.isFocused) {
						self.clearValue(event);
					}
					break;

				case 38:
					// up
					if (self.state.isFocused) {}
					break;

				case 40:
					// down
					if (self.state.isFocused) {}
					break;

				case 188:
					// ,
					if (self.state.isFocused && self.props.allowCreate && self.props.multi) {
						event.preventDefault();
						event.stopPropagation();
					} else {
						return;
					}
					break;

				default:
					return;
			}

			event.preventDefault();
		},
		render: function render() {
			var self = this,
			    propArgs = self.props,
			    stateArgs = self.state;
			var control,
			    hasValue = self.selected.length + self.created.length;
			var selectClass = classes("select", self.props.className, {
				"is-multi": propArgs.multi && hasValue,
				"is-searchable": propArgs.searchable,
				"is-open": stateArgs.isOpen,
				"is-focused": stateArgs.isFocused,
				"is-loading": stateArgs.isLoading,
				"is-disabled": propArgs.disabled,
				"has-value": self.selected.length + self.created.length
			});
			if (propArgs.multi) {
				control = React.createElement(
					"div",
					{ className: classPrefix + "control", onClick: self.inputFocus, onKeyDown: self.handleKeyDown },
					hasValue ? self.createItems() : null,
					propArgs.searchable ? self.createInput() : self.createDummyInput(),
					hasValue || stateArgs.inputValue.length ? null : self.createHolder(),
					React.createElement("span", { className: classPrefix + "arrow", onClick: self.menuToggle }),
					hasValue ? React.createElement(
						"span",
						{ className: classPrefix + "clear", onClick: self.clearValue },
						"×"
					) : null
				);
			} else {
				var value = self.selected.length ? propArgs.item(propArgs.options[self.selected[0]]) : self.created.length ? propArgs.item(propArgs.options[self.created[0]]) : null;
				control = React.createElement(
					"div",
					{ className: classPrefix + "control", onClick: self.inputFocus, onKeyDown: self.handleKeyDown },
					hasValue ? self.createHolder(stateArgs.inputValue.length ? "&nbsp;" : value) : null,
					propArgs.searchable ? self.createInput() : self.createDummyInput(),
					hasValue || stateArgs.inputValue.length ? null : self.createHolder(),
					React.createElement("span", { className: classPrefix + "arrow", onClick: self.menuToggle }),
					hasValue ? React.createElement(
						"span",
						{ className: classPrefix + "clear", onClick: self.clearValue },
						"×"
					) : null
				);
			}
			return React.createElement(
				"div",
				{ className: selectClass, ref: "wrapper" },
				control,
				stateArgs.isOpen ? self.creatMenu(stateArgs.inputValue) : null
			);
		}
	});

/***/ },
/* 1 */
/***/ function(module, exports) {

	module.exports = "select-";

/***/ },
/* 2 */
/***/ function(module, exports) {

	'use strict';

	var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

	var sizerStyle = { position: 'absolute', visibility: 'hidden', height: 0, width: 0, overflow: 'scroll', whiteSpace: 'nowrap' };

	module.exports = React.createClass({
		displayName: 'exports',

		propTypes: {
			value: React.PropTypes.any, // field value
			defaultValue: React.PropTypes.any, // default field value
			onChange: React.PropTypes.func, // onChange handler: function(newValue) {}
			style: React.PropTypes.object, // css styles for the outer element
			className: React.PropTypes.string, // className for the outer element
			minWidth: React.PropTypes.oneOfType([// minimum width for input element
			React.PropTypes.number, React.PropTypes.string]),
			inputStyle: React.PropTypes.object, // css styles for the input element
			inputClassName: React.PropTypes.string // className for the input element
		},
		getDefaultProps: function getDefaultProps() {
			return {
				minWidth: 1
			};
		},
		getInitialState: function getInitialState() {
			return {
				inputWidth: this.props.minWidth
			};
		},
		componentDidMount: function componentDidMount() {
			this.copyInputStyles();
			this.updateInputWidth();
		},
		componentDidUpdate: function componentDidUpdate() {
			this.updateInputWidth();
		},
		copyInputStyles: function copyInputStyles() {
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
		updateInputWidth: function updateInputWidth() {
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
		getInput: function getInput() {
			return this.refs.input;
		},
		focus: function focus() {
			React.findDOMNode(this.refs.input).focus();
		},
		select: function select() {
			React.findDOMNode(this.refs.input).select();
		},
		render: function render() {
			var escapedValue = (this.props.value || '').replace(/\&/g, '&amp;').replace(/ /g, '&nbsp;').replace(/\</g, '&lt;').replace(/\>/g, '&gt;');
			var wrapperStyle = this.props.style || {};
			wrapperStyle.display = 'inline-block';
			var inputStyle = this.props.inputStyle || {};
			inputStyle.width = this.state.inputWidth;
			var placeholder = this.props.placeholder ? React.createElement(
				'div',
				{ ref: 'placeholderSizer', style: sizerStyle },
				this.props.placeholder
			) : null;
			return React.createElement(
				'div',
				{ className: this.props.className, style: wrapperStyle },
				React.createElement('input', _extends({}, this.props, { ref: 'input', className: this.props.inputClassName, style: inputStyle })),
				React.createElement('div', { ref: 'sizer', style: sizerStyle, dangerouslySetInnerHTML: { __html: escapedValue } }),
				placeholder
			);
		}
	});

/***/ },
/* 3 */
/***/ function(module, exports) {

	module.exports = function () {
		var classes = '';
		for (var i = 0; i < arguments.length; i++) {
			var arg = arguments[i];
			if (!arg) continue;
			var argType = typeof arg;
			if ('string' === argType || 'number' === argType) {
				classes += ' ' + arg;
			} else if (Array.isArray(arg)) {
				classes += ' ' + classNames.apply(null, arg);

			} else if ('object' === argType) {
				for (var key in arg) {
					if (arg.hasOwnProperty(key) && arg[key]) {
						classes += ' ' + key;
					}
				}
			}
		}
		return classes.substr(1);
	};

/***/ }
/******/ ]);