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
          className="w-full bg-gray-100 hover:bg-gray-200 py-2 rounded-xl text-gray-700 font-medium"
        >
          Filter
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
