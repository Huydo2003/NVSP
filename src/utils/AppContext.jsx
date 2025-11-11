import { createContext, useContext, useReducer } from 'react';
import { defaultConfig } from './config';

const AppContext = createContext();

const initialState = {
  config: { ...defaultConfig },
  data: []
};

const reducer = (state, action) => {
  switch (action.type) {
    case 'UPDATE_CONFIG':
      return {
        ...state,
        config: { ...action.payload }
      };
    case 'UPDATE_DATA':
      return {
        ...state,
        data: [...action.payload]
      };
    default:
      return state;
  }
};

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  const updateConfig = (newConfig) => {
    dispatch({ type: 'UPDATE_CONFIG', payload: newConfig });
  };

  const updateData = (newData) => {
    dispatch({ type: 'UPDATE_DATA', payload: newData });
  };

  return (
    <AppContext.Provider value={{ state, updateConfig, updateData }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}

export const getConfig = (key) => {
  const { state } = useApp();
  return state.config[key] || defaultConfig[key];
};