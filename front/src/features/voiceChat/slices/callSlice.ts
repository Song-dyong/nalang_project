import {
  createAsyncThunk,
  createSlice,
  type PayloadAction,
} from "@reduxjs/toolkit";
import { fetchCallHistories } from "../apis/callApi";
import type { CallHistoryResponse } from "../types/callType";

interface CallState {
  histories: CallHistoryResponse[];
  loading: boolean;
  error: string | null;
}

const initialState: CallState = {
  histories: [],
  loading: false,
  error: null,
};

export const fetchCallHistoriesThunk = createAsyncThunk(
  "call/fetchHistories",
  async () => {
    const res = await fetchCallHistories();
    return res;
  }
);

const callSlice = createSlice({
  name: "call",
  initialState,
  reducers: {
    clearHistories: (state) => {
      state.histories = [];
      state.error = null;
      state.loading = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCallHistoriesThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        fetchCallHistoriesThunk.fulfilled,
        (state, action: PayloadAction<CallHistoryResponse[]>) => {
          state.histories = action.payload;
          state.loading = false;
        }
      )
      .addCase(fetchCallHistoriesThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? "Failed to load history";
      });
  },
});

export const { clearHistories } = callSlice.actions;
export default callSlice.reducer;
