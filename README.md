3D Model Viewer
A full-stack web application that enables users to upload, manage, and view 3D models directly in the browser. Users can register an account, log in, upload GLB and OBJ files, search their collection, and interact with models in 3D space.

Live Demo
Frontend: Add your deployed frontend URL here
Backend API: Add your deployed backend URL here

Features
Authentication
User Registration and Login
Secure JWT Authentication stored in HTTP-only cookies
Protected routes and session management
Get current logged-in user details

3D Model Management

Upload GLB and OBJ files
Cloud storage via Cloudinary
Model metadata stored in MongoDB
Search models by name
Delete and manage user-specific models

3D Model Viewer

Interactive 3D model rendering via Three.js
Rotate, zoom, and pan controls
Support for GLB formats
Responsive viewer interface

Dashboard

Modern UI with model cards
Search bar functionality
Deletion confirmation modal
Loading and error handling states

Tech Stack

Frontend

React+Vite
React Router
Axios
Bootstrap
Three.js / React Three Fiber / React Three Drei

Backend

Node.js / Express.js
MongoDB / Mongoose
JWT / bcryptjs
Cookie Parser
Multer / Cloudinary
CORS

DevOps and Deployment

GitHub Actions (CI/CD Pipeline)
Vercel
MongoDB Atlas

Frontend Setup
Navigate to the backend directory: cd frontend
Install dependencies:
npm install
create .env
add -> VITE_API_URL=http://localhost:8080
and run : npm run dev

Backend Setup
Navigate to the backend directory: cd backend
Install dependencies : npm install

Create .env:

PORT=8080
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
FRONTEND_URL=http://localhost:5173
NODE_ENV=development

Start the server : npm run dev

Author
Prince Parihar

Full Stack Developer