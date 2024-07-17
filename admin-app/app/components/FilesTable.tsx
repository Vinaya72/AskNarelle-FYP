// FileTable.tsx

import React from 'react';
import FileCard from './FileCard';

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

interface FileTableProps {
  files: Document[];
  collectionName: string;
  onFileDeleted: (id: string, collection: string, file: string, version_id: string, is_root_blob: string) => void,
  onFileMoved: (id: string, collection: string, file: string, version_id: string) => void,
  onBlobDeleted: (id: string, collection: string, file: string, version_id: string, is_root_blob: string) => void
}

const FilesTable: React.FC<FileTableProps> = ({
  files,
  collectionName,
  onFileDeleted,
  onFileMoved,
  onBlobDeleted,
}) => {
  return (
    <div className="overflow-scroll">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              File Name
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              In Vector Store ?
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Is Root File ?
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Date
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Time
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {files.map((document: Document, index: number) => (
            <tr key={index}>
              <td className="px-6 py-4 whitespace-nowrap">
              <a href={document.url} download={document.file} className="text-blue-600 text-center underline">
              {document.file}
               </a>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900 font-medium">{document.in_vector_store.toString()}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900 font-medium">{document.is_root_blob.toString()}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900 font-medium">{document.date_str}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900 font-medium">{document.time_str}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
              { (document.in_vector_store === "yes") && (
                <button
                  className="text-red-500 mr-5 border border-solid p-2 border-red-500 transition duration-300 transform hover:scale-105"
                  onClick={() => onFileDeleted(document._id, collectionName, document.file, document.version_id, document.is_root_blob)}
                >
                  Delete
                </button> )}
                { (document.in_vector_store === "no" && document.is_root_blob === "no") && (
                    <>
                     <button
                     className="text-orange-500 mr-5 border border-solid p-2 border-orange-500 transition duration-300 transform hover:scale-105"
                     onClick={() => onBlobDeleted(document._id, collectionName, document.file, document.version_id, document.is_root_blob)}
                   >
                     Delete From File Storage
                   </button>
                <button
                  className="text-green-500 mr-5 border border-solid p-2 border-green-500 transition duration-300 transform hover:scale-105"
                  onClick={() => onFileMoved(document._id, collectionName, document.file, document.version_id)}
                >
                  Move to vector store
                </button> 
                </>)}
                { (document.in_vector_store === "no" && document.is_root_blob === "yes") && (
                    <>
            <button
            className="text-red-500 mr-5 border border-solid p-2 border-red-500 transition duration-300 transform hover:scale-105"
            onClick={() => onFileDeleted(document._id, collectionName, document.file, document.version_id, document.is_root_blob)}
          >
            Delete
          </button> 
                     <button
                     className="text-green-500 mr-5 border border-solid p-2 border-green-500 transition duration-300 transform hover:scale-105"
                     onClick={() => onFileMoved(document._id, collectionName, document.file, document.version_id)}
                   >
                     Move to vector store
                   </button>
                   </> )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default FilesTable;
