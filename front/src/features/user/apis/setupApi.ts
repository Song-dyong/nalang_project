import axios from "axios";
import type { SetupOption } from "../types/setupTypes";
import { API_ENDPOINT } from "../../../apis/config";
import axiosInstance from "../../../utils/axiosInstance";

interface ProfileUpdatePayload {
  interests: number[];
  languages: number[];
  gender_id: number | null;
}

export const fetchInterests = async (
  locale: string
): Promise<SetupOption[]> => {
  const response = await axios.get(`${API_ENDPOINT.USER}/setup/interests`, {
    headers: {
      "Accept-Language": locale,
    },
  });
  return response.data;
};

export const fetchLanguages = async (
  locale: string
): Promise<SetupOption[]> => {
  const response = await axios.get(`${API_ENDPOINT.USER}/setup/languages`, {
    headers: {
      "Accept-Language": locale,
    },
  });
  return response.data;
};

export const fetchGenders = async (locale: string): Promise<SetupOption[]> => {
  const response = await axios.get(`${API_ENDPOINT.USER}/setup/genders`, {
    headers: {
      "Accept-Language": locale,
    },
  });
  return response.data;
};

export const updateUserProfile = async (data: ProfileUpdatePayload) => {
  await axiosInstance.post(`${API_ENDPOINT.USER}/me/profile`, data);
};

export const uploadProfileImage = async (file: File): Promise<string> => {
  const formData = new FormData();
  formData.append("file", file);

  const response = await axiosInstance.post(
    `${API_ENDPOINT.USER}/me/profile-image`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );

  return response.data.image_url;
};
