const express = require("express");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const bcrypt = require("bcryptjs");
const { createClient } = require('@supabase/supabase-js'); // ✅ เพิ่ม Supabase SDK
const db = require("./db");

const app = express();

// ================= 1. ตั้งค่า SUPABASE STORAGE ================= //
// ⚠️ นำค่าจากหน้า Settings > API ใน Supabase มาใส่ตรงนี้ครับ
const supabaseUrl = 'https://kphjykhlpvpqwwufwekl.supabase.co'; 
const supabaseKey = 'sb_publishable_uahXEE9ExsQytMck2dxA6A_Hcl5SE7w'; 
const supabase = createClient(supabaseUrl, supabaseKey);

// ================= 2. ตั้งค่า MULTER (MEMORY STORAGE) ================= //
// ✅ เปลี่ยนมาใช้ Memory เพื่อส่งรูปต่อไปยัง Cloud โดยไม่ค้างในเครื่อง Railway
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// ================= SETTINGS & MIDDLEWARES ================= //
app.use(cors());
app.use(express.json()); 
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'client')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'client', 'login.html'));
});

// ฟังก์ชันช่วยอัปโหลดรูปไปยัง Supabase Storage
async function uploadToSupabase(file, bucketName) {
    if (!file) return null;
    const fileExt = file.originalname.split('.').pop();
    const fileName = `${Date.now()}.${fileExt}`;

    const { data, error } = await supabase.storage
        .from(bucketName)
        .upload(fileName, file.buffer, {
            contentType: file.mimetype,
            upsert: false
        });

    if (error) throw error;

    const { data: publicUrlData } = supabase.storage
        .from(bucketName)
        .getPublicUrl(fileName);

    return publicUrlData.publicUrl; // ส่ง URL เต็มกลับไปบันทึกใน DB
}

// ================= AUTHENTICATION ================= //

app.post("/register", async (req, res) => {
    const { username, email, password } = req.body;
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const sql = "INSERT INTO users (username, email, password, type) VALUES ($1, $2, $3, 'user')";
        db.query(sql, [username, email, hashedPassword], (err, result) => {
            if (err) return res.status(500).json({ message: "Error or Username exists" });
            res.json({ message: "User registered successfully" });
        });
    } catch (e) {
        res.status(500).json({ message: "Server error" });
    }
});

app.post("/login", (req, res) => {
    const { username, password } = req.body;
    db.query("SELECT * FROM users WHERE username = $1", [username], async (err, result) => {
        if (err) return res.status(500).json({ message: "Database error" });
        if (result.rows.length === 0) return res.status(401).json({ message: "User not found" });
        const user = result.rows[0];
        const match = await bcrypt.compare(password, user.password);
        if (!match) return res.status(401).json({ message: "Incorrect password" });
        res.json({ message: "Login successful", username: user.username, role: user.type });
    });
});

// ================= SHOP MANAGEMENT ================= //

app.post("/add-shop", upload.single('shopImage'), async (req, res) => {
    try {
        const { shopName, hashtags, lat, lng } = req.body;
        // ✅ อัปโหลดไป Supabase (Bucket: food-images)
        const imageUrl = await uploadToSupabase(req.file, 'food-images');

        const sql = "INSERT INTO shops (name, hashtags, lat, lng, image_url) VALUES ($1, $2, $3, $4, $5)";
        db.query(sql, [shopName, hashtags, lat, lng, imageUrl], (dbErr, result) => {
            if (dbErr) return res.status(500).json({ error: dbErr.message });
            res.json({ message: "บันทึกร้านค้าเรียบร้อยแล้ว!", imageUrl });
        });
    } catch (err) {
        res.status(500).json({ error: "Upload failed: " + err.message });
    }
});

