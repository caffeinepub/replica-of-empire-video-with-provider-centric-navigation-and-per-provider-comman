# Empire C.C - AI Provider Command Center

Empire C.C is a comprehensive AI provider management platform built on the Internet Computer. This application allows you to manage multiple AI providers, execute workflows, and maintain a centralized key vault for your API credentials.

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher)
- **pnpm** (v8 or higher) - Install with `npm install -g pnpm`
- **DFX** (Internet Computer SDK) - Install with `sh -ci "$(curl -fsSL https://internetcomputer.org/install.sh)"`

## Installation

1. **Clone or extract this repository**

2. **Install frontend dependencies**
   ```bash
   cd frontend
   pnpm install
   ```

3. **Install backend dependencies** (if needed)
   ```bash
   cd backend
   # DFX will handle Motoko dependencies automatically
   ```

## Running Locally

### Start the Internet Computer Local Replica

From the project root directory:

