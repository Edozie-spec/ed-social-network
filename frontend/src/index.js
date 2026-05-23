import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { StoreProvider } from './context/Store';
import { ThemeProvider } from './context/ThemeContext';
import { SocketProvider } from './context/SocketContext';
import * as serviceWorkerRegistration from './serviceWorkerRegistration';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <ThemeProvider>
      <StoreProvider>
        <SocketProvider>
          <App />
        </SocketProvider>
      </StoreProvider>
    </ThemeProvider>
  </React.StrictMode>
);

serviceWorkerRegistration.register();
