import axios from "axios";
import type {
  LoginRequest,
  RegisterRequest,
  TokenResponse,
  UserProfileResponse,
  UserResponse,
} from "../types/authTypes";
import { API_ENDPOINT } from "../../../apis/config";

export const registerUser = async (
  data: RegisterRequest
): Promise<UserResponse> => {
  const response = await axios.post(`${API_ENDPOINT.AUTH}/register`, data);
  return response.data;
};

export const loginUser = async (data: LoginRequest): Promise<TokenResponse> => {
  const response = await axios.post(`${API_ENDPOINT.AUTH}/login`, data, {
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
  });
  return response.data;
};

export const logoutUser = async (refreshToken: string): Promise<void> => {
  await axios.post(`${API_ENDPOINT.AUTH}/logout`, {
    refresh_token: refreshToken,
  });
};

export const fetchMe = async (
  accessToken: string
): Promise<UserProfileResponse> => {
  const response = await axios.get(`${API_ENDPOINT.USER}/me`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
  return response.data;
};
