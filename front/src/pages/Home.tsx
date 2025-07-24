import { CallWaitingButton } from "../features/voiceChat/components/CallWaitingButton";

export const Home = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-md text-center">
        <h2 className="text-xl font-semibold mb-6">🗣️ 랜덤 통화 시작</h2>
        <CallWaitingButton />
      </div>
    </div>
  );
};
