"use client";

import React,{useState, useEffect} from 'react';
import { RiDeleteBin6Line } from "react-icons/ri";
import { IoFolderOutline } from "react-icons/io5";
import { useRouter } from 'next/navigation';

interface CourseProps{
    courseName: string,
    onCourseDeleted: (courseName: string) => void;
}

const CourseCard: React.FC<CourseProps> = ({courseName, onCourseDeleted}) => {

  const router = useRouter();
  const[totalFiles, setTotalFiles] = useState<number>(0); 

  useEffect(() => {
    fetch(`https://asknarelle-backend.azurewebsites.net/api/${courseName}/totalFiles`)
    .then(response => {
      if (!response.ok) {
        throw new Error('Failed to fetch collections');
      }
      return response.json();
    })
    .then((noOfFiles: number) => {
      setTotalFiles(noOfFiles)
    })
    .catch(error => {
      console.error('Error fetching collections:', error);
    });
}, [courseName]); 

  return (
    <div className='cursor-pointer bg-[white] rounded-lg  px-7 py-3 sm:mr-3 flex flex-col transition-transform duration-300 ease-in-out transform hover:scale-105 hover:bg-[#F6F6F6] w-[300px] border-2 my-2' onClick={() =>  router.push(`/knowledgebase_management/${courseName}`)}>
    <div className='flex justify-between items-center'>
      <div className='bg-[#2C3463] rounded-lg py-2 flex justify-center w-10'>
        <IoFolderOutline color='white' size={20} />
      </div>
      <div onClick={(e) => {
          e.stopPropagation(); 
          onCourseDeleted(courseName);
      }
        } className='cursor-pointer mb-3 p-2 rounded-full hover:bg-gray-300 transition-colors duration-200 ease-in-out'>
        <RiDeleteBin6Line color='#2C3463' size={20} />
      </div>
    </div>
    <div className='mt-3'>
      <div className='text-[#2C3463] font-semibold font-nunito'>{courseName}</div>
      <div className='text-[grey] text-sm font-nunito font-semibold'>{totalFiles} Files</div>
    </div>
  </div>
  );
};

export default CourseCard;
