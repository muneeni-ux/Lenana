import 'dotenv/config';
import app from "./app.js";
import cors from 'cors'; // Assuming 'cors' is installed based on previous context

// Define server port (uses env var or defaults to 4000)
const PORT = process.env.PORT || 4000;

// Define client origin (uses env var or defaults to 3000, where React runs)
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || 'http://localhost:3000';

// Configure CORS to allow the frontend to communicate with the backend
app.use(
  cors({
    origin: CLIENT_ORIGIN,
    methods: "GET,POST,OPTIONS, PUT,DELETE, PATCH",
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true, // Important for sending cookies/auth headers
  })
);


app.listen(PORT, () => {
  console.log("Server listening on port", PORT);
  console.log(`CORS Policy allowing access from: ${CLIENT_ORIGIN}`);
});