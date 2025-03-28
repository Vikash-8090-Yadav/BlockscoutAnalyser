import Link from 'next/link'
import { Github } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-gradient-to-r from-purple-900 via-blue-800 to-indigo-900 text-white py-8">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-xl font-bold mb-4">BlockscoutAnalyser</h3>
            <p className="text-gray-300">
              A powerful tool for analyzing Ethereum blockchain transactions using Blockscout API.
            </p>
          </div>
          <div>
            <h3 className="text-xl font-bold mb-4">Features</h3>
            <ul className="space-y-2 text-gray-300">
              <li>• Transaction Analysis</li>
              <li>• Gas Price Tracking</li>
              <li>• Value Distribution</li>
              <li>• Contract Interaction Analysis</li>
              <li>• Real-time Data</li>
            </ul>
          </div>
          <div>
            <h3 className="text-xl font-bold mb-4">Connect</h3>
            <div className="flex space-x-4">
              <a
                href="https://github.com/Vikash-8090-Yadav/BlockscoutAnalyser"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors"
              >
                <Github className="w-6 h-6" />
                <span>GitHub Repository</span>
              </a>
            </div>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t border-gray-700 text-center text-gray-300">
          <p>Built with Next.js and Blockscout API</p>
        </div>
      </div>
    </footer>
  )
} 