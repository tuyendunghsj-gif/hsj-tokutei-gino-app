// ================= HỆ THỐNG QUẢN LÝ DỮ LIỆU & ÔN THI HSJ WOOD APP =================
const danhSachFileJson = [
    "CauHoi_1860.json",
    "TuVung.json",
    "BaiTapTinhToan.json",
    "NhanDangHinhAnh.json",
    "GhepNoi_Precut.json",
    "GhepNoi_Chip.json",
    "GhepNoi_Flooring.json",
    "GhepNoi_Tsukita.json",
    "GhepNoi_GoubanLVL.json",
    "GhepNoi_Shuuseizai.json",
    "GhepNoi_Seizai.json"
];

let questions = [];
let currentIndex = 0;
let score = 0;

document.addEventListener('DOMContentLoaded', async () => {
    console.log("🚀 HSJ Tokutei Gino Wood App đang khởi chạy...");
    await loadQuestionBank();
});

// Xử lý màn hình chào
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
    const activeTab = document.getElementById('tab-' + tabId);
    if (activeTab) activeTab.classList.remove('hidden');

    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('bg-blue-50', 'text-blue-800', 'font-bold');
        btn.classList.add('text-slate-600');
    });

    if (event && event.currentTarget) {
        event.currentTarget.classList.remove('text-slate-600');
        event.currentTarget.classList.add('bg-blue-50', 'text-blue-800', 'font-bold');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Tải dữ liệu JSON từ GitHub
async function loadQuestionBank() {
    const questionTextEl = document.getElementById('question-text');
    if (questionTextEl) questionTextEl.innerText = "⏳ Đang kết nối hệ thống dữ liệu chuyên ngành...";

    let loadedData = null;

    for (let tenFile of danhSachFileJson) {
        try {
            let response = await fetch(`./${tenFile}`);
            if (response.ok) {
                let data = await response.json();
                if (Array.isArray(data) && data.length > 0) {
                    loadedData = data;
                    console.log(`✅ Đã tải thành công file: ${tenFile} (${data.length} câu)`);
                    break;
                }
            }
        } catch (err) {
            console.warn(`Không thể tải ${tenFile}`);
        }
    }

    if (loadedData && loadedData.length > 0) {
        questions = loadedData;
        currentIndex = 0;
        renderQuestion();
    } else {
        if (questionTextEl) {
            questionTextEl.innerText = "⚠️ Không tìm thấy dữ liệu JSON hợp lệ. Vui lòng kiểm tra lại tên file trên GitHub.";
        }
    }
}

// Hiển thị câu hỏi
function renderQuestion() {
    if (!questions || questions.length === 0) return;
    
    let q = questions[currentIndex];
    
    const progressEl = document.getElementById('quiz-progress');
    if (progressEl) progressEl.innerText = `Câu ${currentIndex + 1} / ${questions.length}`;

    const questionTextEl = document.getElementById('question-text');
    if (questionTextEl) {
        questionTextEl.innerText = q.question || q.DeBaigoc || q.tieuDe || "Nội dung câu hỏi đang cập nhật...";
    }

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

// Kiểm tra đáp án
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

function nextQuestion() {
    if (currentIndex < questions.length - 1) {
        currentIndex++;
        renderQuestion();
    } else {
        alert(`🎉 Chúc mừng bạn đã hoàn thành bài ôn tập! Tổng số câu đúng: ${score} / ${questions.length}`);
    }
}

function prevQuestion() {
    if (currentIndex > 0) {
        currentIndex--;
        renderQuestion();
    }
}