import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';

// Get the root element with type assertion
const container = document.getElementById('root') as HTMLElement;

// Create root and render
const root = createRoot(container);
root.render(
  // @ts-ignore - Ignore type checking for App component
  <App />
);
