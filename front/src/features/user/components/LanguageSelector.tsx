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
  const toggleLanguage = (id: number) => {
    if (selectedLanguages.includes(id)) {
      onChange(selectedLanguages.filter((i) => i !== id));
    } else {
      onChange([...selectedLanguages, id]);
    }
  };

  return (
    <div>
      <h3>Language</h3>
      {languages.map((lang) => (
        <label key={lang.id} style={{ display: "block" }}>
          <input
            type="checkbox"
            checked={selectedLanguages.includes(lang.id)}
            onChange={() => toggleLanguage(lang.id)}
          />
          {lang.name}
        </label>
      ))}
    </div>
  );
};
