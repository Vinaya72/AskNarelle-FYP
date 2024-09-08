import { useState } from 'react';
import { IoIosCloseCircleOutline } from "react-icons/io";
import { Oval } from 'react-loader-spinner';
import { AccountInfo } from '@azure/msal-browser';
import { PublicClientApplication} from "@azure/msal-browser";
import { msalConfig } from "@/authConfig";

interface PopupProps {
  onClose: () => void;
  onCollectionCreated: () => void;
}

export const msalInstance = new PublicClientApplication(msalConfig);

const Popup: React.FC<PopupProps> = ({ onClose, onCollectionCreated}) => {
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [containerExsists, setContainerExsists] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const accounts = msalInstance.getAllAccounts();
  const username = accounts[0].username;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
    setErrorMessage(''); // Clear the error message when the input changes
  };

  const handleSubmit = () => {
    setIsLoading(true);
    setContainerExsists(false);
    fetch('https://asknarelle-backend.azurewebsites.net/api/createcollection', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ collectionName: inputValue, username: username }),
    })
    .then(response => {
      if (response.ok) {
        return fetch('https://asknarelle-backend.azurewebsites.net/createindex', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ collectionName: inputValue })
        });
      } else {
        setContainerExsists(true);
        setErrorMessage('This course code is already in the database. Try again with a different course code.');
        throw new Error('Failed to create container');
      }
    })
    .then(flaskResponse => {
      if (flaskResponse.ok) {
        console.log('Index created successfully');
        onCollectionCreated(); // Call the callback if everything is successful
        onClose(); // Close the popup
      } else {
        throw new Error('Failed to create index');
      }
    })
    .catch(error => {
      console.error('Error creating index:', error);
    })
    .finally(() => {
      setIsLoading(false);
    });
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50 z-50">
      <div className="bg-white p-8 rounded-lg shadow-md relative sm:w-2/6 w-5/6">
        {!isLoading && (
          <button
            onClick={onClose}
            className="absolute top-0 right-0 p-2"
          >
            <IoIosCloseCircleOutline color='#FF0E0E' size={30}/>
          </button>
        )}
        {isLoading && (
          <>
            <div className="flex justify-center mb-4">
              <Oval
                height={40}
                width={40}
                color="#2c4787"
                visible={true}
                ariaLabel='oval-loading'
                secondaryColor="#2c4787"
                strokeWidth={2}
                strokeWidthSecondary={2}
              />
            </div>
            <p className="text-[#1a2d58] text-center mb-4 font-semibold">Creating</p>
          </>
        )}
        {!isLoading && (
          <>
            <label htmlFor="courseName" className="block mb-2 text-gray-800 font-semibold">Course Name{` (Enter just the course code)`}</label>
            <input
              type="text"
              value={inputValue}
              onChange={handleInputChange}
              className="border border-gray-300 rounded-md px-4 py-2 mb-4 w-full"
              placeholder="Enter your input"
            />
            {containerExsists && (
              <p className="text-red-500 text-sm mb-4 font-nunito">{errorMessage}</p>
            )}
            <button
              onClick={handleSubmit}
              className="bg-[#2C3463] text-white font-bold py-2 px-4 rounded transition-transform duration-300 ease-in-out transform hover:scale-105 hover:bg-[#3C456C]"
            >
              Submit
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default Popup;

