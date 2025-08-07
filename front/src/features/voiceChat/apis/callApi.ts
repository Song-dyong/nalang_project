import { API_ENDPOINT } from "../../../apis/config";
import axiosInstance from "../../../utils/axiosInstance";
import type { UserProfileResponse } from "../../auth/types/authTypes";
import type {
  CallHistoryRequest,
  CallHistoryResponse,
} from "../types/callType";

export const fetchCallToken = async (room: string) => {
  const res = await axiosInstance.post(`${API_ENDPOINT.CALL}/token`, { room });
  return res.data.access_token;
};

export const getPartnerData = async (
  id: number
): Promise<UserProfileResponse> => {
  const res = await axiosInstance.get(`${API_ENDPOINT.USER}/${id}`);
  return res.data;
};

export const deleteRoom = async (
  roomName: string
): Promise<{ deleted: string }> => {
  const res = await axiosInstance.delete(
    `${API_ENDPOINT.CALL}/room/${roomName}`
  );
  return res.data;
};

export const recordHistory = async (
  data: CallHistoryRequest
): Promise<CallHistoryResponse> => {
  const res = await axiosInstance.post(`${API_ENDPOINT.CALL}/record`, data);
  return res.data;
};
