// server.js (Conceptual)
import express from 'express';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import 'dotenv/config';
import cors from 'cors';
import authRouter from './routes/auth.js'; 
import stockInRoutes from "./routes/stockInRoutes.js";
import clientRoutes from "./routes/clientRoutes.js";
import inventoryRoutes from "./routes/inventoryRoutes.js";
import productRoutes from "./routes/productsRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import productionRoutes from "./routes/productionRoutes.js";
import invoiceRoutes from "./routes/invoicesRoutes.js";

const app = express(); // Crucial: Initialize the app object

const PORT = process.env.PORT || 8080; 

const httpServer = createServer(app);

// Initialize Socket.IO Server
const io = new SocketIOServer(httpServer, {
    cors: { origin: "*", methods: ["GET", "POST"] } 
});

// Pass the 'io' instance to your controllers
app.use((req, res, next) => {
    req.io = io; // Attach to request object
    next();
});
// ... setup routes and database ...

httpServer.listen(PORT, () => console.log(`Server running on port ${PORT}`));
// --- Configuration & Initialization ---
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
app.use("/api/stock-in", stockInRoutes);
app.use("/api/clients", clientRoutes);
app.use("/api/inventory",inventoryRoutes); 
app.use("/api/products",productRoutes);
app.use("/api/orders",orderRoutes);
app.use("/api/production",productionRoutes);
app.use("/api/invoices",invoiceRoutes);

// --- Start Server ---
app.listen(PORT, () => {
  console.log("Server listening on port", PORT);
  console.log(`CORS Policy allowing access from: ${CLIENT_ORIGIN}`);
});