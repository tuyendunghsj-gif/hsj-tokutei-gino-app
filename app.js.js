// ================= HỆ THỐNG KẾT NỐI DỮ LIỆU JSON - HSJ WOOD APP =================
let questions = [];
let currentIndex = 0;
let score = 0;

document.addEventListener('DOMContentLoaded', async () => {
    console.log("🚀 Đang khởi động kết nối dữ liệu...");
    await taiFileJson();
});

// Xử lý màn hình chào
function enterApp() {
    const splashScreen = document.getElementById('splash-screen');
    if (splashScreen) {
        splashScreen.style.opacity = '0';
        setTimeout(() => { splashScreen.style.display = 'none'; }, 700);
    }
}

// Điều hướng Tab
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

// Hàm tải file JSON trực tiếp
async function taiFileJson() {
    const questionTextEl = document.getElementById('question-text');
    if (questionTextEl) questionTextEl.innerText = "⏳ Đang kết nối tới file CauHoi_1860.json...";

    try {
        // Thử gọi trực tiếp file CauHoi_1860.json (phải nằm chung thư mục trên GitHub)
        let response = await fetch('./CauHoi_1860.json');
        
        if (!response.ok) {
            throw new Error(`Không tìm thấy file trên GitHub (Mã lỗi: ${response.status})`);
        }

        let data = await response.json();
        
        // Kiểm tra xem dữ liệu có phải là mảng không
        if (Array.isArray(data) && data.length > 0) {
            questions = data;
            currentIndex = 0;
            renderQuestion();
            console.log(`✅ Đã tải thành công ${questions.length} câu hỏi!`);
        } else {
            throw new Error("File JSON có nội dung nhưng không đúng định dạng mảng [...]");
        }

    } catch (error) {
        console.error("Lỗi kết nối JSON:", error);
        if (questionTextEl) {
            questionTextEl.innerText = `⚠️ Lỗi: ${error.message}. Chị hãy kiểm tra xem file 'CauHoi_1860.json' đã nằm chung thư mục gốc với 'index.html' trên GitHub chưa nhé!`;
        }
    }
}

// Hiển thị câu hỏi lên giao diện
function renderQuestion() {
    if (!questions || questions.length === 0) return;
    
    let q = questions[currentIndex];
    
    const progressEl = document.getElementById('quiz-progress');
    if (progressEl) progressEl.innerText = `Câu ${currentIndex + 1} / ${questions.length}`;

    const questionTextEl = document.getElementById('question-text');
    if (questionTextEl) {
        // Hỗ trợ nhiều tên trường dữ liệu khác nhau từ file Excel xuất sang
        questionTextEl.innerText = q.question || q.DeBaigoc || q.CauHoi || q.tieuDe || "Nội dung câu hỏi...";
    }

    let optsContainer = document.getElementById('options-container');
    if (optsContainer) {
        optsContainer.innerHTML = '';
        
        let options = q.options || [q.A, q.B, q.C, q.D].filter(Boolean);

        options.forEach(opt => {
            let btn = document.createElement('button');
            btn.className = "w-full text-left px-4 py-3 bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-300 rounded-lg text-sm font-medium transition cursor-pointer flex items-center justify-between mb-2";
            btn.innerText = opt;
            
            let dapAnDung = q.answer || q.DapAnDung || q.DapAn;
            btn.onclick = () => checkAnswer(btn, opt, dapAnDung, q.GiaiThich || q.Giai_thich);
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
        if (correctAnswer && b.innerText.trim().includes(String(correctAnswer).trim())) {
            b.classList.add('bg-green-100', 'border-green-500', 'text-green-900', 'font-bold');
        }
    }

    const isCorrect = correctAnswer && (selectedOption.trim() === String(correctAnswer).trim() || selectedOption.trim().includes(String(correctAnswer).trim()));
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
        alert(`🎉 Chúc mừng bạn đã hoàn thành! Tổng số câu đúng: ${score} / ${questions.length}`);
    }
}

function prevQuestion() {
    if (currentIndex > 0) {
        currentIndex--;
        renderQuestion.call();
    }
}