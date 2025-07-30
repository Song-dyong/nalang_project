import { API_ENDPOINT } from "../../../apis/config";
import axiosInstance from "../../../utils/axiosInstance";
import type { UserProfileResponse } from "../../auth/types/authTypes";

export const fetchCallToken = async (room: string) => {
  const res = await axiosInstance.post(`${API_ENDPOINT.CALL}/token`, { room });
  return res.data.access_token;
};

export const getPartnerData = async (id: number): Promise<UserProfileResponse> => {
  const res = await axiosInstance.get(`${API_ENDPOINT.USER}/${id}`);
  return res.data;
};
