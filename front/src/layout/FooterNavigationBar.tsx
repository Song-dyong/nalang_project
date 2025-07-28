import { NavLink } from "react-router-dom";

export const FooterNavigationBar = () => {
  const tabs = [
    { to: "/home", label: "홈" },
    { to: "/feed", label: "Feed" },
    { to: "/chat", label: "Chat" },
    { to: "/community", label: "커뮤니티" },
    { to: "/profile", label: "프로필" },
  ];
  return (
    <nav className="h-14 border-t border-gray-300 bg-white flex justify-around items-center text-sm">
      {tabs.map((tab) => (
        <NavLink
          key={tab.to}
          to={tab.to}
          className={({ isActive }) =>
            `flex flex-col items-center ${
              isActive ? "text-blue-500 font-bold" : "text-gray-500"
            }`
          }
        >
          <span>{tab.label}</span>
        </NavLink>
      ))}
    </nav>
  );
};
