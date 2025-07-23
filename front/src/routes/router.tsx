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
  },
  {
    id: 1,
    name: "Register",
    path: "/register",
    element: RegisterPage,
  },
  {
    id: 2,
    name: "ProfileSetup",
    path: "/profile/setup",
    element: ProfileSetupPage,
  },
  {
    id: 3,
    name: "Login",
    path: "/login",
    element: LoginPage,
  },
  {
    id: 4,
    name: "Callback",
    path: "/social/callback",
    element: SocialCallbackPage,
  },
  {
    id: 5,
    name: "VoiceRoom",
    path: "/voice-call",
    element: VoiceCallPage,
  },
];
