// =========================================================================
// HỆ THỐNG QUẢN LÝ DỮ LIỆU & GIAO DIỆN 11 FILE JSON - HSJ WOOD APP
// =========================================================================

// Danh sách chính xác 11 file JSON chuyên ngành gỗ
const danhSachFileJson = [
    "GhepNoi_Precut.json",
    "GhepNoi_Chip.json",
    "GhepNoi_Flooring.json",
    "GhepNoi_Tsukita.json",
    "GhepNoi_GoubanLVL.json",
    "GhepNoi_Shuuseizai.json",
    "GhepNoi_Seizai.json",
    "NhanDangHinhAnh.json",
    "BaiTapTinhToan.json",
    "TuVung.json",
    "CauHoi_1860.json"
];

// Biến toàn cục lưu trữ toàn bộ dữ liệu của 11 file
window.appData = {};
let questions = []; // Mảng chứa câu hỏi cho phần Luyện Tập
let currentIndex = 0;
let score = 0;

// ================= SỰ KIỆN KHỞI TẠO ỨNG DỤNG =================
document.addEventListener('DOMContentLoaded', async () => {
    console.log("🚀 HSJ Tokutei Gino Wood App đã khởi chạy thành công cho Phạm Thùy Trang!");
    
    // Tự động tải toàn bộ 11 file JSON trước khi dựng giao diện
    await taiTatCaDuLieuApp();
});

// ================= HÀM TỰ ĐỘNG NẠP ĐỒNG THỜI 11 FILE JSON =================
async function taiTatCaDuLieuApp() {
    // Hiển thị trạng thái đang tải lên màn hình
    const questionTextEl = document.getElementById('question-text');
    if (questionTextEl) {
        questionTextEl.innerText = "Đang tải dữ liệu 11 chuyên đề ngành Gỗ, vui lòng đợi trong giây lát...";
    }

    for (let tenFile of danhSachFileJson) {
        try {
            let response = await fetch(`./${tenFile}`);
            if (response.ok) {
                let data = await response.json();
                let keyName = tenFile.replace(".json", "");
                window.appData[keyName] = data;
                console.log(`✅ Đã nạp thành công: ${tenFile}`);
            } else {
                console.warn(`⚠️ Không thể kết nối tới file: ${tenFile}`);
            }
        } catch (error) {
            console.error(`❌ Lỗi đọc file ${tenFile}:`, error);
        }
    }

    // Tự động gán 1860 câu hỏi từ file CauHoi_1860.json vào phần Luyện Tập Trắc Nghiệm
    if (window.appData["CauHoi_1860"] && Array.isArray(window.appData["CauHoi_1860"])) {
        questions = window.appData["CauHoi_1860"];
        console.log(`🎉 Tổng số câu hỏi luyện tập đã sẵn sàng: ${questions.length} câu!`);
        renderQuestion(); // Hiển thị câu hỏi đầu tiên lên giao diện
    } else {
        displayMessage("⚠️ Không tìm thấy dữ liệu từ file CauHoi_1860.json. Bạn kiểm tra lại tên file nhé!");
    }
}

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

// ================= ĐIỀU HƯỚNG TAB GIAO DIỆN =================
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

// Hiển thị câu hỏi hiện tại lên màn hình Luyện tập
function renderQuestion() {
    if (questions.length === 0) return;
    
    let q = questions[currentIndex];
    
    // Cập nhật thanh tiến độ
    const progressEl = document.getElementById('quiz-progress');
    if (progressEl) {
        progressEl.innerText = `Câu ${currentIndex + 1} / ${questions.length}`;
    }

    // Hiển thị nội dung câu hỏi (hỗ trợ đa dạng cấu trúc khóa dữ liệu)
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

    // Lấy danh sách đáp án linh hoạt
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
