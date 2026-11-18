// ================= HỆ THỐNG KẾT NỐI TOÀN DIỆN - HSJ WOOD APP =================
const danhSachFileJson = [
    "CauHoi_1860.json",
    "TuVung.json",
    "NhanDangHinhAnh.json",
    "GhepNoi_Precut.json",
    "GhepNoi_Chip.json",
    "GhepNoi_Flooring.json",
    "GhepNoi_Tsukita.json",
    "GhepNoi_GoubanLVL.json",
    "GhepNoi_Shuuseizai.json",
    "GhepNoi_Seizai.json"
];

let tatCaDuLieuKho = [];
let questions = [];
let currentIndex = 0;
let score = 0;

// Biến dành riêng cho chế độ Thi Thử (Tab 3)
let examQuestions = [];
let examCurrentIndex = 0;
let examUserAnswers = {};
let examTimer = null;
let examTimeRemaining = 3600; // 60 phút = 3600 giây

let duLieuQuyTrinhKho = {
    precut: [],
    chip: [],
    flooring: [],
    tsukita: [],
    goubanLVL: [],
    shuuseizai: [],
    seizai: []
};

document.addEventListener('DOMContentLoaded', async () => {
    console.log("🚀 Đang khởi động hệ thống nạp dữ liệu HSJ Wood...");
    await taiTatCaDuLieu();
    await taiRiengTatCaFileQuyTrinh();
});

function enterApp() {
    const splashScreen = document.getElementById('splash-screen');
    if (splashScreen) {
        splashScreen.style.opacity = '0';
        setTimeout(() => { splashScreen.style.display = 'none'; }, 700);
    }
}

function switchTab(rawTabId) {
    let tabId = String(rawTabId || '').toLowerCase().replace('tab-', '');
    console.log("📌 Đang chuyển sang tab:", tabId);

    // Dừng đồng hồ thi thử nếu đang chạy mà chuyển tab khác
    if (!tabId.includes('3') && !tabId.includes('exam')) {
        if (examTimer) clearInterval(examTimer);
    }

    document.querySelectorAll('.tab-content').forEach(tab => tab.classList.add('hidden'));
    
    let activeTab = document.getElementById('tab-' + tabId) || 
                    document.getElementById(tabId) || 
                    document.getElementById('tab-quy-trinh') || 
                    document.getElementById('tab-workflow') || 
                    document.getElementById('tab-6') ||
                    document.getElementById('process');

    if (!activeTab) {
        let tabs = document.querySelectorAll('.tab-content');
        if (tabId.includes('1') || tabId.includes('vocab')) activeTab = tabs[0];
        else if (tabId.includes('2') || tabId.includes('practice')) activeTab = tabs[1];
        else if (tabId.includes('3') || tabId.includes('exam')) activeTab = tabs[2];
        else if (tabId.includes('4') || tabId.includes('calc') || tabId.includes('tinh')) activeTab = tabs[3];
        else if (tabId.includes('5') || tabId.includes('safety') || tabId.includes('an-toan')) activeTab = tabs[4];
        else activeTab = tabs[5] || tabs[6] || tabs[tabs.length - 1];
    }
                    
    if (activeTab) {
        activeTab.classList.remove('hidden');
        console.log("✅ Đã kích hoạt hiển thị tab thành công.");
    }

    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('bg-blue-50', 'text-blue-800', 'font-bold');
        btn.classList.add('text-slate-600');
    });

    if (event && event.currentTarget) {
        event.currentTarget.classList.remove('text-slate-600');
        event.currentTarget.classList.add('bg-blue-50', 'text-blue-800', 'font-bold');
    }

    if (tabId.includes('1') || tabId.includes('vocab')) {
        let danhSachTuVung = tatCaDuLieuKho.filter(item => item.TuVungJP || item.ID_TuVung);
        if (danhSachTuVung.length > 0) hienThiDanhSachTuVung(danhSachTuVung);
        else taiRiengFileVocab();
    } else if (tabId.includes('3') || tabId.includes('exam')) {
        hienThiManHinhChuanBiThiThu();
    } else if (tabId.includes('4') || tabId.includes('calc') || tabId.includes('tinh')) {
        taiRiengFileTinhToan();
    } else if (tabId.includes('5') || tabId.includes('safety') || tabId.includes('an-toan')) {
        taiRiengFileAnToan();
    } else if (tabId.includes('6') || tabId.includes('process') || tabId.includes('workflow') || tabId.includes('quy') || tabId.includes('trinh')) {
        hienThiGiaoDienQuyTrinh('precut');
    } else if (tabId.includes('2') || tabId.includes('practice')) {
        questions = tatCaDuLieuKho.filter(item => (item.NoiDungJP || item.question) && !item.TuVungJP && !item.ID_HinhAnh);
        if (questions.length === 0) questions = tatCaDuLieuKho;
        currentIndex = 0;
        renderQuestion();
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
}

async function taiTatCaDuLieu() {
    let tongHop = [];
    for (let tenFile of danhSachFileJson) {
        try {
            let response = await fetch(`./${tenFile}`);
            if (response.ok) {
                let data = await response.json();
                let danhSach = Array.isArray(data) ? data : (data.questions || data.data || Object.values(data)[0] || []);
                if (Array.isArray(danhSach) && danhSach.length > 0) {
                    tongHop = tongHop.concat(danhSach);
                }
            }
        } catch (err) {}
    }

    if (tongHop.length > 0) {
        tatCaDuLieuKho = tongHop;
        questions = tatCaDuLieuKho.filter(item => (item.NoiDungJP || item.question) && !item.TuVungJP && !item.ID_HinhAnh);
        if (questions.length === 0) questions = tatCaDuLieuKho;
        currentIndex = 0;
        renderQuestion();
    }
}

