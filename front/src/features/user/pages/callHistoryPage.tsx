import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../../../stores/store";
import { Sparkles } from "lucide-react";
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
              className="flex items-center bg-white rounded-xl shadow-sm hover:shadow-md transition p-4"
            >
              {/* Partner Image */}
              <img
                src={history.partner.profile_image}
                alt={history.partner.name}
                className="w-16 h-16 rounded-full object-cover mr-4 border-2 border-[#F6D14A]"
              />

              {/* Info Section */}
              <div className="flex-1">
                <div className="flex justify-between items-center">
                  <p className="font-bold text-md">{history.partner.name}</p>
                  <p className="text-sm text-gray-500">
                    {formattedDate} {formattedTime}
                  </p>
                </div>

                <div className="text-sm text-gray-700 mt-1">
                  <span className="font-semibold">통화시간:</span>{" "}
                  {Math.floor(history.duration_sec / 60)}분{" "}
                  {history.duration_sec % 60}초
                </div>

                {history.summary_text && (
                  <div className="mt-2 text-sm text-gray-800 bg-indigo-50 rounded-xl p-3 flex items-start gap-2">
                    <Sparkles className="w-4 h-4 mt-0.5 text-indigo-400" />
                    <div>
                      <span className="font-bold text-indigo-500">요약:</span>{" "}
                      {history.summary_text}
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
