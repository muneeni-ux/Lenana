// import { db } from "../db.js";
// import { v4 as uuid } from "uuid";

// // ───────────────────────────────────────────
// // 1) Get All Clients
// // ───────────────────────────────────────────
// // Only active clients shown to Maker & Checker
// export const getClients = async (req, res) => {
//   try {
//     const role = req.user.role;

//     let query = "SELECT * FROM clients WHERE status='ACTIVE' ORDER BY createdAt DESC";

//     // OWNER can see all clients (active + soft-deleted)
//     if (role === "OWNER" || role === "CHECKER") {
//       query = "SELECT * FROM clients ORDER BY createdAt DESC";
//     }

//     const [rows] = await db.query(query);
//     res.json(rows);
//   } catch (err) {
//     console.error("❌ ERROR getClients:", err);
//     res.status(500).json({ error: err.message });
//   }
// };


// // ───────────────────────────────────────────
// // 2) Create Client
// // ───────────────────────────────────────────
// export const createClient = async (req, res) => {
//   try {
//     const id = uuid();
//     const clientCode = "CL-" + Math.floor(Math.random() * 900 + 100);
//     const createdBy = req.user.id;

//     const values = [
//       id,
//       clientCode,
//       req.body.clientType,
//       req.body.businessName,
//       req.body.businessRegistration || null,
//       req.body.contactPerson || null,
//       req.body.phone,
//       req.body.email || null,
//       req.body.deliveryAddress,
//       req.body.gpsLatitude || null,
//       req.body.gpsLongitude || null,
//       req.body.billingAddress || null,
//       req.body.creditLimitKsh || null,
//       req.body.paymentTerms || null,
//       req.body.preferredDeliveryDay || null,
//       req.body.notes || null,
//       req.body.status || "ACTIVE",
//       createdBy,
//       createdBy
//     ];

//     await db.query(
//       `INSERT INTO clients (
//         id, clientCode, clientType, businessName, businessRegistration,
//         contactPerson, phone, email, deliveryAddress, gpsLatitude, gpsLongitude,
//         billingAddress, creditLimitKsh, paymentTerms, preferredDeliveryDay, notes,
//         status, createdBy, updatedBy
//       ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
//       values
//     );

//     res.json({ message: "Client created successfully", id, clientCode });

//   } catch (err) {
//     console.error("❌ ERROR createClient:", err);
//     res.status(500).json({ error: err.message });
//   }
// };

// // ───────────────────────────────────────────
// // 3) Update Client
// // ───────────────────────────────────────────
// export const updateClient = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const updatedBy = req.user.id;

//     await db.query(
//       `UPDATE clients SET
//         clientType=?, businessName=?, businessRegistration=?, contactPerson=?,
//         phone=?, email=?, deliveryAddress=?, gpsLatitude=?, gpsLongitude=?,
//         billingAddress=?, creditLimitKsh=?, paymentTerms=?, preferredDeliveryDay=?,
//         notes=?, status=?, updatedBy=?
//        WHERE id=?`,
//       [
//         req.body.clientType,
//         req.body.businessName,
//         req.body.businessRegistration,
//         req.body.contactPerson,
//         req.body.phone,
//         req.body.email,
//         req.body.deliveryAddress,
//         req.body.gpsLatitude,
//         req.body.gpsLongitude,
//         req.body.billingAddress,
//         req.body.creditLimitKsh,
//         req.body.paymentTerms,
//         req.body.preferredDeliveryDay,
//         req.body.notes,
//         req.body.status,
//         updatedBy,
//         id
//       ]
//     );

//     res.json({ message: "Client updated successfully" });
//   } catch (err) {
//     console.error("❌ ERROR updateClient:", err);
//     res.status(500).json({ error: err.message });
//   }
// };

// // ───────────────────────────────────────────
// // 4) Soft Delete Client (set INACTIVE)
// // ───────────────────────────────────────────
// export const deleteClient = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const updatedBy = req.user.id;

