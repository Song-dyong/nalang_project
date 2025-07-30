import { useNavigate } from "react-router-dom";

interface OwnProps {
  filters?: {
    genderId?: number;
    languageId?: number;
    minAge?: number;
    maxAge?: number;
  };
}

export const CallWaitingButton = ({ filters }: OwnProps) => {
  const navigate = useNavigate();

  const handleClick = () => {
    const accessToken = localStorage.getItem("access_token");
    if (!accessToken) {
      alert("로그인이 필요합니다!");
      return;
    }

    // 필터 정보를 쿼리 스트링으로 넘김
    const query = new URLSearchParams();
    if (filters?.genderId) query.append("genderId", String(filters.genderId));
    if (filters?.languageId)
      query.append("languageId", String(filters.languageId));
    if (filters?.minAge) query.append("minAge", String(filters.minAge));
    if (filters?.maxAge) query.append("maxAge", String(filters.maxAge));

    navigate(`/waiting?${query.toString()}`);
  };

  return (
    <button
      onClick={handleClick}
      className="w-[200px] bg-lime-100 hover:bg-lime-200 text-sky-300 py-2 rounded-[50px] transition font-bold"
    >
      대화상대 찾아보기
    </button>
  );
};
