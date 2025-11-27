// import { db } from "../db.js";
// import bcrypt from "bcryptjs";
// import { signToken } from "../utils/jwt.js";
// import { v4 as uuid } from "uuid";

// // 1️⃣ OWNER SIGNUP (only once)
// export const signupOwner = async (req, res) => {
//   console.log("--- SIGNUP OWNER Request Received ---");
//   try {
//     const { email, password, firstName, lastName, phone, username } = req.body;
//     console.log("Request body:", { email, firstName, role: 'OWNER' });

//     // Check if an OWNER already exists
//     const [exists] = await db.query(
//       "SELECT id FROM users WHERE role='OWNER' LIMIT 1"
//     );
//     console.log(`Database check: ${exists.length} existing OWNER(s) found.`);

//     if (exists.length > 0) {
//       console.warn("OWNER already exists. Blocking new OWNER creation.");
//       return res
//         .status(400)
//         .json({ message: "Owner already exists. Contact admin to add users." });
//     }

//     const hashed = await bcrypt.hash(password, 12);
//     console.log("Password hashed successfully.");

//     // Insert new OWNER user
//     const newUserDetails = [
//       uuid(),
//       email,
//       username || firstName,
//       firstName,
//       lastName,
//       phone,
//       hashed,
//       "OWNER",
//       null,
//     ];

//     await db.query(
//       `INSERT INTO users 
//       (id, email, username, firstName, lastName, phone, password_hash, role, createdBy)
//       VALUES (?,?,?,?,?,?,?,?,?)`,
//       newUserDetails
//     );

//     console.log("✅ New System Owner successfully inserted into DB.");
//     res.json({ message: "System Owner created successfully" });
//   } catch (err) {
//     console.error("❌ ERROR in signupOwner:", err.message);
//     res.status(500).json({ message: err.message });
//   }
// };

// // 2️⃣ LOGIN
// export const loginUser = async (req, res) => {
//   console.log("--- LOGIN Request Received ---");
//   try {
//     const { email, password } = req.body;
//     console.log(`Attempting login for email: ${email}`);

//     // Fetch user by email
//     const [rows] = await db.query("SELECT * FROM users WHERE email=?", [email]);
    
//     if (rows.length === 0) {
//       console.log("User not found in database.");
//       return res.status(400).json({ message: "Invalid credentials" });
//     }

//     const user = rows[0];
//     console.log(`User found (Role: ${user.role}). Checking password...`);

//     // Compare password hash
//     const valid = await bcrypt.compare(password, user.password_hash);
    
//     if (!valid) {
//       console.log("Password comparison failed.");
//       return res.status(400).json({ message: "Invalid credentials" });
//     }
    
//     console.log("Password matched. Updating last login time...");
//     await db.query("UPDATE users SET lastLogin=NOW() WHERE id=?", [user.id]);

//     // Sign JWT token
//     const token = signToken(user);
//     console.log("JWT token signed. Preparing response.");

//     res.json({
//       message: "Login successful",
//       token,
//       user: {
//         id: user.id,
//         email: user.email,
//         username: user.username,
//         firstName: user.firstName,
//         lastName: user.lastName,
//         phone: user.phone,
//         role: user.role,
//       },
//     });
//     console.log(`✅ User ${user.email} successfully logged in.`);
    
//   } catch (err) {
//     console.error("❌ ERROR in loginUser:", err.message);
//     res.status(500).json({ message: err.message });
//   }
// };

// // 3️⃣ OWNER creates new users
// export const createUser = async (req, res) => {
//   console.log("--- CREATE USER Request Received ---");
//   try {
//     const {
//       email,
//       username,
//       firstName,
//       lastName,
//       phone,
//       password,
//       role,
//     } = req.body;
    
//     // Log who is creating the user (from middleware) and the new user's role
//     console.log(`Admin ${req.user.id} attempting to create new user with role: ${role}`);
//     console.log(`New user details: { email: ${email}, firstName: ${firstName} }`);

//     const hashed = await bcrypt.hash(password, 12);
//     console.log("Password hashed.");

//     const newUserDetails = [
//       uuid(),
//       email,
//       username,
//       firstName,
//       lastName,
//       phone,
//       hashed,
//       role,
//       req.user.id,
//     ];

//     await db.query(
//       `INSERT INTO users 
//       (id, email, username, firstName, lastName, phone, password_hash, role, createdBy) 
//       VALUES (?,?,?,?,?,?,?,?,?)`,
//       newUserDetails
//     );

//     console.log(`✅ User (Role: ${role}) created successfully by ${req.user.id}.`);
//     res.json({ message: "User created successfully" });
//   } catch (err) {
//     console.error("❌ ERROR in createUser:", err.message);
//     res.status(500).json({ message: err.message });
//   }
// };
import { db } from "../db.js";
import bcrypt from "bcryptjs";
import { signToken } from "../utils/jwt.js";
import { v4 as uuid } from "uuid";

