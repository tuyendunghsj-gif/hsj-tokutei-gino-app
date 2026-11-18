// ================= HỆ THỐNG KẾT NỐI & ĐỌC 11 FILE DỮ LIỆU JSON - HSJ WOOD APP =================
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
    console.log("🚀 Đang khởi động hệ thống kết nối dữ liệu HSJ Wood...");
    await taiTatCaDuLieu();
});

// Xử lý màn hình chào mở đầu
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

// Hàm tải thông minh: Quét qua danh sách 11 file JSON trên GitHub
async function taiTatCaDuLieu() {
    const questionTextEl = document.getElementById('question-text');
    if (questionTextEl) questionTextEl.innerText = "⏳ Đang kết nối tới kho dữ liệu GitHub...";

    let tatCaCauHoi = [];

    for (let tenFile of danhSachFileJson) {
        try {
            let response = await fetch(`./${tenFile}`);
            if (response.ok) {
                let data = await response.json();
                let danhSach = Array.isArray(data) ? data : (data.questions || data.data || Object.values(data)[0] || []);
                
                if (Array.isArray(danhSach) && danhSach.length > 0) {
                    tatCaCauHoi = tatCaCauHoi.concat(danhSach);
                    console.log(`✅ Đã tải thành công: ${tenFile} (${danhSach.length} mục)`);
                }
            }
        } catch (err) {
            console.warn(`⚠️ Không đọc được file ${tenFile}`);
        }
    }

    if (tatCaCauHoi.length > 0) {
        questions = tatCaCauHoi;
        currentIndex = 0;
        renderQuestion();
        console.log(`🎉 Tổng số nội dung đã nạp vào app: ${questions.length} mục.`);
    } else {
        if (questionTextEl) {
            questionTextEl.innerText = "⚠️ Không tìm thấy dữ liệu trong các file JSON. Chị kiểm tra lại tên file trên GitHub nhé!";
        }
    }
}

// Hiển thị nội dung câu hỏi và đáp án 〇 / ✖ lên giao diện
function renderQuestion() {
    if (!questions || questions.length === 0) return;
    
    let q = questions[currentIndex];
    
    const progressEl = document.getElementById('quiz-progress');
    if (progressEl) {
        progressEl.innerText = `[${q.TrangSo || 'Ôn tập'}] - Câu ${currentIndex + 1} / ${questions.length}`;
    }

    // Đọc chính xác trường NoiDungJP và NoiDungVN từ file JSON của chị
    const questionTextEl = document.getElementById('question-text');
    if (questionTextEl) {
        let tieuDe = q.TieuDeCau || q.TieuDe || "";
        let noiDungJp = q.NoiDungJP || q.question || q.DeBaigoc || "";
        let noiDungVn = q.NoiDungVN || "";
        
        questionTextEl.innerHTML = `
            <span class="text-blue-700 font-bold text-base">${tieuDe}</span><br>
            <div class="my-2 text-slate-900 font-semibold text-base whitespace-pre-line">${noiDungJp}</div>
            <div class="text-slate-500 text-sm italic">${noiDungVn}</div>
        `;
    }

    // Xử lý các nút đáp án (Tự động sinh nút 〇 và ✖ cho câu hỏi Đúng/Sai)
    let optsContainer = document.getElementById('options-container');
    if (optsContainer) {
        optsContainer.innerHTML = '';
        
        // Nếu file JSON có sẵn options thì dùng, nếu không thì mặc định là Đúng/Sai (〇 / ✖)
        let options = q.options || [q.A, q.B, q.C, q.D].filter(Boolean);
        if (options.length === 0) {
            options = ["〇", "✖"];
        }

        options.forEach(opt => {
            let btn = document.createElement('button');
            btn.className = "w-full text-left px-5 py-3.5 bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-300 rounded-xl text-base font-bold transition cursor-pointer flex items-center justify-between mb-2 shadow-sm";
            
            // Hiển thị tên nút trực quan (〇 -> 〇 Đúng, ✖ -> ✖ Sai)
            let nhanHienThi = opt;
            if (opt === "〇") nhanHienThi = "〇 — Đúng (Tươi cười)";
            if (opt === "✖") nhanHienThi = "✖ — Sai";
            btn.innerText = nhanHienThi;
            
            let dapAnDung = q.DapAn || q.answer || q.DapAnDung;
            btn.onclick = () => checkAnswer(btn, opt, dapAnDung, q.GiaiThich);
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
        if (correctAnswer && b.innerText.trim().includes(String(correctAnswer).trim())) {
            b.classList.add('bg-green-100', 'border-green-500', 'text-green-900', 'font-bold');
        }
    }

    const isCorrect = correctAnswer && (selectedOption.trim() === String(correctAnswer).trim());
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
        alert(`🎉 Chúc mừng bạn đã hoàn thành bài ôn tập! Tổng số câu đúng: ${score} / ${questions.length}`);
    }
}

// Quay lại câu trước
function prevQuestion() {
    if (currentIndex > 0) {
        currentIndex--;
        renderQuestion();
    }
}
