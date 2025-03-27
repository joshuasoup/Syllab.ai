# Syllab.ai

An AI-powered platform for creating and managing university schedule

## Project Overview

Syllab.ai is a modern web application that helps educators create, manage, and share course syllabi efficiently.
checkout out v0.0: https://syllabi--development.gadget.app/ 

## Tech Stack

- **Frontend**: React with TypeScript, TailwindCSS
- **Backend**: Node.js with Express

## Current Status

### Completed

- Project structure setup
- Basic frontend and backend scaffolding
- Initial UI components (Navbar, Hero section)
- Basic routing setup
- Environment configuration
- Git repository setup with proper .gitignore

### In Progress

- User authentication system
- Syllabus creation interface

## Todo List

### Frontend

- [ ] Create syllabus editor interface
- [ ] Implement responsive design for all components
- [ ] Add form validation
- [ ] Create dashboard layout
- [ ] Implement syllabus preview functionality
- [ ] Add export options (PDF, Word)
- [ ] Create user profile management

### Backend

- [ ] Add rate limiting

### Documentation

- [ ] User guide
- [ ] Deployment guide

## Getting Started

### Prerequisites

- Node.js (v18 or higher)

### Installation

1. Clone the repository:

```bash
git clone https://github.com/yourusername/Syllab.ai.git
cd Syllab.ai
```

2. Install dependencies:

```bash
# Install client dependencies
cd client
yarn install

# Install server dependencies
cd ../server
yarn install
```

3. Set up environment variables:

- Copy `.env.example` to `.env` in both client and server directories
- Fill in the required environment variables

4. Start the development servers:

```bash
# Start the client (from client directory)
yarn run dev

# Start the server (from server directory)
yarn run dev
```

## License

none yet...
