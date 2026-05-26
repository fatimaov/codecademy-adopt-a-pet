import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import reportWebVitals from './reportWebVitals';

const container = document.getElementById('root');
const root = ReactDOM.createRoot(container);

const renderApp = () => {
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
};

async function enableMocks() {
  if (process.env.REACT_APP_USE_MOCKS !== 'true') {
    renderApp();
    return;
  }

  const { worker } = await import('./mocks/browser');
  await worker.start();
  renderApp();
}

enableMocks();

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
