const API = "https://ai2-production-18cb.up.railway.app";

/* REGISTER */
function register() {
  const username = document.getElementById("username").value;
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  fetch(`${API}/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, email, password }),
  })
    .then(res => res.json())
    .then(data => {
      alert(data.message);
      window.location.href = "login.html";
    });
}

/* LOGIN */
function login() {
  const username = document.getElementById("loginUsername").value;
  const password = document.getElementById("loginPassword").value;

  if (!username || !password) {
    alert("กรุณากรอกข้อมูลให้ครบถ้วน");
    return;
  }

  fetch(`${API}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  })
    .then(res => res.json())
    .then(data => {
      // เปลี่ยนจากเช็ค data.username เป็นเช็คเงื่อนไขความสำเร็จที่ API ส่งมา
      if (data.success || data.username) { 
        alert(data.message || "เข้าสู่ระบบสำเร็จ");
        
        localStorage.setItem("user", data.username);
        // ตรวจสอบให้มั่นใจว่า Backend ส่ง data.role หรือ data.type กลับมาจริงๆ
        localStorage.setItem("role", data.role); 

        // ตรวจสอบ Role เพื่อแยกหน้า
        if (data.role === "admin") {
          window.location.href = "admin_dashboard.html";
        } else {
          window.location.href = "home.html";
        }
      } else {
        alert(data.message || "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง");
      }
    })
    .catch(err => {
      console.error("Error:", err);
      alert("เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์");
    });
}

/* ===== PAGE ACCESS CHECK ===== */
window.onload = function() {
  const user = localStorage.getItem("user");
  const role = localStorage.getItem("role");

  // เช็คหน้า Home (สำหรับ User ทั่วไป)
  if (window.location.pathname.includes("home.html")) {
    if (!user) {
      window.location.href = "login.html";
    } else {
      document.getElementById("welcomeText").innerText = "Hello, " + user + " 👋";
    }
  }

  // เช็คหน้า Admin Dashboard (ต้องเป็น admin เท่านั้น)
  if (window.location.pathname.includes("admin_dashboard.html")) {
    if (!user || role !== "admin") {
      alert("คุณไม่มีสิทธิ์เข้าถึงหน้านี้");
      window.location.href = "home.html"; // เตะกลับไปหน้า User หรือ Login
    } else {
      // ถ้ามี element ชื่อ adminName ให้แสดงชื่อผู้ใช้
      const adminNameElem = document.getElementById("adminName");
      if (adminNameElem) adminNameElem.innerText = "ผู้ดูแลระบบ: " + user;
    }
  }
};

/* ===== LOGOUT ===== */
function logout() {
  // ลบข้อมูลทั้งหมดที่เก็บไว้ (ทั้ง user และ role)
  localStorage.clear(); 
  window.location.href = "login.html";
}

