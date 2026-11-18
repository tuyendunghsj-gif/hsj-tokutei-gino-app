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
    } else if (tabId.includes('4') || tabId.includes('calc') || tabId.includes('tinh')) {
        taiRiengFileTinhToan();
    } else if (tabId.includes('5') || tabId.includes('safety') || tabId.includes('an-toan')) {
        taiRiengFileAnToan();
    } else if (tabId.includes('6') || tabId.includes('process') || tabId.includes('workflow') || tabId.includes('quy') || tabId.includes('trinh')) {
        hienThiGiaoDienQuyTrinh('precut');
    } else if (tabId.includes('2') || tabId.includes('3') || tabId.includes('practice') || tabId.includes('exam')) {
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

function convertDriveEmbedLink(url) {
    if (!url) return "";
    let match = url.match(/\/d\/([a-zA-Z0-9_-]+)/) || url.match(/id=([a-zA-Z0-9_-]+)/);
    if (match && match[1]) {
        return `https://drive.google.com/file/d/${match[1]}/preview`;
    }
    return url;
}

function convertDriveDirectLink(url) {
    if (!url) return "#";
    let match = url.match(/\/d\/([a-zA-Z0-9_-]+)/) || url.match(/id=([a-zA-Z0-9_-]+)/);
    if (match && match[1]) {
        return `https://drive.google.com/file/d/${match[1]}/view?usp=sharing`;
    }
    return url;
}

function hienThiNhanDangAnToan(danhSach) {
    let safetyTab = document.getElementById('tab-safety') || 
                    document.getElementById('tab-an-toan') || 
                    document.getElementById('tab-5') || 
                    document.getElementById('safety');
                  
    if (!safetyTab) {
        let tabs = document.querySelectorAll('.tab-content');
        if (tabs[4]) safetyTab = tabs[4];
    }
    if (!safetyTab) return;

    let htmlNoiDung = `
        <div class="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
            <div class="border-b pb-3">
                <h2 class="text-lg font-bold text-blue-900">🛡️ 5. An Toàn Vệ Sinh & Nhận Dạng Hình Ảnh Nguy Cơ</h2>
                <p class="text-xs text-slate-500">安全衛生・画像認識問題 - Tổng số: ${danhSach.length} câu hỏi</p>
            </div>
            <div class="space-y-6 max-h-[700px] overflow-y-auto pr-2">
    `;

    danhSach.forEach((item, index) => {
        let chude = item.ChuDe || "Thực kỹ / An toàn vệ sinh";
        let tieude = item.TieuDeCau || `Câu ${index + 1}`;
        let deJP = item.DeBaigocJP || "";
        let deVN = item.DeBaigocVN || "";
        let giaithich = item.GiaiThich || "";
        let dapan = item.DapAnDung || "";
        
        let rawImgUrl = item.HinhAnhURL || item.LinkAnh || item.Image || "";
        let embedUrl = convertDriveEmbedLink(rawImgUrl);
        let directUrl = convertDriveDirectLink(rawImgUrl);

        let luachonList = [
            { text: item.LuaChon_A },
            { text: item.LuaChon_I },
            { text: item.LuaChon_U },
            { text: item.LuaChon_E },
            { text: item.LuaChon_O },
            { text: item.LuaChon_Ka }
        ].filter(opt => opt.text);

        htmlNoiDung += `
            <div class="p-5 bg-gradient-to-r from-blue-50/30 to-slate-50 border border-slate-200 rounded-xl shadow-sm space-y-4">
                <div class="flex justify-between items-center">
                    <span class="text-xs bg-red-100 text-red-800 px-2.5 py-1 rounded-full font-bold">${chude}</span>
                    <span class="text-sm font-bold text-blue-900">Câu ${index + 1}: ${tieude}</span>
                </div>
                ${embedUrl ? `
                    <div class="w-full bg-slate-900 rounded-xl p-2 border border-slate-300 shadow-inner space-y-2">
                        <iframe src="${embedUrl}" class="w-full h-[320px] rounded-lg border-0" allow="autoplay" loading="lazy"></iframe>
                        <div class="text-center pb-1">
                            <a href="${directUrl}" target="_blank" class="text-xs bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg inline-flex items-center space-x-1 font-semibold transition">
                                <span>🔗 Mở hình ảnh lớn trên Google Drive</span>
                            </a>
                        </div>
                    </div>
                ` : ''}
                <div class="space-y-2 bg-white p-4 rounded-lg border border-slate-100">
                    <div class="text-slate-900 font-bold text-base whitespace-pre-line">🇯🇵 ${deJP}</div>
                    <div class="text-slate-600 text-sm italic whitespace-pre-line border-t pt-2">🇻🇳 ${deVN}</div>
                </div>
                <div class="space-y-2">
                    <p class="text-xs font-bold text-slate-500 uppercase">👉 Chọn phương án:</p>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-2">
        `;

        luachonList.forEach(opt => {
            htmlNoiDung += `
                <div onclick="toggleSafetyOption(this)" class="p-3 bg-white hover:bg-amber-50 border border-slate-200 hover:border-amber-300 rounded-xl text-sm text-slate-800 font-medium transition shadow-2xs cursor-pointer flex items-center space-x-3 select-none">
                    <div class="w-6 h-6 flex items-center justify-center rounded-lg bg-slate-100 text-slate-600 font-bold text-xs shrink-0 box-mark border border-slate-300">◯</div>
                    <span>${opt.text}</span>
                </div>
            `;
        });

        htmlNoiDung += `
                    </div>
                </div>
                <button onclick="toggleSafetyAnswer(${index})" id="btn-safe-${index}" class="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold rounded-lg transition shadow-sm cursor-pointer flex items-center space-x-2">
                    <span>👁️ Xem đáp án & Giải thích</span>
                </button>
                <div id="safe-ans-${index}" style="display: none;" class="space-y-3 pt-3 border-t border-slate-200">
                    <div class="p-3 bg-green-50 text-green-900 rounded-lg text-sm font-bold border border-green-200">
                        ✅ Đáp án đúng: ${dapan}
                    </div>
                    ${giaithich ? `<div class="p-3 bg-slate-100 text-slate-800 rounded-lg text-sm whitespace-pre-line border border-slate-200"><strong>💡 Giải thích chi tiết:</strong><br>${giaithich}</div>` : ''}
                </div>
            </div>
        `;
    });

    htmlNoiDung += `</div></div>`;
    safetyTab.innerHTML = htmlNoiDung;
}

// ================= TẢI VÀ HIỂN THỊ TAB 6: QUY TRÌNH & MINI-GAME SẮP XẾP =================
async function taiRiengTatCaFileQuyTrinh() {
    if (duLieuQuyTrinhKho.precut.length > 0) return;

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
                            stt: Number(values[0]) || (idx + 1),
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

async function hienThiGiaoDienQuyTrinh(loaiHienTai) {
    await taiRiengTatCaFileQuyTrinh();

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

    let danhSachGoc = duLieuQuyTrinhKho[loaiHienTai] || [];

    // Khởi tạo mảng xáo trộn ngẫu nhiên nếu đổi quy trình hoặc chưa có
    if (!window.shuffledState || window.shuffledStateKey !== loaiHienTai) {
        window.shuffledStateKey = loaiHienTai;
        window.shuffledState = [...danhSachGoc].sort(() => Math.random() - 0.5);
    }

    let danhSachHienTai = window.shuffledState;

    let menuNutBam = [
        { id: 'precut', name: '🏠 Nhà Gỗ Pre-cut' },
        { id: 'seizai', name: '🪵 Xẻ Gỗ (Seizai)' },
        { id: 'shuuseizai', name: '🪵 Gỗ Ghép (Shuuseizai)' },
        { id: 'goubanLVL', name: '📦 Ván Ép / LVL' },
        { id: 'flooring', name: '🟫 Sàn Gỗ (Flooring)' },
        { id: 'tsukita', name: '📃 Ván Lạng (Tsukita)' },
        { id: 'chip', name: '🪵 Dăm Gỗ / Bột Giấy' }
    ];

    let anhDaiDien = (danhSachGoc.length > 0 && danhSachGoc[0].hinhAnh) ? danhSachGoc[0].hinhAnh : "";
    let embedUrl = convertDriveEmbedLink(anhDaiDien);
    let directUrl = convertDriveDirectLink(anhDaiDien);

    let htmlNoiDung = `
        <div class="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-5">
            <div class="border-b pb-3 flex justify-between items-center flex-wrap gap-2">
                <div>
                    <h2 class="text-lg font-bold text-blue-900">⚙️ 6. Quy Trình Sản Xuất & Ghép Nối Chuyên Ngành Gỗ</h2>
                    <p class="text-xs text-slate-500">🎮 Thực hành: Sắp xếp các bước quy trình theo đúng thứ tự thực tế</p>
                </div>
                <button onclick="xaoTronLaiQuyTrinh('${loaiHienTai}')" class="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold rounded-lg transition shadow-xs cursor-pointer">
                    🔀 Đảo lại vị trí các bước
                </button>
            </div>

            <!-- Thanh chọn loại quy trình -->
            <div class="flex flex-wrap gap-2 pb-2 border-b border-slate-100">
    `;

    menuNutBam.forEach(item => {
        let activeClass = (item.id === loaiHienTai) ? "bg-blue-600 text-white font-bold shadow-sm" : "bg-slate-100 hover:bg-slate-200 text-slate-700";
        htmlNoiDung += `
            <button onclick="chuyenDoiQuyTrinh('${item.id}')" class="px-3.5 py-2 rounded-xl text-xs transition cursor-pointer ${activeClass}">
                ${item.name}
            </button>
        `;
    });

    htmlNoiDung += `
            </div>

            <!-- 1 ẢNH SƠ ĐỒ ĐẠI DIỆN DUY NHẤT -->
            ${embedUrl ? `
                <div class="w-full bg-slate-900 rounded-xl p-3 border border-slate-300 shadow-md space-y-2">
                    <div class="text-xs text-slate-200 font-bold uppercase tracking-wider text-center pb-1">🗺️ Sơ đồ tổng quan quy trình sản xuất (Tham khảo)</div>
                    <iframe src="${embedUrl}" class="w-full h-[280px] rounded-lg border-0" allow="autoplay" loading="lazy"></iframe>
                    <div class="text-center pt-1">
                        <a href="${directUrl}" target="_blank" class="text-xs bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg inline-flex items-center space-x-1 font-semibold transition">
                            <span>🔗 Mở sơ đồ lớn trên Google Drive</span>
                        </a>
                    </div>
                </div>
            ` : ''}

            <div class="p-3 bg-blue-50 text-blue-900 rounded-xl text-xs font-semibold flex items-center justify-between border border-blue-200">
                <span>👉 Hãy bấm nút ⬆️ ⬇️ để di chuyển các bước về đúng vị trí từ 1 đến 10. Khi hoàn thành, hệ thống sẽ tự chấm điểm!</span>
                <span id="status-badge-${loaiHienTai}" class="px-2.5 py-1 bg-amber-100 text-amber-800 rounded-full font-bold">⏳ Đang sắp xếp...</span>
            </div>

            <!-- DANH SÁCH BƯỚC ĐỂ SẮP XẾP -->
            <div class="space-y-3 max-h-[500px] overflow-y-auto pr-2" id="list-container-${loaiHienTai}">
    `;

    danhSachHienTai.forEach((item, index) => {
        htmlNoiDung += `
            <div class="step-card p-3.5 bg-slate-50 border border-slate-200 rounded-xl shadow-2xs flex items-center justify-between gap-3 transition" data-stt="${item.stt}">
                <div class="flex items-center space-x-3">
                    <div class="flex flex-col gap-1">
                        <button onclick="diChuyenBuoc('${loaiHienTai}', ${index}, -1)" class="w-6 h-6 bg-slate-200 hover:bg-blue-600 hover:text-white rounded text-xs font-bold transition cursor-pointer flex items-center justify-center" title="Đưa lên">▲</button>
                        <button onclick="diChuyenBuoc('${loaiHienTai}', ${index}, 1)" class="w-6 h-6 bg-slate-200 hover:bg-blue-600 hover:text-white rounded text-xs font-bold transition cursor-pointer flex items-center justify-center" title="Đưa xuống">▼</button>
                    </div>
                    <span class="w-8 h-8 flex items-center justify-center bg-blue-900 text-white font-bold rounded-lg text-xs shrink-0">#${index + 1}</span>
                    <div>
                        <div class="text-slate-900 font-bold text-sm">🇯🇵 ${item.tuVungJP}</div>
                        <div class="text-slate-600 text-xs italic">🇻🇳 ${item.nghiaVN}</div>
                    </div>
                </div>
                ${item.giaiThich ? `<div class="hidden md:block text-[11px] text-slate-500 max-w-xs truncate" title="${item.giaiThich}">💡 ${item.giaiThich}</div>` : ''}
            </div>
        `;
    });

    htmlNoiDung += `</div>
            <div class="pt-2 text-center">
                <button onclick="kiemTraKetQuaQuyTrinh('${loaiHienTai}')" class="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold rounded-xl transition shadow-sm cursor-pointer inline-flex items-center space-x-2">
                    <span>✨ Kiểm tra kết quả sắp xếp</span>
                </button>
            </div>
        </div>`;

    workflowTab.innerHTML = htmlNoiDung;
}

function chuyenDoiQuyTrinh(loaiID) {
    window.shuffledStateKey = loaiID;
    let danhSachGoc = duLieuQuyTrinhKho[loaiID] || [];
    window.shuffledState = [...danhSachGoc].sort(() => Math.random() - 0.5);
    hienThiGiaoDienQuyTrinh(loaiID);
}

function xaoTronLaiQuyTrinh(loaiID) {
    let danhSachGoc = duLieuQuyTrinhKho[loaiID] || [];
    window.shuffledState = [...danhSachGoc].sort(() => Math.random() - 0.5);
    hienThiGiaoDienQuyTrinh(loaiID);
}

function diChuyenBuoc(loaiID, index, direction) {
    let list = window.shuffledState;
    let targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= list.length) return;

    let temp = list[index];
    list[index] = list[targetIndex];
    list[targetIndex] = temp;

    hienThiGiaoDienQuyTrinh(loaiID);
}

function kiemTraKetQuaQuyTrinh(loaiID) {
    let currentList = window.shuffledState;
    let cards = document.querySelectorAll(`#list-container-${loaiID} .step-card`);
    let badge = document.getElementById(`status-badge-${loaiID}`);

    let isAllCorrect = true;

    currentList.forEach((item, index) => {
        if (item.stt === (index + 1)) {
            if (cards[index]) {
                cards[index].classList.remove('bg-red-50', 'border-red-300');
                cards[index].classList.add('bg-green-50', 'border-green-400');
            }
        } else {
            isAllCorrect = false;
            if (cards[index]) {
                cards[index].classList.remove('bg-green-50', 'border-green-400');
                cards[index].classList.add('bg-red-50', 'border-red-300');
            }
        }
    });

    if (isAllCorrect) {
        if (badge) {
            badge.className = "px-2.5 py-1 bg-green-100 text-green-800 rounded-full font-bold";
            badge.innerText = "🎉 Chính xác tuyệt đối 100%!";
        }
        alert("🎉 Chúc mừng bạn! Bạn đã sắp xếp đúng toàn bộ các bước trong quy trình sản xuất!");
    } else {
        if (badge) {
            badge.className = "px-2.5 py-1 bg-red-100 text-red-800 rounded-full font-bold";
            badge.innerText = "❌ Có bước chưa đúng vị trí!";
        }
        alert("❌ Vẫn còn bước sắp xếp sai (hiển thị khung đỏ). Bạn hãy điều chỉnh lại vị trí các bước và kiểm tra lại nhé!");
    }
}
