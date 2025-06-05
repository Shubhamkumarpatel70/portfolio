# MERN Portfolio

A full-stack portfolio website built with the MERN stack (MongoDB, Express, React, Node.js).

## Features

- Responsive design with Tailwind CSS
- Authentication system with user roles
- Admin dashboard for content management
- Dynamic sections for skills, projects, experience, and contact
- MongoDB database for data storage

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (running locally or connection string to MongoDB Atlas)
- npm or yarn

## Installation

1. Clone the repository:

```
git clone <repository-url>
cd portfolio-mern
```

2. Install dependencies for both frontend and backend:

```
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

3. Create a `.env` file in the backend directory with the following variables:

```
PORT=5000
MONGO_URI=mongodb://localhost:27017/portfolio
JWT_SECRET=your_jwt_secret_key
```

## Running the Application

### Option 1: Using the start script (recommended)

Run both the backend and frontend servers with a single command:

```
# From the root directory
node start.js
```

This will start the backend server on port 5000 and the frontend server on port 3001.

### Option 2: Starting servers manually

1. Make sure MongoDB is running:

```
# Check if MongoDB is running
node check-mongodb.js
```

2. Start the backend server:

```
# From the root directory
cd backend
npm start
```

3. Start the frontend development server:

```
# From the root directory
cd frontend
npm start
```

The frontend will run on port 3001 (http://localhost:3001) and the backend on port 5000.

### Stopping the servers

#### Option 1: Safe stop (recommended)

To stop only the servers for this project:

```
# From the root directory
node stop-safe.js
```

#### Option 2: Force stop all Node.js processes

To stop all running Node.js processes:

```
# From the root directory
node stop.js
```

**Warning**: This will stop ALL Node.js processes running on your system, not just the ones for this project.

4. Open your browser and navigate to `http://localhost:3000`

## Seeding the Database

To seed the database with initial data:

```
# From the backend directory
node seedData.js
```

This will create:

- Default admin user (email: admin@example.com, password: admin123)
- Sample skills
- Sample projects
- Sample experience entries

## Admin Access

After seeding the database, you can log in with:

- Email: admin@example.com
- Password: admin123

## Troubleshooting

### Backend Connection Issues

- Make sure MongoDB is running
- Check the MONGO_URI in the .env file
- Verify the backend is running on the correct port

### Authentication Issues

- Clear browser cookies and localStorage
- Try registering a new user
- Check the JWT_SECRET in the .env file

## License

This project is licensed under the MIT License.
