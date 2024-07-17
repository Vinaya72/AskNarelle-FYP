"use client";

import React from 'react';
import { useState, useEffect } from 'react';
import DocumentPopup from '../components/DocumentPopup';
import { AiOutlineFileAdd } from "react-icons/ai";
import { useSearchParams } from 'next/navigation';
import FileCard from '../components/FileCard';
import { CiSearch } from "react-icons/ci";
import FileDeletionPopup from '../components/FileDeletionPopup';
import FileMovementPopup from '../components/FileMovementPopup';
import BlobDeletionPopup from '../components/BlobDeletionPopup';
import { Suspense } from 'react';
import FilesTable from '../components/FilesTable';

interface Document{
    _id: string;
    file: string;
    url: string;
    version_id: string;
    date_str: string;
    time_str: string;
    in_vector_store: string;
    is_root_blob: string
}
function Fileslist(): JSX.Element{
    const [message, setMessage] = useState<Document[]>([]);
    const [showPopup, setShowPopup] = useState<boolean>(false);
    const [fileCreated, setFileCreated] = useState<boolean>(true); 
    const [fileDeleted, setFileDeleted] = useState<boolean>(true); 
    const [fileMoved, setFileMoved] = useState<boolean>(true);
    const [blobDeleted, setBlobDeleted] = useState<boolean>(true);
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [showDeletionPopup, setShowDeletionPopup] = useState<boolean>(false);
    const [showFileMovementPopup, setShowFileMovementPopup] = useState<boolean>(false);
    const [showBlobDeletionPopup, setShowBlobDeletionPopup] = useState<boolean>(false);
    const[fileName, setFileName] = useState<string>('');
    const[collection, setCollection] = useState<string>('');
    const[docId, setDocId] = useState<string>('');
    const[versionId, setVersionId] = useState<string>('');
    const[isRootBlob, setIsRootBlob] = useState<string>('');

    const searchParams = useSearchParams();
    const collectionName = searchParams.get("course") || '';
    const domainName = searchParams.get("domain") || '';
  
    const handleFileCreated = () => {
      setFileCreated(!fileCreated);
    };

    const handleFileDeleted = () => {
      setFileDeleted(!fileDeleted);
    };

    const handleFileMoved = () => {
      setFileMoved(!fileMoved)
    }

    const handleBlobDeleted = () => {
      setBlobDeleted(!blobDeleted)
    }
  
    const handleButtonClick = (): void => {
      setShowPopup(true);
    };
  
    const handleClosePopup = (): void => {
      setShowPopup(false);
    };

    const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      setSearchQuery(event.target.value);
    };

    const handlePressDelete = (id: string, collection: string, file: string, version_id: string, is_root_blob: string) => {
       setFileName(file);
       setCollection(collection);
       setDocId(id);
       setShowDeletionPopup(true)
       setVersionId(version_id)
       setIsRootBlob(is_root_blob)
    }

    const handlePressMovement = (id: string, collection: string, file: string, version_id: string) => {
      setFileName(file);
      setCollection(collection);
      setDocId(id);
      setShowFileMovementPopup(true)
      setVersionId(version_id)
   }

   const handlePressBlobDelete = (id: string, collection: string, file: string, version_id: string, is_root_blob: string) => {
    setFileName(file);
    setCollection(collection);
    setDocId(id);
    setShowBlobDeletionPopup(true)
    setVersionId(version_id)
    setIsRootBlob(is_root_blob)
 }

    const handleCloseDeletionPopup = (): void => {
      setShowDeletionPopup(false);
    }

    const handleCloseFileMovementPopup = (): void => {
      setShowFileMovementPopup(false);
    }

    const handleCloseBlobDeletePopup = (): void => {
      setShowBlobDeletionPopup(false);
    }

  
    useEffect(() => {
      // console.log("Document");
        fetch(`https://flask-backend-deployment.azurewebsites.net/api/collections/${collectionName}/${domainName}`)
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
    }, [fileCreated, fileDeleted, collectionName, blobDeleted, fileMoved]); 

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
          {/* {filteredFiles.map((document: Document, index: number) => (
            <FileCard
              key={index}
              fileName={document.file}
              collectionName={collectionName}
              id={document._id}
              onFileDeleted={handlePressDelete}
              url = {document.url}
              date={document.date_str}
              time={document.time_str}
              version_id={document.version_id}
              in_vector_store={document.in_vector_store}
              is_root_blob={document.is_root_blob}
              onFileMoved={handlePressMovement}
              onBlobDeleted={handlePressBlobDelete}
            />
          ))} */}
           <FilesTable files={filteredFiles} collectionName={collectionName} onFileDeleted={handlePressDelete} onFileMoved={handlePressMovement} onBlobDeleted={handlePressBlobDelete}/>
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
        {showPopup && <DocumentPopup onClose={handleClosePopup} onFileCreated={handleFileCreated} collectionName = {collectionName} domainName={domainName}/>}
        {showDeletionPopup && <FileDeletionPopup fileName={fileName} collectionName={collection} id={docId} onFileDeleted={handleFileDeleted} onClose={handleCloseDeletionPopup} domainName={domainName} version_id={versionId} is_root_blob={isRootBlob}/>}
        {showFileMovementPopup && <FileMovementPopup fileName={fileName} collectionName={collection} id={docId} onFileMoved={handleFileMoved} onClose={handleCloseFileMovementPopup} domainName={domainName} version_id={versionId}/>}
        {showBlobDeletionPopup && <BlobDeletionPopup fileName={fileName} onBlobDeleted={handleBlobDeleted} id={docId} collectionName={collection} onClose={handleCloseBlobDeletePopup} domainName={domainName} version_id={versionId} is_root_blob={isRootBlob}/>}
      </main>
    );
};

export default function FilePage(): JSX.Element {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Fileslist />
    </Suspense>
  );
}