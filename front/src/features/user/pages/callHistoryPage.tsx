import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../../../stores/store";
import { fetchCallHistoriesThunk } from "../../voiceChat/slices/callSlice";

export const CallHistoryPage = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { histories, loading, error } = useSelector(
    (state: RootState) => state.call
  );

  useEffect(() => {
    dispatch(fetchCallHistoriesThunk());
  }, [dispatch]);

  if (loading)
    return (
      <div className="p-4 text-center text-gray-600 animate-pulse">
        불러오는 중...
      </div>
    );
  if (error)
    return <div className="p-4 text-center text-red-500">오류: {error}</div>;
  if (histories.length === 0)
    return (
      <div className="p-6 text-center text-gray-500 text-sm">
        아직 통화 기록이 없습니다.
      </div>
    );

  return (
    <div className="bg-[#fefeed] min-h-screen py-6 px-4 text-gray-800">
      <h2 className="text-xl font-semibold mb-4">통화 기록</h2>

      <div className="space-y-4">
        {histories.map((history) => {
          const start = new Date(history.started_at);
          const formattedDate = start.toLocaleDateString("ko-KR", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
          });
          const formattedTime = start.toLocaleTimeString("ko-KR", {
            hour: "2-digit",
            minute: "2-digit",
          });

          return (
            <div
              key={history.id}
              className="flex bg-white rounded-xl shadow-sm hover:shadow-md transition p-4"
            >
              {/* 프로필 이미지 */}
              <img
                src={history.partner.profile_image}
                alt={history.partner.name}
                className="w-16 h-16 rounded-full object-cover mr-4 border-2 border-[#F6D14A]"
              />

              {/* 오른쪽 텍스트 영역 */}
              <div className="flex flex-col justify-center">
                <p className="text-md font-bold mb-1 break-words w-44">
                  {history.partner.name}
                </p>
                <p className="text-sm text-gray-700">
                  통화시간: {Math.floor(history.duration_sec / 60)}분{" "}
                  {history.duration_sec % 60}초
                </p>
                <p className="text-sm text-gray-500">
                  {formattedDate} {formattedTime}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
