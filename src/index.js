import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import Select from './select';
var opt = {
	options: [
		{
			label: "item1",
			value: "value"
		},
		{
			label: "item2",
			value: "value2"
		},
		{
			label: "item3",
			value: "value3"
		},
		{
			label: "item4",
			value: "value4"
		},
		{
			label: "item5",
			value: "value5"
		},
		{
			label: "item6",
			value: "value6"
		}
	], 
	disabled: false, 
	onChange: function(selected, created){ console.log(selected, created); }, 
	searchable: true,
	multi: true
};

class App extends Component {

	constructor(props) {

    	super(props);
    	this.state = {visible: true};
    }

	render() {
		return (
			<div>
				<a onClick={() => {
					this.setState({visible: !this.state.visible});
				}}>toggle</a>
				{this.state.visible ? <Select {...opt} /> : null}
			</div>
		);
	}
}
ReactDOM.render(<App />, document.getElementById('select'));