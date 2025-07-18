import { LoginPage } from "../features/auth/pages/LoginPage";
import { RegisterPage } from "../features/auth/pages/RegisterPage";
import { ProfileSetupPage } from "../features/user/pages/ProfileSetupPage";
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
];
