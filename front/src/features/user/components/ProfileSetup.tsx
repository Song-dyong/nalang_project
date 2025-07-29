import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import type { AppDispatch, RootState } from "../../../stores/store";
import { fetchSetupData } from "../slices/setupSlice";
import { GenderSelector } from "./GenderSelector";
import { InterestSelector } from "./InterestSelector";
import { LanguageSelector } from "./LanguageSelector";
import { updateUserProfile } from "../apis/setupApi";

export const ProfileSetup = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const user = useSelector((state: RootState) => state.auth.user);
  const { interests, languages, genders, loading, error } = useSelector(
    (state: RootState) => state.setup
  );

  console.log("user >>> ", user);

  const [selectedInterests, setSelectedInterests] = useState<number[]>([]);
  const [selectedLanguages, setSelectedLanguages] = useState<number[]>([]);
  const [selectedGenderId, setSelectedGenderId] = useState<number | null>(null);
  const [name, setName] = useState(user?.name ?? "");
  const [preview, setPreview] = useState<string | undefined>(user?.image_path);
  const [imageFile, setImageFile] = useState<File | null>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  useEffect(() => {
    dispatch(fetchSetupData("ko"));
  }, [dispatch]);

  const handleSubmit = async () => {
    const token = localStorage.getItem("access_token");
    if (!token) return alert("No Token");

    try {
      await updateUserProfile({
        interests: selectedInterests,
        languages: selectedLanguages,
        gender_id: selectedGenderId,
      });
      navigate("/home");
    } catch {
      alert("설정 저장에 실패했습니다.");
    }
  };

  if (loading) return <p>불러오는 중...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  return (
    <div className="p-6 max-w-md mx-auto space-y-6">
      <h2 className="text-xl font-semibold text-center">프로필 설정</h2>

      {/* 이미지 업로드 */}
      <div className="flex flex-col items-center space-y-2">
        {preview ? (
          <img src={preview} className="w-24 h-24 rounded-full object-cover" />
        ) : (
          <div className="w-40 h-40 rounded-full bg-gray-200" />
        )}
        <label className="bg-[#A6DAF4] text-white px-3 py-1 rounded cursor-pointer text-sm font-semibold">
          프로필 사진 선택
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="hidden"
          />
        </label>
      </div>

      {/* 이름 */}
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="이름을 입력하세요"
        className="w-full border rounded px-4 py-2 text-gray-800"
      />

      {/* 성별 선택 */}
      <GenderSelector
        genders={genders}
        selectedGenderId={selectedGenderId}
        onChange={setSelectedGenderId}
      />

      {/* 관심사 */}
      <InterestSelector
        interests={interests}
        selectedInterests={selectedInterests}
        onChange={setSelectedInterests}
      />

      {/* 언어 */}
      <LanguageSelector
        languages={languages}
        selectedLanguages={selectedLanguages}
        onChange={setSelectedLanguages}
      />

      <button
        onClick={handleSubmit}
        disabled={!selectedGenderId}
        className={`
    w-full py-2 rounded-full text-sm font-medium transition-colors duration-150
    ${
      selectedGenderId
        ? "bg-[#A6DAF4] text-white hover:bg-[#92cbe6] cursor-pointer"
        : "bg-gray-200 text-gray-400 cursor-not-allowed"
    }
  `}
      >
        설정 완료
      </button>
    </div>
  );
};
