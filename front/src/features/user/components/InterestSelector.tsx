import type { SetupOption } from "../types/setupTypes";

interface OwnProps {
  interests: SetupOption[];
  selectedInterests: number[];
  onChange: (ids: number[]) => void;
}

export const InterestSelector = ({
  interests,
  selectedInterests,
  onChange,
}: OwnProps) => {
  const toggle = (id: number) =>
    selectedInterests.includes(id)
      ? onChange(selectedInterests.filter((i) => i !== id))
      : onChange([...selectedInterests, id]);

  return (
    <div>
      <h3 className="text-sm font-semibold mb-2 mt-4">관심사</h3>
      <div className="flex flex-wrap gap-2">
        {interests.map((interest) => {
          const isSelected = selectedInterests.includes(interest.id);
          return (
            <button
              key={interest.id}
              onClick={() => toggle(interest.id)}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-colors duration-150
                ${
                  isSelected
                    ? "bg-[#A6DAF4] text-white hover:bg-[#92cbe6]"
                    : "bg-white text-gray-700 hover:bg-[#E0F3FA]"
                }
              `}
            >
              {interest.name}
            </button>
          );
        })}
      </div>
    </div>
  );
};
