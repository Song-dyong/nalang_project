import type { SetupOption } from "../types/setupTypes";

interface OwnProps {
  genders: SetupOption[];
  selectedGenderId: number | null;
  onChange: (id: number) => void;
}

export const GenderSelector = ({
  genders,
  selectedGenderId,
  onChange,
}: OwnProps) => {
  return (
    <div>
      <h3 className="text-sm font-semibold mb-2 mt-4">성별</h3>
      <div className="flex gap-2 flex-wrap">
        {genders.map((gender) => {
          const isSelected = selectedGenderId === gender.id;
          return (
            <button
              key={gender.id}
              onClick={() => onChange(gender.id)}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-colors duration-150
                ${
                  isSelected
                    ? "bg-[#A6DAF4] text-white hover:bg-[#92cbe6]"
                    : "bg-white text-gray-700 hover:bg-[#E0F3FA]"
                }
              `}
            >
              {gender.name}
            </button>
          );
        })}
      </div>
    </div>
  );
};
