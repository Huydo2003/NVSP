import { createContext } from 'react';
import { defaultConfig } from './config';

export const AppContext = createContext({
  state: {
    config: { ...defaultConfig },
    data: []
  },
  updateConfig: () => {},
  updateData: () => {}
});