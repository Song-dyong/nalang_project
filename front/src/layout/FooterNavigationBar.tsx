import { Home, Rss, MessageCircle, Users
 } from "lucide-react";
import { useSelector } from "react-redux";
import { NavLink } from "react-router-dom";
import { type RootState } from "../stores/store";
import newbie from "../assets/newbie.jpg";
export const FooterNavigationBar = () => {
  const user = useSelector((state: RootState) => state.auth.user);
  const tabs = [
    { to: "/home", label: "홈", icon: <Home size={20} /> },
    { to: "/feed", label: "피드", icon: <Rss size={20} /> },
    { to: "/chat", label: "채팅", icon: <MessageCircle size={20} /> },
    { to: "/community", label: "커뮤니티", icon: <Users size={20} /> },
    {
      to: "/profile",
      label: "프로필",
      icon: (
        <img
          src={user?.image_path || newbie}
          alt="profile"
          className="w-7 h-7 rounded-full object-cover border border-gray-300"
        />
      ),
    },
  ];

  return (
    <nav className="h-14 border-t border-gray-300 bg-white flex justify-around items-center text-sm">
      {tabs.map((tab) => (
        <NavLink
          key={tab.to}
          to={tab.to}
          className={({ isActive }) =>
            `flex flex-col items-center p-2 rounded-full transition-all duration-150
     ${isActive ? "text-blue-500 font-bold" : "text-gray-500"}
     hover:bg-gray-100 hover:scale-110`
          }
        >
          {tab.icon}
        </NavLink>
      ))}
    </nav>
  );
};
