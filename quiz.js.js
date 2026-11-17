// ================= HỆ THỐNG ĐIỀU PHỐI DỮ LIỆU & TRẮC NGHIỆM CHI TIẾT =================
let allQuestions = [];
let vocabData = [];
let calcData = [];
let safetyData = [];
let processData = [];

let currentQuizList = [];
let currentIndex = 0;
let score = 0;

document.addEventListener('DOMContentLoaded', () => {
    loadAllProjectFiles();
});

// 1. Tự động tải và phân loại toàn bộ các file JSON vào từng module tương ứng
async function loadAllProjectFiles() {
    console.log("⏳ Đang kết nối dữ liệu chuyên ngành gỗ...");
    
    // Tải Từ Vựng
    try {
        let res = await fetch('TuVung.json');
        if (res.ok) vocabData = await res.json();
    } catch(e) { console.log("Thiếu file TuVung.json"); }

    // Tải Bài Tập Tính Toán
    try {
        let res = await fetch('BaiTapTinhToan.json');
        if (res.ok) calcData = await res.json();
    } catch(e) { console.log("Thiếu file BaiTapTinhToan.json"); }

    // Tải Nhận Dạng An Toàn
    try {
        let res = await fetch('NhanDangHinhAnh.json');
        if (res.ok) safetyData = await res.json();
    } catch(e) { console.log("Thiếu file NhanDangHinhAnh.json"); }

    // Tải các file Quy Trình (Ghép nối)
    const processFiles = [
        "GhepNoi_Seizai.json", "GhepNoi_Shuuseizai.json", "GhepNoi_GoubanLVL.json",
        "GhepNoi_Tsukita.json", "GhepNoi_Flooring.json", "GhepNoi_Chip.json", "GhepNoi_Precut.json"
    ];
    for (let file of processFiles) {
        try {
            let res = await fetch(file);
            if (res.ok) {
                let data = await res.json();
                if (Array.isArray(data)) processData = processData.concat(data);
            }
        } catch(e) {}
    }

    // Tải 1860 câu hỏi chính
    try {
        let res = await fetch('CauHoi_1860.json');
        if (res.ok) {
            let data = await res.json();
            if (Array.isArray(data)) allQuestions = allQuestions.concat(data);
        }
    } catch(e) { console.log("Thiếu file CauHoi_1860.json"); }

    // Gộp toàn bộ làm nguồn luyện tập mặc định cho Tab Luyện Tập
    currentQuizList = allQuestions.length > 0 ? allQuestions : vocabData;
    
    // Hiển thị dữ liệu lên giao diện các tab tương ứng
    renderVocabularyTab();
    renderCalculationTab();
    renderSafetyTab();
    renderProcessTab();
    
    if (currentQuizList.length > 0) {
        renderQuestion();
    } else {
        displayMessage("⚠️ Chưa tìm thấy dữ liệu câu hỏi. Bạn hãy kiểm tra lại các file JSON trong thư mục nhé!");
    }
}

// 2. Đổ dữ liệu vào Tab 1: Từ Vựng
function renderVocabularyTab() {
    const container = document.querySelector('#tab-vocab .bg-white');
    if (!container) return;

    if (vocabData.length === 0) {
        container.innerHTML = `<h2 class="text-lg font-bold text-blue-900 mb-1">📖 Từ Vựng Chuyên Ngành Gỗ</h2><p class="text-xs text-slate-500 mb-4">専門用語 (Senmon Yougo)</p><p class="text-sm text-slate-500">Đang cập nhật danh sách từ vựng...</p>`;
        return;
    }

    let html = `<h2 class="text-lg font-bold text-blue-900 mb-1">📖 Từ Vựng Chuyên Ngành Gỗ (${vocabData.length} từ)</h2><p class="text-xs text-slate-500 mb-4">専門用語 (Senmon Yougo)</p><div class="space-y-3 max-h-[500px] overflow-y-auto pr-2">`;
    vocabData.forEach((item, idx) => {
        html += `<div class="p-3 bg-slate-50 border border-slate-200 rounded-lg flex justify-between items-center">
            <div>
                <p class="font-bold text-blue-900 text-sm">${item.TuVung || item.Kanji || item.question || "Thuật ngữ " + (idx+1)}</p>
                <p class="text-xs text-slate-600 mt-0.5">${item.NghiaVN || item.Meaning || item.answer || ""}</p>
            </div>
            <span class="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded font-medium">Từ ${idx+1}</span>
        </div>`;
    });
    html += `</div>`;
    container.innerHTML = html;
}

// 3. Đổ dữ liệu vào Tab 4: Tính Toán
function renderCalculationTab() {
    const container = document.querySelector('#tab-calc .bg-white');
    if (!container) return;

    if (calcData.length === 0) return;

    let html = `<h2 class="text-lg font-bold text-blue-900 mb-1">🧮 Bài Tập Tính Toán Thực Chiến (${calcData.length} bài)</h2><p class="text-xs text-slate-500 mb-4">計算問題 (Keisan Mondai)</p><div class="space-y-4 max-h-[500px] overflow-y-auto pr-2">`;
    calcData.forEach((item, idx) => {
        html += `<div class="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
            <h3 class="font-bold text-blue-900 text-sm">Bài ${idx+1}: ${item.TieuDeBai || item.question || ""}</h3>
            <p class="text-xs text-slate-700 font-medium bg-white p-2.5 rounded border border-slate-100">📌 Đề bài: ${item.DeBaigoc || item.content || ""}</p>
            <p class="text-xs text-emerald-700 font-medium">💡 Công thức: ${item.CongThuc || "Đang cập nhật..."}</p>
            <p class="text-xs text-blue-700 font-medium">🎯 Đáp án: ${item.DapAnDung || item.answer || ""}</p>
        </div>`;
    });
    html += `</div>`;
    container.innerHTML = html;
}

