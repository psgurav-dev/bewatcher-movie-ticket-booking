import React from 'react'
import Lottie from 'react-lottie-player';
import lottieJson from '@/assets/lottie/cinema-blue.json'

export default function CinemaLottie() {
  return (
    <div className='bg-blue-300 w-fit mx-auto rounded-full'>
      <Lottie
        loop
        animationData={lottieJson}
        play
        style={{ width: 150, height: 150 }}
      />
    </div>
  )
}