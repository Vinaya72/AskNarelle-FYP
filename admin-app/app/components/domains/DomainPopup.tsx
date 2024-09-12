import { useState } from 'react';
import { IoIosCloseCircleOutline } from "react-icons/io";
import { Oval } from 'react-loader-spinner';


interface PopupProps {
  onClose: () => void;
  onDomainCreated: () => void;
  collectionName: string
  
}

const DomainPopup: React.FC<PopupProps> = ({ onClose, onDomainCreated, collectionName}) => {
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState<boolean>(false);


  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const handleSubmit = () => {
    setIsLoading(true)
    fetch('https://adminapp-backend.azurewebsites.net/api/createdomain', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ domainName: inputValue, courseName: collectionName}),
    })
    .then(response => {
      if (response.ok) {
        console.log('Domain created successfully');
      } else {
        throw new Error('Failed to create domain');
      }
    })
    .catch(error => {
      console.error('Error creating domain:', error);
    })
    .finally(() => {
      setIsLoading(false);
      onClose();
      onDomainCreated(); // Close the popup regardless of success or failure
    });
  };
  
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50 z-50">
      <div className="bg-white p-8 rounded-lg shadow-md relative sm:w-2/6 w-5/6">
        { !isLoading && (
           <button
           onClick={onClose}
           className="absolute top-0 right-0 p-2"
         >
          <IoIosCloseCircleOutline color='#FF0E0E' size={30}/>
         </button>

        )
        }
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
        {
          !isLoading && (
            <>
            <label htmlFor="courseName" className="block mb-2 text-gray-800 font-semibold">Domain Name</label>
            <input
              type="text"
              value={inputValue}
              onChange={handleInputChange}
              className="border border-gray-300 rounded-md px-4 py-2 mb-4 w-full"
              placeholder="Enter your input"
            />
            <button
              onClick={handleSubmit}
              className="bg-[#2C3463] text-white font-bold py-2 px-4 rounded transition-transform duration-300 ease-in-out transform hover:scale-105 hover:bg-[#3C456C]"
            >
              Submit
            </button>
            </>

          )
        }

      </div>
    </div>
  );
};

export default DomainPopup;