import ReactDOM from 'react-dom';

export default function(context, ref){
	return ReactDOM.findDOMNode(context.refs[ref]);
};