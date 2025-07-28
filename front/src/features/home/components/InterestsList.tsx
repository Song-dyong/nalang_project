interface OwnProps {
  interests: string[];
}
export const InterestsList = ({ interests }: OwnProps) => {
  return (
    <div className="w-full text-left space-y-2">
      <h2 className="text-md font-semibold">내 관심사</h2>
      <ul className="flex flex-wrap gap-2">
        {interests.length > 0 ? (
          interests.map((interest: string, idx: number) => (
            <li
              key={idx}
              className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm"
            >
              {interest}
            </li>
          ))
        ) : (
          <p className="text-sm text-gray-400">관심사가 없습니다.</p>
        )}
      </ul>
    </div>
  );
};
