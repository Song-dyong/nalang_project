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

  const { interests, languages, genders, loading, error } = useSelector(
    (state: RootState) => state.setup
  );

  const [selectedInterests, setSelectedInterests] = useState<number[]>([]);
  const [selectedLanguages, setSelectedLanguages] = useState<number[]>([]);
  const [selectedGenderId, setSelectedGenderId] = useState<number | null>(null);

  useEffect(() => {
    dispatch(fetchSetupData("ko"));
  }, [dispatch]);

  const handleSubmit = async () => {
    const token = localStorage.getItem("access_token");
    if (!token) return alert("No Token");

    try {
      await updateUserProfile(
        {
          interests: selectedInterests,
          languages: selectedLanguages,
          gender_id: selectedGenderId,
        },
        token
      );
      navigate("/home");
    } catch {
      alert("설정 저장에 실패했습니다.");
    }
  };

  if (loading) return <p>불러오는 중...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  return (
    <div>
      <h2>프로필 설정</h2>

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

      <button onClick={handleSubmit} disabled={!selectedGenderId}>
        설정 완료
      </button>
    </div>
  );
};
