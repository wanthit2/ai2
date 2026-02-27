// 1. เปลี่ยนเป็น URL ของ Railway ให้เหมือนกับหน้า home
const API_URL = "https://ai2-production-18cb.up.railway.app";
let allFoods = []; 

async function loadShopData() {
    const urlParams = new URLSearchParams(window.location.search);
    const shopId = urlParams.get('id');

    try {
        // ตรวจสอบว่าใน server.js ใช้ path นี้จริงๆ หรือไม่
        const response = await fetch(`${API_URL}/get-shop/${shopId}`); 
        
        if (!response.ok) throw new Error('Network response was not ok');
        
        const shop = await response.json();
        // นำข้อมูลไปแสดงผล...
        document.getElementById("resName").textContent = shop.name;
        document.getElementById("resImage").src = shop.image_url; // ใช้ URL ตรงจาก Supabase
    } catch (error) {
        console.error("Error loading shop:", error);
        document.getElementById("resName").textContent = "❌ ไม่พบข้อมูลร้านค้า";
    }
}

window.onload = async function() {
    const urlParams = new URLSearchParams(window.location.search);
    const shopId = urlParams.get('id');

    if (!shopId) {
        alert("ไม่พบรหัสร้านค้า");
        window.location.href = "restaurants.html";
        return;
    }

    try {
        // ดึงข้อมูลรายละเอียดร้าน
        const shopRes = await fetch(`${API_URL}/get-shop/${shopId}`);
        const shop = await shopRes.json();

        document.getElementById("resName").textContent = shop.name;
        document.getElementById("resDetail").textContent = shop.hashtags || "#ร้านเด็ด";
        
        // ✅ แก้ไข: ดึงรูปจาก image_url ตรงๆ (ลบ /uploads/ ออก)
        if (shop.image_url) {
            document.getElementById("resImage").src = shop.image_url;
        }

        // ✅ แก้ไข: จัดการแผนที่ (ลบส่วน http://googleusercontent... ออก)
        if (shop.lat && shop.lng) {
            document.getElementById("mapFrame").src = `https://www.google.com/maps?q=${shop.lat},${shop.lng}&output=embed`;
        }

        // โหลดเมนูอาหาร
        const foodRes = await fetch(`${API_URL}/get-foods/${shopId}`);
        allFoods = await foodRes.json();
        renderMenus(allFoods); 

    } catch (err) {
        console.error("Error:", err);
        // แสดง Error ให้ผู้ใช้เห็นถ้าดึงข้อมูลไม่ได้
        document.getElementById("resName").textContent = "❌ ไม่สามารถโหลดข้อมูลได้";
    }
};

// ฟังก์ชันวิเคราะห์ AI
function analyzeAI() {
    const userInput = document.getElementById("aiInput").value;
    const messageBox = document.getElementById("aiMessage");
    const messageText = document.getElementById("messageText");

    const priceMatch = userInput.match(/\d+/); 
    const budget = priceMatch ? parseInt(priceMatch[0]) : null;

    const filtered = allFoods.filter(food => {
        let match = true;
        if (budget !== null) {
            match = match && (Number(food.price) <= budget);
        }
        const textOnly = userInput.replace(/[0-9]/g, '').replace('งบ', '').replace('มีเงิน', '').trim();
        if (textOnly.length > 0) {
            match = match && food.name.toLowerCase().includes(textOnly.toLowerCase());
        }
        return match;
    });

    if (filtered.length > 0) {
        if(messageBox) messageBox.style.display = "none";
        renderMenus(filtered);
    } else {
        if(messageBox) {
            messageBox.style.display = "block";
            messageText.textContent = "เสียใจด้วยครับ AI หาเมนูไม่เจอ ลองปรับงบดูนะครับ";
        }
        renderMenus([]); 
    }
}

// ฟังก์ชันวาดรายการเมนู
function renderMenus(foods) {
    const menuList = document.getElementById("menuList");
    if (foods.length === 0) {
        menuList.innerHTML = "<p style='padding:20px; color:#999; text-align:center;'>ไม่มีรายการอาหาร</p>";
        return;
    }

    menuList.innerHTML = foods.map(food => `
        <div class="menu-item" style="display: flex; align-items: center; background: white; margin-bottom: 15px; padding: 15px; border-radius: 20px; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
            <img src="${food.image_url ? food.image_url : 'https://placehold.co/100x100?text=No+Image'}" 
                 onerror="this.src='https://placehold.co/100x100?text=No+Image'"
                 style="width: 85px; height: 85px; object-fit: cover; border-radius: 15px;">
            <div style="margin-left: 15px; flex: 1;">
                <h4 style="margin: 0; font-size: 1.1rem;">${food.name}</h4>
                <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 8px;">
                     <p style="margin: 0; color: #10b981; font-weight: bold; font-size: 1.2rem;">฿${food.price}</p>
                     <small style="color: #94a3b8; background: #f1f5f9; padding: 2px 8px; border-radius: 6px;">${food.category || 'ทั่วไป'}</small>
                </div>
            </div>
        </div>
    `).join('');
}

function goBack() {
    window.location.href = "restaurants.html";
}
