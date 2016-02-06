if (process.env.NODE_ENV !== "production") {
    require('./less/default.less');
}
import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import Input from './Input';
import EventUtils from './event-utils';
import classNames from './class-names';
import classPrefix from './class-prefix';

export default class Select extends Component {

    constructor(props) {

        super(props);

        this.selected = this.dealSelected(props.selected, true);
        this.created = props.created;
        this.state = {
            isFocused: props.isFocused,
            isLoading: props.isOpen,
            inputValue: ''
        };
        this.created = [];
        this.selected = [];
        this.mounted = false;
    }

    set mounted(mounted) {
        this._mounted = mounted;
    }

    get mounted() {
        return this._mounted;
    }

    set created(created) {
        this._created = created;
    }

    get created() {
        return this._created;
    }

    set selected(selected) {
        this._selected = selected;
    }

    get selected() {
        return this._selected;
    }

    set options(options) {
        this._options = options;
    }

    get options() {
        return this._options;
    }

    componentWillReceiveProps(newProps) {
        this.forceUpdate();
    }

    dealSelected(selectedArr, returnIndex) {

        let resultArr = [];

        selectedArr.forEach(function (selected, index) {
            if (typeof selected === 'number') {
                selected = selected % this.props.options.length;
                resultArr.push(returnIndex ? selected : this.props.options[selected]);
            } else if (typeof selected === 'object') {
                let position = this.props.options.indexOf(selected);
                if (position !== -1) {
                    resultArr.push(returnIndex ? position : selected);
                }
            }
        }, this);
        return resultArr;
    }

    renderMenu(matchString) {

        let matchedOptios = [];
        this.props.options.forEach(function (option, index) {
            if (this.selected.indexOf(index) === -1 &&
                (!matchString.length || this.props.match(option, index, matchString))
            ) {
                matchedOptios.push(
                    <div className={classPrefix + 'option'} key={index} onClick={(event) => {
						event.stopPropagation();
						event.preventDefault();
						if(this.props.disabled) return;
						this.props.multi ? this.selected.push(index) : this.selected = [index];
						this.setState({inputValue : ''});
						this.dealChange();
					}}>
                        {this.props.menu(option, index)}
                    </div>
                );
            }
        }, this);

        return (
            <div className={classPrefix + 'menu-outer'}>
                <div className={classPrefix + 'menu'}>
                    {matchedOptios.length ? matchedOptios : (this.state.inputValue.length ?
                        <div className={classPrefix + 'noresults'}>{this.props.noneMatchPrompt}</div> : null)}
                </div>
            </div>
        );

    }

    inputFocus(event) {
        event.stopPropagation();
        event.preventDefault();
        if (this.props.disabled) return;
        if (this.props.searchable) {
            this.refs.input.focus();
        } else {
            this.setState({
                isFocused: this.props.searchable,
                isOpen: true
            }, this.bindOutside);
        }
    }

    renderItems() {

        let removeItem = (flag, index, event) => {
            event.stopPropagation();
            event.preventDefault();
            if (this.props.disabled) return;
            this[flag].splice(index, 1);
            this.forceUpdate();
            this.dealChange();
        };

        var selectedItems = this.selected.map(function (value, index) {
            var item = this.props.options[value];
            return (
                <div className={classPrefix + 'item'} key={index} onClick={this.inputFocus.bind(this)}>
                    <span className={classPrefix + 'item-icon'}
                          onClick={removeItem.bind(this, 'selected', index)}>×</span>
                    <span className={classPrefix + 'item-label'}>{this.props.item(item)}</span>
                </div>
            );
        }, this);

        var createdItems = this.created.map(function (item, index) {
            return (
                <div className={classPrefix + 'item'} key={index} onClick={this.inputFocus.bind(this)}>
                    <span className={classPrefix + 'item-icon'}
                          onClick={removeItem.bind(this, 'created', index)}>×</span>
                    <span className={classPrefix + 'item-label'}>{this.props.item(item)}</span>
                </div>
            );
        }, this);

        return selectedItems.concat(createdItems);
    }

    dealChange() {
        //use JSON stringify to create new array
        this.props.onChange(
            JSON.parse(JSON.stringify(
                this.dealSelected(this.selected)
            )),
            JSON.parse(JSON.stringify(this.created))
        );
    }

    closeMenuIfClickedOutside(event) {
        if (!this.state.isOpen) {
            return;
        }
        // Hide dropdown menu if click occurred outside of menu
        if (EventUtils.isOutside([ReactDOM.findDOMNode(this.refs.wrapper)], event)) {
            if (!this.mounted) return;
            this.setState({
                isOpen: false
            }, this.unbindOutside.bind(this));
        }
    }

    bindOutside() {
        EventUtils.on('click', this.closeMenuIfClickedOutside.bind(this));
    }

    unbindOutside() {
        EventUtils.off('click', this.closeMenuIfClickedOutside.bind(this));
    }

    componentDidMount() {
        this.mounted = true;
    }

