// ==========================================
// FILE: quiz.js (Đã loại bỏ hoàn toàn data.json)
// ==========================================

document.addEventListener("DOMContentLoaded", async () => {
    // 1. Hiển thị trạng thái đang tải
    hienThiTrangThaiDangTai(true);

    try {
        // 2. Tự động gom dữ liệu trực tiếp từ 11 file JSON trong thư mục
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

        window.appData = {};
        
        for (let tenFile of danhSachFileJson) {
            try {
                let response = await fetch(`./${tenFile}`);
                if (response.ok) {
                    let data = await response.json();
                    let keyName = tenFile.replace(".json", "");
                    window.appData[keyName] = data;
                }
            } catch (err) {
                console.warn(`Không tải được file ${tenFile}:`, err);
            }
        }

        // 3. Lấy trực tiếp 1860 câu hỏi từ file CauHoi_1860.json gán vào biến luyện tập
        let danhSachCauHoi = window.appData["CauHoi_1860"] || [];

        if (danhSachCauHoi.length > 0) {
            console.log(`Đã tải thành công ${danhSachCauHoi.length} câu hỏi cho phần Luyện Tập!`);
            // Gọi hàm khởi tạo giao diện trắc nghiệm của bạn ở đây (nếu có sẵn trong code cũ)
            if (typeof khoiTaoGiaoDienQuiz === "function") {
                khoiTaoGiaoDienQuiz(danhSachCauHoi);
            } else {
                hienThiDanhSachLenManHinh(danhSachCauHoi);
            }
        } else {
            hienThiloi("Không tìm thấy dữ liệu câu hỏi trong các file JSON.");
        }

    } catch (error) {
        console.error("Lỗi hệ thống khi tải dữ liệu:", error);
        hienThiloi("Lỗi kết nối dữ liệu, vui lòng kiểm tra lại các file JSON.");
    } finally {
        hienThiTrangThaiDangTai(false);
    }
});

// Các hàm hỗ trợ hiển thị giao diện thông báo
function hienThiTrangThaiDangTai(dangTai) {
    let el = document.querySelector(".loading-status, #loading, .status-text");
    if (el) {
        el.innerText = dangTai ? "Đang tải dữ liệu 11 chuyên đề..." : "";
    }
}

function hienThiloi(noiDung) {
    let container = document.querySelector(".quiz-container, #app, main");
    if (container) {
        container.innerHTML = `<div style="padding: 20px; color: #d9534f; background: #fdf7f7; border: 1px solid #ebccd1; border-radius: 4px; margin: 20px;">
            ⚠️ ${noiDung}
        </div>`;
    }
}

function hienThiDanhSachLenManHinh(danhSach) {
    let container = document.querySelector(".quiz-container, #app, main");
    if (container && danhSach.length > 0) {
        // Xóa thông báo lỗi cũ và hiển thị thông báo thành công nhẹ nhàng
        console.log("Giao diện sẵn sàng với số câu:", danhSach.length);
    }
}