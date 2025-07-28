import type { ReactNode } from "react";
import Logo from "../assets/NaLang_Logo2.png";

export const Landing = ({ children }: { children: ReactNode }) => {
  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-[#fefeed] text-gray-800">
      <div className="flex flex-col justify-center items-center w-full lg:w-2/3 p-10 text-center space-y-6">
        <img src={Logo} alt="NaLangLogo" className="w-32" />
        <p className="text-lg max-w-xl leading-relaxed">
          언어를 나누고 친구를 사귀는
          <br />
          AI 기반 실시간 음성 대화 플랫폼
        </p>
        <p className="text-sm text-gray-500">언어는 나눌수록 자랍니다 🌱</p>
      </div>
      <div className="flex justify-center items-center w-full lg:w-1/3 bg-[#fefeed]">
        <div className="w-[360px] h-[720px] border-2 border-gray-300 rounded-3xl overflow-hidden">
          {children}
        </div>
      </div>
    </div>
  );
};
