/* ==========================================
   HSJ WOOD APP - XỬ LÝ NGÂN HÀNG CÂU HỎI (quiz.js)
   ================================---------- */

let questions = [];
let currentIndex = 0;
let score = 0;

// 1. TẢI NGÂN HÀNG CÂU HỎI TỪ data.json
document.addEventListener('DOMContentLoaded', () => {
    loadQuestionBank();
});

function loadQuestionBank() {
    fetch('data.json')
        .then(response => {
            if (!response.ok) {
                throw new Error('Không thể tải file dữ liệu câu hỏi.');
            }
            return response.json();
        })
        .then(data => {
            questions = data;
            if (questions.length > 0) {
                renderQuestion();
            } else {
                displayMessage("Ngân hàng câu hỏi hiện đang trống!");
            }
        })
        .catch(error => {
            console.error('Lỗi tải file data.json:', error);
            displayMessage("⚠️ Không tìm thấy file data.json. Hãy đảm bảo bạn đã tải file JSON lên GitHub cùng thư mục.");
        });
}

// 2. HIỂN THỊ CÂU HỎI LÊN GIAO DIỆN LUYỆN TẬP
function renderQuestion() {
    if (questions.length === 0) return;

    let q = questions[currentIndex];
    
    // Cập nhật thanh tiến độ câu hỏi
    const progressEl = document.getElementById('quiz-progress');
    if (progressEl) {
        progressEl.innerText = `Câu hỏi ${currentIndex + 1} / ${questions.length}`;
    }

    // Hiển thị nội dung câu hỏi (hỗ trợ nhiều tên trường dữ liệu)
    const questionTextEl = document.getElementById('question-text');
    if (questionTextEl) {
        questionTextEl.innerText = q.question || q.DeBaigoc || "Nội dung câu hỏi...";
    }

    // Xóa sạch các đáp án cũ và khung giải thích
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

    // Tạo các nút bấm đáp án tương tác
    options.forEach(opt => {
        let btn = document.createElement('button');
        btn.className = "w-full text-left px-4 py-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-sm font-medium transition cursor-pointer";
        btn.innerText = opt;
        btn.onclick = () => checkAnswer(btn, opt, q.answer || q.DapAnDung);
        if (optsContainer) {
            optsContainer.appendChild(btn);
        }
    });
}

// 3. KIỂM TRA ĐÁP ÁN ĐÚNG / SAI & PHÁT ÂM THANH "TING"
function checkAnswer(button, selectedOption, correctAnswer) {
    let optsContainer = document.getElementById('options-container');
    if (!optsContainer) return;

    let buttons = optsContainer.getElementsByTagName('button');

    // Khóa tất cả các nút sau khi đã chọn
    for (let b of buttons) {
        b.disabled = true;
        b.classList.remove('hover:bg-slate-100');
        // Tô màu đáp án đúng thực tế để học viên dễ đối chiếu
        if (b.innerText.trim() === String(correctAnswer).trim()) {
            b.classList.add('bg-green-100', 'border-green-500', 'text-green-800', 'font-bold');
        }
    }

    // Kiểm tra lựa chọn của người dùng
    const isCorrect = (selectedOption.trim() === String(correctAnswer).trim());

    if (isCorrect) {
        button.classList.add('bg-green-500', 'text-white', 'border-green-600');
        score++;
        playSuccessSound(); // Phát âm thanh "Ting" vui nhộn khi trả lời đúng
    } else {
        button.classList.add('bg-red-100', 'border-red-500', 'text-red-800');
    }

    // Hiển thị phần giải thích chi tiết
    let expBox = document.getElementById('explanation-box');
    if (expBox) {
        expBox.innerText = `💡 Đáp án chính xác: ${correctAnswer}`;
        expBox.classList.remove('hidden');
    }
}

// 4. HÀM TẠO ÂM THANH "TING" (DÙNG WEB AUDIO API KHÔNG CẦN FILE NGOÀI)
function playSuccessSound() {
    try {
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // Nốt D5
        osc.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.15); // Lên nốt A5

        gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.3);

        osc.connect(gain);
        gain.connect(audioCtx.destination);

        osc.start();
        osc.stop(audioCtx.currentTime + 0.3);
    } catch (e) {
        console.log("Trình duyệt chặn Audio tự động:", e);
    }
}

// 5. ĐIỀU HƯỚNG CÂU HỎI TIẾP THEO / TRƯỚC ĐÓ
function nextQuestion() {
    if (currentIndex < questions.length - 1) {
        currentIndex++;
        renderQuestion();
    } else {
        alert(`🎉 Chúc mừng bạn đã hoàn thành phiên ôn tập! Tổng số câu đúng: ${score} / ${questions.length}`);
    }
}

function prevQuestion() {
    if (currentIndex > 0) {
        currentIndex--;
        renderQuestion();
    }
}

// Hàm hiển thị thông báo lỗi
function displayMessage(msg) {
    const questionTextEl = document.getElementById('question-text');
    if (questionTextEl) {
        questionTextEl.innerText = msg;
    }
}