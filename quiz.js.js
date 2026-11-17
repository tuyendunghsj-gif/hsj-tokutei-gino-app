// ================= ĐỌC DỮ LIỆU TRỰC TIẾP TỪ BIẾN APP_DATA TRONG data.js =================
let currentQuizList = [];
let currentIndex = 0;
let score = 0;

document.addEventListener('DOMContentLoaded', () => {
    // Kiểm tra xem biến APP_DATA từ file data.js đã được tải chưa
    if (typeof APP_DATA !== 'undefined') {
        console.log("✅ Đã kết nối thành công dữ liệu nội bộ từ data.js!");
        
        // Gán dữ liệu cho phần luyện tập trắc nghiệm mặc định
        currentQuizList = APP_DATA.questions || [];

        // Đổ dữ liệu lên các tab tương ứng
        renderVocabularyTab();
        renderCalculationTab();
        renderSafetyTab();
        renderProcessTab();

        if (currentQuizList.length > 0) {
            renderQuestion();
        } else {
            displayMessage("⚠️ Chưa có câu hỏi trắc nghiệm nào trong data.js");
        }
    } else {
        console.log("⚠️ Không tìm thấy biến APP_DATA. Bạn hãy kiểm tra lại file data.js nhé!");
        displayMessage("⚠️ Lỗi: Không tải được file data.js");
    }
});

// 1. Hiển thị Tab 1: Từ Vựng
function renderVocabularyTab() {
    const container = document.querySelector('#tab-vocab .bg-white');
    if (!container || !APP_DATA.vocab) return;

    let html = `<h2 class="text-lg font-bold text-blue-900 mb-1">📖 Từ Vựng Chuyên Ngành Gỗ (${APP_DATA.vocab.length} từ)</h2><p class="text-xs text-slate-500 mb-4">専門用語 (Senmon Yougo)</p><div class="space-y-3 max-h-[500px] overflow-y-auto pr-2">`;
    APP_DATA.vocab.forEach((item, idx) => {
        html += `<div class="p-3 bg-slate-50 border border-slate-200 rounded-lg flex justify-between items-center">
            <div>
                <p class="font-bold text-blue-900 text-sm">${item.TuVung}</p>
                <p class="text-xs text-slate-600 mt-0.5">${item.NghiaVN}</p>
            </div>
            <span class="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded font-medium">Từ ${idx+1}</span>
        </div>`;
    });
    html += `</div>`;
    container.innerHTML = html;
}

// 2. Hiển thị Tab 4: Tính Toán
function renderCalculationTab() {
    const container = document.querySelector('#tab-calc .bg-white');
    if (!container || !APP_DATA.calc) return;

    let html = `<h2 class="text-lg font-bold text-blue-900 mb-1">🧮 Bài Tập Tính Toán Thực Chiến</h2><p class="text-xs text-slate-500 mb-4">計算問題 (Keisan Mondai)</p><div class="space-y-4 max-h-[500px] overflow-y-auto pr-2">`;
    APP_DATA.calc.forEach((item, idx) => {
        html += `<div class="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
            <h3 class="font-bold text-blue-900 text-sm">Bài ${idx+1}: ${item.TieuDeBai}</h3>
            <p class="text-xs text-slate-700 font-medium bg-white p-2.5 rounded border border-slate-100">📌 Đề bài: ${item.DeBaigoc}</p>
            <p class="text-xs text-emerald-700 font-medium">💡 Công thức: ${item.CongThuc}</p>
            <p class="text-xs text-blue-700 font-medium">🎯 Đáp án: ${item.DapAnDung}</p>
        </div>`;
    });
    html += `</div>`;
    container.innerHTML = html;
}

// 3. Hiển thị Tab 5: An Toàn Lao Động
function renderSafetyTab() {
    const container = document.querySelector('#tab-safety .bg-white');
    if (!container || !APP_DATA.safety) return;

    let html = `<h2 class="text-lg font-bold text-blue-900 mb-1">🛡️ Nhận Dạng Hình Ảnh An Toàn</h2><p class="text-xs text-slate-500 mb-4">安全作業画像認識の課題</p><div class="space-y-3 max-h-[500px] overflow-y-auto pr-2">`;
    APP_DATA.safety.forEach((item, idx) => {
        html += `<div class="p-3 bg-slate-50 border border-slate-200 rounded-lg">
            <p class="font-bold text-slate-800 text-sm">Câu ${idx+1}: ${item.question}</p>
            <p class="text-xs text-blue-800 mt-1">✓ Đáp án: ${item.answer}</p>
        </div>`;
    });
    html += `</div>`;
    container.innerHTML = html;
}

// 4. Hiển thị Tab 6: Quy Trình Sản Xuất
function renderProcessTab() {
    const container = document.querySelector('#tab-process .bg-white');
    if (!container || !APP_DATA.process) return;

    let html = `<h2 class="text-lg font-bold text-blue-900 mb-1">🔄 Quy Trình Sản Xuất & Ghép Nối</h2><p class="text-xs text-slate-500 mb-4">製造工程の画像認識とマッチング</p><div class="space-y-3 max-h-[500px] overflow-y-auto pr-2">`;
    APP_DATA.process.forEach((item, idx) => {
        html += `<div class="p-3 bg-slate-50 border border-slate-200 rounded-lg">
            <p class="font-bold text-slate-800 text-sm">Quy trình ${idx+1}: ${item.question}</p>
            <p class="text-xs text-blue-800 mt-1">✓ Trình tự chuẩn: ${item.answer}</p>
        </div>`;
    });
    html += `</div>`;
    container.innerHTML = html;
}

// 5. Logic Luyện Tập Trắc Nghiệm (Tab 2)
function renderQuestion() {
    if (currentQuizList.length === 0) return;
    
    let q = currentQuizList[currentIndex];
    
    const progressEl = document.getElementById('quiz-progress');
    if (progressEl) progressEl.innerText = `Câu ${currentIndex + 1} / ${currentQuizList.length}`;

    const questionTextEl = document.getElementById('question-text');
    if (questionTextEl) {
        questionTextEl.innerText = q.question;
    }

    let optsContainer = document.getElementById('options-container');
    if (optsContainer) optsContainer.innerHTML = '';
    
    const expBox = document.getElementById('explanation-box');
    if (expBox) {
        expBox.classList.add('hidden');
        expBox.innerText = '';
    }

    let options = q.options || [];

    options.forEach(opt => {
        let btn = document.createElement('button');
        btn.className = "w-full text-left px-4 py-3 bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-300 rounded-lg text-sm font-medium transition cursor-pointer flex items-center justify-between";
        btn.innerText = opt;
        btn.onclick = () => checkAnswer(btn, opt, q.answer, q.GiaiThich);
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

    const isCorrect = (selectedOption.trim() === String(correctAnswer).trim());
    if (isCorrect) {
        button.classList.add('bg-green-500', 'text-white', 'border-green-600');
        score++;
        playSuccessSound();
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