async function taiRiengFileVocab() {
    try {
        let res = await fetch('./TuVung.json');
        if (res.ok) {
            let data = await res.json();
            if (Array.isArray(data)) hienThiDanhSachTuVung(data);
        }
    } catch (e) {}
}

async function taiRiengFileTinhToan() {
    let calcTab = document.getElementById('tab-calc') || document.getElementById('tab-tinh-toan') || document.getElementById('tab-4');
    if (!calcTab) {
        let tabs = document.querySelectorAll('.tab-content');
        if (tabs[3]) calcTab = tabs[3];
    }
    if (!calcTab) return;

    try {
        let res = await fetch('./BaiTapTinhToan.json');
        if (res.ok) {
            let data = await res.json();
            let danhSach = Array.isArray(data) ? data : (data.data || data.questions || Object.values(data)[0] || []);
            if (Array.isArray(danhSach) && danhSach.length > 0) hienThiBaiTapTinhToan(danhSach);
        }
    } catch (e) {}
}

async function taiRiengFileAnToan() {
    let safetyTab = document.getElementById('tab-safety') || 
                    document.getElementById('tab-an-toan') || 
                    document.getElementById('tab-5') || 
                    document.getElementById('safety');
                  
    if (!safetyTab) {
        let tabs = document.querySelectorAll('.tab-content');
        if (tabs[4]) safetyTab = tabs[4];
    }
    if (!safetyTab) return;

    safetyTab.innerHTML = `<div class="p-6 text-center text-slate-500">⏳ Đang tải câu hỏi nhận dạng an toàn...</div>`;

    try {
        let res = await fetch('./NhanDangHinhAnh.json');
        if (res.ok) {
            let data = await res.json();
            let danhSach = Array.isArray(data) ? data : (data.data || data.questions || Object.values(data)[0] || []);
            if (Array.isArray(danhSach) && danhSach.length > 0) {
                hienThiNhanDangAnToan(danhSach);
            }
        }
    } catch (e) {}
}

// ================= MODULE 3: THI THỬ MÔ PHỎNG ĐỀ THI THẬT (20 BỘ ĐỀ - 35 CÂU - 60 PHÚT) =================
function hienThiManHinhChuanBiThiThu() {
    let examTab = document.getElementById('tab-exam') || 
                  document.getElementById('exam') || 
                  document.getElementById('tab-3');
    if (!examTab) {
        let tabs = document.querySelectorAll('.tab-content');
        examTab = tabs[2];
    }
    if (!examTab) return;

    if (examTimer) clearInterval(examTimer);

    let htmlNoiDung = `
        <div class="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-6 max-w-3xl mx-auto">
            <div class="text-center space-y-2 border-b pb-4">
                <h2 class="text-xl font-bold text-blue-900">📝 3. Thi Thử Mô Phỏng Đề Thi Thật (模擬試験モード)</h2>
                <p class="text-sm text-slate-600">Cấu trúc chuẩn kỳ thi Tokutei Ginou Ngành Gỗ:</p>
            </div>
            
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                <div class="p-4 bg-blue-50 border border-blue-200 rounded-xl">
                    <div class="text-2xl font-bold text-blue-900">35 Câu</div>
                    <div class="text-xs text-slate-600 mt-1">Tổng số câu hỏi mỗi đề</div>
                </div>
                <div class="p-4 bg-amber-50 border border-amber-200 rounded-xl">
                    <div class="text-2xl font-bold text-amber-800">60 Phút</div>
                    <div class="text-xs text-slate-600 mt-1">Thời gian làm bài có đồng hồ</div>
                </div>
                <div class="p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
                    <div class="text-2xl font-bold text-emerald-800">20 Bộ Đề</div>
                    <div class="text-xs text-slate-600 mt-1">Lấy ngẫu nhiên từ kho dữ liệu</div>
                </div>
            </div>

            <div class="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-xs text-slate-700">
                <div class="font-bold text-slate-900">📌 Cấu trúc chi tiết bộ đề:</div>
                <div>• <strong>Câu 1 đến Câu 32:</strong> Kiến thức chung & chuyên ngành gỗ (Lọc ngẫu nhiên từ 1860 câu).</div>
                <div>• <strong>Câu 33:</strong> Câu hỏi nhận dạng an toàn / hình ảnh nguy cơ.</div>
                <div>• <strong>Câu 34:</strong> Bài tập tính toán thực chiến ngành gỗ.</div>
                <div>• <strong>Câu 35:</strong> Câu hỏi quy trình sản xuất / ghép nối chuyên ngành.</div>
            </div>

            <div class="space-y-3">
                <label class="block text-sm font-bold text-slate-800 text-center">🎯 Chọn bộ đề thi thử muốn làm:</label>
                <div class="grid grid-cols-2 md:grid-cols-5 gap-2 max-h-[220px] overflow-y-auto p-2 border rounded-xl">
    `;

    for (let i = 1; i <= 20; i++) {
        htmlNoiDung += `
            <button onclick="batDauThiThu(${i})" class="p-3 bg-slate-50 hover:bg-blue-600 hover:text-white border border-slate-200 rounded-xl text-sm font-bold text-slate-800 transition shadow-2xs cursor-pointer flex flex-col items-center justify-center">
                <span>Đề số ${i}</span>
                <span class="text-[10px] font-normal opacity-75">35 câu • 60 phút</span>
            </button>
        `;
    }

    htmlNoiDung += `
                </div>
            </div>
        </div>
    `;
    examTab.innerHTML = htmlNoiDung;
}

