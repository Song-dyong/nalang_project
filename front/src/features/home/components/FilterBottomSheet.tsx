import { useState } from "react";
import { GenderSelector } from "./GenderSelector";
import { LanguageSelector } from "./LanguageSelector";
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
  const [minAge, setMinAge] = useState<number>();
  const [maxAge, setMaxAge] = useState<number>();
  if (!isOpen) return null;

  return (
    <div
      className={`absolute bottom-0 left-0 right-0 w-full bg-white rounded-t-2xl shadow-xl transition-transform duration-300 z-50
    ${isOpen ? "translate-y-0" : "translate-y-full"}
  `}
    >
      <div className="w-full max-w-md bd-white rounded-t-2xl p-4 space-y-6 transition-transform duration-300 transform translate-y-0">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-bold">Filter</h2>
          <button onClick={onClose} className="text-gray-400 text-xl">
            X
          </button>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <h3 className="text-sm font-semibold mb-1">Gender</h3>
          <GenderSelector
            selectedGenderId={selectedGender?.id ?? null}
            onSelect={(option) => setSelectedGender(option)}
          ></GenderSelector>
        </div>

        {/* 언어 선택 */}
        <div>
          <h3 className="text-sm font-semibold mb-1">언어</h3>
          <LanguageSelector
            selectedLanguageId={selectedLanguage?.id ?? null}
            onSelect={(option) => setSelectedLanguage(option)}
          />
        </div>

        {/* 나이 범위 */}
        <div className="flex gap-3">
          <input
            type="number"
            placeholder="최소 나이"
            className="border px-3 py-2 rounded-md w-full"
            value={minAge ?? ""}
            onChange={(e) =>
              setMinAge(e.target.value ? Number(e.target.value) : undefined)
            }
          />
          <input
            type="number"
            placeholder="최대 나이"
            className="border px-3 py-2 rounded-md w-full"
            value={maxAge ?? ""}
            onChange={(e) =>
              setMaxAge(e.target.value ? Number(e.target.value) : undefined)
            }
          />
        </div>
      </div>

      {/* 적용 버튼 */}
      <button
        onClick={() => {
          onApply({
            genderId: selectedGender?.id,
            languageId: selectedLanguage?.id,
            minAge,
            maxAge,
          });
        }}
        className="w-full bg-sky-400 hover:bg-sky-500 text-white py-2 rounded-xl font-semibold transition"
      >
        적용하기
      </button>
    </div>
  );
};
