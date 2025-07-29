import { API_ENDPOINT } from "../../../apis/config";
import axiosInstance from "../../../utils/axiosInstance";

export const fetchCallToken = async (room: string) => {
  const res = await axiosInstance.post(`${API_ENDPOINT.CALL}/token`, { room });
  return res.data.access_token;
};
