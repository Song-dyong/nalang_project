import { combineReducers, configureStore } from "@reduxjs/toolkit";
import authReducer from "../features/auth/slices/authSlice";
import setupReducer from "../features/user/slices/setupSlice";

const reducer = combineReducers({
  auth: authReducer,
  setup: setupReducer,
});

export const store = configureStore({ reducer });
export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;
