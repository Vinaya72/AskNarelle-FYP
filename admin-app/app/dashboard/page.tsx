"use client";

import {useEffect, Suspense, useState} from 'react'
import MyResponsivePie from '../components/SentimentPieChart';
import EmotionsPieChart from '../components/EmotionPieChart';

interface ChatObject {
  "_id": string,
  "timestamp": string,
  "user_query": string,
  "sentiment": 'POS' | 'NEG' | 'NEU',
  "emotion": 'sadness' | 'joy' | 'love' | 'anger' | 'fear' | 'surprise'
}


const prepareSentimentChartData = (logs: ChatObject[]) => {
  const sentimentCounts = logs.reduce((acc, log) => {
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
    fetch('https://flask-backend-deployment.azurewebsites.net/get-chats')
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
    <div className='flex flex-col justify-center items-center h-screen'>
    <div className="font-semibold relative w-10 text-xl">
        Dashboard
        <div className="absolute bottom-0 left-5 w-full h-1 bg-[#3F50AD]"></div>
      </div>
         <div className="flex mx-auto p-4 w-full">
          <div className='flex flex-col justify-center items-center w-1/2 p-2 '>
              <div className='text-[##3F50AD] text-lg font-semibold'>
                Sentiment Chart
              </div>
              <div className='w-full'>
                  <MyResponsivePie data={sentimentData} />
              </div>

          </div>
          <div className='flex flex-col justify-center items-center w-1/2 p-2 '>
              <div className='text-[##3F50AD] text-lg font-semibold'>
                Emotion Chart
              </div>
              <div className='w-full'>
              <EmotionsPieChart data={emotionData} />
              </div>

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
  