// import { db } from "../db.js";
// import { v4 as uuid } from "uuid";

// // Helper to compute cost
// const computeTotalCost = (unit, duty, sticker) =>
//   Number(unit) + Number(duty) + Number(sticker);

// /**
//  * GET Products
//  * - Maker sees only ACTIVE
//  * - Owner & Checker see all
//  */
// export const getProducts = async (req, res) => {
//   try {
//     const role = req.user.role;
//     let query = "SELECT * FROM products WHERE status='ACTIVE' ORDER BY createdAt DESC";

//     if (role === "OWNER" || role === "CHECKER") {
//       query = "SELECT * FROM products ORDER BY createdAt DESC";
//     }

//     const [rows] = await db.query(query);
//     res.json(rows);
//   } catch (err) {
//     console.error("❌ ERROR getProducts:", err);
//     res.status(500).json({ error: err.message });
//   }
// };

// /**
//  * CREATE Product
//  */
// export const createProduct = async (req, res) => {
//   try {
//     const id = uuid();
//     const createdBy = req.user.id;

//     const {
//       skuCode,
//       productName,
//       sizeMl,
//       unit,
//       supplier = null,
//       unitCostKsh = 0,
//       exerciseDutyKsh = 0,
//       stickerCostKsh = 0,
//       reorderLevel
//     } = req.body;

//     const totalCostPerUnitKsh = computeTotalCost(unitCostKsh, exerciseDutyKsh, stickerCostKsh);

//     await db.query(
//       `INSERT INTO products (
//         id, skuCode, productName, sizeMl, unit, supplier,
//         unitCostKsh, exerciseDutyKsh, stickerCostKsh,
//         totalCostPerUnitKsh, reorderLevel, createdBy, updatedBy
//       ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)`,
//       [
//         id, skuCode, productName, sizeMl, unit, supplier,
//         unitCostKsh, exerciseDutyKsh, stickerCostKsh,
//         totalCostPerUnitKsh, reorderLevel,
//         createdBy, createdBy
//       ]
//     );

//     // 🔥 Auto-create inventory record for the product (1:1)
//     await db.query(
//       `INSERT INTO inventory (id, productId, warehouseLocation, createdBy, updatedBy)
//        VALUES (?,?,?,?,?)`,
//       [
//         uuid(),
//         id,
//         "Factory",
//         createdBy,
//         createdBy
//       ]
//     );

//     res.json({ message: "Product created successfully", id });
//   } catch (err) {
//     console.error("❌ ERROR createProduct:", err);
//     res.status(500).json({ error: err.message });
//   }
// };

// /**
//  * UPDATE Product
//  */
// export const updateProduct = async (req, res) => {
//   try {
//     const id = req.params.id;
//     const updatedBy = req.user.id;

//     const {
//       productName,
//       sizeMl,
//       unit,
//       supplier,
//       unitCostKsh,
//       exerciseDutyKsh,
//       stickerCostKsh,
//       reorderLevel,
//       status
//     } = req.body;

//     const totalCostPerUnitKsh = computeTotalCost(unitCostKsh, exerciseDutyKsh, stickerCostKsh);

//     await db.query(
//       `UPDATE products SET
//         productName=?, sizeMl=?, unit=?, supplier=?,
//         unitCostKsh=?, exerciseDutyKsh=?, stickerCostKsh=?, totalCostPerUnitKsh=?,
//         reorderLevel=?, status=?, updatedBy=?
//        WHERE id=?`,
//       [
//         productName, sizeMl, unit, supplier,
//         unitCostKsh, exerciseDutyKsh, stickerCostKsh, totalCostPerUnitKsh,
//         reorderLevel, status, updatedBy,
//         id
//       ]
//     );

//     res.json({ message: "Product updated successfully" });
//   } catch (err) {
//     console.error("❌ ERROR updateProduct:", err);
//     res.status(500).json({ error: err.message });
//   }
// };

// /**
//  * SOFT DELETE Product
//  * Sets status = 'DELETED' and isActive = false
//  */
// export const deleteProduct = async (req, res) => {
//   try {
//     const id = req.params.id;
//     const updatedBy = req.user.id;

//     await db.query(
//       `UPDATE products SET status='DELETED', isActive=FALSE, updatedBy=? WHERE id=?`,
//       [updatedBy, id]
//     );

//     res.json({ message: "Product soft-deleted" });
//   } catch (err) {
//     console.error("❌ ERROR deleteProduct:", err);
//     res.status(500).json({ error: err.message });
//   }
// };
import { db } from "../db.js";
import { v4 as uuid } from "uuid";

// Helper to compute cost
const computeTotalCost = (unit, duty, sticker) => {
    const total = Number(unit) + Number(duty) + Number(sticker);
    console.log(`🛠️ computeTotalCost: Unit(${unit}) + Duty(${duty}) + Sticker(${sticker}) = Total(${total})`); // Debug Log
    return total;
}

/**
 * GET Products
 * - Maker sees only ACTIVE
 * - Owner & Checker see all
 */
export const getProducts = async (req, res) => {
    console.log("🔍 getProducts: Request received."); // Debug Log
    try {
        const role = req.user.role;
        console.log(`👤 getProducts: User role is ${role}.`); // Debug Log
        let query = "SELECT * FROM products WHERE status='ACTIVE' ORDER BY createdAt DESC";

        if (role === "OWNER" || role === "CHECKER") {
            query = "SELECT * FROM products ORDER BY createdAt DESC";
        }
        
        console.log(`📜 getProducts: Executing query: ${query}`); // Debug Log
        const [rows] = await db.query(query);
        console.log(`✅ getProducts: Found ${rows.length} product rows.`); // Debug Log
        res.json(rows);
    } catch (err) {
        console.error("❌ ERROR getProducts:", err);
        res.status(500).json({ error: err.message });
    }
};

