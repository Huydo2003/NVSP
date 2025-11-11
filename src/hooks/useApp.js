import { useContext } from 'react';
import { AppContext } from '../utils/AppContext';
import { defaultConfig } from '../utils/config';

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}

export function useConfig(key) {
  const { state } = useApp();
  return state.config[key] || defaultConfig[key];
}

export function useData() {
  const { state } = useApp();
  return state.data;
}