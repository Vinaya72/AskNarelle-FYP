"use client"
import { useEffect, useState } from "react";
import { MdDriveFolderUpload } from "react-icons/md";
import Popup from "../components/courses/CollectionPopup";
import CourseCard from "../components/courses/CourseCard";
import DeletionPopup from "../components/courses/DeletionPopup";
import { Suspense } from 'react';
import { msalConfig } from "@/authConfig";
import { PublicClientApplication} from "@azure/msal-browser";
import withAuth from "../components/authentication/WithAuth";

const msalInstance = new PublicClientApplication(msalConfig);


function ManageKnowledgeBase(): JSX.Element {
  const [message, setMessage] = useState<string[]>([]);
  const [showPopup, setShowPopup] = useState<boolean>(false);
  const[showDeletionPopup, setShowDeletionPopup] = useState<boolean>(false);
  const [collectionCreated, setCollectionCreated] = useState<boolean>(true); 
  const [collectionDeleted, setCollectionDeleted] = useState<boolean>(true); 
  const[collection, setCollection] = useState<string>('');

  const accounts = msalInstance.getAllAccounts();
  const username = accounts[0]?.username; 

  const handleCollectionCreated = () => {
    setCollectionCreated(!collectionCreated);
  };

  const handleCollectionDeleted = () => {
    setCollectionDeleted(!collectionDeleted);
  };

  const handleButtonClick = (): void => {
    setShowPopup(true);
  };

  const handleClosePopup = (): void => {
    setShowPopup(false);
  };
  const handlePressDelete = (courseName: string): void => {
    setCollection(courseName)
    setShowDeletionPopup(true);
  }

  const handleCloseDeletionPopup = (): void => {
    setShowDeletionPopup(false);
  }


  useEffect(() => {
      fetch(`https://adminapp-backend.azurewebsites.net/api/collections/${username}`)
      .then(response => {
        if (!response.ok) {
          throw new Error('Failed to fetch collections');
        }
        return response.json();
      })
      .then((collections: string[]) => {
        setMessage(collections);
      })
      .catch(error => {
        console.error('Error fetching collections:', error);
      });
  }, [collectionCreated, collectionDeleted, username]); 

  return (
    <main className="flex h-screen mt-[8vh] lg:mt-[0vh] flex-col p-10 sm:p-24 bg-gray-100">
      <div className="flex flex-row justify-between">
      <div className="font-semibold relative w-10 text-xl font-nunito">
        Courses
        <div className="absolute left-2 w-full h-1 bg-[#2C3463]"></div>
      </div>
       <div>
       {message.length > 0 && <button onClick={handleButtonClick} className="bg-[#2C3463] text-white py-2 px-4 rounded-lg font-normal transition-transform duration-300 ease-in-out transform hover:scale-105 hover:bg-[#3C456C] font-nunito">Add New Course</button>}
       </div>
      </div>
      {message.length > 0 ? (
        <div className="flex flex-row flex-wrap mt-5 justify-center sm:justify-normal">
          {message.map((collection: string, index: number) => (
       <CourseCard key={index} courseName={collection} onCourseDeleted={handlePressDelete}/>

          ))}
        </div>
      ) : (
        <div className="flex h-screen flex-col items-center justify-center">
          <div className="flex  flex-col bg-white sm:w-4/5 w-full border border-dotted border-[#3F50AD] p-4 mx-auto rounded-lg items-center">
          <MdDriveFolderUpload  size={50} color="#2C3463"/>
          <p className="font-semibold text-lg mt-2 font-nunito">Create a folder for the course</p>
          <button onClick={handleButtonClick} className="bg-[#2C3463] text-white py-2 px-4 rounded-lg font-normal mt-5 sm:w-2/5 w-full transition-transform duration-300 ease-in-out transform hover:scale-105 hover:bg-[#3C456C] font-nunito">Add New Course</button>
          </div>
        </div>
      )
      }
      {showPopup && <Popup onClose={handleClosePopup} onCollectionCreated={handleCollectionCreated}/>}
      {showDeletionPopup && <DeletionPopup onClose={handleCloseDeletionPopup} onCourseDeleted={handleCollectionDeleted} courseName= {collection} username={username}/> }

    </main>
  );
}

const AuthenticatedManageKnowledgeBase = withAuth(ManageKnowledgeBase);

export default function KnowledgebaseManagementPage(): JSX.Element {
    return (
      <Suspense fallback={<div>Loading...</div>}>
        <AuthenticatedManageKnowledgeBase/>
      </Suspense>
    );
  }
