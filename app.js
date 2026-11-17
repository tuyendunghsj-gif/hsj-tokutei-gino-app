/* ==========================================
   HSJ WOOD APP - LOGIC ĐIỀU KHIỂN & TƯƠNG TÁC (app.js)
   ================================---------- */

// 1. XỬ LÝ MÀN HÌNH CHÀO MỞ ĐẦU (SPLASH SCREEN)
function enterApp() {
    const splashScreen = document.getElementById('splash-screen');
    if (splashScreen) {
        splashScreen.style.opacity = '0';
        setTimeout(() => {
            splashScreen.style.display = 'none';
        }, 700); // Khớp với thời gian hiệu ứng chuyển động trong style.css
    }
}

// 2. XỬ LÝ CHUYỂN TAB MƯỢT MÀ
function switchTab(tabId) {
    // Ẩn tất cả các nội dung tab
    const tabContents = document.querySelectorAll('.tab-content');
    tabContents.forEach(tab => {
        tab.classList.add('hidden');
    });

    // Hiển thị tab được chọn
    const activeTab = document.getElementById('tab-' + tabId);
    if (activeTab) {
        activeTab.classList.remove('hidden');
    }

    // Cập nhật trạng thái active cho các nút trên thanh điều hướng (Navbar)
    const tabButtons = document.querySelectorAll('.tab-btn');
    tabButtons.forEach(btn => {
        btn.classList.remove('bg-blue-50', 'text-blue-800');
        btn.classList.add('text-slate-600');
    });

    // Thêm style active cho nút được click
    event.currentTarget.classList.remove('text-slate-600');
    event.currentTarget.classList.add('bg-blue-50', 'text-blue-800');
}

// 3. QUẢN LÝ NGÂN HÀNG CÂU HỎI TỪ data.json
let questions = [];
let currentIndex = 0;

// Tự động tải file data.json khi ứng dụng khởi động
document.addEventListener('DOMContentLoaded', () => {
    fetch('data.json')
        .then(response => {
            if (!response.ok) {
                throw new Error('Không thể tải file dữ liệu');
            }
            return response.json();
        })
        .then(data => {
            questions = data;
            if (questions.length > 0) {
                loadQuestion();
            } else {
                showQuizMessage("Ngân hàng câu hỏi hiện đang trống!");
            }
        })
        .catch(error => {
            console.error('Lỗi tải dữ liệu JSON:', error);
            showQuizMessage("⚠️ Chưa tìm thấy file data.json hoặc lỗi cấu trúc dữ liệu. Hãy đảm bảo file data.json đã được tải lên cùng thư mục trên GitHub.");
        });
});

// Hiển thị câu hỏi hiện tại lên giao diện Luyện tập
function loadQuestion() {
    if (questions.length === 0) return;

    let q = questions[currentIndex];
    
    // Cập nhật tiến độ câu hỏi
    const progressEl = document.getElementById('quiz-progress');
    if (progressEl) {
        progressEl.innerText = `Câu ${currentIndex + 1} / ${questions.length}`;
    }

    // Hiển thị nội dung câu hỏi (hỗ trợ nhiều tên trường dữ liệu khác nhau)
    const questionTextEl = document.getElementById('question-text');
    if (questionTextEl) {
        questionTextEl.innerText = q.question || q.DeBaigoc || "Nội dung câu hỏi...";
    }

    // Làm sạch vùng chứa đáp án và hộp giải thích
    let optsContainer = document.getElementById('options-container');
    if (optsContainer) {
        optsContainer.innerHTML = '';
    }
    
    const expBox = document.getElementById('explanation-box');
    if (expBox) {
        expBox.classList.add('hidden');
        expBox.innerText = '';
    }

    // Lấy danh sách đáp án
    let options = q.options || [q.A, q.B, q.C, q.D].filter(Boolean);

    // Tạo các nút bấm đáp án
    options.forEach(opt => {
        let btn = document.createElement('button');
        btn.className = "w-full text-left px-4 py-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-sm font-medium transition cursor-pointer";
        btn.innerText = opt;
        btn.onclick = () => selectAnswer(btn, opt, q.answer || q.DapAnDung);
        if (optsContainer) {
            optsContainer.appendChild(btn);
        }
    });
}

// Xử lý khi người dùng chọn đáp án
function selectAnswer(button, selectedOption, correctAnswer) {
    let optsContainer = document.getElementById('options-container');
    if (!optsContainer) return;

    let buttons = optsContainer.getElementsByTagName('button');

    // Khóa tất cả các nút sau khi đã chọn
    for (let b of buttons) {
        b.disabled = true;
        b.classList.remove('hover:bg-slate-100');
        // Tô sáng đáp án đúng thực tế
        if (b.innerText.trim() === String(correctAnswer).trim()) {
            b.classList.add('bg-green-100', 'border-green-500', 'text-green-800', 'font-bold');
        }
    }

    // Kiểm tra đúng / sai cho lựa chọn của người dùng
    if (selectedOption.trim() === String(correctAnswer).trim()) {
        button.classList.add('bg-green-500', 'text-white', 'border-green-600');
    } else {
        button.classList.add('bg-red-100', 'border-red-500', 'text-red-800');
    }

    // Hiển thị phần giải thích / đáp án chuẩn
    let expBox = document.getElementById('explanation-box');
    if (expBox) {
        expBox.innerText = "💡 Đáp án chính xác theo giáo trình: " + correctAnswer;
        expBox.classList.remove('hidden');
    }
}

// Chuyển sang câu hỏi tiếp theo
function nextQuestion() {
    if (currentIndex < questions.length - 1) {
        currentIndex++;
        loadQuestion();
    } else {
        alert("🎉 Chúc mừng bạn đã hoàn thành tất cả câu hỏi trong phiên ôn tập này!");
    }
}

// Quay lại câu hỏi trước đó
function prevQuestion() {
    if (currentIndex > 0) {
        currentIndex--;
        loadQuestion();
    }
}

// Hàm phụ trợ hiển thị thông báo lỗi/trạng thái câu hỏi
function showQuizMessage(message) {
    const questionTextEl = document.getElementById('question-text');
    if (questionTextEl) {
        questionTextEl.innerText = message;
    }
}
