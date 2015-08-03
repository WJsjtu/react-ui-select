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

	if (true) {
		__webpack_require__(1);
	}
	var classPrefix = __webpack_require__(5);
	var Input = __webpack_require__(6);
	var classes = __webpack_require__(7);

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
					matches.length ? matches : self.state.inputValue.length ? React.createElement(
						"div",
						{ className: classPrefix + "noresults" },
						self.props.nonMatchPrompt
					) : null
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
/***/ function(module, exports, __webpack_require__) {

	// style-loader: Adds some css to the DOM by adding a <style> tag

	// load the styles
	var content = __webpack_require__(2);
	if(typeof content === 'string') content = [[module.id, content, '']];
	// add the styles to the DOM
	var update = __webpack_require__(4)(content, {});
	if(content.locals) module.exports = content.locals;
	// Hot Module Replacement
	if(false) {
		// When the styles change, update the <style> tags
		if(!content.locals) {
			module.hot.accept("!!./../node_modules/css-loader/index.js!./style.css", function() {
				var newContent = require("!!./../node_modules/css-loader/index.js!./style.css");
				if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
				update(newContent);
			});
		}
		// When the module is disposed, remove the <style> tags
		module.hot.dispose(function() { update(); });
	}

/***/ },
/* 2 */
/***/ function(module, exports, __webpack_require__) {

	exports = module.exports = __webpack_require__(3)();
	// imports


	// module
	exports.push([module.id, ".select,.select-control{position:relative}.select-placeholder,.select-value{padding:6px 52px 6px 10px;top:0;left:0;right:-15px;max-width:100%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.select-arrow,.select-arrow-zone{content:\" \"}.select-control,.select-loading,.select-menu-outer,.select-noresults,.select-option{box-sizing:border-box}.select-control{overflow:hidden;background-color:#fff;border:1px solid #ccc;border-color:#d9d9d9 #ccc #b3b3b3;border-radius:0;color:#333;cursor:default;outline:0;padding:6px 52px 6px 10px;transition:all 200ms ease}.is-open>.select-control,.select-menu-outer{border-bottom-right-radius:0;border-bottom-left-radius:0}.is-searchable.is-focused:not(.is-open)>.select-control,.is-searchable.is-open>.select-control{cursor:text}.select-control:hover{box-shadow:0 1px 0 rgba(0,0,0,.06)}.is-open>.select-control{background:#fff;border-color:#b3b3b3 #ccc #d9d9d9}.is-open>.select-control>.select-arrow{border-color:transparent transparent #999;border-width:0 5px 5px}.is-focused:not(.is-open)>.select-control{border-color:#08c #0099e6 #0099e6;box-shadow:inset 0 1px 2px rgba(0,0,0,.1),0 0 5px -1px rgba(0,136,204,.5)}.select-placeholder{color:#aaa;position:absolute}.has-value>.select-control>.select-placeholder{color:#333}.select-value{color:#aaa;position:absolute}.has-value>.select-control>.select-value{color:#333}.select-input>input{cursor:default;background:none;box-shadow:none;height:auto;border:0;font-family:inherit;font-size:inherit;margin:0;padding:0;outline:0;display:inline-block;-webkit-appearance:none}.is-focused .select-input>input{cursor:text}.select-control:not(.is-searchable)>.select-input{outline:0}.select-loading{-webkit-animation:select-animation-spin 400ms infinite linear;-o-animation:select-animation-spin 400ms infinite linear;animation:select-animation-spin 400ms infinite linear;width:16px;height:16px;border-radius:50%;border:2px solid #ccc;border-right-color:#333;display:inline-block;margin-top:-8px;position:absolute;right:30px;top:50%}.select-arrow-zone,.select-clear{top:0;position:absolute;cursor:pointer}.has-value>.select-control>.select-loading{right:46px}.select-clear{color:#999;display:inline-block;font-size:16px;padding:4px 10px;right:17px}.select-clear:hover{color:#c0392b}.select-clear>span{font-size:1.1em}.select-arrow-zone{display:block;right:0;bottom:0;width:30px}.select-arrow{border-color:#999 transparent transparent;border-style:solid;border-width:5px 5px 0;display:block;height:0;margin-top:-ceil(2.5px);position:absolute;right:10px;top:12px;width:0;cursor:pointer}.select-menu-outer{background-color:#fff;border:1px solid #ccc;border-top-color:#e6e6e6;box-shadow:0 1px 0 rgba(0,0,0,.06);margin-top:-1px;max-height:200px;position:absolute;top:100%;width:100%;z-index:1000;-webkit-overflow-scrolling:touch}.select-menu{max-height:198px;overflow-y:auto}.select-option{color:#666;cursor:pointer;display:block;padding:6px 11px}.select-option:last-child{border-bottom-right-radius:0;border-bottom-left-radius:0}.select-option.is-focused,.select-option:hover{background-color:#ddd;color:#333}.select-option.is-disabled{color:#ccc;cursor:not-allowed}.select-noresults{color:#999;cursor:default;display:block;padding:6px 10px}.select.is-multi .select-control{padding:0 52px 0 10px}.select.is-multi .select-input{vertical-align:middle;border:1px solid transparent;margin:2px 3px 2px -1;padding:3px 0}.select-item{background-color:#f2f9fc;border-radius:0;border:1px solid #c9e6f2;color:#08c;display:inline-block;font-size:1em;margin:2px 7px 2px -5px}.select-item-icon,.select-item-label{display:inline-block;vertical-align:middle}.select-item-label{cursor:default;border-bottom-right-radius:0;border-top-right-radius:0;padding:3px 5px}.select-item-label .select-item-label__a{color:#08c;cursor:pointer}.select-item-icon{cursor:pointer;border-bottom-left-radius:0;border-top-left-radius:0;border-right:1px solid #c9e6f2;padding:2px 5px 4px}.select-item-icon:focus,.select-item-icon:hover{background-color:#ddeff7;color:#0077b3}.select-item-icon:active{background-color:#c9e6f2}.select.is-multi.is-disabled .select-item{background-color:#f2f2f2;border:1px solid #d9d9d9;color:#888}.select.is-multi.is-disabled .select-item-icon{cursor:not-allowed;border-right:1px solid #d9d9d9}.select.is-multi.is-disabled .select-item-icon:active,.select.is-multi.is-disabled .select-item-icon:focus,.select.is-multi.is-disabled .select-item-icon:hover{background-color:#f2f2f2}@keyframes select-animation-spin{to{transform:rotate(1turn)}}@-webkit-keyframes select-animation-spin{to{-webkit-transform:rotate(1turn)}}", ""]);

	// exports


/***/ },
/* 3 */
/***/ function(module, exports) {

	/*
		MIT License http://www.opensource.org/licenses/mit-license.php
		Author Tobias Koppers @sokra
	*/
	// css base code, injected by the css-loader
	module.exports = function() {
		var list = [];

		// return the list of modules as css string
		list.toString = function toString() {
			var result = [];
			for(var i = 0; i < this.length; i++) {
				var item = this[i];
				if(item[2]) {
					result.push("@media " + item[2] + "{" + item[1] + "}");
				} else {
					result.push(item[1]);
				}
			}
			return result.join("");
		};

		// import a list of modules into the list
		list.i = function(modules, mediaQuery) {
			if(typeof modules === "string")
				modules = [[null, modules, ""]];
			var alreadyImportedModules = {};
			for(var i = 0; i < this.length; i++) {
				var id = this[i][0];
				if(typeof id === "number")
					alreadyImportedModules[id] = true;
			}
			for(i = 0; i < modules.length; i++) {
				var item = modules[i];
				// skip already imported module
				// this implementation is not 100% perfect for weird media query combinations
				//  when a module is imported multiple times with different media queries.
				//  I hope this will never occur (Hey this way we have smaller bundles)
				if(typeof item[0] !== "number" || !alreadyImportedModules[item[0]]) {
					if(mediaQuery && !item[2]) {
						item[2] = mediaQuery;
					} else if(mediaQuery) {
						item[2] = "(" + item[2] + ") and (" + mediaQuery + ")";
					}
					list.push(item);
				}
			}
		};
		return list;
	};


/***/ },
/* 4 */
/***/ function(module, exports, __webpack_require__) {

	/*
		MIT License http://www.opensource.org/licenses/mit-license.php
		Author Tobias Koppers @sokra
	*/
	var stylesInDom = {},
		memoize = function(fn) {
			var memo;
			return function () {
				if (typeof memo === "undefined") memo = fn.apply(this, arguments);
				return memo;
			};
		},
		isOldIE = memoize(function() {
			return /msie [6-9]\b/.test(window.navigator.userAgent.toLowerCase());
		}),
		getHeadElement = memoize(function () {
			return document.head || document.getElementsByTagName("head")[0];
		}),
		singletonElement = null,
		singletonCounter = 0;

	module.exports = function(list, options) {
		if(false) {
			if(typeof document !== "object") throw new Error("The style-loader cannot be used in a non-browser environment");
		}

		options = options || {};
		// Force single-tag solution on IE6-9, which has a hard limit on the # of <style>
		// tags it will allow on a page
		if (typeof options.singleton === "undefined") options.singleton = isOldIE();

		var styles = listToStyles(list);
		addStylesToDom(styles, options);

		return function update(newList) {
			var mayRemove = [];
			for(var i = 0; i < styles.length; i++) {
				var item = styles[i];
				var domStyle = stylesInDom[item.id];
				domStyle.refs--;
				mayRemove.push(domStyle);
			}
			if(newList) {
				var newStyles = listToStyles(newList);
				addStylesToDom(newStyles, options);
			}
			for(var i = 0; i < mayRemove.length; i++) {
				var domStyle = mayRemove[i];
				if(domStyle.refs === 0) {
					for(var j = 0; j < domStyle.parts.length; j++)
						domStyle.parts[j]();
					delete stylesInDom[domStyle.id];
				}
			}
		};
	}

	function addStylesToDom(styles, options) {
		for(var i = 0; i < styles.length; i++) {
			var item = styles[i];
			var domStyle = stylesInDom[item.id];
			if(domStyle) {
				domStyle.refs++;
				for(var j = 0; j < domStyle.parts.length; j++) {
					domStyle.parts[j](item.parts[j]);
				}
				for(; j < item.parts.length; j++) {
					domStyle.parts.push(addStyle(item.parts[j], options));
				}
			} else {
				var parts = [];
				for(var j = 0; j < item.parts.length; j++) {
					parts.push(addStyle(item.parts[j], options));
				}
				stylesInDom[item.id] = {id: item.id, refs: 1, parts: parts};
			}
		}
	}

	function listToStyles(list) {
		var styles = [];
		var newStyles = {};
		for(var i = 0; i < list.length; i++) {
			var item = list[i];
			var id = item[0];
			var css = item[1];
			var media = item[2];
			var sourceMap = item[3];
			var part = {css: css, media: media, sourceMap: sourceMap};
			if(!newStyles[id])
				styles.push(newStyles[id] = {id: id, parts: [part]});
			else
				newStyles[id].parts.push(part);
		}
		return styles;
	}

	function createStyleElement() {
		var styleElement = document.createElement("style");
		var head = getHeadElement();
		styleElement.type = "text/css";
		head.appendChild(styleElement);
		return styleElement;
	}

	function createLinkElement() {
		var linkElement = document.createElement("link");
		var head = getHeadElement();
		linkElement.rel = "stylesheet";
		head.appendChild(linkElement);
		return linkElement;
	}

	function addStyle(obj, options) {
		var styleElement, update, remove;

		if (options.singleton) {
			var styleIndex = singletonCounter++;
			styleElement = singletonElement || (singletonElement = createStyleElement());
			update = applyToSingletonTag.bind(null, styleElement, styleIndex, false);
			remove = applyToSingletonTag.bind(null, styleElement, styleIndex, true);
		} else if(obj.sourceMap &&
			typeof URL === "function" &&
			typeof URL.createObjectURL === "function" &&
			typeof URL.revokeObjectURL === "function" &&
			typeof Blob === "function" &&
			typeof btoa === "function") {
			styleElement = createLinkElement();
			update = updateLink.bind(null, styleElement);
			remove = function() {
				styleElement.parentNode.removeChild(styleElement);
				if(styleElement.href)
					URL.revokeObjectURL(styleElement.href);
			};
		} else {
			styleElement = createStyleElement();
			update = applyToTag.bind(null, styleElement);
			remove = function() {
				styleElement.parentNode.removeChild(styleElement);
			};
		}

		update(obj);

		return function updateStyle(newObj) {
			if(newObj) {
				if(newObj.css === obj.css && newObj.media === obj.media && newObj.sourceMap === obj.sourceMap)
					return;
				update(obj = newObj);
			} else {
				remove();
			}
		};
	}

	var replaceText = (function () {
		var textStore = [];

		return function (index, replacement) {
			textStore[index] = replacement;
			return textStore.filter(Boolean).join('\n');
		};
	})();

	function applyToSingletonTag(styleElement, index, remove, obj) {
		var css = remove ? "" : obj.css;

		if (styleElement.styleSheet) {
			styleElement.styleSheet.cssText = replaceText(index, css);
		} else {
			var cssNode = document.createTextNode(css);
			var childNodes = styleElement.childNodes;
			if (childNodes[index]) styleElement.removeChild(childNodes[index]);
			if (childNodes.length) {
				styleElement.insertBefore(cssNode, childNodes[index]);
			} else {
				styleElement.appendChild(cssNode);
			}
		}
	}

	function applyToTag(styleElement, obj) {
		var css = obj.css;
		var media = obj.media;
		var sourceMap = obj.sourceMap;

		if(media) {
			styleElement.setAttribute("media", media)
		}

		if(styleElement.styleSheet) {
			styleElement.styleSheet.cssText = css;
		} else {
			while(styleElement.firstChild) {
				styleElement.removeChild(styleElement.firstChild);
			}
			styleElement.appendChild(document.createTextNode(css));
		}
	}

	function updateLink(linkElement, obj) {
		var css = obj.css;
		var media = obj.media;
		var sourceMap = obj.sourceMap;

		if(sourceMap) {
			// http://stackoverflow.com/a/26603875
			css += "\n/*# sourceMappingURL=data:application/json;base64," + btoa(unescape(encodeURIComponent(JSON.stringify(sourceMap)))) + " */";
		}

		var blob = new Blob([css], { type: "text/css" });

		var oldSrc = linkElement.href;

		linkElement.href = URL.createObjectURL(blob);

		if(oldSrc)
			URL.revokeObjectURL(oldSrc);
	}


/***/ },
/* 5 */
/***/ function(module, exports) {

	module.exports = "select-";

/***/ },
/* 6 */
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
/* 7 */
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