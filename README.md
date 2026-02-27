    ภาษา Node.js + Express
# ติดตั้ง Extentions ใน vscode เพื่อรันเว็บ
ค้นหาคำว่า Live server

# สร้างฐานข้อมูล MySQL
    mysql -u root -p
    
    CREATE DATABASE login_system;
    
    USE login_system;

    CREATE TABLE users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(50) UNIQUE,
        email VARCHAR(100),
        password VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

# ติดตั้ง Backend dependencies ใน cmd

    cd server

    npm init -y
    npm install express mysql2 cors body-parser bcrypt

# เชื่อมต่อกับฐานข้อมูล
node server.js
