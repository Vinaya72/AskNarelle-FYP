"use client"
import { Suspense } from 'react';
import DomainCard from "../components/DomainCard";
import { useSearchParams } from 'next/navigation';

function DomainContent() {
  const searchParams = useSearchParams();
  const collectionName = searchParams.get("query") || '';

  const domains = ['Lectures', 'Tutorials', 'Labs', 'Others'];

  return (
    <main className="flex h-screen flex-col p-24 bg-gray-100 justify-center items-center">   
        <div className="font-semibold relative text-xl">
          Categories
          <div className="absolute bottom-0 left-4 w-16 h-1 bg-[#3F50AD]"></div>
        </div>
  
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-lg mt-5">
        <div className="flex flex-col space-y-4">
          {domains.map((domain: string, index: number) => (
            <DomainCard key={index} courseName={collectionName} domainName={domain} />
          ))}
        </div>
      </div>
    </main>
  );
}

export default function DomainPage(): JSX.Element {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <DomainContent />
    </Suspense>
  );
}
