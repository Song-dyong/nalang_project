import { useSelector } from "react-redux";
import { CallWaitingButton } from "../features/voiceChat/components/CallWaitingButton";
import type { RootState } from "../stores/store";
import phone from "../assets/illu.jpg";
import { InterestsList } from "../features/home/components/InterestsList";
import { FilterBottomSheet } from "../features/home/components/FilterBottomSheet";
import { useState } from "react";

export const Home = () => {
  const user = useSelector((state: RootState) => state.auth.user);

  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filters, setFilters] = useState<{
    genderId?: number;
    languageId?: number;
    minAge?: number;
    maxAge?: number;
  }>({});
  return (
    <main
      className="h-full bg-[#fefeed] bg-center bg-cover flex flex-col items-center justify-center"
      style={{ backgroundImage: `url(${phone})` }}
    >
      <div className="mt-auto w-full max-w-md bg-white p-6 rounded-t-[30px] shadow-md text-center space-y-4 relative">
        <p className="text-gray-500 text-sm">{user?.name}</p>
        <InterestsList interests={user?.interests ?? []} />
        <button
          onClick={() => setIsFilterOpen(true)}
          className="w-[200px] bg-[#fca17d] hover:bg-[#fb8f65] py-2 rounded-[50px] text-gray-700 font-bold text-white"
        >
          필터
        </button>
        <CallWaitingButton filters={filters} />
        <FilterBottomSheet
          isOpen={isFilterOpen}
          onClose={() => setIsFilterOpen(false)}
          onApply={(selectedFilters) => {
            setFilters(selectedFilters);
            setIsFilterOpen(false);
          }}
        />
      </div>
    </main>
  );
};
