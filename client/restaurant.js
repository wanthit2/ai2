const API_URL = "http://localhost:3000";
let allFoods = []; // เก็บข้อมูลเมนูทั้งหมดไว้ที่นี่เพื่อใช้ค้นหา

window.onload = async function() {
    const urlParams = new URLSearchParams(window.location.search);
    const shopId = urlParams.get('id');

    if (!shopId) {
        alert("ไม่พบรหัสร้านค้า");
        window.location.href = "restaurants.html";
        return;
    }

    try {
        // 1. ดึงข้อมูลรายละเอียดร้าน
        const shopRes = await fetch(`${API_URL}/get-shop/${shopId}`);
        const shop = await shopRes.json();

        document.getElementById("resName").textContent = shop.name;
        document.getElementById("resDetail").textContent = shop.hashtags || "#ร้านเด็ด";
        
        if (shop.image_url) {
            document.getElementById("resImage").src = `${API_URL}/uploads/${shop.image_url}`;
        }

        // 2. จัดการแผนที่ (แก้ไข Bug URL)
        if (shop.lat && shop.lng) {
            document.getElementById("mapFrame").src = `https://www.google.com/maps?q=${shop.lat},${shop.lng}&output=embed`;
        }

        // 3. โหลดเมนูอาหารเก็บไว้ใน allFoods
        const foodRes = await fetch(`${API_URL}/get-foods/${shopId}`);
        allFoods = await foodRes.json();
        renderMenus(allFoods); // แสดงเมนูทั้งหมดตอนเริ่มต้น

    } catch (err) {
        console.error("Error:", err);
    }
};

// ฟังก์ชันวิเคราะห์ AI (ฉบับแก้บัคพิมพ์ราคาไม่เจอ)
function analyzeAI() {
    const userInput = document.getElementById("aiInput").value;
    const messageBox = document.getElementById("aiMessage");
    const messageText = document.getElementById("messageText");

    // 1. ดึงตัวเลขจากประโยค (เช่น "100" หรือ "งบ 100")
    const priceMatch = userInput.match(/\d+/); 
    const budget = priceMatch ? parseInt(priceMatch[0]) : null;

    // 2. กรองข้อมูล
    const filtered = allFoods.filter(food => {
        let match = true;
        
        // ถ้าพิมพ์ตัวเลขมา ให้กรองเมนูที่ราคา "ไม่เกิน" งบนั้น
        if (budget !== null) {
            match = match && (Number(food.price) <= budget);
        }
        
        // ถ้ามีข้อความอื่นๆ (เช่น ของหวาน, เส้น) ให้ค้นหาในชื่อเมนูด้วย
        const textOnly = userInput.replace(/[0-9]/g, '').replace('งบ', '').replace('มีเงิน', '').trim();
        if (textOnly.length > 0) {
            match = match && food.name.toLowerCase().includes(textOnly.toLowerCase());
        }

        return match;
    });

    // 3. แสดงผลหรือแจ้งเตือน
    if (filtered.length > 0) {
        messageBox.style.display = "none";
        renderMenus(filtered);
    } else {
        messageBox.style.display = "block";
        messageText.textContent = "เสียใจด้วยครับ AI หาเมนูที่ตรงเงื่อนไขไม่เจอ ลองปรับงบหรือเปลี่ยนหมวดดูนะครับ";
        renderMenus([]); // ล้างหน้ารายการอาหาร
    }
}

// ฟังก์ชันวาดรายการเมนู
function renderMenus(foods) {
    const menuList = document.getElementById("menuList");
    if (foods.length === 0) {
        menuList.innerHTML = "<p style='padding:20px; color:#999;'>ไม่มีรายการอาหาร</p>";
        return;
    }

    menuList.innerHTML = foods.map(food => `
        <div class="menu-item" style="display: flex; align-items: center; background: white; margin-bottom: 10px; padding: 10px; border-radius: 15px; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
            <img src="${food.image_url ? API_URL+'/uploads/'+food.image_url : 'https://via.placeholder.com/100'}" 
                 style="width: 70px; height: 70px; object-fit: cover; border-radius: 10px;">
            <div style="margin-left: 15px;">
                <h4 style="margin: 0;">${food.name}</h4>
                <p style="margin: 5px 0 0; color: #ef4444; font-weight: bold;">฿${food.price}</p>
            </div>
        </div>
    `).join('');
}

function goBack() {
    window.location.href = "restaurants.html";
}