import { useState } from "react";
import { GenderSelector } from "./GenderSelector";
import { LanguageSelector } from "./LanguageSelector";
import { AgeRangeSlider } from "./AgeRangeSlider"; // 슬라이더 컴포넌트 import
import type { SetupOption } from "../../user/types/setupTypes";

interface FilterValues {
  genderId?: number;
  languageId?: number;
  minAge?: number;
  maxAge?: number;
}

interface OwnProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (filters: FilterValues) => void;
}

export const FilterBottomSheet = ({ isOpen, onClose, onApply }: OwnProps) => {
  const [selectedGender, setSelectedGender] = useState<SetupOption | null>(
    null
  );
  const [selectedLanguage, setSelectedLanguage] = useState<SetupOption | null>(
    null
  );
  const [ageRange, setAgeRange] = useState<[number, number]>([10, 80]);

  if (!isOpen) return null;

  return (
    <div className="absolute bottom-0 left-0 right-0 z-50">
      {/* 반투명 배경 오버레이 */}
      <div
        className="absolute inset-0 bg-black bg-opacity-30"
        onClick={onClose}
      />

      {/* 모달 본체 */}
      <div className="relative z-10 w-full h-fit bg-white rounded-t-3xl p-6 shadow-xl max-w-[360px] mx-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold text-gray-700">필터 설정</h2>
          <button onClick={onClose} className="text-gray-400 text-xl">
            ×
          </button>
        </div>

        {/* 성별 선택 */}
        <div className="mb-4">
          <h3 className="text-sm font-semibold mb-2 text-gray-600">성별</h3>
          <GenderSelector
            selectedGenderId={selectedGender?.id ?? null}
            onSelect={setSelectedGender}
          />
        </div>

        {/* 언어 선택 */}
        <div className="mb-4">
          <h3 className="text-sm font-semibold mb-2 text-gray-600">언어</h3>
          <LanguageSelector
            selectedLanguageId={selectedLanguage?.id ?? null}
            onSelect={setSelectedLanguage}
          />
        </div>

        {/* 나이 슬라이더 */}
        <div className="mb-4">
          <h3 className="text-sm font-semibold mb-2 text-gray-600">나이</h3>
          <AgeRangeSlider values={ageRange} onChange={setAgeRange} />
        </div>

        {/* 적용하기 버튼 */}
        <button
          onClick={() => {
            onApply({
              genderId: selectedGender?.id,
              languageId: selectedLanguage?.id,
              minAge: ageRange[0],
              maxAge: ageRange[1],
            });
          }}
          className="w-full bg-[#fca17d] hover:bg-[#fb8f65] text-white font-semibold py-2 rounded-full"
        >
          적용하기
        </button>
      </div>
    </div>
  );
};
