import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type { SetupState } from "../types/setupTypes";
import { fetchGenders, fetchInterests, fetchLanguages } from "../apis/setupApi";

const initialState: SetupState = {
  interests: [],
  languages: [],
  genders: [],
  loading: false,
  error: null,
};

export const fetchSetupData = createAsyncThunk(
  "setup/fetchSetupData",
  async (locale: string, { rejectWithValue }) => {
    try {
      const [interests, languages, genders] = await Promise.all([
        fetchInterests(locale),
        fetchLanguages(locale),
        fetchGenders(locale),
      ]);
      return { interests, languages, genders };
    } catch {
      return rejectWithValue("설정 데이터 불러오기 실패");
    }
  }
);

const setupSlice = createSlice({
  name: "setup",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchSetupData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSetupData.fulfilled, (state, action) => {
        state.loading = false;
        state.interests = action.payload.interests;
        state.languages = action.payload.languages;
        state.genders = action.payload.genders;
      })
      .addCase(fetchSetupData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export default setupSlice.reducer;
