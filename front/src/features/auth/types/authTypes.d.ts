export interface RegisterRequest {
  email: string;
  name: string;
  password?: string;
  provider?: string;
  profile_image?: string;
}

export interface UserResponse {
  access_token: string;
  refresh_token: string;
  user: {
    id: number;
    email: string;
    name: string;
    interests: List[string];
    languages: List[string];
    genders?: string;
    image_path?: string;
  };
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

export interface UserProfileResponse {
  id: number;
  name: string;
  email: string;
  interests: List[str];
  languages: List[str];
  gender?: str;
  image_path?: str;
}
