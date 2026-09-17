import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import challengesReducer from './slices/challengesSlice';
import applicationsReducer from './slices/applicationsSlice';
import workspaceReducer from './slices/workspaceSlice';
import portfolioReducer from './slices/portfolioSlice';
import connectionsReducer from './slices/connectionsSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    challenges: challengesReducer,
    applications: applicationsReducer,
    workspace: workspaceReducer,
    portfolio: portfolioReducer,
    connections: connectionsReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false, // Allows flexible Date & Function callbacks in simulated mock actions
    }),
});

export default store;
