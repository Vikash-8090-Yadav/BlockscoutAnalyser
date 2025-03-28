# BlockscoutAnalyser

A powerful web application for analyzing Ethereum blockchain transactions using the Blockscout API. This tool provides detailed insights into transaction history, token transfers, and blockchain analytics.

## Features

- 🔍 **Transaction Analysis**
  - View detailed transaction history
  - Track gas prices and usage
  - Monitor transaction success rates
  - Analyze transaction patterns

- 💰 **Token Transfers**
  - Track ERC-20 token transfers
  - View token balances
  - Monitor token transaction history
  - Analyze token transfer patterns

- 📊 **Analytics Dashboard**
  - Transaction value distribution
  - Gas price analysis
  - Transaction type breakdown
  - Real-time data updates

- 🔐 **Wallet Integration**
  - Connect with MetaMask
  - View personal transaction history
  - Track wallet balances
  - Secure authentication

## Tech Stack

- **Frontend Framework**: Next.js 15
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Blockchain**: Ethereum
- **API**: Blockscout
- **Wallet Integration**: MetaMask

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- MetaMask wallet (for wallet integration)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/Vikash-8090-Yadav/BlockscoutAnalyser.git
cd BlockscoutAnalyser
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Start the development server:
```bash
npm run dev
# or
yarn dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

1. Connect your MetaMask wallet (optional)
2. Enter an Ethereum address to analyze
3. View transaction history and analytics
4. Explore token transfers and balances
5. Use the analytics dashboard to understand transaction patterns

## API Integration

This project uses the Blockscout API to fetch blockchain data. The API endpoints used include:

- Transaction history: `/api?module=account&action=txlist`
- Token transfers: `/api?module=account&action=tokentx`

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [Blockscout](https://docs.blockscout.com/) for providing the API
- [Ethereum](https://ethereum.org/) community
- [Next.js](https://nextjs.org/) team
- [Tailwind CSS](https://tailwindcss.com/) team

## Contact

Vikash Kumar Yadav - [GitHub](https://github.com/Vikash-8090-Yadav)

Project Link: [https://github.com/Vikash-8090-Yadav/BlockscoutAnalyser](https://github.com/Vikash-8090-Yadav/BlockscoutAnalyser)
