import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type {
  LoginRequest,
  RegisterRequest,
  UserResponse,
} from "../types/authTypes";
import { fetchMe, loginUser, logoutUser, registerUser } from "../apis/authApi";

interface AuthState {
  user: UserResponse["user"] | null;
  loading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  loading: false,
  error: null,
};

export const registerThunk = createAsyncThunk(
  "auth/register",
  async (data: RegisterRequest, { rejectWithValue }) => {
    try {
      const response = await registerUser(data);
      localStorage.setItem("access_token", response.access_token);
      localStorage.setItem("refresh_token", response.refresh_token);
      return response;
    } catch {
      return rejectWithValue("Register Failed");
    }
  }
);
export const loginThunk = createAsyncThunk(
  "auth/login",
  async (data: LoginRequest, { rejectWithValue }) => {
    try {
      const response = await loginUser(data);
      localStorage.setItem("access_token", response.access_token);
      localStorage.setItem("refresh_token", response.refresh_token);

      return response;
    } catch {
      return rejectWithValue("Login Failed");
    }
  }
);

export const logoutThunk = createAsyncThunk(
  "auth/logout",
  async (_, { dispatch, rejectWithValue }) => {
    try {
      const refreshToken = localStorage.getItem("refresh_token");
      if (refreshToken) {
        await logoutUser(refreshToken);
      }
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");

      dispatch(logout());
    } catch {
      return rejectWithValue("Logout Failed");
    }
  }
);

export const fetchMeThunk = createAsyncThunk(
  "auth/fetchMe",
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("access_token");
      if (!token) {
        throw new Error("No Token");
      }
      const response = await fetchMe(token);
      return response;
    } catch {
      return rejectWithValue("Failed to Fetch user");
    }
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.loading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(registerThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
      })
      .addCase(registerThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(loginThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginThunk.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(loginThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchMeThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMeThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
      })
      .addCase(fetchMeThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;
