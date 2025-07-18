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
      <h3>Gender</h3>
      {genders.map((gen) => (
        <label key={gen.id}>
          <input
            type="radio"
            name="gender"
            checked={selectedGenderId === gen.id}
            onChange={() => onChange(gen.id)}
          />
          {gen.name}
        </label>
      ))}
    </div>
  );
};
