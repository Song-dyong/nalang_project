import { useEffect, useState } from "react";
import type { SetupOption } from "../../user/types/setupTypes";
import { fetchLanguages } from "../../user/apis/setupApi";

interface OwnProps {
  selectedLanguageId: number | null;
  onSelect: (option: SetupOption) => void;
}

export const LanguageSelector = ({
  selectedLanguageId,
  onSelect,
}: OwnProps) => {
  const [languages, setLanguages] = useState<SetupOption[]>([]);
  const locale = "ko";

  useEffect(() => {
    fetchLanguages(locale).then(setLanguages);
  }, []);

  return (
    <div className="flex gap-3">
      {languages.map((language) => (
        <button
          key={language.id}
          onClick={() => onSelect(language)}
          className={`p-4 rounded-xl border-2 ${
            selectedLanguageId === language.id
              ? "border-red-500 text-red-500"
              : "border-gray-300 text-gray-500"
          }`}
        >
          {language.name}
        </button>
      ))}
    </div>
  );
};
