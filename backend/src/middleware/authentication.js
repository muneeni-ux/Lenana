import jwt from 'jsonwebtoken';
import { db } from '../db.js'; // Adjust path as needed

// Secret key for JWT verification (MUST match the secret used in signToken)
const JWT_SECRET = process.env.JWT_SECRET || 'your_default_secret_key'; 

// Middleware to protect routes and attach user data
export const authenticate = async (req, res, next) => {
    // 1. Get the token from the header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        // If no token is provided, authentication fails
        return res.status(401).json({ error: "Not authenticated: Missing token" });
    }

    // Extract the token part
    const token = authHeader.split(' ')[1];
    
    try {
        // 2. Verify the token using the secret key
        const decoded = jwt.verify(token, JWT_SECRET);
        
        // 3. Fetch the user from the database using the ID from the token
        const [rows] = await db.query(
            "SELECT id, email, role FROM users WHERE id = ?", 
            [decoded.id] // Assuming you stored 'id' in the JWT payload
        );

        if (rows.length === 0) {
            return res.status(401).json({ error: "Not authenticated: User not found" });
        }

        // 4. Attach the user object (containing role) to the request object
        req.user = rows[0];

        // Proceed to the next middleware (which is requireRole)
        next();

    } catch (error) {
        // Handle common JWT errors (e.g., expired, invalid signature)
        console.error("JWT Verification Error:", error.message);
        return res.status(401).json({ error: "Not authenticated: Invalid token" });
    }
};