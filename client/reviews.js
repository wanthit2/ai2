// 1. ตรวจสอบชื่อตัวแปรให้ตรงกัน (ใช้ API_URL ตามหน้าอื่นๆ)
const API_URL = "https://ai2-production-18cb.up.railway.app";

window.onload = function() {
    checkLoginStatus(); 
    loadShopsToSelect();
    loadAllReviews();
};

// ตรวจสอบสถานะการล็อกอิน
function checkLoginStatus() {
    // ดึงค่า "user" ที่เก็บจาก auth.js (ซึ่งปกติเก็บเป็น String ชื่อผู้ใช้)
    const username = localStorage.getItem("user"); 
    
    const nameDisplay = document.getElementById("userNameDisplay");
    const nameInput = document.getElementById("name");

    if (username) {
        // แสดงผลชื่อผู้ใช้
        nameDisplay.innerText = "👤 " + username;
        if (nameInput) nameInput.value = username; 
        nameDisplay.style.color = "#4f46e5";
    } else {
        nameDisplay.innerText = "⚠️ กรุณาเข้าสู่ระบบก่อนรีวิว";
        nameDisplay.style.color = "#ef4444";
        // ปิดการใช้งานปุ่มส่งรีวิวถ้าไม่ได้ Login (Option เสริม)
        const submitBtn = document.querySelector("button[onclick='addReview()']");
        if (submitBtn) submitBtn.disabled = true;
    }
}

// ดึงรายชื่อร้านค้ามาใส่ใน Dropdown
async function loadShopsToSelect() {
    try {
        const res = await fetch(`${API_URL}/get-shops`);
        const shops = await res.json();
        const select = document.getElementById("restaurantSelect");
        
        if (!select) return;
        select.innerHTML = '<option value="">-- เลือกร้านอาหาร --</option>';

        shops.forEach(shop => {
            const option = document.createElement("option");
            option.value = shop.name; // เก็บชื่อร้าน
            option.textContent = shop.name;
            select.appendChild(option);
        });
    } catch (err) {
        console.error("Error loading shops:", err);
    }
}

// บันทึกรีวิวใหม่
async function addReview() {
    const username = localStorage.getItem("user"); // ดึงจาก Storage โดยตรงเพื่อความปลอดภัย
    const restaurant = document.getElementById("restaurantSelect").value;
    const rating = document.getElementById("rating").value;
    const comment = document.getElementById("comment").value;

    if (!username) { 
        alert("กรุณาเข้าสู่ระบบก่อนรีวิวครับ"); 
        window.location.href = "login.html";
        return; 
    }
    if (!restaurant || !comment) { 
        alert("กรุณาเลือกชื่อร้านและกรอกความเห็น"); 
        return; 
    }

    // ชื่อ Field ต้องตรงกับที่ Backend รอรับ (userName, restaurantName, rating, comment)
    const reviewData = { 
        userName: username, 
        restaurantName: restaurant, 
        rating: parseInt(rating), 
        comment: comment 
    };

    try {
        const res = await fetch(`${API_URL}/add-review`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(reviewData)
        });
        const result = await res.json();
        alert(result.message || "บันทึกรีวิวสำเร็จ");
        location.reload(); 
    } catch (err) {
        alert("ไม่สามารถส่งรีวิวได้ในขณะนี้");
    }
}

// แสดงรายการรีวิวทั้งหมด
async function loadAllReviews() {
    const reviewList = document.getElementById("reviewList");
    if (!reviewList) return;

    try {
        const res = await fetch(`${API_URL}/get-reviews`);
        const reviews = await res.json();
        
        if (reviews.length === 0) {
            reviewList.innerHTML = "<p style='text-align:center; color:#64748b;'>ยังไม่มีรีวิวในขณะนี้</p>";
            return;
        }

        reviewList.innerHTML = reviews.map(rev => `
            <div class="review-card" style="background:white; padding:20px; border-radius:15px; margin-bottom:15px; box-shadow:0 4px 6px -1px rgba(0,0,0,0.1); border: 1px solid #f1f5f9;">
                <div style="display:flex; justify-content:space-between; align-items:center;">
                    <strong style="color:#4f46e5; font-size:1.1rem;">👤 ${rev.user_name}</strong>
                    <span style="font-size:0.8rem; color:#94a3b8;">${new Date(rev.created_at).toLocaleDateString('th-TH')}</span>
                </div>
                <div style="margin:5px 0; color:#64748b; font-size:0.9rem; font-weight:600;">📍 ร้าน: ${rev.restaurant_name}</div>
                <div style="color:#f59e0b; margin:8px 0;">${"⭐".repeat(rev.rating)}</div>
                <p style="margin:0; color:#334155; line-height:1.5; background:#f8fafc; padding:10px; border-radius:10px;">${rev.comment}</p>
            </div>
        `).join("");
    } catch (err) {
        reviewList.innerHTML = "<p style='text-align:center;'>⚠️ ไม่สามารถโหลดข้อมูลรีวิวได้</p>";
    }
}
