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
});

function enterApp() {
    const splashScreen = document.getElementById('splash-screen');
    if (splashScreen) {
        splashScreen.style.opacity = '0';
        setTimeout(() => { splashScreen.style.display = 'none'; }, 700);
    }
}

// Hàm chuyển tab thông minh
function switchTab(rawTabId) {
    let tabId = String(rawTabId || '').toLowerCase().replace('tab-', '');
    console.log("📌 Đang chuyển sang tab:", tabId);

    document.querySelectorAll('.tab-content').forEach(tab => tab.classList.add('hidden'));
    
    let activeTab = document.getElementById('tab-' + tabId) || 
                    document.getElementById(tabId) || 
                    document.getElementById('tab-quy-trinh') || 
                    document.getElementById('tab-workflow') || 
                    document.getElementById('tab-6');

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
        console.log("✅ Đã kích hoạt hiển thị tab thành công:", activeTab.id || activeTab.className);
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
        taiRiengTatCaFileQuyTrinh();
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

// ================= TẢI VÀ HIỂN THỊ TAB 6: QUY TRÌNH (BẢN AN TOÀN TUYỆT ĐỐI & CÓ LOG DEBUG) =================
async function taiRiengTatCaFileQuyTrinh() {
    console.log("⚙️ Bắt đầu tải 7 file quy trình sản xuất...");
    
    // Tìm chính xác phần tử hiển thị của tab 6 theo mọi ID có thể
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
    
    if (!workflowTab) {
        console.error("❌ Không tìm thấy khung chứa Tab 6 trong HTML!");
        return;
    }

    console.log("✅ Đã tìm thấy khung chứa Tab 6:", workflowTab);

    // Nếu chưa tải dữ liệu, tiến hành fetch đồng loạt
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
                let url = `./${filesMap[key]}`;
                console.log(`📥 Đang fetch file: ${url}`);
                let res = await fetch(url);
                if (res.ok) {
                    let data = await res.json();
                    console.log(`✅ Tải thành công ${filesMap[key]}, số dòng:`, data.length);
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
                        console.log(`✨ Đã lọc thành công ${danhSachbuoc.length} bước cho ${key}`);
                    }
                } else {
                    console.warn(`⚠️ Không tìm thấy file ${filesMap[key]} (Mã lỗi: ${res.status})`);
                }
            } catch(e) {
                console.error(`❌ Lỗi đọc file ${filesMap[key]}:`, e);
            }
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
    console.log(`🖥️ Đang vẽ giao diện quy trình [${loaiHienTai}], số bước hiển thị:`, danhSachHienTai.length);

    let menuNutBam = [
        { id: 'precut', name: '🏠 Nhà Gỗ Pre-cut' },
        { id: 'seizai', name: '🪵 Xẻ Gỗ (Seizai)' },
        { id: 'shuuseizai', name: '🪵 Gỗ Ghép (Shuuseizai)' },
        { id: 'goubanLVL', name: '📦 Ván Ép / LVL' },
        { id: 'flooring', name: '🟫 Sàn Gỗ (Flooring)' },
        { id: 'tsukita', name: '📃 Ván Lạng (Tsukita)' },
        { id: 'chip', name: '🪵 Dăm Gỗ / Bột Giấy' }
    ];

    let htmlNoiDung = `
        <div class="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-5">
            <div class="border-b pb-3">
                <h2 class="text-lg font-bold text-blue-900">⚙️ 6. Quy Trình Sản Xuất & Ghép Nối Chuyên Ngành Gỗ</h2>
                <p class="text-xs text-slate-500">木材加工・製造工程 (Kotei Mondai) - Hệ thống 7 quy trình thực chiến</p>
            </div>

            <!-- Thanh chọn loại quy trình -->
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

            <!-- Danh sách nội dung quy trình -->
            <div class="space-y-4 max-h-[620px] overflow-y-auto pr-2">
    `;

    if (danhSachHienTai.length === 0) {
        htmlNoiDung += `
            <div class="p-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-300 space-y-2">
                <p class="text-slate-600 font-semibold">⏳ Đang tải dữ liệu hoặc file JSON chưa sẵn sàng.</p>
                <p class="text-xs text-slate-400">Hãy nhấn F12 kiểm tra bảng Console xem có file nào bị báo lỗi 404 không chị nhé!</p>
            </div>
        `;
    } else {
        danhSachHienTai.forEach((item, index) => {
            let embedUrl = convertDriveEmbedLink(item.hinhAnh);
            let directUrl = convertDriveDirectLink(item.hinhAnh);

            htmlNoiDung += `
                <div class="p-5 bg-gradient-to-r from-blue-50/20 to-slate-50 border border-slate-200 rounded-xl shadow-sm space-y-3">
                    <div class="flex justify-between items-center">
                        <span class="text-xs bg-indigo-100 text-indigo-800 px-2.5 py-1 rounded-full font-bold">Bước #${item.stt || (index + 1)}</span>
                    </div>

                    ${embedUrl ? `
                        <div class="w-full bg-slate-900 rounded-xl p-2 border border-slate-300 shadow-inner space-y-2">
                            <iframe src="${embedUrl}" class="w-full h-[280px] rounded-lg border-0" allow="autoplay" loading="lazy"></iframe>
                            <div class="text-center pb-1">
                                <a href="${directUrl}" target="_blank" class="text-xs bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded-lg inline-flex items-center space-x-1 font-semibold transition">
                                    <span>🔗 Mở ảnh quy trình lớn trên Google Drive</span>
                                </a>
                            </div>
                        </div>
                    ` : ''}

                    <div class="space-y-2 bg-white p-4 rounded-lg border border-slate-100">
                        <div class="text-slate-900 font-bold text-base whitespace-pre-line">🇯🇵 ${item.tuVungJP}</div>
                        <div class="text-slate-600 text-sm italic whitespace-pre-line border-t pt-2">🇻🇳 ${item.nghiaVN}</div>
                    </div>

                    ${item.giaiThich ? `
                        <div class="p-3 bg-slate-100 text-slate-800 rounded-lg text-sm whitespace-pre-line border border-slate-200">
                            <strong>💡 Giải thích chi tiết:</strong><br>${item.giaiThich}
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
