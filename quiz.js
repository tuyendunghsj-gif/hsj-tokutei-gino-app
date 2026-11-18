// =========================================================================
// HỆ THỐNG ĐỌC 11 FILE DỮ LIỆU & HIỂN THỊ TRẮC NGHIỆM - HSJ_WOOD 
// =========================================================================

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

let questions = [];
let currentIndex = 0;
let score = 0;

document.addEventListener('DOMContentLoaded', async () => {
    console.log("🚀 Bắt đầu tải dữ liệu 11 file JSON...");
    await taiDuLieuVaHienThi();
});

async function taiDuLieuVaHienThi() {
    const questionTextEl = document.getElementById('question-text');
    if (questionTextEl) {
        questionTextEl.innerText = "⏳ Đang kết nối tới hệ thống dữ liệu...";
    }

    let loadedData = null;

    // Thử tải file CauHoi_1860.json trước tiên cho phần luyện tập
    try {
        let res = await fetch('./CauHoi_1860.json');
        if (res.ok) {
            let json = await res.json();
            // Xử lý nếu dữ liệu nằm trong mảng hoặc thuộc tính object
            loadedData = Array.isArray(json) ? json : (json.questions || json.data || []);
        }
    } catch (e) {
        console.log("Không tải trực tiếp được CauHoi_1860.json, đang quét tổng hợp...");
    }

    // Nếu chưa có, quét qua toàn bộ các file trong danh sách
    if (!loadedData || loadedData.length === 0) {
        for (let tenFile of danhSachFileJson) {
            try {
                let response = await fetch(`./${tenFile}`);
                if (response.ok) {
                    let data = await response.json();
                    if (Array.isArray(data) && data.length > 0) {
                        loadedData = data;
                        break; // Lấy được mảng dữ liệu đầu tiên hợp lệ
                    }
                }
            } catch (err) {
                console.warn(`Lỗi đọc file ${tenFile}`);
            }
        }
    }

    if (loadedData && loadedData.length > 0) {
        questions = loadedData;
        console.log(`✅ Đã tải thành công ${questions.length} câu hỏi!`);
        currentIndex = 0;
        renderQuestion();
    } else {
        if (questionTextEl) {
            questionTextEl.innerText = "⚠️ Không tìm thấy dữ liệu câu hỏi trong các file JSON. Vui lòng kiểm tra lại tên file.";
        }
    }
}

// Hiển thị câu hỏi lên giao diện
function renderQuestion() {
    if (!questions || questions.length === 0) return;
    
    let q = questions[currentIndex];
    
    // Cập nhật tiến độ
    const progressEl = document.getElementById('quiz-progress');
    if (progressEl) {
        progressEl.innerText = `Câu ${currentIndex + 1} / ${questions.length}`;
    }

    // Hiển thị nội dung câu hỏi
    const questionTextEl = document.getElementById('question-text');
    if (questionTextEl) {
        questionTextEl.innerText = q.question || q.DeBaigoc || q.tieuDe || "Nội dung câu hỏi đang cập nhật...";
    }

    // Xử lý các nút đáp án
    let optsContainer = document.getElementById('options-container');
    if (optsContainer) {
        optsContainer.innerHTML = '';
        
        let options = q.options || [q.A, q.B, q.C, q.D].filter(Boolean);

        options.forEach(opt => {
            let btn = document.createElement('button');
            btn.className = "w-full text-left px-4 py-3 bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-300 rounded-lg text-sm font-medium transition cursor-pointer flex items-center justify-between mb-2";
            btn.innerText = opt;
            btn.onclick = () => checkAnswer(btn, opt, q.answer || q.DapAnDung);
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
function checkAnswer(button, selectedOption, correctAnswer) {
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
