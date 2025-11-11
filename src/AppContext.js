import { createContext } from 'react';

const AppContext = createContext({
  data: [],
  config: {
    app_name: 'NVSP Manager',
    app_description: 'Hệ thống quản lý hoạt động, sự kiện, tình nguyện sinh viên',
    text_color: '#1F2937',
    accent_color: '#4F46E5',
    background_color: '#F3F4F6',
    highlight_color: '#6366F1',
    error_color: '#EF4444',
    success_color: '#10B981',
    warning_color: '#F59E0B',
    info_color: '#3B82F6',
  },
  user: null,
  isLoading: false,
  error: null,
  dispatch: () => {}
});

export const AppActionTypes = {
  SET_DATA: 'SET_DATA',
  UPDATE_CONFIG: 'UPDATE_CONFIG',
  SET_USER: 'SET_USER',
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
  CLEAR_ERROR: 'CLEAR_ERROR'
};

export const initialAppState = {
  data: [],
  config: {
    app_name: 'NVSP Manager',
    app_description: 'Hệ thống quản lý hoạt động, sự kiện, tình nguyện sinh viên',
    text_color: '#1F2937',
    accent_color: '#4F46E5', 
    background_color: '#F3F4F6',
    highlight_color: '#6366F1',
    error_color: '#EF4444',
    success_color: '#10B981',
    warning_color: '#F59E0B',
    info_color: '#3B82F6',
  },
  user: null,
  isLoading: false,
  error: null
};

export const appReducer = (state, action) => {
  switch (action.type) {
    case AppActionTypes.SET_DATA:
      return {
        ...state,
        data: action.payload
      };
    
    case AppActionTypes.UPDATE_CONFIG:
      return {
        ...state,
        config: {
          ...state.config,
          ...action.payload
        }
      };
    
    case AppActionTypes.SET_USER:
      return {
        ...state,
        user: action.payload
      };
    
    case AppActionTypes.SET_LOADING:
      return {
        ...state,
        isLoading: action.payload
      };
    
    case AppActionTypes.SET_ERROR:
      return {
        ...state,
        error: action.payload
      };
    
    case AppActionTypes.CLEAR_ERROR:
      return {
        ...state,
        error: null
      };
    
    default:
      return state;
  }
};

export default AppContext;