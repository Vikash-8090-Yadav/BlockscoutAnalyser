"use client"

import { useState, type FormEvent, useEffect } from "react"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import { Loader } from 'lucide-react'

interface Transaction {
  blockNumber: string
  timestamp: string
  hash: string
  blockHash: string
  from: string
  to: string
  value: string
  gasPrice: string
  gas: string
  isError: string
  input: string
  functionName: string
}

interface ApiResponse {
  status: string
  message: string
  result: Transaction[]
}

interface ChartData {
  label: string
  value: number
  color: string
}

interface TokenTransfer extends Transaction {
  tokenName?: string
  tokenSymbol?: string
  tokenDecimal?: string
}

export default function Home() {
  const [address, setAddress] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [tokenTransfers, setTokenTransfers] = useState<TokenTransfer[]>([])
  const [valueDistribution, setValueDistribution] = useState<ChartData[]>([])
  const [gasDistribution, setGasDistribution] = useState<ChartData[]>([])
  const [transactionTypeData, setTransactionTypeData] = useState<ChartData[]>([])

  // Process transaction data for charts
  useEffect(() => {
    if (transactions.length > 0) {
      processChartData(transactions)
    }
  }, [transactions])

  const processChartData = (txs: Transaction[]) => {
    // Process value distribution for pie chart
    const valueRanges: { [key: string]: number } = {
      "0 ETH": 0,
      "0-0.1 ETH": 0,
      "0.1-1 ETH": 0,
      "1-10 ETH": 0,
      "10+ ETH": 0,
    }

    txs.forEach((tx) => {
      const value = Number.parseInt(tx.value) / 1e18
      if (value === 0) {
        valueRanges["0 ETH"]++
      } else if (value <= 0.1) {
        valueRanges["0-0.1 ETH"]++
      } else if (value <= 1) {
        valueRanges["0.1-1 ETH"]++
      } else if (value <= 10) {
        valueRanges["1-10 ETH"]++
      } else {
        valueRanges["10+ ETH"]++
      }
    })

    const colors = ["#3B82F6", "#60A5FA", "#93C5FD", "#BFDBFE", "#DBEAFE"]

    const valueChartData = Object.entries(valueRanges).map(([label, value], index) => ({
      label,
      value,
      color: colors[index % colors.length],
    }))

    setValueDistribution(valueChartData)

    // Process gas price distribution
    const gasRanges: { [key: string]: number } = {
      Low: 0,
      Medium: 0,
      High: 0,
    }

    // Find min and max gas prices
    const gasPrices = txs.map((tx) => Number.parseInt(tx.gasPrice))
    const minGas = Math.min(...gasPrices)
    const maxGas = Math.max(...gasPrices)
    const gasRange = maxGas - minGas

    txs.forEach((tx) => {
      const gasPrice = Number.parseInt(tx.gasPrice)
      const normalizedGas = gasRange > 0 ? (gasPrice - minGas) / gasRange : 0

      if (normalizedGas < 0.33) {
        gasRanges["Low"]++
      } else if (normalizedGas < 0.66) {
        gasRanges["Medium"]++
      } else {
        gasRanges["High"]++
      }
    })

    const gasColors = ["#10B981", "#34D399", "#6EE7B7"]

    const gasChartData = Object.entries(gasRanges).map(([label, value], index) => ({
      label,
      value,
      color: gasColors[index % gasColors.length],
    }))

    setGasDistribution(gasChartData)

    // Process transaction type distribution
    const txTypes: { [key: string]: number } = {
      "Contract Call": 0,
      "Value Transfer": 0,
      "Failed Transaction": 0,
    }

    txs.forEach((tx) => {
      // Check if transaction failed
      if (tx.isError === "1") {
        txTypes["Failed Transaction"]++
      }
      // Check if it's a contract call (input data length > 2 means there's function data)
      else if (tx.input && tx.input.length > 2 && tx.input !== "0x") {
        txTypes["Contract Call"]++
      }
      // Otherwise it's a simple value transfer
      else {
        txTypes["Value Transfer"]++
      }
    })

    const txTypeColors = ["#F59E0B", "#FBBF24", "#FCD34D"]

    const txTypeChartData = Object.entries(txTypes).map(([label, value], index) => ({
      label,
      value,
      color: txTypeColors[index % txTypeColors.length],
    }))

    setTransactionTypeData(txTypeChartData)
  }

  const fetchTokenTransfers = async (address: string) => {
    try {
      const apiUrl = `https://eth.blockscout.com/api?module=account&action=tokentx&address=${address}&page=1&offset=5&sort=desc`
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      })
      if (!response.ok) throw new Error(`API request failed with status ${response.status}`)
      const data = await response.json()
      
      if (data.status === "1" && data.result) {
        const transformedTokens = data.result.map((tx: any) => ({
          blockNumber: tx.blockNumber,
          timestamp: tx.timeStamp,
          hash: tx.hash,
          blockHash: tx.blockHash,
          from: tx.from,
          to: tx.to,
          value: tx.value,
          gasPrice: tx.gasPrice,
          gas: tx.gas,
          isError: tx.isError,
          input: tx.input,
          functionName: tx.functionName || "Token Transfer",
          tokenName: tx.tokenName,
          tokenSymbol: tx.tokenSymbol,
          tokenDecimal: tx.tokenDecimal
        }))
        setTokenTransfers(transformedTokens)
      }
    } catch (err: any) {
      console.error('Error fetching token transfers:', err)
    }
  }

  const fetchTransactions = async (e: FormEvent) => {
    e.preventDefault()
    if (!address.trim()) {
      setError("Please enter a valid address")
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      // Create a timeout promise
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Request timeout')), 30000) // 30 second timeout
      })

      // Create the API calls
      const normalTxPromise = fetch(
        `https://eth.blockscout.com/api?module=account&action=txlist&address=${address}&page=1&offset=20&sort=desc`,
        {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
          },
        }
      )

      const tokenTxPromise = fetch(
        `https://eth.blockscout.com/api?module=account&action=tokentx&address=${address}&page=1&offset=5&sort=desc`,
        {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
          },
        }
      )

      // Wait for both API calls to complete or timeout
      const [normalTxResponse, tokenTxResponse] = await Promise.race([
        Promise.all([normalTxPromise, tokenTxPromise]),
        timeoutPromise
      ]) as [Response, Response]

      if (!normalTxResponse.ok) {
        throw new Error(`API request failed with status ${normalTxResponse.status}`)
      }

      const data = await normalTxResponse.json()

      if (data.result === 'Max rate limit reached') {
        throw new Error("Rate limit reached. Please try again later.")
      }

      if (data.status === "0") {
        throw new Error(data.message || "Failed to fetch transactions")
      }

      if (!data.result || data.result.length === 0) {
        throw new Error("No transactions found for this address")
      }

      const transformedTransactions = data.result.map((tx: any) => ({
        blockNumber: tx.blockNumber,
        timestamp: tx.timeStamp,
        hash: tx.hash,
        blockHash: tx.blockHash,
        from: tx.from,
        to: tx.to,
        value: tx.value,
        gasPrice: tx.gasPrice,
        gas: tx.gas,
        isError: tx.isError,
        input: tx.input,
        functionName: tx.functionName || "Transfer"
      }))

      setTransactions(transformedTransactions.slice(0, 10))
      
      // Process token transfers
      if (tokenTxResponse.ok) {
        const tokenData = await tokenTxResponse.json()
        if (tokenData.status === "1" && tokenData.result) {
          const transformedTokens = tokenData.result.map((tx: any) => ({
            blockNumber: tx.blockNumber,
            timestamp: tx.timeStamp,
            hash: tx.hash,
            blockHash: tx.blockHash,
            from: tx.from,
            to: tx.to,
            value: tx.value,
            gasPrice: tx.gasPrice,
            gas: tx.gas,
            isError: tx.isError,
            input: tx.input,
            functionName: tx.functionName || "Token Transfer",
            tokenName: tx.tokenName,
            tokenSymbol: tx.tokenSymbol,
            tokenDecimal: tx.tokenDecimal
          }))
          setTokenTransfers(transformedTokens)
        }
      }
    } catch (err: any) {
      console.error('Error fetching data:', err)
      setError(err.message || "Failed to fetch transaction data")
      setTransactions([])
    } finally {
      setIsLoading(false)
    }
  }

  // Format timestamp to readable date
  const formatDate = (timestamp: string) => {
    return new Date(parseInt(timestamp) * 1000).toLocaleString()
  }

  // Format value from wei to ETH
  const formatValue = (value: string) => {
    const valueInETH = Number.parseInt(value) / 1e18
    return valueInETH.toFixed(6)
  }

  // Truncate hash values for display
  const truncateHash = (hash: string) => {
    return `${hash.substring(0, 6)}...${hash.substring(hash.length - 4)}`
  }

  return (
    <main className="min-h-screen flex flex-col bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-900/95">
      <Navbar />

      <div className="container mx-auto p-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-blue-400 dark:from-blue-400 dark:to-blue-300">
            Blockscout Transaction Analyzer
          </h2>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-8 border border-gray-200 dark:border-gray-700">
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Enter an Ethereum address to view transaction details and analytics. Connect your wallet to analyze your own
              transactions.
            </p>

            <form onSubmit={fetchTransactions} className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Enter Ethereum address (0x...)"
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={isLoading}
                className={`px-6 py-2 rounded-md font-medium text-sm text-white bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex items-center justify-center min-w-[120px] ${isLoading ? "opacity-70 cursor-not-allowed" : ""}`}
              >
                {isLoading ? (
                  <>
                    <Loader className="w-4 h-4 mr-2 animate-spin" />
                    Loading...
                  </>
                ) : (
                  "Fetch Transactions"
                )}
              </button>
            </form>

            {error && (
              <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md text-red-600 dark:text-red-400 text-sm">
                {error}
              </div>
            )}
          </div>

          {isLoading && (
            <div className="flex flex-col items-center justify-center p-12 bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
              <Loader className="w-16 h-16 text-blue-500 animate-spin mb-4" />
              <p className="text-lg text-gray-600 dark:text-gray-300">Fetching transaction data...</p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">This may take a few moments</p>
            </div>
          )}

          {!isLoading && transactions.length > 0 && (
            <>
              {/* Charts Section */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                {/* Transaction Value Distribution */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-4">
                  <h3 className="text-lg font-medium mb-4">Transaction Value Distribution</h3>
                  <div className="relative" style={{ height: "250px" }}>
                    <div className="flex justify-center items-center">
                      <div className="relative w-48 h-48">
                        <svg viewBox="0 0 100 100" className="w-full h-full">
                          {valueDistribution.map((item, index) => {
                            // Calculate pie chart segments
                            const total = valueDistribution.reduce((sum, item) => sum + item.value, 0)
                            const startAngle = valueDistribution
                              .slice(0, index)
                              .reduce((sum, item) => sum + (item.value / total) * 360, 0)
                            const angle = (item.value / total) * 360

                            // Convert angles to radians for SVG arc
                            const startRad = ((startAngle - 90) * Math.PI) / 180
                            const endRad = ((startAngle + angle - 90) * Math.PI) / 180

                            // Calculate arc path
                            const x1 = 50 + 40 * Math.cos(startRad)
                            const y1 = 50 + 40 * Math.sin(startRad)
                            const x2 = 50 + 40 * Math.cos(endRad)
                            const y2 = 50 + 40 * Math.sin(endRad)

                            // Determine if the arc should be drawn as a large arc
                            const largeArcFlag = angle > 180 ? 1 : 0

                            // Create SVG path for the arc
                            const path = `
                              M 50 50
                              L ${x1} ${y1}
                              A 40 40 0 ${largeArcFlag} 1 ${x2} ${y2}
                              Z
                            `

                            return <path key={index} d={path} fill={item.color} stroke="white" strokeWidth="1" />
                          })}
                        </svg>
                      </div>
                    </div>
                    <div className="mt-4 grid grid-cols-2 gap-2">
                      {valueDistribution.map((item, index) => (
                        <div key={index} className="flex items-center">
                          <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: item.color }}></div>
                          <span className="text-xs text-gray-600 dark:text-gray-300">
                            {item.label} ({item.value})
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Gas Price Distribution */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-4">
                  <h3 className="text-lg font-medium mb-4">Gas Price Distribution</h3>
                  <div className="relative" style={{ height: "250px" }}>
                    <div className="flex justify-center items-center h-48">
                      {gasDistribution.map((item, index) => {
                        const total = gasDistribution.reduce((sum, item) => sum + item.value, 0)
                        const percentage = total > 0 ? (item.value / total) * 100 : 0

                        return (
                          <div key={index} className="flex flex-col items-center mx-4">
                            <div className="relative w-16 mb-2">
                              <div
                                className="absolute bottom-0 w-full rounded-t-md"
                                style={{
                                  backgroundColor: item.color,
                                  height: `${Math.max(percentage, 5)}%`,
                                  minHeight: "20px",
                                }}
                              ></div>
                            </div>
                            <span className="text-xs text-gray-600 dark:text-gray-300">{item.label}</span>
                            <span className="text-xs font-medium">{item.value}</span>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </div>

                {/* Transaction Type Distribution */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-4 md:col-span-2">
                  <h3 className="text-lg font-medium mb-4">Transaction Type Distribution</h3>
                  <div className="flex flex-col md:flex-row items-center justify-center gap-8 py-4">
                    {transactionTypeData.map((item, index) => {
                      const total = transactionTypeData.reduce((sum, item) => sum + item.value, 0)
                      const percentage = total > 0 ? Math.round((item.value / total) * 100) : 0

                      return (
                        <div key={index} className="flex flex-col items-center">
                          <div className="relative w-32 h-32">
                            <svg viewBox="0 0 100 100" className="w-full h-full">
                              <circle cx="50" cy="50" r="45" fill="none" stroke="#e5e7eb" strokeWidth="10" />
                              <circle
                                cx="50"
                                cy="50"
                                r="45"
                                fill="none"
                                stroke={item.color}
                                strokeWidth="10"
                                strokeDasharray={`${percentage * 2.83} 283`}
                                strokeDashoffset="0"
                                transform="rotate(-90 50 50)"
                              />
                              <text
                                x="50"
                                y="50"
                                textAnchor="middle"
                                dominantBaseline="middle"
                                className="text-2xl font-bold"
                                fill={item.color}
                              >
                                {percentage}%
                              </text>
                            </svg>
                          </div>
                          <div className="mt-2 text-center">
                            <div className="flex items-center justify-center">
                              <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: item.color }}></div>
                              <span className="text-sm font-medium">{item.label}</span>
                            </div>
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              ({item.value} transactions)
                            </span>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>

              {/* Transaction Table */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 overflow-hidden mb-8">
                <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-medium">Transaction List</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Showing the 10 most recent transactions</p>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Block
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Time
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Hash
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Block Hash
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          From
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          To
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Value (ETH)
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Gas Price
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                      {transactions.map((tx, index) => (
                        <tr
                          key={tx.hash}
                          className={index % 2 === 0 ? "bg-white dark:bg-gray-800" : "bg-gray-50 dark:bg-gray-700/50"}
                        >
                          <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">{tx.blockNumber}</td>
                          <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">
                            {formatDate(tx.timestamp)}
                          </td>
                          <td className="px-4 py-3 text-sm text-blue-600 dark:text-blue-400 font-medium">
                            <a
                              href={`https://eth.blockscout.com/tx/${tx.hash}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="hover:underline"
                            >
                              {truncateHash(tx.hash)}
                            </a>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                            {truncateHash(tx.blockHash)}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                            {truncateHash(tx.from)}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">{truncateHash(tx.to)}</td>
                          <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">
                            {formatValue(tx.value)}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">{tx.gasPrice}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}

          {!isLoading && transactions.length === 0 && !error && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 border border-gray-200 dark:border-gray-700 text-center">
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-full inline-flex items-center justify-center mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-8 w-8 text-blue-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-medium mb-2">No Transactions to Display</h3>
              <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto">
                Enter an Ethereum address and click "Fetch Transactions" to view transaction data and analytics.
              </p>
            </div>
          )}

          {/* Add Token Transfers Section */}
          {tokenTransfers.length > 0 && (
            <div className="container mx-auto p-6">
              <div className="max-w-6xl mx-auto">
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 overflow-hidden mb-8">
                  <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-medium">Token Transfers</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Recent token transfers for this address</p>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 dark:bg-gray-700">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                            Token
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                            Amount
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                            From
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                            To
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                            Time
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                        {tokenTransfers.map((tx, index) => (
                          <tr key={tx.hash} className={index % 2 === 0 ? "bg-white dark:bg-gray-800" : "bg-gray-50 dark:bg-gray-700/50"}>
                            <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">
                              {tx.tokenSymbol || 'Unknown Token'}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">
                              {(Number(tx.value) / Math.pow(10, Number(tx.tokenDecimal || 18))).toFixed(6)}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                              {truncateHash(tx.from)}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                              {truncateHash(tx.to)}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">
                              {formatDate(tx.timestamp)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
            <div className="bg-white dark:bg-gray-800 rounded-md p-4 border border-gray-200 dark:border-gray-700">
              <h3 className="font-medium mb-2 text-gray-900 dark:text-gray-100">Real-time Insights</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Get detailed analysis of transactions on the Ethereum blockchain in real-time.
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-md p-4 border border-gray-200 dark:border-gray-700">
              <h3 className="font-medium mb-2 text-gray-900 dark:text-gray-100">Secure Connection</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Connect securely with MetaMask to access your Ethereum wallet and transactions.
              </p>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </main>
  )
}

