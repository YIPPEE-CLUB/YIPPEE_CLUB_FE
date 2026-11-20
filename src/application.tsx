'use client';

import { BrowserRouter } from 'react-router-dom';
import { App } from './App';
import { AuthProvider } from './context/AuthContext';
import { ChildrenProvider } from './context/ChildrenContext';

export default function Application() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ChildrenProvider>
          <App />
        </ChildrenProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
