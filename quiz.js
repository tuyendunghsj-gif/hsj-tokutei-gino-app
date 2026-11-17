// ================= DỮ LIỆU TÍCH HỢP TRỰC TIẾP (KHÔNG BỊ CHẶN BỞI GITHUB) =================
let allQuestions = [
    { question: "Thuật ngữ tiếng Nhật cho 'An toàn lao động' trong xưởng gỗ là gì?", options: ["A. 安全作業 (Anzen sagyou)", "B. 製造工程 (Seizou katei)", "C. 品質管理 (Hinshitsu kanri)", "D. 乾燥 (Kansou)"], answer: "A. 安全作業 (Anzen sagyou)", GiaiThich: "Anzen sagyou là quy trình làm việc an toàn, bắt buộc tuân thủ trong xưởng chế biến gỗ." },
    { question: "Quy trình nào dùng để cưa xẻ gỗ tròn thành gỗ xẻ thanh?", options: ["A. プレカット (Pre-cut)", "B. 製材 (Seizai)", "C. 合板 (Gouban)", "D. チップ (Chip)"], answer: "B. 製材 (Seizai)", GiaiThich: "Seizai (製材) là công đoạn cưa xẻ gỗ tròn thành các quy cách thương mại." },
    { question: "Độ ẩm của gỗ (含水率 - Kansuiritsu) dùng để làm gì trước khi gia công?", options: ["A. Tăng trọng lượng gỗ", "B. Đảm bảo gỗ không bị cong vênh, nứt nẻ", "C. Làm gỗ mềm hơn để dễ đốt", "D. Tăng độ bám bụi"], answer: "B. Đảm bảo gỗ không bị cong vênh, nứt nẻ", GiaiThich: "Kiểm soát độ ẩm giúp gỗ ổn định kích thước, tránh biến dạng sau khi sản xuất." }
];

let vocabData = [
    { TuVung: "製材 (Seizai)", NghiaVN: "Cưa xẻ gỗ" },
    { TuVung: "集成材 (Shuuseizai)", NghiaVN: "Gỗ ghép thanh / Gỗ kỹ thuật" },
    { TuVung: "合板 (Gouban)", NghiaVN: "Gỗ ép / Gỗ dán Plywood" },
    { TuVung: "プレカット (Pre-cut)", NghiaVN: "Gia công cắt sẵn cấu kiện gỗ nhà khung" },
    { TuVung: "含水率 (Kansuiritsu)", NghiaVN: "Tỷ lệ hàm lượng nước trong gỗ (Độ ẩm)" }
];

let calcData = [
    { TieuDeBai: "Tính thể tích gỗ tròn (丸太の体積計算)", DeBaigoc: "Tính thể tích log gỗ có đường kính đầu nhỏ d = 20cm (0.2m), chiều dài L = 4m theo công thức Smalian hoặc đơn giản.", CongThuc: "V = (d^2) * L * 0.7854 (hoặc công thức JAS)", DapAnDung: "Khoảng 0.1256 m³" }
];

let safetyData = [
    { question: "Nhận diện thiết bị bảo hộ bắt buộc khi vận hành máy cưa vòng (帯鋸)", answer: "Đeo kính bảo hộ, mặc quần áo gọn gàng, mang găng tay phù hợp (hoặc tuân thủ quy định chống cuốn)." }
];

let processData = [
    { question: "Trình tự các bước trong dây chuyền sản xuất gỗ xẻ", answer: "1. Nhập gỗ tròn -> 2. Bóc vỏ (Debarker) -> 3. Cưa xẻ (Seizai) -> 4. Sấy gỗ (Kanso) -> 5. Phân loại & Kiểm tra." }
];

let currentQuizList = allQuestions;
let currentIndex = 0;
let score = 0;

document.addEventListener('DOMContentLoaded', () => {
    // Tự động hiển thị dữ liệu ngay khi tải trang
    renderVocabularyTab();
    renderCalculationTab();
    renderSafetyTab();
    renderProcessTab();
    renderQuestion();
});

// 1. Hiển thị Tab Từ Vựng
function renderVocabularyTab() {
    const container = document.querySelector('#tab-vocab .bg-white');
    if (!container) return;

    let html = `<h2 class="text-lg font-bold text-blue-900 mb-1">📖 Từ Vựng Chuyên Ngành Gỗ (${vocabData.length} từ)</h2><p class="text-xs text-slate-500 mb-4">専門用語 (Senmon Yougo)</p><div class="space-y-3 max-h-[500px] overflow-y-auto pr-2">`;
    vocabData.forEach((item, idx) => {
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

// 2. Hiển thị Tab Tính Toán
function renderCalculationTab() {
    const container = document.querySelector('#tab-calc .bg-white');
    if (!container) return;

    let html = `<h2 class="text-lg font-bold text-blue-900 mb-1">🧮 Bài Tập Tính Toán Thực Chiến</h2><p class="text-xs text-slate-500 mb-4">計算問題 (Keisan Mondai)</p><div class="space-y-4 max-h-[500px] overflow-y-auto pr-2">`;
    calcData.forEach((item, idx) => {
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

// 3. Hiển thị Tab An Toàn
function renderSafetyTab() {
    const container = document.querySelector('#tab-safety .bg-white');
    if (!container) return;

    let html = `<h2 class="text-lg font-bold text-blue-900 mb-1">🛡️ Nhận Dạng Hình Ảnh An Toàn</h2><p class="text-xs text-slate-500 mb-4">安全作業画像認識の課題</p><div class="space-y-3 max-h-[500px] overflow-y-auto pr-2">`;
    safetyData.forEach((item, idx) => {
        html += `<div class="p-3 bg-slate-50 border border-slate-200 rounded-lg">
            <p class="font-bold text-slate-800 text-sm">Câu ${idx+1}: ${item.question}</p>
            <p class="text-xs text-blue-800 mt-1">✓ Đáp án: ${item.answer}</p>
        </div>`;
    });
    html += `</div>`;
    container.innerHTML = html;
}

// 4. Hiển thị Tab Quy Trình
function renderProcessTab() {
    const container = document.querySelector('#tab-process .bg-white');
    if (!container) return;

    let html = `<h2 class="text-lg font-bold text-blue-900 mb-1">🔄 Quy Trình Sản Xuất & Ghép Nối</h2><p class="text-xs text-slate-500 mb-4">製造工程の画像認識とマッチング</p><div class="space-y-3 max-h-[500px] overflow-y-auto pr-2">`;
    processData.forEach((item, idx) => {
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
