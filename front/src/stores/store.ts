import { combineReducers, configureStore } from "@reduxjs/toolkit";
import authReducer from "../features/auth/slices/authSlice";
import setupReducer from "../features/user/slices/setupSlice";
import callReducer from "../features/voiceChat/slices/callSlice";

const reducer = combineReducers({
  auth: authReducer,
  setup: setupReducer,
  call: callReducer,
});

export const store = configureStore({ reducer });
export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;