// Re-export requireRole for use in router
export function requireRole(roles = []) {
  return (req, res, next) => {
    const user = req.user;

    if (!user) {
      console.warn(`[ROLE CHECK] Failed: req.user is missing.`);
      return res.status(401).json({ error: "Not authenticated" });
    }
    
    console.log(`[ROLE CHECK] User role is: ${user.role}. Required roles: ${roles.join(', ')}`);
    
    if (!roles.length) return next();
    
    if (!roles.includes(user.role)) {
      console.warn(`[ROLE CHECK] Forbidden: User role ${user.role} is not in required roles.`);
      return res.status(403).json({ error: "Forbidden" });
    }

    console.log("[ROLE CHECK] Success: User role is authorized.");
    next();
  };
}


// 1️⃣ OWNER SIGNUP (only once)
export const signupOwner = async (req, res) => {
  console.log("--- SIGNUP OWNER Request Received ---");
  try {
    const { email, password, firstName, lastName, phone, username } = req.body;
    console.log("Request body:", { email, firstName, role: 'OWNER' });

    // Check if an OWNER already exists
    const [exists] = await db.query(
      "SELECT id FROM users WHERE role='OWNER' LIMIT 1"
    );
    console.log(`Database check: ${exists.length} existing OWNER(s) found.`);

    if (exists.length > 0) {
      console.warn("OWNER already exists. Blocking new OWNER creation.");
      return res
        .status(400)
        .json({ message: "Owner already exists. Contact admin to add users." });
    }

    const hashed = await bcrypt.hash(password, 12);
    console.log("Password hashed successfully.");

    // Insert new OWNER user
    const newUserDetails = [
      uuid(),
      email,
      username || firstName,
      firstName,
      lastName,
      phone,
      hashed,
      "OWNER",
      null,
    ];

    await db.query(
      `INSERT INTO users 
      (id, email, username, firstName, lastName, phone, password_hash, role, createdBy)
      VALUES (?,?,?,?,?,?,?,?,?)`,
      newUserDetails
    );

    console.log("✅ New System Owner successfully inserted into DB.");
    res.json({ message: "System Owner created successfully" });
  } catch (err) {
    console.error("❌ ERROR in signupOwner:", err.message);
    res.status(500).json({ message: err.message });
  }
};

// 2️⃣ LOGIN
export const loginUser = async (req, res) => {
  console.log("--- LOGIN Request Received ---");
  try {
    const { email, password } = req.body;
    console.log(`Attempting login for email: ${email}`);

    // Fetch user by email
    const [rows] = await db.query("SELECT * FROM users WHERE email=?", [email]);
    
    if (rows.length === 0) {
      console.log("User not found in database.");
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const user = rows[0];
    console.log(`User found (Role: ${user.role}). Checking password...`);

    // Compare password hash
    const valid = await bcrypt.compare(password, user.password_hash);
    
    if (!valid) {
      console.log("Password comparison failed.");
      return res.status(400).json({ message: "Invalid credentials" });
    }
    
    console.log("Password matched. Updating last login time...");
    await db.query("UPDATE users SET lastLogin=NOW() WHERE id=?", [user.id]);

    // Sign JWT token
    const token = signToken(user);
    console.log("JWT token signed. Preparing response.");

    res.json({
      message: "Login successful",
      token,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        role: user.role,
      },
    });
    console.log(`✅ User ${user.email} successfully logged in.`);
    
  } catch (err) {
    console.error("❌ ERROR in loginUser:", err.message);
    res.status(500).json({ message: err.message });
  }
};

// 3️⃣ OWNER creates new users
export const createUser = async (req, res) => {
  console.log("--- CREATE USER Request Received ---");
  try {
    const {
      email,
      username,
      firstName,
      lastName,
      phone,
      password,
      role,
    } = req.body;
    
    // Log who is creating the user (from middleware) and the new user's role
    console.log(`Admin ${req.user.id} attempting to create new user with role: ${role}`);
    console.log(`New user details: { email: ${email}, firstName: ${firstName} }`);

    const hashed = await bcrypt.hash(password, 12);
    console.log("Password hashed.");

    const newUserDetails = [
      uuid(),
      email,
      username,
      firstName,
      lastName,
      phone,
      hashed,
      role,
      req.user.id,
    ];

    await db.query(
      `INSERT INTO users 
      (id, email, username, firstName, lastName, phone, password_hash, role, createdBy) 
      VALUES (?,?,?,?,?,?,?,?,?)`,
      newUserDetails
    );

    console.log(`✅ User (Role: ${role}) created successfully by ${req.user.id}.`);
    res.json({ message: "User created successfully" });
  } catch (err) {
    console.error("❌ ERROR in createUser:", err.message);
    res.status(500).json({ message: err.message });
  }
};