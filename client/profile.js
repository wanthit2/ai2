const API = "https://ai2-production-18cb.up.railway.app";
// ถ้าไม่ได้ login
if (!user) {
  window.location.href = "login.html";
}

// โหลดข้อมูลผู้ใช้
fetch(`${API}/user/${user}`)
  .then(res => res.json())
  .then(data => {
    document.getElementById("username").value = data.username;
    document.getElementById("email").value = data.email;
  });

function updateProfile() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  fetch(`${API}/user/${user}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  })
  .then(res => res.json())
  .then(data => {
    alert("อัปเดตข้อมูลเรียบร้อย");
    window.location.href = "home.html";
  });
}

function goHome() {
  window.location.href = "home.html";
}
