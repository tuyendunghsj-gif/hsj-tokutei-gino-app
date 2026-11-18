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

document.addEventListener('DOMContentLoaded', async () => {
    console.log("🚀 Đang khởi động hệ thống nạp dữ liệu HSJ Wood...");
    await taiTatCaDuLieu();
});

// Xử lý màn hình chào mở đầu
function enterApp() {
    const splashScreen = document.getElementById('splash-screen');
    if (splashScreen) {
        splashScreen.style.opacity = '0';
        setTimeout(() => { splashScreen.style.display = 'none'; }, 700);
    }
}

// Điều hướng Tab giao diện
function switchTab(tabId) {
    document.querySelectorAll('.tab-content').forEach(tab => tab.classList.add('hidden'));
    
    let activeTab = document.getElementById('tab-' + tabId) || 
                    document.getElementById('tab-an-toan') || 
                    document.getElementById('tab-safety') || 
                    document.getElementById('tab-5') || 
                    document.getElementById(tabId);

    if (!activeTab && (tabId === 'safety' || tabId === 'an-toan' || tabId === '5')) {
        let tabs = document.querySelectorAll('.tab-content');
        if (tabs[4]) activeTab = tabs[4];
    }
                    
    if (activeTab) activeTab.classList.remove('hidden');

    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('bg-blue-50', 'text-blue-800', 'font-bold');
        btn.classList.add('text-slate-600');
    });

    if (event && event.currentTarget) {
        event.currentTarget.classList.remove('text-slate-600');
        event.currentTarget.classList.add('bg-blue-50', 'text-blue-800', 'font-bold');
    }

    if (tabId === 'vocab') {
        let danhSachTuVung = tatCaDuLieuKho.filter(item => item.TuVungJP || item.ID_TuVung);
        if (danhSachTuVung.length > 0) {
            hienThiDanhSachTuVung(danhSachTuVung);
        } else {
            taiRiengFileVocab();
        }
    } else if (tabId === 'calc' || tabId === 'tinh-toan' || tabId === '4' || tabId === 'tinh_toan') {
        taiRiengFileTinhToan();
    } else if (tabId === 'safety' || tabId === 'an-toan' || tabId === '5') {
        taiRiengFileAnToan();
    } else if (tabId === 'practice' || tabId === 'exam') {
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
            if (Array.isArray(danhSach) && danhSach.length > 0) {
                hienThiBaiTapTinhToan(danhSach);
            }
        }
    } catch (e) {}
}

// Tải chuyên biệt file NhanDangHinhAnh.json
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
            } else {
                safetyTab.innerHTML = `<div class="p-6 text-center text-red-500">⚠️ File NhanDangHinhAnh.json trống dữ liệu.</div>`;
            }
        }
    } catch (e) { 
        safetyTab.innerHTML = `<div class="p-6 text-center text-red-500">⚠️ Lỗi tải file NhanDangHinhAnh.json</div>`;
    }
}

