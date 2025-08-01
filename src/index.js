import React from 'react';
import { createRoot } from 'react-dom/client';

// third party
import { HashRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import thunk from 'redux-thunk';
import { createStore, applyMiddleware, compose  } from 'redux';

// project imports
import * as serviceWorker from 'serviceWorker';
import App from 'App';

// style + assets
import './assets/scss/style.scss';
import config from './config';
import reducer from 'store/reducer';

// ==============================|| REACT DOM RENDER  ||============================== //




const container = document.getElementById('root');
const root = createRoot(container); // createRoot(container!) if you use TypeScript
// const store = createStore(reducer, window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__(), applyMiddleware(thunk));


const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;
const store = createStore(reducer, composeEnhancers(
    applyMiddleware(thunk)
));

root.render(
  <Provider store={store}>
    <HashRouter basename={config.basename}>
    
        <App />
     
    </HashRouter>
  </Provider>
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
