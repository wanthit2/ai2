// เปลี่ยน URL เป็นของ Railway ของคุณ
const API = "https://ai2-production-18cb.up.railway.app"; 

async function register() {
    const username = document.getElementById("username").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;
    const confirmPassword = document.getElementById("confirmPassword").value;

    if (!username || !email || !password) {
        alert("กรุณากรอกข้อมูลให้ครบ");
        return;
    }

    if (password !== confirmPassword) {
        alert("รหัสผ่านไม่ตรงกัน");
        return;
    }

    try {
        const response = await fetch(`${API}/register`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, email, password })
        });

        const data = await response.json();
        
        if (response.ok) {
            alert("สมัครสมาชิกสำเร็จ!");
            window.location.href = "login.html";
        } else {
            alert("สมัครไม่สำเร็จ: " + data.message);
        }
    } catch (error) {
        console.error("Error:", error);
        alert("เกิดข้อผิดพลาดในการเชื่อมต่อกับ Server");
    }
}
