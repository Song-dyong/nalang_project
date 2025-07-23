import axios from "axios";
import { API_ENDPOINT } from "../../../apis/config";

export const fetchCallToken = async (room: string, accessToken: string) => {
  const res = await axios.post(
    `${API_ENDPOINT.CALL}/token`,
    { room },
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );
  return res.data.access_token;
};
