"use client"

import React, { useState, useEffect } from "react"
import Link from 'next/link'
import { ethers } from 'ethers'
import { Web3 } from 'web3'

interface Ethereum {
  isMetaMask?: boolean;
  request?: (args: { method: string; params?: Array<any> }) => Promise<any>;
}

interface ExtendedWindow extends Window {
  ethereum?: Ethereum;
}

function NavLink({ to, children }: { to: string; children: React.ReactNode }) {
  return (
    <Link href={to} legacyBehavior>
      <a className="text-white hover:text-yellow-300 px-4 py-2 rounded-md text-lg font-medium transition duration-150 ease-in-out">
        {children}
      </a>
    </Link>
  )
}

const networks = {
  Ethereum: {
    chainId: `0x${Number(1).toString(16)}`,
    chainName: "Ethereum Mainnet",
    nativeCurrency: {
      name: "Ether",
      symbol: "ETH",
      decimals: 18,
    },
    rpcUrls: ["https://eth-mainnet.g.alchemy.com/v2/your-api-key"],
    blockExplorerUrls: ['https://blockscout.com/'],
  },
}

export default function Navbar() {
  const [accountAddress, setAccountAddress] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [balance, setBalance] = useState('0')
  const [isHovered, setIsHovered] = useState(false)

  useEffect(() => {
    const storedAddress = localStorage.getItem("filWalletAddress")
    if (storedAddress) {
      setAccountAddress(storedAddress)
      fetchBalance(storedAddress)
    }
  }, [])

  const fetchBalance = async (address: string) => {
    if (typeof (window as ExtendedWindow).ethereum !== 'undefined') {
      const provider = new ethers.providers.Web3Provider((window as ExtendedWindow).ethereum as any)
      const balance = await provider.getBalance(address)
      setBalance(ethers.utils.formatEther(balance))
    }
  }

  const handleLogin = async () => {
    if ((window as ExtendedWindow).ethereum) {
      const web3 = new Web3((window as ExtendedWindow).ethereum as any)

      const chainId = await web3.eth.getChainId()
      const EthereumChainId = parseInt(networks.Ethereum.chainId, 16)

      console.log(parseInt(chainId.toString()))
      console.log("The Ethereum chain id is", parseInt(chainId.toString()))

      const chainId1 = parseInt(chainId.toString())
      
      if (chainId1 !== EthereumChainId) {
        const ethereum = (window as ExtendedWindow).ethereum;
      
        if (ethereum && typeof ethereum.request === "function") {
          try {
            await ethereum.request({
              method: "wallet_addEthereumChain",
              params: [{
                ...networks["Ethereum"]
              }]
            });
          } catch (error) {
            alert("Failed to add Ethereum chain:");
          }
        } else {
          alert("Ethereum provider not detected. Please install MetaMask or a compatible wallet.");
        }
      }

      const accounts = await web3.eth.requestAccounts()

      console.log(accounts)
      const Address = accounts[0]
      if (typeof window !== 'undefined') {
        localStorage.setItem("filWalletAddress", Address)
      }

      console.log(Address)
      setAccountAddress(Address)
      fetchBalance(Address)

      window.location.reload()
    } else {
      alert("Please install the metamask")
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("filWalletAddress")
    setAccountAddress('')
    setIsDropdownOpen(false)
    setBalance('0')
  }

  function truncateAddress(address: string) {
    if (!address) return ''
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  const getEtherscanLink = (address: string) => {
    return `https://blockscout.com/address/${address}`
  }

  return (
    <nav className="sticky top-0 z-50 bg-gradient-to-r from-purple-900 via-blue-800 to-indigo-900 shadow-lg">
      <div className="max-w-full mx-auto px-6 lg:px-12">
        <div className="flex items-center justify-between h-24">
          <div className="flex items-center space-x-8">
            <Link href="/" legacyBehavior>
              <a className="flex-shrink-0">
                <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-pink-600">
                  BlockscoutAnalyser
                </h1>
              </a>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  )
}