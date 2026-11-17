JavaScript
// ==========================================
// HỆ THỐNG NẠP DỮ LIỆU 11 FILE - APP.JS
// ==========================================

const danhSachFileJson = [
    "GhepNoi_Precut.json",
    "GhepNoi_Chip.json",
    "GhepNoi_Flooring.json",
    "GhepNoi_Tsukita.json",
    "GhepNoi_GoubanLVL.json",
    "GhepNoi_Shuuseizai.json",
    "GhepNoi_Seizai.json",
    "NhanDangHinhAnh.json",
    "BaiTapTinhToan.json",
    "TuVung.json",
    "CauHoi_1860.json"
];

// Biến toàn cục chứa toàn bộ dữ liệu hệ thống
window.appData = {};

document.addEventListener('DOMContentLoaded', async () => {
    console.log("🚀 HSJ Wood App đang khởi chạy...");
    await taiTatCa11FileJson();
});

async function taiTatCa11FileJson() {
    for (let tenFile of danhSachFileJson) {
        try {
            let response = await fetch(`./${tenFile}`);
            if (response.ok) {
                let data = await response.json();
                let keyName = tenFile.replace(".json", "");
                window.appData[keyName] = data;
                console.log(`✅ Đã nạp thành công: ${tenFile}`);
            } else {
                console.warn(`⚠️ Không đọc được file: ${tenFile}`);
            }
        } catch (error) {
            console.error(`❌ Lỗi kết nối file ${tenFile}:`, error);
        }
    }

    console.log("🎉 Toàn bộ dữ liệu 11 file đã sẵn sàng trong window.appData:", window.appData);
    
    // Kích hoạt hiển thị dữ liệu trắc nghiệm nếu đã sẵn sàng
    if (typeof khoiTaoQuizSauKhiNap === "function") {
        khoiTaoQuizSauKhiNap();
    }
}

// Điều hướng Tab giao diện mượt mà
function switchTab(tabId) {
    const tabContents = document.querySelectorAll('.tab-content');
    tabContents.forEach(tab => tab.classList.add('hidden'));

    const activeTab = document.getElementById('tab-' + tabId);
    if (activeTab) {
        activeTab.classList.remove('hidden');
    }

    const tabButtons = document.querySelectorAll('.tab-btn');
    tabButtons.forEach(btn => {
        btn.classList.remove('bg-blue-50', 'text-blue-800', 'font-bold');
        btn.classList.add('text-slate-600');
    });

    if (event && event.currentTarget) {
        event.currentTarget.classList.remove('text-slate-600');
        event.currentTarget.classList.add('bg-blue-50', 'text-blue-800', 'font-bold');
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function enterApp() {
    const splashScreen = document.getElementById('splash-screen');
    if (splashScreen) {
        splashScreen.style.opacity = '0';
        setTimeout(() => {
            splashScreen.style.display = 'none';
        }, 700);
    }
}