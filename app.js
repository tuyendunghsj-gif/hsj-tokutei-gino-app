// ================= SỰ KIỆN KHỞI TẠO ỨNG DỤNG =================
document.addEventListener('DOMContentLoaded', () => {
    console.log("🚀 HSJ Tokutei Gino Wood App đã khởi chạy thành công cho Phạm Thùy Trang!");
    // Tự động tải ngân hàng câu hỏi khi mở app
    loadQuestionBank();
});

// ================= XỬ LÝ MÀN HÌNH CHÀO VÀ VIDEO CON GÀ =================
function enterApp() {
    const splashScreen = document.getElementById('splash-screen');
    if (splashScreen) {
        splashScreen.style.opacity = '0';
        setTimeout(() => {
            splashScreen.style.display = 'none';
        }, 700);
    }
}

// ================= ĐIỀU HƯỚNG 9 TAB GIAO DIỆN =================
function switchTab(tabId) {
    // Ẩn tất cả các tab nội dung
    const tabContents = document.querySelectorAll('.tab-content');
    tabContents.forEach(tab => tab.classList.add('hidden'));

    // Hiển thị tab được chọn
    const activeTab = document.getElementById('tab-' + tabId);
    if (activeTab) {
        activeTab.classList.remove('hidden');
    }

    // Cập nhật trạng thái active cho các nút trên thanh menu (Navbar)
    const tabButtons = document.querySelectorAll('.tab-btn');
    tabButtons.forEach(btn => {
        btn.classList.remove('bg-blue-50', 'text-blue-800', 'font-bold');
        btn.classList.add('text-slate-600');
    });

    // Làm nổi bật nút đang chọn
    if (event && event.currentTarget) {
        event.currentTarget.classList.remove('text-slate-600');
        event.currentTarget.classList.add('bg-blue-50', 'text-blue-800', 'font-bold');
    }

    // Cuộn mượt lên đầu trang khi đổi tab
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ================= LOGIC ÔN THI VÀ TRẮC NGHIỆM (QUIZ ENGINE) =================
let questions = [];
let currentIndex = 0;
let score = 0;

// Tải dữ liệu từ tệp data.json tổng hợp
function loadQuestionBank() {
    fetch('data.json')
        .then(response => {
            if (!response.ok) throw new Error('Không thể tải file dữ liệu data.json');
            return response.json();
        })
        .then(data => {
            if (Array.isArray(data) && data.length > 0) {
                questions = data;
                renderQuestion();
                console.log(`✅ Đã tải thành công ${questions.length} câu hỏi vào hệ thống!`);
            } else {
                displayMessage("⚠️ File data.json trống hoặc không đúng định dạng mảng.");
            }
        })
        .catch(error => {
            console.error('Lỗi tải dữ liệu:', error);
            displayMessage("⚠️ Chưa tìm thấy file data.json trong thư mục dự án.");
        });
}

// Hiển thị câu hỏi hiện tại lên màn hình Luyện tập
function renderQuestion() {
    if (questions.length === 0) return;
    
    let q = questions[currentIndex];
    
    // Cập nhật thanh tiến độ
    const progressEl = document.getElementById('quiz-progress');
    if (progressEl) {
        progressEl.innerText = `Câu ${currentIndex + 1} / ${questions.length}`;
    }

    // Hiển thị nội dung câu hỏi (hỗ trợ cả khóa tiếng Việt/Nhật)
    const questionTextEl = document.getElementById('question-text');
    if (questionTextEl) {
        questionTextEl.innerText = q.question || q.DeBaigoc || "Nội dung câu hỏi đang cập nhật...";
    }

    // Xử lý các đáp án lựa chọn
    let optsContainer = document.getElementById('options-container');
    if (optsContainer) {
        optsContainer.innerHTML = '';
    }
    
    // Ẩn hộp giải thích trước khi chọn đáp án
    const expBox = document.getElementById('explanation-box');
    if (expBox) {
        expBox.classList.add('hidden');
        expBox.innerText = '';
    }

    // Lấy danh sách đáp án
    let options = q.options || [q.A, q.B, q.C, q.D].filter(Boolean);

    options.forEach(opt => {
        let btn = document.createElement('button');
        btn.className = "w-full text-left px-4 py-3 bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-300 rounded-lg text-sm font-medium transition cursor-pointer flex items-center justify-between";
        btn.innerText = opt;
        btn.onclick = () => checkAnswer(btn, opt, q.answer || q.DapAnDung, q.GiaiThich);
        if (optsContainer) {
            optsContainer.appendChild(btn);
        }
    });
}

// Kiểm tra đáp án đúng/sai
function checkAnswer(button, selectedOption, correctAnswer, explanation) {
    let optsContainer = document.getElementById('options-container');
    if (!optsContainer) return;

    let buttons = optsContainer.getElementsByTagName('button');
    
    // Khóa tất cả các nút sau khi đã chọn
    for (let b of buttons) {
        b.disabled = true;
        b.classList.remove('hover:bg-blue-50', 'hover:border-blue-300');
        // Tô sáng đáp án đúng thực tế
        if (b.innerText.trim() === String(correctAnswer).trim()) {
            b.classList.add('bg-green-100', 'border-green-500', 'text-green-900', 'font-bold');
        }
    }

    // So sánh kết quả người dùng chọn
    const isCorrect = (selectedOption.trim() === String(correctAnswer).trim());
    if (isCorrect) {
        button.classList.add('bg-green-500', 'text-white', 'border-green-600');
        score++;
        playSuccessSound(); // Phát âm thanh "Ting" vui tai
    } else {
        button.classList.add('bg-red-100', 'border-red-500', 'text-red-900');
    }

    // Hiển thị phần giải thích đáp án
    let expBox = document.getElementById('explanation-box');
    if (expBox) {
        let explanationText = explanation ? `💡 Giải thích: ${explanation}` : `💡 Đáp án chính xác: ${correctAnswer}`;
        expBox.innerText = explanationText;
        expBox.classList.remove('hidden');
    }
}

// Chuyển sang câu hỏi tiếp theo
function nextQuestion() {
    if (currentIndex < questions.length - 1) {
        currentIndex++;
        renderQuestion();
    } else {
        alert(`🎉 Chúc mừng bạn đã hoàn thành xuất sắc! Tổng số câu đúng: ${score} / ${questions.length}`);
    }
}

// Quay lại câu hỏi trước đó
function prevQuestion() {
    if (currentIndex > 0) {
        currentIndex--;
        renderQuestion();
    }
}

// Hiệu ứng âm thanh "Ting" vui nhộn khi trả lời đúng
function playSuccessSound() {
    try {
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // Nốt D5
        osc.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.15); // Nốt A5

        gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.3);

        osc.connect(gain);
        gain.connect(audioCtx.destination);

        osc.start();
        osc.stop(audioCtx.currentTime + 0.3);
    } catch (e) {
        console.log("Trình duyệt chặn Audio tự động");
    }
}

// Hàm hỗ trợ thông báo trạng thái lỗi
function displayMessage(msg) {
    const questionTextEl = document.getElementById('question-text');
    if (questionTextEl) {
        questionTextEl.innerText = msg;
    }
}