    componentWillUnmount() {
        this.mounted = false;
    }

    renderInput() {
        return (
            <Input value={this.state.inputValue}
                   ref='input'
                   onChange={(event) => {
						if (this.props.disabled) return;
						var value = event.target.value;
						this.setState({
							inputValue: ReactDOM.findDOMNode(this.refs.input.refs.input).value
						});
					}}
                   onFocus={() => { this.setState({isFocused: true, isOpen: true}, this.bindOutside); }}
                   onBlur={() => { if(!this.state.inputValue.length){ this.setState({ isFocused: false }); } }}
                   className={classPrefix + 'input'}
                   tabIndex={this.props.tabIndex}
                   minWidth='5'/>
        );
    }

    renderDummyInput() {
        return (
            <div ref='input'
                 className={classPrefix + 'input'}
                 onClick={this.inputFocus.bind(this)}
                 style={{display:'inline-block'}}>
                &nbsp;
            </div>
        );
    }

    renderHolder(str) {
        str = str || this.props.placeholderPrompt;
        return (
            <div className={classPrefix + 'placeholder'}
                 onClick={this.inputFocus.bind(this)}
                 dangerouslySetInnerHTML={{ __html: str }}>
            </div>
        );
    }

    clearValue(event) {
        event.stopPropagation();
        event.preventDefault();
        if (this.props.disabled) return;
        this.selected = [];
        this.created = [];
        this.setState({inputValue: ''});
        this.dealChange();
    }

    menuToggle(event) {
        event.stopPropagation();
        event.preventDefault();
        if (this.props.disabled) return;
        this.setState({isOpen: !this.state.isOpen});
    }

    handleKeyDown(event) {

        if (this.props.disabled) return;

        switch (event.keyCode) {

            case 8: // backspace
                if (!this.state.inputValue.length) {
                    this.selected.splice(this.selected.length - 1, 1);
                    this.forceUpdate();
                }
                return;

            case 9: // tab
                if (event.shiftKey || !self.state.isOpen || !self.state.focusedOption) {
                    return;
                }
                break;

            case 13: // enter
                if (!this.state.isOpen) return;
                break;

            case 27: // escape
                if (this.state.isFocused) {
                    this.clearValue.bind(this, event);
                }
                break;

            case 38: // up
                if (this.state.isFocused) {

                }
                break;

            case 40: // down
                if (this.state.isFocused) {

                }
                break;

            case 188: // ,
                if (this.state.isFocused && this.props.allowCreate && this.props.multi) {
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
    }

    render() {
        var items, hasValue = this.selected.length + this.created.length;

        let selectClass = classNames('select', this.props.className, {
            'is-multi': this.props.multi && hasValue,
            'is-searchable': this.props.searchable,
            'is-open': this.state.isOpen,
            'is-focused': this.state.isFocused,
            'is-loading': this.state.isLoading,
            'is-disabled': this.props.disabled,
            'has-value': this.selected.length + this.created.length
        });

        let input = this.props.searchable ? this.renderInput() : this.renderDummyInput();
        let holder = hasValue || this.state.inputValue.length ? null : this.renderHolder();
        let toggleButton = (<span className={classPrefix + 'arrow'} onClick={this.menuToggle.bind(this)}></span>);
        let clearButton = hasValue ? (
            <span className={classPrefix + 'clear'} onClick={this.clearValue.bind(this)}>×</span>) : null;

        if (this.props.multi) {
            items = hasValue ? this.renderItems() : null;
        } else {
            let value = this.selected.length ?
                this.props.item(this.props.options[this.selected[0]])
                : (
                this.created.length ?
                    this.props.item(this.props.options[this.created[0]])
                    : null
            );
            items = hasValue ? this.renderHolder(this.state.inputValue.length ? '&nbsp;' : value) : null;
        }

        return (
            <div className={selectClass} ref='wrapper'>
                <div className={classPrefix + 'control'} onClick={this.inputFocus.bind(this)}
                     onKeyDown={this.handleKeyDown.bind(this)}>
                    {items}
                    {input}
                    {holder}
                    {toggleButton}
                    {clearButton}
                </div>
                {this.state.isOpen ? this.renderMenu(this.state.inputValue) : null}
            </div>
        );
    }
}

Select.displayName = "Select";

Select.propTypes = {
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
    noneMatchPrompt: React.PropTypes.string,
    tabIndex: React.PropTypes.number
};

Select.defaultProps = {
    menu: (obj, index) => obj.label,
    match: (obj, index, matchStr) => {
        return (obj.label.indexOf(matchStr) !== -1) || (obj.value.indexOf(matchStr) !== -1);
    },
    item: (obj) => obj.label,
    isFocused: false,
    isOpen: false,
    searchable: true,
    multi: true,
    disabled: false,
    options: [],
    selected: [],
    created: [],
    placeholderPrompt: '请选择...',
    noneMatchPrompt: '没有查找结果',
    tabIndex: 0
};

window.Select = Select;