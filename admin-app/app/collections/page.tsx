"use client";

import React from 'react';
import { useState, useEffect } from 'react';
import DocumentPopup from '../components/DocumentPopup';
import { AiOutlineFileAdd } from "react-icons/ai";
import { useSearchParams } from 'next/navigation';
import FileCard from '../components/FileCard';
import { CiSearch } from "react-icons/ci";
import FileDeletionPopup from '../components/FileDeletionPopup';

interface Document{
    _id: string;
    file: string;
    url: string
}
const FilesList: React.FC = () => {
    const [message, setMessage] = useState<Document[]>([]);
    const [showPopup, setShowPopup] = useState<boolean>(false);
    const [fileCreated, setFileCreated] = useState<boolean>(true); 
    const [fileDeleted, setFileDeleted] = useState<boolean>(true); 
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [showDeletionPopup, setShowDeletionPopup] = useState<boolean>(false);
    const[fileName, setFileName] = useState<string>('');
    const[collection, setCollection] = useState<string>('');
    const[docId, setDocId] = useState<string>('');

    const searchParams = useSearchParams();
    const collectionName = searchParams.get("query") || '';
  
    const handleFileCreated = () => {
      setFileCreated(!fileCreated);
    };

    const handleFileDeleted = () => {
      setFileDeleted(!fileDeleted);
    };
  
    const handleButtonClick = (): void => {
      setShowPopup(true);
    };
  
    const handleClosePopup = (): void => {
      setShowPopup(false);
    };

    const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      setSearchQuery(event.target.value);
    };

    const handlePressDelete = (id: string, collection: string, file: string) => {
       setFileName(file);
       setCollection(collection);
       setDocId(id);
       setShowDeletionPopup(true)
    }

    const handleCloseDeletionPopup = (): void => {
      setShowDeletionPopup(false);
    }

  
    useEffect(() => {
      // console.log("Document");
        fetch(`http://localhost:5000/api/collections/${collectionName}`)
        .then(response => {
          if (!response.ok) {
            throw new Error('Failed to fetch collections');
          }
          return response.json();
        })
        .then((documents: Document[]) => {
          setMessage(documents);
        })
        .catch(error => {
          console.error('Error fetching collections:', error);
        });
    }, [fileCreated, fileDeleted]); 

    const filteredFiles = message.filter(document =>
      document.file.toLowerCase().includes(searchQuery.toLowerCase())
    );
  
  
    return (
      <main className="flex h-screen flex-col p-24 bg-gray-100">
        <div className="flex flex-row justify-between">
        <div className="font-semibold relative w-10 text-xl">
          {collectionName}
          <div className="absolute bottom-0 left-2 w-full h-1 bg-[#3F50AD]"></div>
        </div>
         <div>
          {message.length > 0 &&  <button onClick={handleButtonClick} className="bg-[#2C3463] text-white py-2 px-4 rounded-lg font-normal transition-transform duration-300 ease-in-out transform hover:scale-105 hover:bg-[#3C456C]">Add New File</button>}
         </div>
        </div>
        {message.length > 0 ? (
          <>
           <div className='flex items-center justify-center'>
        <input
            type="text"
            value={searchQuery}
            onChange={handleSearchChange}
            placeholder="Search files..."
            className="border border-gray-300 rounded-lg py-2 px-4 mr-2"
          />
             <CiSearch size={35}/> 
        </div>
        <div className="flex flex-col mt-5 justify-center items-center overflow-scroll">
          {filteredFiles.map((document: Document, index: number) => (
            <FileCard
              key={index}
              fileName={document.file}
              collectionName={collectionName}
              id={document._id}
              onFileDeleted={handlePressDelete}
              url = {document.url}
            />
          ))}
        </div>
        </>
      ) : (
        <div className="flex h-screen flex-col items-center justify-center">
          <div className="flex flex-col bg-white w-4/5 border border-dotted border-[#3F50AD] p-4 mx-auto rounded-lg items-center">
            <AiOutlineFileAdd size={50} color="#2C3463" />
            <p className="font-semibold text-lg mt-2">Upload the materials</p>
            <button
              onClick={handleButtonClick}
              className="bg-[#2C3463] text-white py-2 px-4 rounded-lg font-normal mt-5 w-2/5 transition-transform duration-300 ease-in-out transform hover:scale-105 hover:bg-[#3C456C]"
            >
              Add New Files
            </button>
          </div>
        </div>
      )}
        {showPopup && <DocumentPopup onClose={handleClosePopup} onFileCreated={handleFileCreated} collectionName = {collectionName}/>}
        {showDeletionPopup && <FileDeletionPopup fileName={fileName} collectionName={collection} id={docId} onFileDeleted={handleFileDeleted} onClose={handleCloseDeletionPopup}/>}
  
      </main>
    );
};

export default FilesList;