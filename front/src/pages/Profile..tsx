import { useSelector } from "react-redux";
import type { RootState } from "../stores/store";
import newbie from "../assets/newbie.jpg";
export const Profile = () => {
  const user = useSelector((state: RootState) => state.auth.user);
  console.log(user);
  return (
    <div className="relative h-full bg-white flex flex-col items-center px-6 pt-10">
      {/* 설정 버튼 */}
      <button className="absolute top-6 right-6 text-gray-500 text-2xl">
        ⚙️
      </button>

      <div className="relative">
        <img
          src={user?.image_path || newbie}
          className="w-32 h-32 rounded-full border-4 border-white shadow-md object-cover"
        />
        <div className="absolute bottom-0 right-0 bg-white rounded-full p-1 shadow -mb-1 -mr-1 text-lg">
          ✏️
        </div>
      </div>

      {/* 사용자 닉네임 */}
      <p className="mt-4 text-lg font-bold text-gray-800">
        {user?.name || "의문의 고양이"}
      </p>

      {/* 통화 기록 메뉴 */}
      <div className="w-full mt-10 border-t">
        <button className="w-full flex items-center py-4 border-b px-4">
          <span className="text-xl mr-3">📞</span>
          <span className="text-gray-700 font-medium">통화 기록</span>
        </button>
      </div>
    </div>
  );
};
