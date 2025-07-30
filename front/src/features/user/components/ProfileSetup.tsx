import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import type { AppDispatch, RootState } from "../../../stores/store";
import { fetchSetupData } from "../slices/setupSlice";
import { GenderSelector } from "./GenderSelector";
import { InterestSelector } from "./InterestSelector";
import { LanguageSelector } from "./LanguageSelector";
import { updateUserProfile, uploadProfileImage } from "../apis/setupApi";
import newbie from "../../../assets/newbie.jpg";
import { fetchMeThunk } from "../../auth/slices/authSlice";

export const ProfileSetup = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const user = useSelector((state: RootState) => state.auth.user);
  const { interests, languages, genders, loading, error } = useSelector(
    (state: RootState) => state.setup
  );

  const [selectedInterests, setSelectedInterests] = useState<number[]>([]);
  const [selectedLanguages, setSelectedLanguages] = useState<number[]>([]);
  const [selectedGenderId, setSelectedGenderId] = useState<number | null>(null);
  const [name, setName] = useState(user?.name ?? "");
  const [preview, setPreview] = useState<string | undefined>();
  const [imageFile, setImageFile] = useState<File | null>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (!file) return;

    const validImageTypes = [
      "image/jpeg",
      "image/png",
      "image/gif",
      "image/jpg",
      "image/webp",
    ];
    const maxSizeImage = 10 * 1024 * 1024

    if (!validImageTypes.includes(file.type)) {
      alert("이미지 파일(jpg, png, gif, webp)만 업로드 가능합니다.");
      return;
    }

    if (file.size > maxSizeImage) {
      alert("이미지 파일은 최대 10MB까지 업로드 가능합니다.")
      return
    }

    if (file) {
      setImageFile(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  useEffect(() => {
    setPreview(user?.image_path || newbie);
    setName(user?.name || "");
    dispatch(fetchSetupData("ko"));
  }, [dispatch, user]);

  const handleSubmit = async () => {
    const token = localStorage.getItem("access_token");
    if (!token) return alert("No Token");

    try {
      if (imageFile) {
        await uploadProfileImage(imageFile);
      }

      await updateUserProfile({
        interests: selectedInterests,
        languages: selectedLanguages,
        gender_id: selectedGenderId,
      });
      await dispatch(fetchMeThunk());
      navigate("/profile");
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

      <input
        type="text"
        value={name}
        placeholder="이름을 입력하세요"
        className="w-full rounded px-4 py-2 text-gray-800 text-center"
        disabled
      />
      <GenderSelector
        genders={genders}
        selectedGenderId={selectedGenderId}
        onChange={setSelectedGenderId}
      />
      <InterestSelector
        interests={interests}
        selectedInterests={selectedInterests}
        onChange={setSelectedInterests}
      />
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
