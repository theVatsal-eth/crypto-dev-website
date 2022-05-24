import type { NextPage } from 'next'
import Head from 'next/head'
import Image from 'next/image'
import Web3Modal from "web3modal";
import { Contract, providers, utils } from "ethers";
import { abi, NFT_CONTRACT_ADDRESS } from "../constants";
import { MutableRefObject, useEffect, useRef, useState } from 'react'
import Core from 'web3modal';

const Home: NextPage = () => {

  const [ walletConnected, setWalletConnected] = useState<boolean>(false)
  const [presaleStarted, setPresaleStarted] = useState<boolean>(false);
  const [presaleEnded, setPresaleEnded] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [isOwner, setIsOwner] = useState<boolean>(false);
  const [tokenIdsMinted, setTokenIdsMinted] = useState<string>("0");
  const web3ModalRef: MutableRefObject<Core | undefined> = useRef();

  const presaleMint = async (): Promise<void> => {
    try {
      const signer = await getProviderOrSigner(true)

      const whitelistContract = new Contract (
        NFT_CONTRACT_ADDRESS,
        abi,
        signer
      )

      const tx = await whitelistContract.presaleMint({
        value: utils.parseEther("0.01")
      })

      setLoading(true)
      await tx.wait()
      setLoading(false)
      window.alert("You successfully minted a Crypto Dev!")
    } catch (err) {
      console.error(err)
    }
  }

  const publicMint = async (): Promise<void> => {
    try {
      
      const signer = await getProviderOrSigner(true)

      const whitelistContract = new Contract (
        NFT_CONTRACT_ADDRESS,
        abi,
        signer
      )

      const tx = await whitelistContract.mint({
        value: utils.parseEther("0.01")
      })

      setLoading(true)
      await tx.wait()
      setLoading(false)
      window.alert("You succesfully minted a Crypto Dev!")
    } catch (err) {
      console.error(err)
    }
  }

  const connectWallet = async (): Promise<void> => {
    try {

      await getProviderOrSigner();
      setWalletConnected(true);

    } catch (err) {
      console.error(err)
    }
  } 

  const startPresale = async (): Promise<void> => {
    try {
      const signer = await getProviderOrSigner(true);

      const whitelistContract = new Contract(
        NFT_CONTRACT_ADDRESS,
        abi,
        signer
      );

      const tx = await whitelistContract.startPresale();
      setLoading(true);

      await tx.wait();
      setLoading(false);

      await checkIfPresaleStarted();
    } catch (err) {
      console.error(err);
    }
  };

  const checkIfPresaleStarted = async (): Promise<boolean> => {
    try {

      const provider = await getProviderOrSigner();
      const nftContract = new Contract (
        NFT_CONTRACT_ADDRESS,
        abi,
        provider
      )

      const _presaleStarted: boolean = await nftContract.presaleStarted()
      if (_presaleStarted) {
        await getOwner()
      }
      setPresaleStarted(true)
      return _presaleStarted;

    } catch (err) {
      console.error(err)
      return false;
    }
  }

  const checkIfPresaleEnded = async ():Promise<boolean> => {
    try {

      const provider = await getProviderOrSigner()

      const nftContract = new Contract(
        NFT_CONTRACT_ADDRESS,
        abi,
        provider
      )

      const _preSaleEnded = await nftContract.presaleEnded();
      const hasEnded: boolean = _preSaleEnded.lt(Math.floor(Date.now() / 1000))
      if (hasEnded) {
        setPresaleEnded(true);
      } else {
        setPresaleEnded(false)
      }

      return hasEnded;

    } catch (err) {
      console.error(err)
      return false;
    }
  }

  const getOwner = async (): Promise<void> => {
    try {
      const provider = await getProviderOrSigner();
      const nftContract = new Contract (
        NFT_CONTRACT_ADDRESS,
        abi,
        provider
      )

      const _owner = await nftContract.owner()

      const signer = await getProviderOrSigner(true)
      const address = await signer.getAddress()
      if(address.toLowerCase() === _owner.toLowerCase()) {
        setIsOwner(true)
      } 

    } catch (err) {
      console.error(err)
    }
  }

  const getTokenIdsMinted = async (): Promise<void> => {
    try {

      const provider = await getProviderOrSigner()

      const nftContract = new Contract(
        NFT_CONTRACT_ADDRESS,
        abi,
        provider
      )

      const _tokenIds = await nftContract.tokenIds()
      setTokenIdsMinted(_tokenIds.toString())

    } catch (err) {
      console.error(err)
    }
  }

  const getProviderOrSigner = async (needSigner: boolean = false): Promise<providers.Web3Provider | providers.JsonRpcSigner> => {
    
    const provider = await web3ModalRef.current.connect()
    const web3Provider = new providers.Web3Provider(provider)

    const { chainId } = await web3Provider.getNetwork()
    
    if (chainId !==5) {
      window.alert("Change the network to Goerli")
      throw new Error("Change the network to Goerli")
    }

    if (needSigner) {
      const signer = web3Provider.getSigner()
      return signer
    }

    return web3Provider;

  }

  useEffect(() => {

    if(!walletConnected) {
      web3ModalRef.current = new Web3Modal({
        network: "goerli",
        providerOptions: {},
        disableInjectedProvider: false,
      })
    }

    connectWallet();

    const checker= async () => {
      const _presaleStarted = await checkIfPresaleStarted()

      if (_presaleStarted) {
        checkIfPresaleEnded();
      }
    }
    checker()
    getTokenIdsMinted();

    const presaleEndInterval = setInterval(async () => {
      const _presaleStarted = await checkIfPresaleStarted()

      if (_presaleStarted) {
        const _preSaleEnded = await checkIfPresaleEnded();

        if (_preSaleEnded) {
          clearInterval(presaleEndInterval)
        }
      }
    }, 5 * 1000)

    setInterval( async () => {
      await getTokenIdsMinted();
    }, 5 * 1000 )

  }, [walletConnected])

  const renderButton = (): JSX.Element | undefined => {

    if (!walletConnected) {
      return(
        <button className='text-lg font-medium border-none p-3 rounded-md bg-blue-500' onClick={() => connectWallet()}>
          Connect Wallet
        </button>
      )
    }

    if (loading) {
      return (
        <div className='h-40px w-40px inline-flex border-[10px] border-blue-600 rounded-full animate-ping'></div>
      )
    }

    if(isOwner && !presaleStarted) {
      return (
        <button className='text-lg font-semibold border-none rounded-md p-3 bg-green-500' onClick={() => startPresale()}>
          Start Presale!
        </button>
      )
    }

    if (!presaleStarted) {
      return (
        <div>
          <div className='font-bold text-lg text-yellow-400'>Presale hasn not started yet :(</div>
        </div>
      )
    }

    if (!presaleStarted && !presaleEnded) {
      return (
        <div className=''>
          <div className='font-medium'>
            Presale has started!!! If your address is whitelisted, Mint a
            Crypto Dev 🥳
          </div>
          <button className='mt-3 text-lg font-semibold border-none rounded-md p-3 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500' onClick={presaleMint}>
            Presale Mint 🚀
          </button>
        </div>
      )
    }

    if (presaleStarted && presaleEnded) {
      return (
        <button className='mt-3 text-lg font-semibold border-none rounded-md p-3 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500' onClick={publicMint}>
            Public Mint 🚀
        </button>
      )
    }

  }

  return (
    <div className='h-screen flex flex-col justify-center items-center'>
      <Head>
        <title>Create Next App</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className='flex justify-center items-center gap-10'>
        <div>
          <h1 className='mb-5 text-2xl font-bold'>Welcome to Crypto Devs!</h1>
          <div className='mb-2 text-lg'>
            Its an <strong className='text-green-500'>NFT</strong> Collection for Developers in Crypto.
          </div>
          <div className='mb-5 text-lg'>
            <strong className='text-red-500'>{tokenIdsMinted}/20</strong> NFTs have been minted! 🥳
          </div>
          {renderButton()}
        </div>
        <div>
          <img src='./cryptodevs/4.svg' alt='' />
        </div>
      </div>

      <footer className='absolute bottom-10 left-10'>
        Made with 💙 by Crypto Devs
      </footer>

    </div>
  )
}

export default Home
