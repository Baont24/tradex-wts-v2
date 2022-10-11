import 'babel-polyfill';
import 'react-toastify/dist/ReactToastify.min.css';
import 'slick-carousel/slick/slick-theme.css';
import 'slick-carousel/slick/slick.css';
import 'styles/style.scss';
import 'styles/theme.scss';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { DndProvider } from 'react-dnd';
import { Fallback } from 'components/common';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { PersistGate } from 'redux-persist/integration/react';
import { Provider } from 'react-redux';
import { ToastContainer } from 'react-toastify';
import Routers from 'routers';
import store, { persistor } from 'redux/store';

ReactDOM.render(
  <DndProvider backend={HTML5Backend}>
    <Provider store={store}>
      <PersistGate loading={<Fallback />} persistor={persistor}>
        <Routers />
        <ToastContainer />
      </PersistGate>
    </Provider>
  </DndProvider>,
  document.getElementById('root') as HTMLElement
);