// 4. Đổ dữ liệu vào Tab 5: An Toàn Lao Động
function renderSafetyTab() {
    const container = document.querySelector('#tab-safety .bg-white');
    if (!container) return;

    if (safetyData.length === 0) return;

    let html = `<h2 class="text-lg font-bold text-blue-900 mb-1">🛡️ Nhận Dạng Hình Ảnh An Toàn (${safetyData.length} câu)</h2><p class="text-xs text-slate-500 mb-4">安全作業画像認識の課題</p><div class="space-y-3 max-h-[500px] overflow-y-auto pr-2">`;
    safetyData.forEach((item, idx) => {
        html += `<div class="p-3 bg-slate-50 border border-slate-200 rounded-lg">
            <p class="font-bold text-slate-800 text-sm">Câu ${idx+1}: ${item.question || item.TieuDeBai || ""}</p>
            <p class="text-xs text-blue-800 mt-1">✓ Đáp án: ${item.answer || item.DapAnDung || ""}</p>
        </div>`;
    });
    html += `</div>`;
    container.innerHTML = html;
}

// 5. Đổ dữ liệu vào Tab 6: Quy Trình Sản Xuất
function renderProcessTab() {
    const container = document.querySelector('#tab-process .bg-white');
    if (!container) return;

    if (processData.length === 0) return;

    let html = `<h2 class="text-lg font-bold text-blue-900 mb-1">🔄 Quy Trình Sản Xuất & Ghép Nối (${processData.length} mục)</h2><p class="text-xs text-slate-500 mb-4">製造工程の画像認識とマッチング</p><div class="space-y-3 max-h-[500px] overflow-y-auto pr-2">`;
    processData.forEach((item, idx) => {
        html += `<div class="p-3 bg-slate-50 border border-slate-200 rounded-lg">
            <p class="font-bold text-slate-800 text-sm">Quy trình ${idx+1}: ${item.question || item.TieuDeBai || "Ghép nối chi tiết"}</p>
            <p class="text-xs text-blue-800 mt-1">✓ Trình tự chuẩn: ${item.answer || item.DapAnDung || ""}</p>
        </div>`;
    });
    html += `</div>`;
    container.innerHTML = html;
}

// 6. Logic Luyện Tập Trắc Nghiệm (Tab 2)
function renderQuestion() {
    if (currentQuizList.length === 0) return;
    
    let q = currentQuizList[currentIndex];
    
    const progressEl = document.getElementById('quiz-progress');
    if (progressEl) progressEl.innerText = `Câu ${currentIndex + 1} / ${currentQuizList.length}`;

    const questionTextEl = document.getElementById('question-text');
    if (questionTextEl) {
        questionTextEl.innerText = q.question || q.DeBaigoc || q.TieuDeBai || "Nội dung câu hỏi...";
    }

    let optsContainer = document.getElementById('options-container');
    if (optsContainer) optsContainer.innerHTML = '';
    
    const expBox = document.getElementById('explanation-box');
    if (expBox) {
        expBox.classList.add('hidden');
        expBox.innerText = '';
    }

    let options = q.options || [q.A, q.B, q.C, q.D].filter(Boolean);
    if (options.length === 0) options = ["〇 (Đúng)", "✕ (Sai)"];

    options.forEach(opt => {
        let btn = document.createElement('button');
        btn.className = "w-full text-left px-4 py-3 bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-300 rounded-lg text-sm font-medium transition cursor-pointer flex items-center justify-between";
        btn.innerText = opt;
        btn.onclick = () => checkAnswer(btn, opt, q.answer || q.DapAnDung, q.GiaiThich || q.CacBướcGiai);
        if (optsContainer) optsContainer.appendChild(btn);
    });
}

function checkAnswer(button, selectedOption, correctAnswer, explanation) {
    let optsContainer = document.getElementById('options-container');
    if (!optsContainer) return;

    let buttons = optsContainer.getElementsByTagName('button');
    for (let b of buttons) {
        b.disabled = true;
        if (correctAnswer && b.innerText.trim() === String(correctAnswer).trim()) {
            b.classList.add('bg-green-100', 'border-green-500', 'text-green-900', 'font-bold');
        }
    }

    const isCorrect = correctAnswer ? (selectedOption.trim() === String(correctAnswer).trim()) : true;
    if (isCorrect) {
        button.classList.add('bg-green-500', 'text-white', 'border-green-600');
        score++;
        playSuccessSound();
    } else {
        button.classList.add('bg-red-100', 'border-red-500', 'text-red-900');
    }

    let expBox = document.getElementById('explanation-box');
    if (expBox && (explanation || correctAnswer)) {
        expBox.innerText = explanation ? `💡 Giải thích: ${explanation}` : `💡 Đáp án chính xác: ${correctAnswer}`;
        expBox.classList.remove('hidden');
    }
}

function nextQuestion() {
    if (currentIndex < currentQuizList.length - 1) {
        currentIndex++;
        renderQuestion();
    } else {
        alert(`🎉 Chúc mừng bạn đã hoàn thành! Tổng số câu đúng: ${score} / ${currentQuizList.length}`);
    }
}

function prevQuestion() {
    if (currentIndex > 0) {
        currentIndex--;
        renderQuestion();
    }
}

function playSuccessSound() {
    try {
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(587.33, audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.15);
        gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.3);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.3);
    } catch (e) {}
}

function displayMessage(msg) {
    const questionTextEl = document.getElementById('question-text');
    if (questionTextEl) questionTextEl.innerText = msg;
}