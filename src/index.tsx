import React from 'react';
import ReactDOM from 'react-dom';
import App from './ui/App';

document.addEventListener('keydown', event => {
  console.log(`Key pressed "${event.key}" code ${event.keyCode}`);
});

ReactDOM.render(<App />, document.getElementById('root'));