/**
 * CREATE Product
 */
export const createProduct = async (req, res) => {
    console.log("📥 createProduct: Request received. Body:", req.body); // Debug Log
    try {
        const id = uuid();
        const createdBy = req.user.id;
        console.log(`🛠️ createProduct: Generated Product ID: ${id}, Created By: ${createdBy}`); // Debug Log

        const {
            skuCode,
            productName,
            sizeMl,
            unit,
            supplier = null,
            unitCostKsh = 0,
            exerciseDutyKsh = 0,
            stickerCostKsh = 0,
            reorderLevel
        } = req.body;

        const totalCostPerUnitKsh = computeTotalCost(unitCostKsh, exerciseDutyKsh, stickerCostKsh);

        const productValues = [
            id, skuCode, productName, sizeMl, unit, supplier,
            unitCostKsh, exerciseDutyKsh, stickerCostKsh,
            totalCostPerUnitKsh, reorderLevel,
            createdBy, createdBy
        ];
        console.log("❓ createProduct: Product Query values (13):", productValues); // Debug Log

        const [productResult] = await db.query(
            `INSERT INTO products (
                id, skuCode, productName, sizeMl, unit, supplier,
                unitCostKsh, exerciseDutyKsh, stickerCostKsh,
                totalCostPerUnitKsh, reorderLevel, createdBy, updatedBy
            ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)`,
            productValues
        );
        console.log("✔️ createProduct: Product SQL Result:", productResult); // Debug Log

        // 🔥 Auto-create inventory record for the product (1:1)
        const inventoryId = uuid();
        const inventoryValues = [
            inventoryId,
            id,
            "Factory",
            createdBy,
            createdBy
        ];
        console.log("🔥 createProduct: Auto-creating Inventory record ID:", inventoryId); // Debug Log
        console.log("❓ createProduct: Inventory Query values (5):", inventoryValues); // Debug Log

        const [inventoryResult] = await db.query(
            `INSERT INTO inventory (id, productId, warehouseLocation, createdBy, updatedBy)
            VALUES (?,?,?,?,?)`,
            inventoryValues
        );
        console.log("✔️ createProduct: Inventory SQL Result:", inventoryResult); // Debug Log

        res.json({ message: "Product created successfully", id });
    } catch (err) {
        console.error("❌ ERROR createProduct:", err);
        res.status(500).json({ error: err.message });
    }
};

/**
 * UPDATE Product
 */
export const updateProduct = async (req, res) => {
    console.log(`📥 updateProduct: Request received for ID: ${req.params.id}. Body:`, req.body); // Debug Log
    try {
        const id = req.params.id;
        const updatedBy = req.user.id;

        const {
            productName,
            sizeMl,
            unit,
            supplier,
            unitCostKsh,
            exerciseDutyKsh,
            stickerCostKsh,
            reorderLevel,
            status
        } = req.body;

        const totalCostPerUnitKsh = computeTotalCost(unitCostKsh, exerciseDutyKsh, stickerCostKsh);

        const updateValues = [
            productName, sizeMl, unit, supplier,
            unitCostKsh, exerciseDutyKsh, stickerCostKsh, totalCostPerUnitKsh,
            reorderLevel, status, updatedBy,
            id
        ];
        console.log("❓ updateProduct: Query values (12):", updateValues); // Debug Log

        const [result] = await db.query(
            `UPDATE products SET
             productName=?, sizeMl=?, unit=?, supplier=?,
             unitCostKsh=?, exerciseDutyKsh=?, stickerCostKsh=?, totalCostPerUnitKsh=?,
             reorderLevel=?, status=?, updatedBy=?
             WHERE id=?`,
            updateValues
        );
        console.log("✔️ updateProduct: SQL Result:", result); // Debug Log
        if (result.affectedRows === 0) {
            console.warn(`⚠️ updateProduct: No rows affected for ID ${id}. Product might not exist.`);
        }

        res.json({ message: "Product updated successfully" });
    } catch (err) {
        console.error("❌ ERROR updateProduct:", err);
        res.status(500).json({ error: err.message });
    }
};

/**
 * SOFT DELETE Product
 * Sets status = 'DELETED' and isActive = false
 */
export const deleteProduct = async (req, res) => {
    console.log(`📥 deleteProduct: Request received for ID: ${req.params.id}.`); // Debug Log
    try {
        const id = req.params.id;
        const updatedBy = req.user.id;
        console.log(`👤 deleteProduct: Performed by user ID: ${updatedBy}`); // Debug Log

        const [result] = await db.query(
            `UPDATE products SET status='DELETED', isActive=FALSE, updatedBy=? WHERE id=?`,
            [updatedBy, id]
        );
        console.log("✔️ deleteProduct: SQL Result:", result); // Debug Log
        if (result.affectedRows === 0) {
            console.warn(`⚠️ deleteProduct: No rows affected for ID ${id}. Product might not exist.`);
        }

        res.json({ message: "Product soft-deleted" });
    } catch (err) {
        console.error("❌ ERROR deleteProduct:", err);
        res.status(500).json({ error: err.message });
    }
};