//     // 1. Confirm client exists
//     const [existing] = await db.query(
//       "SELECT id FROM clients WHERE id = ?",
//       [id]
//     );

//     if (existing.length === 0) {
//       return res.status(404).json({ message: "Client not found" });
//     }

//     // 2. Soft delete → Mark INACTIVE
//     await db.query(
//       `UPDATE clients 
//        SET status = 'INACTIVE', updatedBy = ? 
//        WHERE id = ?`,
//       [updatedBy, id]
//     );

//     res.json({ message: "Client archived (soft deleted) successfully" });

//   } catch (err) {
//     console.error("❌ ERROR softDeleteClient:", err);
//     res.status(500).json({ error: err.message });
//   }
// };
import { db } from "../db.js";
import { v4 as uuid } from "uuid";

// ───────────────────────────────────────────
// 1) Get All Clients (GET /api/clients)
// FIX: SQL query condensed to a single line.
// ───────────────────────────────────────────
export const getClients = async (req, res) => {
  console.log("🔍 Fetching all client records...");

  try {
    const role = req.user.role;
    // CLEANED QUERY: All joins are now on a single line for stability
    let baseQuery = `SELECT c.*, u_creator.firstName AS creatorName, u_updater.firstName AS updaterName FROM clients c LEFT JOIN users u_creator ON c.createdBy = u_creator.id LEFT JOIN users u_updater ON c.updatedBy = u_updater.id`;
    let query = baseQuery;

    // Maker's query: Only sees ACTIVE clients
    if (role === "MAKER") {
      query += " WHERE c.status='ACTIVE' ORDER BY c.createdAt DESC";
    } 
    // OWNER/CHECKER query: Sees all clients (ACTIVE + INACTIVE/ON_HOLD)
    else {
      query += " ORDER BY c.createdAt DESC";
    }

    console.log(`👤 User Role: ${role}. Executing Query: ${query.substring(0, 80)}...`);

    const [rows] = await db.query(query);
    
    console.log(`✅ Retrieved ${rows.length} client records successfully.`);
    res.json(rows);

  } catch (err) {
    console.error("❌ ERROR getClients:", err.message);
    console.error("Stack:", err.stack); 
    res.status(500).json({ error: "Failed to fetch clients: " + err.message });
  }
};

// ----------------------------------------------------------------------------------

