import { LoginPage } from "../features/auth/pages/LoginPage";
import { RegisterPage } from "../features/auth/pages/RegisterPage";
import { SocialCallbackPage } from "../features/auth/pages/SocialCallbackPage";
import { CallHistoryPage } from "../features/user/pages/callHistoryPage";
import { ProfileSetupPage } from "../features/user/pages/ProfileSetupPage";
import { VoiceCallPage } from "../features/voiceChat/pages/VoiceCallPage";
import { WaitingRoom } from "../features/voiceChat/pages/WaitingRoom";
import { Chat } from "../pages/Chat";
import { Community } from "../pages/Community";
import { Feed } from "../pages/Feed";
import { Home } from "../pages/Home";
import { Profile } from "../pages/Profile.";

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
  {
    id: 6,
    name: "Feed",
    path: "/feed",
    element: Feed,
    requireAuth: true,
  },
  {
    id: 7,
    name: "Chat",
    path: "/chat",
    element: Chat,
    requireAuth: true,
  },
  {
    id: 8,
    name: "Community",
    path: "/community",
    element: Community,
    requireAuth: true,
  },
  {
    id: 9,
    name: "Profile",
    path: "/profile",
    element: Profile,
    requireAuth: true,
  },
  {
    id: 10,
    name: "Waiting",
    path: "/waiting",
    element: WaitingRoom,
    requireAuth: true,
  },
  {
    id: 11,
    name: "History",
    path: "/profile/history",
    element: CallHistoryPage,
    requireAuth: true,
  },
];