function parseTuVungJP(jpText) {
    if (!jpText) return { display: "", speech: "" };
    let hiraganaIndex = -1;
    for (let i = 0; i < jpText.length; i++) {
        let code = jpText.charCodeAt(i);
        if (code >= 0x3040 && code <= 0x309F) {
            hiraganaIndex = i;
            break;
        }
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

// Hàm chuyển đổi link Google Drive sang định dạng nhúng ảnh trực tiếp
function convertDriveLink(url) {
    if (!url) return "";
    let match = url.match(/\/d\/([a-zA-Z0-9_-]+)/);
    if (match && match[1]) {
        return `https://lh3.googleusercontent.com/d/${match[1]}`;
    }
    return url;
}

// Hiển thị Tab 5: Nhận Dạng Hình Ảnh & An Toàn Lao Động (Có Ảnh minh họa & Nút bấm chọn đáp án)
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
        let imgUrl = convertDriveLink(item.HinhAnhURL || "");

        let luachonList = [
            { key: "ア", text: item.LuaChon_A },
            { key: "イ", text: item.LuaChon_I },
            { key: "ウ", text: item.LuaChon_U },
            { key: "エ", text: item.LuaChon_E },
            { key: "オ", text: item.LuaChon_O },
            { key: "カ", text: item.LuaChon_Ka }
        ].filter(opt => opt.text);

        htmlNoiDung += `
            <div class="p-5 bg-gradient-to-r from-blue-50/30 to-slate-50 border border-slate-200 rounded-xl shadow-sm space-y-4">
                <div class="flex justify-between items-center">
                    <span class="text-xs bg-red-100 text-red-800 px-2.5 py-1 rounded-full font-bold">${chude}</span>
                    <span class="text-sm font-bold text-blue-900">Câu ${index + 1}: ${tieude}</span>
                </div>

                <!-- Hiển thị Hình ảnh minh họa (nếu có link) -->
                ${imgUrl ? `
                    <div class="flex justify-center bg-slate-900 rounded-xl p-2 border border-slate-300 shadow-inner">
                        <img src="${imgUrl}" alt="Hình minh họa an toàn" class="max-h-[300px] object-contain rounded-lg" onerror="this.onerror=null; this.parentElement.innerHTML='<div class=\'text-xs text-white p-4\'>⚠️ Không thể tải ảnh trực tiếp từ liên kết này.</div>';">
                    </div>
                ` : ''}

                <!-- Nội dung đề bài Nhật & Việt -->
                <div class="space-y-2 bg-white p-4 rounded-lg border border-slate-100 shadow-2xs">
                    <div class="text-slate-900 font-bold text-base whitespace-pre-line">🇯🇵 ${deJP}</div>
                    <div class="text-slate-600 text-sm italic whitespace-pre-line border-t pt-2">🇻🇳 ${deVN}</div>
                </div>

                <!-- Danh sách các lựa chọn có thể click chọn -->
                <div class="space-y-2">
                    <p class="text-xs font-bold text-slate-500 uppercase">👉 Chọn phương án (Click vào để chọn):</p>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-2">
        `;

        luachonList.forEach(opt => {
            let safeOptText = opt.text.replace(/'/g, "\\'");
            htmlNoiDung += `
                <button onclick="selectSafetyOption(this, ${index})" class="w-full text-left p-3 bg-white hover:bg-blue-50 border border-slate-200 hover:border-blue-300 rounded-xl text-sm text-slate-800 font-medium transition shadow-2xs cursor-pointer flex items-center space-x-2">
                    <span class="w-6 h-6 flex items-center justify-center rounded-full bg-slate-100 text-slate-700 font-bold text-xs shrink-0 checkbox-mark">◯</span>
                    <span>${opt.text}</span>
                </button>
            `;
        });

        htmlNoiDung += `
                    </div>
                </div>

                <!-- Nút bấm xem giải thích & đáp án -->
                <button onclick="toggleSafetyAnswer(${index})" id="btn-safe-${index}" class="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold rounded-lg transition shadow-sm cursor-pointer flex items-center space-x-2">
                    <span>👁️ Xem đáp án & Giải thích</span>
                </button>

                <!-- Khung đáp án ẩn -->
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

// Hàm tương tác khi học viên bấm chọn/bỏ chọn đáp án
function selectSafetyOption(button, questionIndex) {
    let mark = button.querySelector('.checkbox-mark');
    if (button.classList.contains('bg-blue-500')) {
        button.classList.remove('bg-blue-500', 'text-white', 'border-blue-600');
        button.classList.add('bg-white', 'text-slate-800', 'border-slate-200');
        if (mark) {
            mark.classList.remove('bg-white', 'text-blue-600');
            mark.classList.add('bg-slate-100', 'text-slate-700');
            mark.innerText = "◯";
        }
    } else {
        button.classList.add('bg-blue-500', 'text-white', 'border-blue-600');
        button.classList.remove('bg-white', 'text-slate-800', 'border-slate-200');
        if (mark) {
            mark.classList.remove('bg-slate-100', 'text-slate-700');
            mark.classList.add('bg-white', 'text-blue-600');
            mark.innerText = "✓";
        }
    }
}

// Hàm bật/tắt hiển thị đáp án phần An Toàn
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

