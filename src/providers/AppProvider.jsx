import { useReducer, useEffect } from 'react';
import AppContext, { initialAppState, appReducer, AppActionTypes } from '../context/AppContext';

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(appReducer, initialAppState);

  useEffect(() => {
    const initializeApp = async () => {
      try {
        dispatch({ type: AppActionTypes.SET_LOADING, payload: true });

        // Load saved configuration
        const savedConfig = localStorage.getItem('app_config');
        if (savedConfig) {
          dispatch({
            type: AppActionTypes.UPDATE_CONFIG,
            payload: JSON.parse(savedConfig)
          });
        }

        // Load saved user session
        const savedUser = localStorage.getItem('user_session');
        if (savedUser) {
          dispatch({
            type: AppActionTypes.SET_USER,
            payload: JSON.parse(savedUser)
          });
        }

        // Initialize DataSDK and load data
        if (window.dataSdk) {
          const result = await window.dataSdk.list();
          if (result.isOk) {
            dispatch({
              type: AppActionTypes.SET_DATA,
              payload: result.data || []
            });
          } else {
            throw new Error('Failed to load data');
          }
        }

        dispatch({ type: AppActionTypes.SET_LOADING, payload: false });
      } catch (error) {
        console.error('App initialization error:', error);
        dispatch({
          type: AppActionTypes.SET_ERROR,
          payload: 'Có lỗi xảy ra khi khởi tạo ứng dụng. Vui lòng thử lại!'
        });
        dispatch({ type: AppActionTypes.SET_LOADING, payload: false });
      }
    };

    initializeApp();
  }, []);

  // Save config changes to localStorage
  useEffect(() => {
    localStorage.setItem('app_config', JSON.stringify(state.config));
  }, [state.config]);

  // Save user session to localStorage
  useEffect(() => {
    if (state.user) {
      localStorage.setItem('user_session', JSON.stringify(state.user));
    } else {
      localStorage.removeItem('user_session');
    }
  }, [state.user]);

  // Subscribe to DataSDK updates
  useEffect(() => {
    if (!window.dataSdk) return;

    const handleDataUpdate = async () => {
      try {
        const result = await window.dataSdk.list();
        if (result.isOk) {
          dispatch({
            type: AppActionTypes.SET_DATA,
            payload: result.data || []
          });
        }
      } catch (error) {
        console.error('Data update error:', error);
        dispatch({
          type: AppActionTypes.SET_ERROR,
          payload: 'Có lỗi xảy ra khi cập nhật dữ liệu!'
        });
      }
    };

    window.dataSdk.subscribe(handleDataUpdate);
    return () => window.dataSdk.unsubscribe(handleDataUpdate);
  }, []);

  // Error auto-clear after 5 seconds
  useEffect(() => {
    if (state.error) {
      const timer = setTimeout(() => {
        dispatch({ type: AppActionTypes.CLEAR_ERROR });
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [state.error]);

  return (
    <AppContext.Provider value={{ ...state, dispatch }}>
      {state.isLoading ? (
        <div className="fixed inset-0 flex items-center justify-center bg-white bg-opacity-75 z-50">
          <div className="text-center space-y-3">
            <div className="w-16 h-16 border-4 border-t-4 border-accent rounded-full animate-spin"
                 style={{ borderTopColor: state.config.accent_color }}></div>
            <p className="text-gray-600">Đang tải...</p>
          </div>
        </div>
      ) : state.error ? (
        <div className="fixed top-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded z-50">
          {state.error}
        </div>
      ) : null}
      {children}
    </AppContext.Provider>
  );
}