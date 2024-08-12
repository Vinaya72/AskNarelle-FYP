"use client";
import { useRouter } from 'next/navigation';
import {
  AuthenticatedTemplate,
  UnauthenticatedTemplate,
} from "@azure/msal-react";
import { MdWavingHand } from "react-icons/md";
import SignInButton from './components/authentication/SignInButton';
import CardDataStats from './components/dashboard/CardDataStats';
import { IoPeople } from "react-icons/io5";
import ChartOne from './components/dashboard/ChartOne';
import ChartTwo from './components/dashboard/ChartTwo';
import ChartThree from './components/dashboard/ChartThree';
import SearchBar from './components/dashboard/SearchBar';
import { useEffect, useState } from 'react';
import { msalConfig } from '../authConfig';
import { PublicClientApplication } from '@azure/msal-browser';
import ChartFour from './components/dashboard/ChartFour';

const msalInstance = new PublicClientApplication(msalConfig);

export default function Home() {
  const router = useRouter();

  const[totalUsers, setTotalUsers] = useState<number|undefined>();
  const[totalQueries,setTotalQueries] = useState<number|undefined>();

  const accounts = msalInstance.getAllAccounts();
  const username = accounts[0]?.username; 


  useEffect(() => {
    fetch(`http://127.0.0.1:5000/chats/totalUsers/${username}`)
      .then(response => {
        if (!response.ok) {
          throw new Error('Failed to fetch total users');
        }
        return response.json();
      })
      .then((totalUsers: number) => {
        setTotalUsers(totalUsers);
      })
      .catch(error => {
        console.error('Error fetching total users:', error);
      });

      fetch(`http://127.0.0.1:5000/chats/totalQueries/${username}`)
      .then(response => {
        if (!response.ok) {
          throw new Error('Failed to fetch total queries');
        }
        return response.json();
      })
      .then((totalQueries: number) => {
        setTotalQueries(totalQueries);
      })
      .catch(error => {
        console.error('Error fetching total queries:', error);
      });

  }, [])

  return (
<div>
    <AuthenticatedTemplate>
    <div className='flex flex-col h-full px-12 mt-[8vh]'>
      <div className='flex flex-col sm:flex-row justify-between w-full mt-5'>
        <div className='flex flex-col'>
          <div className='text-2xl font-nunito font-semibold'>Good Evening,</div>
          <div className='text-gray-400 font-nunito'>AskNarelle dashboard homepage</div>
        </div>
        <div className='flex'>
          <div>
            <SearchBar/>
          </div>
        </div>
      </div>
      <div className= 'grid md:grid-cols-2 gap-4 mt-5'>
          <div className='flex sm:justify-end justify-center'>
            <CardDataStats title="Total Users" total={totalUsers} rate="0.95%" levelDown>
                <div className="flex items-center justify-center rounded-full bg-gray-200 w-14 h-14">
                  <IoPeople size={30} color={'#2C3463'} />
                </div>
            </CardDataStats>
          </div>
          <div className='flex sm:justify-start justify-center'>
              <CardDataStats title="Total number of queries" total={totalQueries} rate="0.95%" levelDown>
                <div className="flex items-center justify-center rounded-full bg-gray-200 w-14 h-14">
                  <IoPeople size={30} color={'#2C3463'} />
                </div>
              </CardDataStats>
          </div>
      </div>
      <div className= 'grid md:grid-cols-2 gap-4 mt-5'>
            <div className='flex justify-center'>
              <ChartOne/>
            </div>
            <div className='flex justify-center'>
              <ChartTwo/>
            </div>
      </div>
      <div className= 'grid md:grid-cols-2 gap-4 mt-5 mb-5'>
            <div className='flex justify-center'>
            <ChartThree />
            </div>
            <div className='flex justify-center'>
            <ChartFour />
            </div>
      </div>
   </div>
    </AuthenticatedTemplate>

    <UnauthenticatedTemplate>
    <div className="h-[95vh] flex flex-col sm:flex-row gap-4 items-center justify-center mt-[5vh]">
  <div className="hidden sm:block flex-grow ">
    <img src={'/assets/hive.jpg'} alt="My Image" className="h-[95vh] w-full object-cover"/>
  </div>
  <div className='flex justify-center flex-shrink-0 sm:w-[600px]'>
    <div className='w-full max-w-[400px] rounded-lg shadow-lg p-5'>
      <h1 className="text-3xl mb-2 text-[#3F50AD] text-center font-nunito">Admin Site</h1>
      <h2 className="text-xl text-gray-500 mb-6 text-center font-nunito">Login</h2>
      <div className="flex items-center mb-4 justify-center">
        <p className="text-lg text-gray-700 mr-2 text-center font-nunito">Hi, Welcome</p>
        <MdWavingHand />
      </div>
      <SignInButton/>
    </div>
  </div>
</div>

    </UnauthenticatedTemplate>
    </div>

  );
}

