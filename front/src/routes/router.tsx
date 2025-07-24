import { LoginPage } from "../features/auth/pages/LoginPage";
import { RegisterPage } from "../features/auth/pages/RegisterPage";
import { SocialCallbackPage } from "../features/auth/pages/SocialCallbackPage";
import { ProfileSetupPage } from "../features/user/pages/ProfileSetupPage";
import { VoiceCallPage } from "../features/voiceChat/pages/VoiceCallPage";
import { Home } from "../pages/Home";

export const Router = [
  {
    id: 99,
    name: "home",
    path: "/home",
    element: Home,
    requireAuth: true,
  },
  {
    id: 1,
    name: "Register",
    path: "/register",
    element: RegisterPage,
    requireAuth: true,
  },
  {
    id: 2,
    name: "ProfileSetup",
    path: "/profile/setup",
    element: ProfileSetupPage,
    requireAuth: true,
  },
  {
    id: 3,
    name: "Login",
    path: "/login",
    element: LoginPage,
    requireAuth: false,
  },
  {
    id: 4,
    name: "Callback",
    path: "/social/callback",
    element: SocialCallbackPage,
    requireAuth: false,
  },
  {
    id: 5,
    name: "VoiceRoom",
    path: "/voice-room/:roomName",
    element: VoiceCallPage,
    requireAuth: true,
  },
];
