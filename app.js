// ================= HỆ THỐNG KẾT NỐI CHUYÊN BIỆT TỪNG FILE - HSJ WOOD APP =================
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
                    document.getElementById('tab-tinh-toan') || 
                    document.getElementById('tab-calculation') || 
                    document.getElementById('tab-4') || 
                    document.getElementById(tabId) ||
                    document.getElementById('calc');

    if (!activeTab && (tabId === 'calc' || tabId === 'tinh-toan' || tabId === '4')) {
        let tabs = document.querySelectorAll('.tab-content');
        if (tabs[3]) activeTab = tabs[3];
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
    } else if (tabId === 'practice' || tabId === 'exam') {
        questions = tatCaDuLieuKho.filter(item => (item.NoiDungJP || item.question) && !item.TuVungJP);
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
        questions = tatCaDuLieuKho.filter(item => (item.NoiDungJP || item.question) && !item.TuVungJP);
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

// Hàm tải chuyên biệt file BaiTapTinhToan.json chuẩn xác cấu trúc
async function taiRiengFileTinhToan() {
    let calcTab = document.getElementById('tab-calc') || 
                  document.getElementById('tab-tinh-toan') || 
                  document.getElementById('tab-tinh_toan') ||
                  document.getElementById('tab-4') || 
                  document.getElementById('calc');
                  
    if (!calcTab) {
        let tabs = document.querySelectorAll('.tab-content');
        if (tabs[3]) calcTab = tabs[3];
    }
    if (!calcTab) return;

    calcTab.innerHTML = `<div class="p-6 text-center text-slate-500">⏳ Đang tải bài tập tính toán...</div>`;

    try {
        let res = await fetch('./BaiTapTinhToan.json');
        if (res.ok) {
            let data = await res.json();
            let danhSach = Array.isArray(data) ? data : (data.data || data.questions || Object.values(data)[0] || []);
            if (Array.isArray(danhSach) && danhSach.length > 0) {
                hienThiBaiTapTinhToan(danhSach);
            } else {
                calcTab.innerHTML = `<div class="p-6 text-center text-red-500">⚠️ File BaiTapTinhToan.json trống dữ liệu.</div>`;
            }
        }
    } catch (e) { 
        calcTab.innerHTML = `<div class="p-6 text-center text-red-500">⚠️ Lỗi tải file BaiTapTinhToan.json</div>`;
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

// Hiển thị chuẩn xác Bài Tập Tính Toán (Bóc tách đúng theo cấu trúc file JSON thực tế)
function hienThiBaiTapTinhToan(danhSach) {
    let calcTab = document.getElementById('tab-calc') || 
                  document.getElementById('tab-tinh-toan') || 
                  document.getElementById('tab-tinh_toan') ||
                  document.getElementById('tab-4') || 
                  document.getElementById('calc');
                  
    if (!calcTab) {
        let tabs = document.querySelectorAll('.tab-content');
        if (tabs[3]) calcTab = tabs[3];
    }
    if (!calcTab) return;

    // Lọc bỏ dòng tiêu đề đầu tiên trong file JSON (nếu có)
    let danhSachBaiTap = danhSach.filter(item => item.__2 || item.DeBaigoc || item.question);

    let htmlNoiDung = `
        <div class="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
            <div class="border-b pb-3">
                <h2 class="text-lg font-bold text-blue-900">🧮 Bài Tập Tính Toán Thực Chiến Ngành Gỗ</h2>
                <p class="text-xs text-slate-500">計算問題 (Keisan Mondai) - Tổng số: ${danhSachBaiTap.length} bài tập</p>
            </div>
            <div class="space-y-4 max-h-[650px] overflow-y-auto pr-2">
    `;

    danhSachBaiTap.forEach((item, index) => {
        let chude = item[""] || item.ChuDe || "Bài tập tính toán";
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
                ${congthuc ? `<div class="p-3 bg-blue-50 text-blue-900 rounded-lg text-sm border border-blue-100"><strong>📐 Công thức:</strong> ${congthuc}</div>` : ''}
                ${buocgiai ? `<div class="p-3 bg-slate-100 text-slate-800 rounded-lg text-sm whitespace-pre-line border border-slate-200"><strong>💡 Các bước giải:</strong><br>${buocgiai}</div>` : ''}
                ${dapan ? `<div class="p-3 bg-green-50 text-green-900 rounded-lg text-sm font-bold border border-green-200">✅ Đáp án: ${dapan}</div>` : ''}
            </div>
        `;
    });

    htmlNoiDung += `</div></div>`;
    calcTab.innerHTML = htmlNoiDung;
}

function renderQuestion() {
    if (!questions || questions.length === 0) return;
    let q = questions[currentIndex];
    if (q.TuVungJP) { nextQuestion(); return; }
    
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



 
