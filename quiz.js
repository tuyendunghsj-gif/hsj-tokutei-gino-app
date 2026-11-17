// ==========================================
// LOGIC ÔN THI TRẮC NGHIỆM - QUIZ.JS
// ==========================================

let questions = [];
let currentIndex = 0;
let score = 0;

// Hàm tự động kích hoạt khi app.js tải xong dữ liệu
function khoiTaoQuizSauKhiNap() {
    if (window.appData["CauHoi_1860"] && Array.isArray(window.appData["CauHoi_1860"])) {
        questions = window.appData["CauHoi_1860"];
        currentIndex = 0;
        score = 0;
        renderQuestion();
        console.log(`✅ Đã nạp ${questions.length} câu hỏi vào phần Luyện Tập!`);
    } else {
        // Dự phòng tải trực tiếp nếu window chưa kịp đồng bộ
        taiTrucTiepCauHoi1860();
    }
}

async function taiTrucTiepCauHoi1860() {
    try {
        let res = await fetch('./CauHoi_1860.json');[cite: 7]
        if (res.ok) {
            questions = await res.json();
            renderQuestion();
        }
    } catch (e) {
        console.error("Không thể tải file CauHoi_1860.json", e);[cite: 7]
        let qEl = document.getElementById('question-text');
        if (qEl) qEl.innerText = "⚠️ Không tìm thấy dữ liệu câu hỏi. Vui lòng kiểm tra lại các file JSON.";
    }
}

// Hiển thị câu hỏi lên màn hình
function renderQuestion() {
    if (!questions || questions.length === 0) return;
    
    let q = questions[currentIndex];
    
    // Tiến độ câu hỏi
    const progressEl = document.getElementById('quiz-progress');
    if (progressEl) {
        progressEl.innerText = `Câu ${currentIndex + 1} / ${questions.length}`;
    }

    // Nội dung câu hỏi
    const questionTextEl = document.getElementById('question-text');
    if (questionTextEl) {
        questionTextEl.innerText = q.question || q.DeBaigoc || q.tieuDe || "Nội dung câu hỏi đang cập nhật...";
    }

    // Danh sách đáp án
    let optsContainer = document.getElementById('options-container');
    if (optsContainer) {
        optsContainer.innerHTML = '';
        
        let options = q.options || [q.A, q.B, q.C, q.D].filter(Boolean);

        options.forEach(opt => {
            let btn = document.createElement('button');
            btn.className = "w-full text-left px-4 py-3 bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-300 rounded-lg text-sm font-medium transition cursor-pointer flex items-center justify-between mb-2";
            btn.innerText = opt;
            btn.onclick = () => checkAnswer(btn, opt, q.answer || q.DapAnDung, q.GiaiThich);
            optsContainer.appendChild(btn);
        });
    }
    
    const expBox = document.getElementById('explanation-box');
    if (expBox) {
        expBox.classList.add('hidden');
        expBox.innerText = '';
    }
}

// Kiểm tra đáp án đúng/sai
function checkAnswer(button, selectedOption, correctAnswer, explanation) {
    let optsContainer = document.getElementById('options-container');
    if (!optsContainer) return;

    let buttons = optsContainer.getElementsByTagName('button');
    for (let b of buttons) {
        b.disabled = true;
        if (b.innerText.trim() === String(correctAnswer).trim()) {
            b.classList.add('bg-green-100', 'border-green-500', 'text-green-900', 'font-bold');
        }
    }

    const isCorrect = (selectedOption.trim() === String(correctAnswer).trim());
    if (isCorrect) {
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

// Chuyển câu tiếp theo
function nextQuestion() {
    if (currentIndex < questions.length - 1) {
        currentIndex++;
        renderQuestion();
    } else {
        alert(`🎉 Bạn đã hoàn thành bài luyện tập! Tổng câu đúng: ${score} / ${questions.length}`);
    }
}

// Quay lại câu trước
function prevQuestion() {
    if (currentIndex > 0) {
        currentIndex--;
        renderQuestion();
    }
}

// Kích hoạt khởi tạo khi mở trang nếu app.js đã load trước
document.addEventListener("DOMContentLoaded", () => {
    setTimeout(khoiTaoQuizSauKhiNap, 300);
});
