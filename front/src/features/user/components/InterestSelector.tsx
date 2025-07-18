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
  const toggleInterest = (id: number) => {
    if (selectedInterests.includes(id)) {
      onChange(selectedInterests.filter((i) => i !== id));
    } else {
      onChange([...selectedInterests, id]);
    }
  };
  return (
    <div>
      <h3>Interest</h3>
      {interests.map((interest) => (
        <label key={interest.id}>
          <input
            type="checkbox"
            checked={selectedInterests.includes(interest.id)}
            onChange={() => toggleInterest(interest.id)}
          />
          {interest.name}
        </label>
      ))}
    </div>
  );
};
