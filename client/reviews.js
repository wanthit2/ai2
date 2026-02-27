const API = "https://ai2-production-18cb.up.railway.app";

window.onload = function() {
    checkLoginStatus(); 
    loadShopsToSelect();
    loadAllReviews();
};

// ตรวจสอบสถานะการล็อกอินและแสดงชื่อ
function checkLoginStatus() {
    // 1. ดึงข้อมูลออกมาตรงๆ ก่อน
    const rawData = localStorage.getItem("user"); 
    
    const nameDisplay = document.getElementById("userNameDisplay");
    const nameInput = document.getElementById("name");

    if (rawData) {
        let username = "";
        try {
            // 2. พยายาม Parse เผื่อว่าเก็บมาเป็น JSON Object
            const userObj = JSON.parse(rawData);
            username = userObj.username || userObj; 
        } catch (e) {
            // 3. ถ้า Parse ไม่ได้ (เป็นแค่ String ธรรมดา เช่น "tom") ก็ใช้ค่าตรงๆ เลย
            username = rawData;
        }

        // แสดงผลชื่อ
        nameDisplay.innerText = "👤 " + username;
        nameInput.value = username; 
        nameDisplay.style.color = "#4f46e5";
    } else {
        nameDisplay.innerText = "⚠️ กรุณาเข้าสู่ระบบก่อนรีวิว";
        nameDisplay.style.color = "red";
    }
}

// ดึงรายชื่อร้านค้า
async function loadShopsToSelect() {
    try {
        const res = await fetch(`${API_URL}/get-shops`);
        const shops = await res.json();
        const select = document.getElementById("restaurantSelect");
        
        shops.forEach(shop => {
            const option = document.createElement("option");
            option.value = shop.name;
            option.textContent = shop.name;
            select.appendChild(option);
        });
    } catch (err) {
        console.error("Error loading shops:", err);
    }
}

// บันทึกรีวิว
async function addReview() {
    const name = document.getElementById("name").value;
    const restaurant = document.getElementById("restaurantSelect").value;
    const rating = document.getElementById("rating").value;
    const comment = document.getElementById("comment").value;

    if (!name) { alert("กรุณาเข้าสู่ระบบก่อนครับ"); return; }
    if (!restaurant || !comment) { alert("กรุณาเลือกชื่อร้านและกรอกความเห็น"); return; }

    const reviewData = { userName: name, restaurantName: restaurant, rating: rating, comment: comment };

    try {
        const res = await fetch(`${API_URL}/add-review`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(reviewData)
        });
        const result = await res.json();
        alert(result.message);
        location.reload(); 
    } catch (err) {
        alert("ไม่สามารถส่งรีวิวได้ในขณะนี้");
    }
}

// แสดงรายการรีวิว
async function loadAllReviews() {
    const reviewList = document.getElementById("reviewList");
    try {
        const res = await fetch(`${API_URL}/get-reviews`);
        const reviews = await res.json();
        
        reviewList.innerHTML = reviews.map(rev => `
            <div class="review-card" style="background:white; padding:20px; border-radius:15px; margin-bottom:15px; box-shadow:0 4px 6px -1px rgba(0,0,0,0.1);">
                <div style="display:flex; justify-content:space-between; align-items:center;">
                    <strong style="color:#4f46e5; font-size:1.1rem;">${rev.user_name}</strong>
                    <span style="font-size:0.8rem; color:#94a3b8;">${new Date(rev.created_at).toLocaleDateString('th-TH')}</span>
                </div>
                <div style="margin:5px 0; color:#64748b; font-size:0.9rem;">📍 ร้าน: ${rev.restaurant_name}</div>
                <div style="color:#f59e0b; margin:8px 0;">${"⭐".repeat(rev.rating)}</div>
                <p style="margin:0; color:#334155; line-height:1.5;">${rev.comment}</p>
            </div>
        `).join("");
    } catch (err) {
        reviewList.innerHTML = "<p>ยังไม่มีข้อมูลรีวิว</p>";
    }
}
