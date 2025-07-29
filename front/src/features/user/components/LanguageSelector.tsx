import type { SetupOption } from "../types/setupTypes";

interface OwnProps {
  languages: SetupOption[];
  selectedLanguages: number[];
  onChange: (ids: number[]) => void;
}

export const LanguageSelector = ({
  languages,
  selectedLanguages,
  onChange,
}: OwnProps) => {
  const toggle = (id: number) =>
    selectedLanguages.includes(id)
      ? onChange(selectedLanguages.filter((i) => i !== id))
      : onChange([...selectedLanguages, id]);

  return (
    <div>
      <h3 className="text-sm font-semibold mb-2 mt-4">가능 언어</h3>
      <div className="flex flex-wrap gap-2">
        {languages.map((lang) => {
          const isSelected = selectedLanguages.includes(lang.id);
          return (
            <button
              key={lang.id}
              onClick={() => toggle(lang.id)}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-colors duration-150
                ${
                  isSelected
                    ? "bg-[#A6DAF4] text-white hover:bg-[#92cbe6]"
                    : "bg-white text-gray-700 hover:bg-[#E0F3FA]"
                } // 선택 안 된 상태 hover 시 연한 파랑
              `}
            >
              {lang.name}
            </button>
          );
        })}
      </div>
    </div>
  );
};
