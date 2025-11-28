import 'dotenv/config';
import express from 'express'; // Crucial: Import Express
import cors from 'cors';
import authRouter from './routes/auth.js'; 
import { db } from "./db.js"; 

// --- Configuration & Initialization ---
const app = express(); // Crucial: Initialize the app object
const PORT = process.env.PORT || 8080; 
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || 'http://localhost:3000';

// --- Global Middleware ---
app.use(express.json()); 

// Configure CORS
const corsOptions = {
    origin: CLIENT_ORIGIN,
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE", 
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
};

// Use the cors middleware globally. This is generally sufficient
// for handling preflight (OPTIONS) requests automatically for routes defined later.
app.use(cors(corsOptions));

// --- API Routes ---
app.use('/api/auth', authRouter); 


// --- Start Server ---
app.listen(PORT, () => {
  console.log("Server listening on port", PORT);
  console.log(`CORS Policy allowing access from: ${CLIENT_ORIGIN}`);
});