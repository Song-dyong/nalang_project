import { useEffect, useState } from "react";
import type { SetupOption } from "../../user/types/setupTypes";
import { fetchGenders } from "../../user/apis/setupApi";

interface OwnProps {
  selectedGenderId: number | null;
  onSelect: (option: SetupOption) => void;
}

export const GenderSelector = ({ selectedGenderId, onSelect }: OwnProps) => {
  const [genders, setGenders] = useState<SetupOption[]>([]);
  const locale = "ko";

  useEffect(() => {
    fetchGenders(locale).then(setGenders);
  }, []);

  return (
    <div className="flex gap-3">
      {genders.map((gender) => (
        <button
          key={gender.id}
          onClick={() => onSelect(gender)}
          className={`p-4 rounded-xl border-2 ${
            selectedGenderId === gender.id
              ? "border-red-500 text-red-500"
              : "border-gray-300 text-gray-500"
          }`}
        >
          {gender.name}
        </button>
      ))}
    </div>
  );
};