// ───────────────────────────────────────────
// 2) Create Client (POST /api/clients)
// FIX: SQL query is a single line.
// ───────────────────────────────────────────
export const createClient = async (req, res) => {
  console.log("📥 Incoming createClient request body:", req.body);

  try {
    const id = uuid();
    const clientCode = "CL-" + Math.floor(Math.random() * 900 + 100); 
    const createdBy = req.user.id;
    
    console.log("🛠️ Generated ID and Code:", { id, clientCode, createdBy });

    const values = [
      id,
      clientCode,
      req.body.clientType,
      req.body.businessName,
      req.body.businessRegistration || null,
      req.body.contactPerson || null,
      req.body.phone,
      req.body.email || null,
      req.body.deliveryAddress,
      req.body.gpsLatitude || null,
      req.body.gpsLongitude || null,
      req.body.billingAddress || null,
      req.body.creditLimitKsh || null,
      req.body.paymentTerms || null,
      req.body.preferredDeliveryDay || null,
      req.body.notes || null,
      req.body.status || "ACTIVE",
      createdBy,
      createdBy 
    ];
    
    console.log("❓ SQL Query Values Count:", values.length);

    // CLEANED AND CONDENSED SQL QUERY (19 fields/values)
    const [result] = await db.query(
      `INSERT INTO clients (id, clientCode, clientType, businessName, businessRegistration, contactPerson, phone, email, deliveryAddress, gpsLatitude, gpsLongitude, billingAddress, creditLimitKsh, paymentTerms, preferredDeliveryDay, notes, status, createdBy, updatedBy) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      values
    );
    
    console.log("✔️ SQL Insert Result:", result);

    res.json({ message: "Client created successfully", id, clientCode });

  } catch (err) {
    console.error("❌ ERROR createClient:", err.message);
    console.error("Stack:", err.stack);
    if (err.code === 'ER_DUP_ENTRY') {
        res.status(409).json({ error: "Client Code already exists. Please try a different client." });
    } else {
        res.status(500).json({ error: "Failed to create client: " + err.message });
    }
  }
};

// ----------------------------------------------------------------------------------

// ───────────────────────────────────────────
// 3) Update Client (PUT /api/clients/:id)
// FIX: SQL query condensed to a single line.
// ───────────────────────────────────────────
export const updateClient = async (req, res) => {
    const { id } = req.params;
    console.log(`📥 Incoming updateClient request for ID: ${id}. Body:`, req.body);

  try {
    const updatedBy = req.user.id;

    const updateValues = [
        req.body.clientType,
        req.body.businessName,
        req.body.businessRegistration,
        req.body.contactPerson,
        req.body.phone,
        req.body.email,
        req.body.deliveryAddress,
        req.body.gpsLatitude,
        req.body.gpsLongitude,
        req.body.billingAddress,
        req.body.creditLimitKsh,
        req.body.paymentTerms,
        req.body.preferredDeliveryDay,
        req.body.notes,
        req.body.status,
        updatedBy,
        id 
    ];
    
    console.log("❓ SQL Update Values Count:", updateValues.length);

    // CLEANED AND CONDENSED SQL QUERY (17 fields/values)
    const [result] = await db.query(
      `UPDATE clients SET clientType=?, businessName=?, businessRegistration=?, contactPerson=?, phone=?, email=?, deliveryAddress=?, gpsLatitude=?, gpsLongitude=?, billingAddress=?, creditLimitKsh=?, paymentTerms=?, preferredDeliveryDay=?, notes=?, status=?, updatedBy=? WHERE id=?`,
      updateValues
    );
    
    console.log("✔️ SQL Update Result:", result);
    
    if (result.affectedRows === 0) {
        console.warn(`⚠️ Warning: Update failed, client ID ${id} not found.`);
        return res.status(404).json({ message: "Client not found or no changes made" });
    }

    res.json({ message: "Client updated successfully" });
  } catch (err) {
    console.error("❌ ERROR updateClient:", err.message);
    console.error("Stack:", err.stack); 
    res.status(500).json({ error: "Failed to update client: " + err.message });
  }
};

// ----------------------------------------------------------------------------------

// ───────────────────────────────────────────
// 4) Soft Delete Client (DELETE /api/clients/:id)
// FIX: SQL query condensed to a single line.
// ───────────────────────────────────────────
export const deleteClient = async (req, res) => {
    const { id } = req.params;
    console.log(`📥 Incoming deleteClient request for ID: ${id}.`);

  try {
    const updatedBy = req.user.id;

    // 1. Confirm client exists
    const [existing] = await db.query(
      "SELECT id FROM clients WHERE id = ?",
      [id]
    );

    if (existing.length === 0) {
        console.warn(`⚠️ Warning: Delete failed, client ID ${id} not found.`);
        return res.status(404).json({ message: "Client not found" });
    }
    
    console.log("👤 Client found. Proceeding with soft delete.");

    // 2. Soft delete → Mark INACTIVE (CLEANED QUERY)
    const [result] = await db.query(
      `UPDATE clients SET status = 'INACTIVE', updatedBy = ? WHERE id = ?`,
      [updatedBy, id]
    );
    
    console.log("✔️ SQL Soft Delete Result:", result);

    res.json({ message: "Client archived (soft deleted) successfully" });

  } catch (err) {
    console.error("❌ ERROR deleteClient:", err.message);
    console.error("Stack:", err.stack); 
    res.status(500).json({ error: "Failed to archive client: " + err.message });
  }
};