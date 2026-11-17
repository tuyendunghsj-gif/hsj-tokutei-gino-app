// =========================================================================
// HỆ THỐNG QUẢN LÝ DỮ LIỆU 11 FILE CHUYÊN NGÀNH GỖ - HSJ WOOD APP
// =========================================================================

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

// Biến toàn cục lưu trữ dữ liệu cho toàn bộ ứng dụng
window.appData = {};

document.addEventListener('DOMContentLoaded', async () => {
    console.log("🚀 Khởi chạy hệ thống nạp 11 file JSON chuyên ngành gỗ...");
    await taiTatCaDuLieu();
});

async function taiTatCaDuLieu() {
    for (let tenFile of danhSachFileJson) {
        try {
            let response = await fetch(`./${tenFile}`);
            if (response.ok) {
                let data = await response.json();
                let keyName = tenFile.replace(".json", "");
                window.appData[keyName] = data;
                console.log(`✅ Đã tải thành công: ${tenFile}`);
            }
        } catch (error) {
            console.error(`❌ Không đọc được file ${tenFile}:`, error);
        }
    }

    // Đồng bộ dữ liệu 1860 câu hỏi cho phần luyện tập nếu cần
    if (window.appData["CauHoi_1860"]) {
        window.danhSachCauHoi = window.appData["CauHoi_1860"];
    }

    console.log("🎉 Toàn bộ dữ liệu app đã sẵn sàng:", window.appData);
    
    // Nếu app có hàm khởi tạo giao diện sau khi tải xong, gọi tại đây
    if (typeof khoiTaoGiaoDien === "function") {
        khoiTaoGiaoDien();
    }
}

// ================= ĐIỀU HƯỚNG TAB GIAO DIỆN =================
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