async function batDauThiThu(deSo) {
    let examTab = document.getElementById('tab-exam') || document.getElementById('exam') || document.getElementById('tab-3');
    if (!examTab) {
        let tabs = document.querySelectorAll('.tab-content');
        examTab = tabs[2];
    }
    if (!examTab) return;

    examTab.innerHTML = `<div class="p-10 text-center text-slate-600 font-bold">⏳ Đang khởi tạo Bộ đề số ${deSo} (Trộn đề chuẩn hóa)...</div>`;

    // 1. Lấy 32 câu từ CauHoi_1860.json
    let ds1860 = [];
    try {
        let res = await fetch('./CauHoi_1860.json');
        if (res.ok) {
            let data = await res.json();
            ds1860 = Array.isArray(data) ? data : (data.questions || data.data || Object.values(data)[0] || []);
        }
    } catch (e) {}
    if (ds1860.length === 0) ds1860 = tatCaDuLieuKho;
    let shuffled1860 = [...ds1860].sort(() => Math.random() - 0.5).slice(0, 32);

    // 2. Lấy 1 câu từ NhanDangHinhAnh.json (Câu 33)
    let dsAnToan = [];
    try {
        let res = await fetch('./NhanDangHinhAnh.json');
        if (res.ok) {
            let data = await res.json();
            dsAnToan = Array.isArray(data) ? data : (data.data || data.questions || Object.values(data)[0] || []);
        }
    } catch (e) {}
    let cauAnToan = dsAnToan.length > 0 ? dsAnToan[Math.floor(Math.random() * dsAnToan.length)] : shuffled1860[0];

    // 3. Lấy 1 câu từ BaiTapTinhToan.json (Câu 34)
    let dsTinhToan = [];
    try {
        let res = await fetch('./BaiTapTinhToan.json');
        if (res.ok) {
            let data = await res.json();
            dsTinhToan = Array.isArray(data) ? data : (data.data || data.questions || Object.values(data)[0] || []);
        }
    } catch (e) {}
    let cauTinhToan = dsTinhToan.length > 0 ? dsTinhToan[Math.floor(Math.random() * dsTinhToan.length)] : shuffled1860[1];

    // 4. Lấy 1 câu từ 1 trong 7 file Quy Trình (Câu 35)
    let fileQuyTrinhList = [
        "GhepNoi_Precut.json",
        "GhepNoi_Chip.json",
        "GhepNoi_Flooring.json",
        "GhepNoi_Tsukita.json",
        "GhepNoi_GoubanLVL.json",
        "GhepNoi_Shuuseizai.json",
        "GhepNoi_Seizai.json"
    ];
    let chonFileQT = fileQuyTrinhList[Math.floor(Math.random() * fileQuyTrinhList.length)];
    let dsQuyTrinhItem = [];
    try {
        let res = await fetch(`./${chonFileQT}`);
        if (res.ok) {
            let data = await res.json();
            if (Array.isArray(data) && data.length > 1) {
                dsQuyTrinhItem = data.slice(1);
            }
        }
    } catch (e) {}
    let cauQuyTrinh = dsQuyTrinhItem.length > 0 ? dsQuyTrinhItem[Math.floor(Math.random() * dsQuyTrinhItem.length)] : shuffled1860[2];

    // Tổng hợp đủ 35 câu cho bộ đề
    examQuestions = [...shuffled1860, cauAnToan, cauTinhToan, cauQuyTrinh];
    examCurrentIndex = 0;
    examUserAnswers = {};
    examTimeRemaining = 3600; // 60 phút

    // Bắt đầu đếm giờ
    if (examTimer) clearInterval(examTimer);
    examTimer = setInterval(() => {
        examTimeRemaining--;
        let timerEl = document.getElementById('exam-timer-display');
        if (timerEl) {
            let mins = Math.floor(examTimeRemaining / 60);
            let secs = examTimeRemaining % 60;
            timerEl.innerText = `${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
            if (examTimeRemaining <= 300) {
                timerEl.className = "text-sm font-bold px-3 py-1 bg-red-600 text-white rounded-lg animate-pulse";
            }
        }
        if (examTimeRemaining <= 0) {
            clearInterval(examTimer);
            alert("⏰ Đã hết thời gian làm bài thi!");
            nopBaiThiThu();
        }
    }, 1000);

    renderGiaoDienLamBaiThi(deSo);
}

function renderGiaoDienLamBaiThi(deSo) {
    let examTab = document.getElementById('tab-exam') || document.getElementById('exam') || document.getElementById('tab-3');
    if (!examTab) return;

    let q = examQuestions[examCurrentIndex];
    let totalQ = examQuestions.length;

    // Chuẩn hóa nội dung câu hỏi tùy theo loại câu (1860, An toàn, Tính toán, Quy trình)
    let tieudeCau = q.TieuDeCau || q.TieuDe || (examCurrentIndex === 32 ? "🛡️ Câu hỏi An toàn vệ sinh" : examCurrentIndex === 33 ? "🧮 Bài tập Tính toán thực chiến" : examCurrentIndex === 34 ? "⚙️ Câu hỏi Quy trình sản xuất" : `Câu ${examCurrentIndex + 1}`);
    let noidungJP = q.NoiDungJP || q.question || q.DeBaigocJP || q.DeBaigoc || q.__2 || q.tuVungJP || "";
    let noidungVN = q.NoiDungVN || q.DeBaigocVN || q.nghiaVN || "";
    
    let rawImgUrl = q.HinhAnhURL || q.LinkAnh || q.Image || "";
    let embedUrl = convertDriveEmbedLink(rawImgUrl);
    let directUrl = convertDriveDirectLink(rawImgUrl);

    // Xử lý danh sách đáp án
    let options = q.options || [q.A, q.B, q.C, q.D].filter(Boolean);
    if (options.length === 0) {
        let lC = [q.LuaChon_A, q.LuaChon_I, q.LuaChon_U, q.LuaChon_E, q.LuaChon_O, q.LuaChon_Ka].filter(Boolean);
        if (lC.length > 0) options = lC;
        else options = ["〇 (Đúng)", "✖ (Sai)"];
    }

    let selectedOpt = examUserAnswers[examCurrentIndex] || "";

    let htmlNoiDung = `
        <div class="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-5 max-w-4xl mx-auto">
            <!-- Thanh tiêu đề & Đồng hồ đếm giờ -->
            <div class="flex justify-between items-center border-b pb-3 flex-wrap gap-2">
                <div>
                    <h2 class="text-base font-bold text-blue-900">📝 Đang thi thử: Bộ đề số ${deSo}</h2>
                    <p class="text-xs text-slate-500">Câu hỏi ${examCurrentIndex + 1} / ${totalQ}</p>
                </div>
                <div class="flex items-center space-x-3">
                    <div class="text-xs text-slate-600 font-bold">⏱️ Thời gian còn lại:</div>
                    <div id="exam-timer-display" class="text-sm font-bold px-3 py-1 bg-amber-600 text-white rounded-lg shadow-xs">60:00</div>
                    <button onclick="xacNhanNopBai()" class="px-4 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-lg transition cursor-pointer">
                        🏁 Nộp bài
                    </button>
                </div>
            </div>

            <!-- Nội dung câu hỏi -->
            <div class="p-5 bg-gradient-to-r from-blue-50/30 to-slate-50 border border-slate-200 rounded-xl space-y-4">
                <div class="flex justify-between items-center">
                    <span class="text-xs bg-blue-100 text-blue-800 px-2.5 py-1 rounded-full font-bold">${tieudeCau}</span>
                    <span class="text-xs text-slate-500 font-semibold">Trang ${q.TrangSo || 'Mô phỏng'}</span>
                </div>

                ${embedUrl ? `
                    <div class="w-full bg-slate-900 rounded-xl p-2 border border-slate-300 space-y-2">
                        <iframe src="${embedUrl}" class="w-full h-[280px] rounded-lg border-0" allow="autoplay" loading="lazy"></iframe>
                        <div class="text-center pb-1">
                            <a href="${directUrl}" target="_blank" class="text-xs bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg inline-flex items-center space-x-1 font-semibold transition">
                                <span>🔗 Mở hình ảnh lớn trên Google Drive</span>
                            </a>
                        </div>
                    </div>
                ` : ''}

                <div class="space-y-2 bg-white p-4 rounded-lg border border-slate-100">
                    <div class="text-slate-900 font-bold text-base whitespace-pre-line">🇯🇵 ${noidungJP}</div>
                    ${noidungVN ? `<div class="text-slate-600 text-sm italic whitespace-pre-line border-t pt-2">🇻🇳 ${noidungVN}</div>` : ''}
                </div>

                <!-- Các phương án lựa chọn -->
                <div class="space-y-2">
                    <p class="text-xs font-bold text-slate-500 uppercase">👉 Chọn đáp án của bạn:</p>
                    <div class="grid grid-cols-1 gap-2">
    `;

    options.forEach(opt => {
        let optText = typeof opt === 'object' ? (opt.text || JSON.stringify(opt)) : String(opt);
        let isChecked = selectedOpt === optText ? "bg-blue-100 border-blue-500 text-blue-950 font-bold shadow-xs" : "bg-white hover:bg-slate-100 border-slate-200 text-slate-800 font-medium";
        htmlNoiDung += `
            <div onclick="chonDapAnThiThu('${optText.replace(/'/g, "\\'")}')" class="p-3.5 border rounded-xl text-sm transition cursor-pointer flex items-center space-x-3 select-none ${isChecked}">
                <div class="w-6 h-6 flex items-center justify-center rounded-lg bg-slate-100 text-slate-700 font-bold text-xs shrink-0 border">
                    ${selectedOpt === optText ? '✓' : '◯'}
                </div>
                <span>${optText}</span>
            </div>
        `;
    });

    htmlNoiDung += `
                    </div>
                </div>
            </div>

            <!-- Thanh điều hướng câu hỏi trước / sau -->
            <div class="flex justify-between items-center pt-2">
                <button onclick="cauTruocThiThu()" ${examCurrentIndex === 0 ? 'disabled class="px-4 py-2 bg-slate-200 text-slate-400 rounded-xl text-xs font-bold cursor-not-allowed"' : 'class="px-4 py-2 bg-slate-600 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition cursor-pointer"'}>
                    ⬅️ Câu trước
                </button>
                <div class="flex gap-1 overflow-x-auto max-w-[300px] p-1">
    `;

    // Thanh danh mục số câu nhỏ bên dưới
    for (let i = 0; i < totalQ; i++) {
        let answeredClass = examUserAnswers[i] ? "bg-emerald-600 text-white" : "bg-slate-200 text-slate-700";
        let currentClass = i === examCurrentIndex ? "ring-2 ring-blue-600 font-bold" : "";
        htmlNoiDung += `
            <button onclick="chuyenCauThiThu(${i})" class="w-7 h-7 rounded text-[11px] font-bold shrink-0 transition cursor-pointer ${answeredClass} ${currentClass}">
                ${i + 1}
            </button>
        `;
    }

    htmlNoiDung += `
                </div>
                <button onclick="cauSauThiThu()" ${examCurrentIndex === totalQ - 1 ? 'disabled class="px-4 py-2 bg-slate-200 text-slate-400 rounded-xl text-xs font-bold cursor-not-allowed"' : 'class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition cursor-pointer"'}>
                    Câu sau ➡️
                </button>
            </div>
        </div>
    `;

    examTab.innerHTML = htmlNoiDung;
}

function chonDapAnThiThu(optionText) {
    examUserAnswers[examCurrentIndex] = optionText;
    renderGiaoDienLamBaiThi(1);
}

function chuyenCauThiThu(index) {
    examCurrentIndex = index;
    renderGiaoDienLamBaiThi(1);
}

function cauTruocThiThu() {
    if (examCurrentIndex > 0) {
        examCurrentIndex--;
        renderGiaoDienLamBaiThi(1);
    }
}

function cauSauThiThu() {
    if (examCurrentIndex < examQuestions.length - 1) {
        examCurrentIndex++;
        renderGiaoDienLamBaiThi(1);
    }
}

function xacNhanNopBai() {
    let soCauDaLam = Object.keys(examUserAnswers).length;
    let chuaLam = examQuestions.length - soCauDaLam;
    let msg = chuaLam > 0 ? `⚠️ Bạn còn ${chuaLam} câu chưa trả lời. Bạn có chắc chắn muốn nộp bài không?` : `✨ Bạn đã trả lời đủ tất cả các câu hỏi. Bạn có muốn nộp bài ngay bây giờ không?`;
    if (confirm(msg)) {
        nopBaiThiThu();
    }
}

function nopBaiThiThu() {
    if (examTimer) clearInterval(examTimer);

    let soCauDung = 0;
    examQuestions.forEach((q, index) => {
        let userAns = examUserAnswers[index] || "";
        let correctAns = q.DapAn || q.answer || q.DapAnDung || "";
        if (userAns && correctAns && userAns.trim().includes(String(correctAns).trim())) {
            soCauDung++;
        }
    });

    let totalQ = examQuestions.length;
    let phanTram = Math.round((soCauDung / totalQ) * 100);
    let ketQuaDat = soCauDung >= Math.ceil(totalQ * 0.7); // Đạt từ 70% trở lên

    let examTab = document.getElementById('tab-exam') || document.getElementById('exam') || document.getElementById('tab-3');
    if (!examTab) return;

    let htmlNoiDung = `
        <div class="bg-white p-8 rounded-xl border border-slate-200 shadow-sm space-y-6 max-w-2xl mx-auto text-center">
            <div class="space-y-2">
                <div class="text-5xl">${ketQuaDat ? '🎉' : '📚'}</div>
                <h2 class="text-2xl font-bold ${ketQuaDat ? 'text-emerald-600' : 'text-amber-600'}">
                    ${ketQuaDat ? 'CHÚC MỪNG BẠN ĐÃ ĐÃ THỊ ĐẠT!' : 'BẠN CẦN CỐ GẮNG ÔN TẬP THÊM!'}
                </h2>
                <p class="text-sm text-slate-500">Kết quả bài thi mô phỏng đề thi thật Tokutei Ginou</p>
            </div>

            <div class="grid grid-cols-2 gap-4">
                <div class="p-4 bg-slate-50 border rounded-xl">
                    <div class="text-3xl font-extrabold text-blue-900">${soCauDung} / ${totalQ}</div>
                    <div class="text-xs text-slate-600 mt-1">Số câu trả lời đúng</div>
                </div>
                <div class="p-4 bg-slate-50 border rounded-xl">
                    <div class="text-3xl font-extrabold ${ketQuaDat ? 'text-emerald-600' : 'text-red-600'}">${phanTram}%</div>
                    <div class="text-xs text-slate-600 mt-1">Tỷ lệ chính xác</div>
                </div>
            </div>

            <div class="p-4 bg-blue-50 text-blue-900 rounded-xl text-xs font-semibold">
                ${ketQuaDat ? '🌟 Năng lực của bạn đã đạt tiêu chuẩn vượt qua kỳ thi thực tế tại Nhật Bản!' : '💡 Hãy ôn tập thêm phần Từ vựng và Quy trình để nâng cao số câu đúng nhé!'}
            </div>

            <div class="pt-4 flex justify-center gap-3">
                <button onclick="hienThiManHinhChuanBiThiThu()" class="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl transition shadow-sm cursor-pointer">
                    🔄 Làm lại bộ đề mới
                </button>
            </div>
        </div>
    `;

    examTab.innerHTML = htmlNoiDung;
}

// ================= TẢI VÀ HIỂN THỊ TAB 6: QUY TRÌNH (CHỈ HIỂN THỊ 1 ẢNH DUY NHẤT CHO MỖI QUY TRÌNH) =================
async function taiRiengTatCaFileQuyTrinh() {
    let workflowTab = document.getElementById('process') || 
                      document.getElementById('tab-process') || 
                      document.getElementById('tab-workflow') || 
                      document.getElementById('tab-quy-trinh') || 
                      document.getElementById('tab-6') || 
                      document.getElementById('workflow');
                  
    if (!workflowTab) {
        let tabs = document.querySelectorAll('.tab-content');
        workflowTab = tabs[5] || tabs[6] || tabs[tabs.length - 1];
    }
    if (!workflowTab) return;

    workflowTab.innerHTML = `<div class="p-6 text-center text-slate-500">⏳ Đang tải dữ liệu quy trình sản xuất...</div>`;

    if (duLieuQuyTrinhKho.precut.length === 0) {
        const filesMap = {
            precut: "GhepNoi_Precut.json",
            seizai: "GhepNoi_Seizai.json",
            shuuseizai: "GhepNoi_Shuuseizai.json",
            goubanLVL: "GhepNoi_GoubanLVL.json",
            flooring: "GhepNoi_Flooring.json",
            tsukita: "GhepNoi_Tsukita.json",
            chip: "GhepNoi_Chip.json"
        };

        for (let key in filesMap) {
            try {
                let res = await fetch(`./${filesMap[key]}`);
                if (res.ok) {
                    let data = await res.json();
                    if (Array.isArray(data) && data.length > 1) {
                        let danhSachbuoc = data.slice(1).map((item, idx) => {
                            let values = Object.values(item);
                            return {
                                stt: values[0] || (idx + 1),
                                hinhAnh: values[1] || "",
                                tuVungJP: values[2] || "",
                                nghiaVN: values[3] || "",
                                giaiThich: values[4] || ""
                            };
                        }).filter(item => item.tuVungJP);

                        duLieuQuyTrinhKho[key] = danhSachbuoc;
                    }
                }
            } catch(e) {}
        }
    }

    hienThiGiaoDienQuyTrinh('precut');
}

function hienThiGiaoDienQuyTrinh(loaiHienTai) {
    let workflowTab = document.getElementById('process') || 
                      document.getElementById('tab-process') || 
                      document.getElementById('tab-workflow') || 
                      document.getElementById('tab-quy-trinh') || 
                      document.getElementById('tab-6') || 
                      document.getElementById('workflow');
    if (!workflowTab) {
        let tabs = document.querySelectorAll('.tab-content');
        workflowTab = tabs[5] || tabs[6] || tabs[tabs.length - 1];
    }
    if (!workflowTab) return;

    let danhSachHienTai = duLieuQuyTrinhKho[loaiHienTai] || [];

    let menuNutBam = [
        { id: 'precut', name: '🏠 Nhà Gỗ Pre-cut' },
        { id: 'seizai', name: '🪵 Xẻ Gỗ (Seizai)' },
        { id: 'shuuseizai', name: '🪵 Gỗ Ghép (Shuuseizai)' },
        { id: 'goubanLVL', name: '📦 Ván Ép / LVL' },
        { id: 'flooring', name: '🟫 Sàn Gỗ (Flooring)' },
        { id: 'tsukita', name: '📃 Ván Lạng (Tsukita)' },
        { id: 'chip', name: '🪵 Dăm Gỗ / Bột Giấy' }
    ];

    let anhDaiDien = (danhSachHienTai.length > 0 && danhSachHienTai[0].hinhAnh) ? danhSachHienTai[0].hinhAnh : "";
    let embedUrl = convertDriveEmbedLink(anhDaiDien);
    let directUrl = convertDriveDirectLink(anhDaiDien);

    let htmlNoiDung = `
        <div class="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-5">
            <div class="border-b pb-3">
                <h2 class="text-lg font-bold text-blue-900">⚙️ 6. Quy Trình Sản Xuất & Ghép Nối Chuyên Ngành Gỗ</h2>
                <p class="text-xs text-slate-500">木材加工・製造工程 (Kotei Mondai) - Hệ thống 7 quy trình thực chiến</p>
            </div>

            <div class="flex flex-wrap gap-2 pb-2 border-b border-slate-100">
    `;

    menuNutBam.forEach(item => {
        let activeClass = (item.id === loaiHienTai) ? "bg-blue-600 text-white font-bold shadow-sm" : "bg-slate-100 hover:bg-slate-200 text-slate-700";
        htmlNoiDung += `
            <button onclick="hienThiGiaoDienQuyTrinh('${item.id}')" class="px-3.5 py-2 rounded-xl text-xs transition cursor-pointer ${activeClass}">
                ${item.name}
            </button>
        `;
    });

    htmlNoiDung += `
            </div>

            ${embedUrl ? `
                <div class="w-full bg-slate-900 rounded-xl p-3 border border-slate-300 shadow-md space-y-2">
                    <div class="text-xs text-slate-200 font-bold uppercase tracking-wider text-center pb-1">🗺️ Sơ đồ tổng quan quy trình sản xuất</div>
                    <iframe src="${embedUrl}" class="w-full h-[320px] rounded-lg border-0" allow="autoplay" loading="lazy"></iframe>
                    <div class="text-center pt-1">
                        <a href="${directUrl}" target="_blank" class="text-xs bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg inline-flex items-center space-x-1 font-semibold transition">
                            <span>🔗 Mở sơ đồ lớn trên Google Drive</span>
                        </a>
                    </div>
                </div>
            ` : ''}

            <div class="space-y-4 max-h-[500px] overflow-y-auto pr-2">
    `;

    if (danhSachHienTai.length === 0) {
        htmlNoiDung += `<div class="p-6 text-center text-slate-400">⏳ Đang tải dữ liệu quy trình...</div>`;
    } else {
        danhSachHienTai.forEach((item, index) => {
            htmlNoiDung += `
                <div class="p-4 bg-gradient-to-r from-blue-50/20 to-slate-50 border border-slate-200 rounded-xl shadow-sm space-y-2">
                    <div class="flex justify-between items-center">
                        <span class="text-xs bg-indigo-100 text-indigo-800 px-2.5 py-0.5 rounded-full font-bold">Bước #${item.stt || (index + 1)}</span>
                    </div>

                    <div class="space-y-1 bg-white p-3 rounded-lg border border-slate-100">
                        <div class="text-slate-900 font-bold text-base whitespace-pre-line">🇯🇵 ${item.tuVungJP}</div>
                        <div class="text-slate-600 text-sm italic whitespace-pre-line border-t pt-1">🇻🇳 ${item.nghiaVN}</div>
                    </div>

                    ${item.giaiThich ? `
                        <div class="p-2.5 bg-slate-100 text-slate-800 rounded-lg text-xs whitespace-pre-line border border-slate-200">
                            <strong>💡 Giải thích chi tiết:</strong> ${item.giaiThich}
                        </div>
                    ` : ''}
                </div>
            `;
        });
    }

    htmlNoiDung += `</div></div>`;
    workflowTab.innerHTML = htmlNoiDung;
}

function toggleSafetyOption(element) {
    let mark = element.querySelector('.box-mark');
    if (element.classList.contains('bg-amber-100')) {
        element.classList.remove('bg-amber-100', 'border-amber-400', 'text-amber-950', 'font-bold');
        element.classList.add('bg-white', 'border-slate-200', 'text-slate-800', 'font-medium');
        if (mark) {
            mark.classList.remove('bg-amber-500', 'text-white', 'border-amber-600');
            mark.classList.add('bg-slate-100', 'text-slate-600', 'border-slate-300');
            mark.innerText = "◯";
        }
    } else {
        element.classList.add('bg-amber-100', 'border-amber-400', 'text-amber-950', 'font-bold');
        element.classList.remove('bg-white', 'border-slate-200', 'text-slate-800', 'font-medium');
        if (mark) {
            mark.classList.add('bg-amber-500', 'text-white', 'border-amber-600');
            mark.classList.remove('bg-slate-100', 'text-slate-600', 'border-slate-300');
            mark.innerText = "✓";
        }
    }
}

function toggleSafetyAnswer(index) {
    let box = document.getElementById(`safe-ans-${index}`);
    let btn = document.getElementById(`btn-safe-${index}`);
    if (box && btn) {
        if (box.style.display === 'none') {
            box.style.display = 'block';
            btn.innerHTML = `<span>🙈 Thu gọn đáp án</span>`;
            btn.className = "px-4 py-2 bg-slate-600 hover:bg-slate-700 text-white text-sm font-bold rounded-lg transition shadow-sm cursor-pointer flex items-center space-x-2";
        } else {
            box.style.display = 'none';
            btn.innerHTML = `<span>👁️ Xem đáp án & Giải thích</span>`;
            btn.className = "px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold rounded-lg transition shadow-sm cursor-pointer flex items-center space-x-2";
        }
    }
}

function parseTuVungJP(jpText) {
    if (!jpText) return { display: "", speech: "" };
    let hiraganaIndex = -1;
    for (let i = 0; i < jpText.length; i++) {
        let code = jpText.charCodeAt(i);
        if (code >= 0x3040 && code <= 0x309F) { hiraganaIndex = i; break; }
    }
    if (hiraganaIndex > 0) {
        return {
            display: `${jpText.substring(0, hiraganaIndex)} <span class="text-slate-500 font-normal text-sm">(${jpText.substring(hiraganaIndex)})</span>`,
            speech: jpText.substring(0, hiraganaIndex)
        };
    }
    return { display: jpText, speech: jpText };
}

function phatAmThanh(text) {
    if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        let utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'ja-JP';
        utterance.rate = 0.85;
        window.speechSynthesis.speak(utterance);
    }
}

function hienThiDanhSachTuVung(danhSach) {
    let vocabTab = document.getElementById('tab-vocab') || document.getElementById('vocab');
    if (!vocabTab) return;
    let htmlNoiDung = `
        <div class="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
            <div class="flex justify-between items-center border-b pb-3">
                <h2 class="text-lg font-bold text-blue-900">📖 Từ Vựng Chuyên Ngành Gỗ (Tổng số: ${danhSach.length} từ)</h2>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[600px] overflow-y-auto pr-2">
    `;
    danhSach.forEach((item) => {
        let parsed = parseTuVungJP(item.TuVungJP || "");
        htmlNoiDung += `
            <div class="p-4 bg-slate-50 border border-slate-200 rounded-xl flex flex-col justify-between">
                <div>
                    <div class="flex justify-between items-start">
                        <div class="flex items-center space-x-2">
                            <span class="text-base font-bold text-blue-900">${parsed.display}</span>
                            <button onclick="phatAmThanh('${parsed.speech.replace(/'/g, "\\'")}')" class="p-1.5 bg-blue-100 hover:bg-orange-500 text-blue-800 hover:text-white rounded-full transition cursor-pointer">🔊</button>
                        </div>
                        <span class="text-[10px] bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full font-semibold">Trang ${item.TrangSo || 1}</span>
                    </div>
                    <p class="text-xs text-orange-600 font-medium mt-0.5">${item.Furigana ? `(${item.Furigana})` : ''}</p>
                </div>
                <div class="mt-3 pt-2 border-t border-slate-200/60 text-sm font-semibold text-slate-700">🇻🇳 ${item.NghiaVN || ''}</div>
            </div>
        `;
    });
    htmlNoiDung += `</div></div>`;
    vocabTab.innerHTML = htmlNoiDung;
}

function hienThiBaiTapTinhToan(danhSach) {
    let calcTab = document.getElementById('tab-calc') || document.getElementById('tab-tinh-toan') || document.getElementById('tab-4');
    if (!calcTab) {
        let tabs = document.querySelectorAll('.tab-content');
        if (tabs[3]) calcTab = tabs[3];
    }
    if (!calcTab) return;
    let danhSachBaiTap = danhSach.filter(item => item.__2 || item.DeBaigoc || item.question);
    let htmlNoiDung = `
        <div class="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
            <div class="border-b pb-3">
                <h2 class="text-lg font-bold text-blue-900">🧮 Bài Tập Tính Toán Thực Chiến Ngành Gỗ</h2>
                <p class="text-xs text-slate-500">計算問題 (Keisan Mondai) - Tổng số: ${danhSachBaiTap.length} bài tập (Đáp án đã ẩn)</p>
            </div>
            <div class="space-y-4 max-h-[650px] overflow-y-auto pr-2">
    `;
    danhSachBaiTap.forEach((item, index) => {
        let chude = item[""] || item.ChuDe || "木材の材積と歩止まり計算";
        let tieude = item.__1 || item.TieuDeBai || `Bài ${index + 1}`;
        let debaigoc = item.__2 || item.DeBaigoc || item.question || "";
        let congthuc = item.__3 || item.CongThuc || "";
        let buocgiai = item.__4 || item.CacBướcGiai || item.GiaiThich || "";
        let dapan = item.__5 || item.DapAnDung || item.answer || "";
        htmlNoiDung += `
            <div class="p-5 bg-gradient-to-r from-blue-50/40 to-slate-50 border border-slate-200 rounded-xl shadow-sm space-y-3">
                <div class="flex justify-between items-center">
                    <span class="text-xs bg-orange-100 text-orange-800 px-2.5 py-1 rounded-full font-bold">${chude}</span>
                    <span class="text-sm font-bold text-blue-900">${tieude}</span>
                </div>
                <div class="text-slate-900 font-semibold text-base whitespace-pre-line bg-white p-3 rounded-lg border border-slate-100">
                    📝 ${debaigoc}
                </div>
                <button onclick="toggleAnswer(${index})" id="btn-${index}" class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-lg transition shadow-sm cursor-pointer flex items-center space-x-2">
                    <span>👁️ Xem đáp án & Hướng dẫn giải</span>
                </button>
                <div id="ans-${index}" style="display: none;" class="space-y-3 pt-3 border-t border-slate-200">
                    ${congthuc ? `<div class="p-3 bg-blue-50 text-blue-900 rounded-lg text-sm border border-blue-100"><strong>📐 Công thức:</strong> ${congthuc}</div>` : ''}
                    ${buocgiai ? `<div class="p-3 bg-slate-100 text-slate-800 rounded-lg text-sm whitespace-pre-line border border-slate-200"><strong>💡 Các bước giải:</strong><br>${buocgiai}</div>` : ''}
                    ${dapan ? `<div class="p-3 bg-green-50 text-green-900 rounded-lg text-sm font-bold border border-green-200">✅ Đáp án: ${dapan}</div>` : ''}
                </div>
            </div>
        `;
    });
    htmlNoiDung += `</div></div>`;
    calcTab.innerHTML = htmlNoiDung;
}

function toggleAnswer(index) {
    let box = document.getElementById(`ans-${index}`);
    let btn = document.getElementById(`btn-${index}`);
    if (box && btn) {
        if (box.style.display === 'none') {
            box.style.display = 'block';
            btn.innerHTML = `<span>🙈 Thu gọn đáp án</span>`;
            btn.className = "px-4 py-2 bg-slate-600 hover:bg-slate-700 text-white text-sm font-bold rounded-lg transition shadow-sm cursor-pointer flex items-center space-x-2";
        } else {
            box.style.display = 'none';
            btn.innerHTML = `<span>👁️ Xem đáp án & Hướng dẫn giải</span>`;
            btn.className = "px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-lg transition shadow-sm cursor-pointer flex items-center space-x-2";
        }
    }
}

function renderQuestion() {
    if (!questions || questions.length === 0) return;
    let q = questions[currentIndex];
    if (q.TuVungJP || q.ID_HinhAnh) { nextQuestion(); return; }
    let progressEl = document.getElementById('quiz-progress');
    if (progressEl) progressEl.innerText = `[${q.TrangSo || 'Ôn tập'}] - Câu ${currentIndex + 1} / ${questions.length}`;
    let questionTextEl = document.getElementById('question-text');
    if (questionTextEl) {
        questionTextEl.innerHTML = `
            <span class="text-blue-700 font-bold text-base">${q.TieuDeCau || q.TieuDe || ""}</span><br>
            <div class="my-2 text-slate-900 font-semibold text-base whitespace-pre-line">${q.NoiDungJP || q.question || q.DeBaigoc || ""}</div>
            <div class="text-slate-500 text-sm italic">${q.NoiDungVN || ""}</div>
        `;
    }
    let optsContainer = document.getElementById('options-container');
    if (optsContainer) {
        optsContainer.innerHTML = '';
        let options = q.options || [q.A, q.B, q.C, q.D].filter(Boolean);
        if (options.length === 0) options = ["〇", "✖"];
        options.forEach(opt => {
            let btn = document.createElement('button');
            btn.className = "w-full text-left px-5 py-3.5 bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-300 rounded-xl text-base font-bold transition cursor-pointer flex items-center justify-between mb-2 shadow-sm";
            btn.innerText = (opt === "〇") ? "〇 — Đúng" : ((opt === "✖") ? "✖ — Sai" : opt);
            let dapAnDung = q.DapAn || q.answer || q.DapAnDung;
            btn.onclick = () => checkAnswer(btn, opt, dapAnDung, q.GiaiThich);
            optsContainer.appendChild(btn);
        });
    }
    let expBox = document.getElementById('explanation-box');
    if (expBox) { expBox.classList.add('hidden'); expBox.innerText = ''; }
}

function checkAnswer(button, selectedOption, correctAnswer, explanation) {
    let optsContainer = document.getElementById('options-container');
    if (!optsContainer) return;
    let buttons = optsContainer.getElementsByTagName('button');
    for (let b of buttons) {
        b.disabled = true;
        if (correctAnswer && b.innerText.trim().includes(String(correctAnswer).trim())) {
            b.classList.add('bg-green-100', 'border-green-500', 'text-green-900', 'font-bold');
        }
    }
    if (correctAnswer && selectedOption.trim() === String(correctAnswer).trim()) {
        button.classList.add('bg-green-500', 'text-white', 'border-green-600');
        score++;
    } else {
        button.classList.add('bg-red-100', 'border-red-500', 'text-red-900');
    }
    let expBox = document.getElementById('explanation-box');
    if (expBox && explanation) {
        expBox.innerText = `💡 Giải thích: ${explanation}`;
        expBox.classList.remove('hidden');
    }
}

function nextQuestion() {
    if (currentIndex < questions.length - 1) {
        currentIndex++;
        renderQuestion();
    } else {
        alert(`🎉 Chúc mừng bạn đã hoàn thành! Tổng số câu đúng: ${score} / ${questions.length}`);
    }
}

function prevQuestion() {
    if (currentIndex > 0) { currentIndex--; renderQuestion(); }
}
