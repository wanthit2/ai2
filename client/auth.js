const user = localStorage.getItem("user");
const authBtn = document.getElementById("authBtn");

// ❌ ถ้ายังไม่ login → กลับหน้า login
if (!user) {
  window.location.href = "login.html";
}

// แสดงชื่อผู้ใช้บนปุ่ม
if (user) {
  authBtn.innerText = "Logout (" + user + ")";

  authBtn.onclick = () => {
    localStorage.removeItem("user");
    alert("ออกจากระบบแล้ว");
    window.location.href = "login.html";
  };
}
