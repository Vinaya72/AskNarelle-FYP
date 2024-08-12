"use client";

import {useEffect, Suspense, useState} from 'react'
import SearchBar from '../components/dashboard/SearchBar';
import CardDataStats from '../components/dashboard/CardDataStats';
import { IoPeople } from "react-icons/io5";
import ChartOne from '../components/dashboard/ChartOne';
import ChartTwo from '../components/dashboard/ChartTwo';
import ChartThree from '../components/dashboard/ChartThree';

interface ChatObject {
  "_id": string,
  "timestamp": string,
  "user_query": string,
  "sentiment": 'POS' | 'NEG' | 'NEU',
  "emotion": 'sadness' | 'joy' | 'love' | 'anger' | 'fear' | 'surprise'
}


const prepareSentimentChartData = (logs: ChatObject[]) => {
  const sentimentCounts = logs?.reduce((acc, log) => {
      acc[log.sentiment] = (acc[log.sentiment] || 0) + 1;
      return acc;
  }, {} as Record<'POS' | 'NEG' | 'NEU', number>);

  return [
      { id: 'POS', label: 'Positive', value: sentimentCounts.POS || 0, color: '#4caf50' },
      { id: 'NEG', label: 'Negative', value: sentimentCounts.NEG || 0, color: '#f44336'  },
      { id: 'NEU', label: 'Neutral', value: sentimentCounts.NEU || 0,  color: '#ffeb3b' },
  ];
};

const prepareEmotionChartData = (logs: ChatObject[] ) => {
  const emotionCounts = logs.reduce((acc, log) => {
    acc[log.emotion] = (acc[log.emotion] || 0) + 1;
    return acc;
  }, {} as Record<'sadness'| 'joy'| 'love'| 'anger'| 'fear' | 'surprise', number>);

  return [
    {id: 'sadness', label: 'sadness', value: emotionCounts.sadness || 0, color: '#4caf50' },
    {id: 'joy', label: 'joy', value: emotionCounts.joy || 0, color: '#f44336' },
    {id: 'love', label: 'love', value: emotionCounts.love || 0, color: '#ffeb3b' },
    {id: 'anger', label: 'anger', value: emotionCounts.anger || 0, color: '#4caf50' },
    {id: 'fear', label: 'fear', value: emotionCounts.fear || 0, color: '#f44336' },
    {id: 'surprise', label: 'surprise', value: emotionCounts.surprise || 0, color: '#ffeb3b' }
  ]

}


function Dashboard () {

  const[chats, setChats] = useState<ChatObject[]>([])

  useEffect(() => {
    fetch('http://127.0.0.1:5000/get-chats')
    .then(response => {
      if (!response.ok) {
        throw new Error('Failed to fetch collections');
      }
      return response.json();
    })
    .then((chats: ChatObject[]) => {
      setChats(chats);
    })
    .catch(error => {
      console.error('Error fetching collections:', error);
    });
}, []); 

  const sentimentData = prepareSentimentChartData(chats);
  const emotionData = prepareEmotionChartData(chats);


  return (  
   <div className='flex flex-col h-[95vh] mt-[8vh] mx-12'>
      <div className='flex justify-between w-full'>
        <div className='flex flex-col'>
          <div className='text-2xl font-nunito font-semibold'>Good Evening,</div>
          <div className='text-gray-400 font-nunito'>AskNarelle dashboard homepage</div>
        </div>
        <div className='flex'>
          <div>
            <SearchBar/>
          </div>
          {/* <div>
          <CgProfile size={45} color={'#2C3463'}/>
          </div> */}

        </div>
      </div>
      <div className= 'grid grid-cols-2 sm:grid-cols-4 gap-4 mt-5 mr-12'>
          <div>
            <CardDataStats title="Total Users" total="3.456" rate="0.95%" levelDown>
                <div className="flex items-center justify-center rounded-full bg-gray-200 w-14 h-14">
                  <IoPeople size={30} color={'#2C3463'} />
                </div>
            </CardDataStats>
          </div>
          <div className='flex justify-center bg-yellow-200 '>
              <CardDataStats title="Total Users" total="3.456" rate="0.95%" levelDown>
                <div className="flex items-center justify-center rounded-full bg-gray-200 w-14 h-14">
                  <IoPeople size={30} color={'#2C3463'} />
                </div>
              </CardDataStats>
          </div>
          <div className='flex justify-center bg-slate-400 '>
              <CardDataStats title="Total Users" total="3.456" rate="0.95%" levelDown>
                  <div className="flex items-center justify-center rounded-full bg-gray-200 w-14 h-14">
                    <IoPeople size={30} color={'#2C3463'} />
                  </div>
               </CardDataStats>
          </div>
          <div className='flex justify-center bg-slate-400 '>
              <CardDataStats title="Total Users" total="3.456" rate="0.95%" levelDown>
                <div className="flex items-center justify-center rounded-full bg-gray-200 w-14 h-14">
                  <IoPeople size={30} color={'#2C3463'} />
                </div>
              </CardDataStats>
          </div>
      </div>
      <div className= 'grid grid-cols-[50%_50%] gap-4 mt-5'>
            <div className='flex justify-center bg-yellow-200 '>
              <ChartOne/>
            </div>
            <div className='flex justify-center bg-slate-400 '>
              <ChartTwo/>
            </div>
      </div>
      <div className= 'grid grid-cols-[50%_50%] gap-4 mt-5'>
            <div className='flex justify-center'>
            <ChartThree />
            </div>
            <div className='flex justify-center'>
            <ChartThree />
            </div>
      </div>
   </div>
  )
}

export default function DashboardPage(): JSX.Element {
    return (
      <Suspense fallback={<div>Loading...</div>}>
        <Dashboard />
      </Suspense>
    );
  }
  