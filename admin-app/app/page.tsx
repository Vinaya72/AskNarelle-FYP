"use client";
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  return (
    <div className="h-screen flex flex-col items-center justify-center bg-gray-100">
     <h1 className="text-3xl font-bold mb-6 text-center text-[#2C3463] relative">
          AskNarelle Admin App
          <span className="absolute left-1/2 transform -translate-x-1/2 bottom-0 w-[10rem] h-1 bg-[#2C3463] rounded"></span>
        </h1>
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-lg mt-5">
        <div className="flex flex-col space-y-4">
          <button
            className="bg-[#2C3463] hover:bg-[#2c4787] text-white font-semibold rounded px-4 py-2 transition duration-300 transform hover:scale-105"
            onClick={() => { router.push('/knowledgebase_management') }}
          >
            Manage Knowledge base
          </button>
          <button
            className="bg-[#2C3463] hover:bg-[#2c4787] text-white font-semibold rounded px-4 py-2 transition duration-300 transform hover:scale-105"
            onClick={() => { router.push('/dashboard') }}
          >
            View Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}

