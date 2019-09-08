import React from 'react';
import ReactDOM from 'react-dom';
import App from './ui/App';

document.addEventListener('keypress', event => {
  console.log(event.keyCode);
});

ReactDOM.render(<App />, document.getElementById('root'));