// สำหรับดึงข้อมูลรายละเอียดร้านค้า (ชื่อร้าน, รูปหน้าร้าน, พิกัด)
app.get("/get-shop/:id", (req, res) => {
    const shopId = req.params.id;
    db.query("SELECT * FROM shops WHERE id = $1", [shopId], (err, result) => {
        if (err) {
            console.error("DB Error:", err);
            return res.status(500).json(err);
        }
        if (result.rows.length === 0) return res.status(404).json({ message: "ไม่พบข้อมูลร้านค้า" });
        res.json(result.rows[0]);
    });
});

// ================= FOOD MANAGEMENT ================= //

app.post("/add-food", upload.single('foodImage'), async (req, res) => {
    try {
        console.log("Body:", req.body); // ดูว่าข้อมูลมาครบไหม
        console.log("File:", req.file); // ดูว่าไฟล์มาไหม
        
        const { shopId, foodName, price, category } = req.body;
        const imageUrl = await uploadToSupabase(req.file, 'food-images');

        const sql = "INSERT INTO foods (shop_id, name, price, category, image_url) VALUES ($1, $2, $3, $4, $5)";
        db.query(sql, [shopId, foodName, price, category, imageUrl], (dbErr, result) => {
            if (dbErr) {
                console.error("DB Error:", dbErr); // <--- เพิ่มตรงนี้
                return res.status(500).json({ error: dbErr.message });
            }
            res.json({ message: "เพิ่มเมนูอาหารสำเร็จ!", imageUrl });
        });
    } catch (err) {
        console.error("Catch Error:", err); // <--- เพิ่มตรงนี้
        res.status(500).json({ error: "Upload failed: " + err.message });
    }
});

app.get("/get-all-foods", (req, res) => {
    const sql = `
        SELECT foods.*, shops.name AS shop_name 
        FROM foods 
        LEFT JOIN shops ON foods.shop_id = shops.id 
        ORDER BY foods.id DESC
    `;
    db.query(sql, (err, result) => {
        if (err) return res.status(500).json(err);
        res.json(result.rows);
    });
});

app.post("/update-food", upload.single('foodImage'), async (req, res) => {
    try {
        const { id, name, price, category } = req.body;
        let imageUrl = null;
        let sql, params;

        if (req.file) {
            imageUrl = await uploadToSupabase(req.file, 'food-images');
            sql = "UPDATE foods SET name = $1, price = $2, category = $3, image_url = $4 WHERE id = $5";
            params = [name, price, category, imageUrl, id];
        } else {
            sql = "UPDATE foods SET name = $1, price = $2, category = $3 WHERE id = $4";
            params = [name, price, category, id];
        }

        db.query(sql, params, (dbErr, result) => {
            if (dbErr) return res.status(500).json({ error: dbErr.message });
            res.json({ message: "อัปเดตข้อมูลสำเร็จ!" });
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete("/delete-food/:id", (req, res) => {
    db.query("DELETE FROM foods WHERE id = $1", [req.params.id], (err, result) => {
        if (err) return res.status(500).json(err);
        res.json({ message: "ลบเมนูเรียบร้อย!" });
    });
});

// 2. สำหรับดึงรายการอาหารทั้งหมดที่สังกัดร้านนี้ (ดึงมาโชว์ในหน้าเมนูร้าน)
app.get("/get-foods/:shopId", (req, res) => {
    const shopId = req.params.shopId;
    db.query("SELECT * FROM foods WHERE shop_id = $1", [shopId], (err, result) => {
        if (err) return res.status(500).json(err);
        res.json(result.rows);
    });
});

// เพิ่ม Route สำหรับลบเมนูอาหาร
app.delete("/delete-food/:id", (req, res) => {
    const foodId = req.params.id;
    db.query("DELETE FROM foods WHERE id = $1", [foodId], (err, result) => {
        if (err) {
            console.error("Delete Error:", err);
            return res.status(500).json({ message: "ไม่สามารถลบข้อมูลได้" });
        }
        res.json({ message: "ลบเมนูอาหารเรียบร้อยแล้ว" });
    });
});

// ================= START SERVER ================= //

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server is LIVE on port ${PORT}`);
});
