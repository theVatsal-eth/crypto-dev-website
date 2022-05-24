import React from 'react'

export default function testing() {
  return (
    <div>
        <button className='border-none p-3 rounded-md bg-blue-500' >
          Connect Wallet
        </button>
        <div className='ml-10 h-40px w-40px inline-flex border-[10px] border-blue-600 rounded-full animate-ping'></div>
        <button className='ml-10 border-none rounded-md p-3 bg-green-500'>
          Start Presale!
        </button>
        <div className='ml-10'>
          <div className='font-bold text-lg text-yellow-400'>Presale hasn not started yet :(</div>
        </div>
        <div className=''>
          <div className='font-medium'>
            Presale has started!!! If your address is whitelisted, Mint a
            Crypto Dev 🥳
          </div>
          <button className='mt-3 text-lg font-semibold border-none rounded-md p-3 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 '>
            Presale Mint 🚀
          </button>
        </div>
    </div>
  )
}
