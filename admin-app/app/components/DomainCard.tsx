"use client";

import React from 'react';
import Link from 'next/link';

interface CourseProps{
    courseName: string,
    domainName: string,
}

const DomainCard: React.FC<CourseProps> = ({courseName, domainName}) => {
  return (
    <div className='bg-[#2C3463] hover:bg-[#2c4787] text-white font-semibold rounded px-4 py-2 transition duration-300 transform hover:scale-105'>
        <div className='text-white text-center'>
        <Link href={`/collections?course=${encodeURIComponent(courseName)}&domain=${encodeURIComponent(domainName)}`}>{domainName}</Link>
        </div>
    </div>
  );
};

export default DomainCard;