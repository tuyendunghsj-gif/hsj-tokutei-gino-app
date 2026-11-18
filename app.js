// ================= HỆ THỐNG ĐỌC ĐA CẤU TRÚC JSON - HSJ WOOD APP =================
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

let tatCaDuLieuKho = []; // Kho chứa toàn bộ dữ liệu
let questions = [];      // Dữ liệu đang dùng để luyện tập
let currentIndex = 0;
let score = 0;

document.addEventListener('DOMContentLoaded', async () => {
    console.log("🚀 Đang khởi động hệ thống nạp dữ liệu HSJ Wood...");
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

// Điều hướng Tab giao diện (Hỗ trợ lọc dữ liệu riêng cho từng Tab)
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

    // Nếu bấm sang tab Từ Vựng, tự động lọc dữ liệu từ vựng để hiển thị
    if (tabId === 'vocab') {
        let danhSachTuVung = tatCaDuLieuKho.filter(item => item.TuVungJP || item.ID_TuVung);
        if (danhSachTuVung.length > 0) {
            hienThiDanhSachTuVung(danhSachTuVung);
        } else {
            // Nếu chưa tìm thấy trong kho tổng, thử tải riêng file TuVung.json
            taiRiengFileVocab();
        }
    } else if (tabId === 'practice' || tabId === 'exam') {
        // Mặc định cho phần luyện tập
        questions = tatCaDuLieuKho.filter(item => item.NoiDungJP || item.question || item.DeBaigoc);
        if (questions.length === 0) questions = tatCaDuLieuKho;
        currentIndex = 0;
        renderQuestion();
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Hàm tải toàn bộ danh sách 11 file JSON
async function taiTatCaDuLieu() {
    const questionTextEl = document.getElementById('question-text');
    if (questionTextEl) questionTextEl.innerText = "⏳ Đang kết nối tới kho dữ liệu GitHub...";

    let tongHop = [];

    for (let tenFile of danhSachFileJson) {
        try {
            let response = await fetch(`./${tenFile}`);
            if (response.ok) {
                let data = await response.json();
                let danhSach = Array.isArray(data) ? data : (data.questions || data.data || Object.values(data)[0] || []);
                
                if (Array.isArray(danhSach) && danhSach.length > 0) {
                    tongHop = tongHop.concat(danhSach);
                    console.log(`✅ Đã tải thành công: ${tenFile} (${danhSach.length} mục)`);
                }
            }
        } catch (err) {
            console.warn(`⚠️ Không đọc được file ${tenFile}`);
        }
    }

    if (tongHop.length > 0) {
        tatCaDuLieuKho = tongHop;
        // Mặc định đưa câu hỏi vào bảng luyện tập
        questions = tatCaDuLieuKho.filter(item => item.NoiDungJP || item.question || item.DeBaigoc);
        if (questions.length === 0) questions = tatCaDuLieuKho;
        currentIndex = 0;
        renderQuestion();
        console.log(`🎉 Tổng số nội dung đã nạp vào app: ${tatCaDuLieuKho.length} mục.`);
    } else {
        if (questionTextEl) {
            questionTextEl.innerText = "⚠️ Không tìm thấy dữ liệu trong các file JSON. Kiểm tra lại tên file trên GitHub nhé!";
        }
    }
}

// Tải riêng file Từ Vựng nếu cần
async function taiRiengFileVocab() {
    try {
        let res = await fetch('./TuVung.json');
        if (res.ok) {
            let data = await res.json();
            if (Array.isArray(data)) {
                hienThiDanhSachTuVung(data);
            }
        }
    } catch (e) {
        console.log("Không tải được TuVung.json riêng lẻ");
    }
}

// Hiển thị giao diện danh sách Từ Vựng (Tab 1)
function hienThiDanhSachTuVung(danhSach) {
    const vocabTab = document.getElementById('tab-vocab');
    if (!vocabTab) return;

    let htmlNoiDung = `
        <div class="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
            <div class="flex justify-between items-center border-b pb-3">
                <div>
                    <h2 class="text-lg font-bold text-blue-900">📖 Từ Vựng Chuyên Ngành Gỗ</h2>
                    <p class="text-xs text-slate-500">専門用語 (Senmon Yougo) - Tổng số: ${danhSach.length} từ</p>
                </div>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[600px] overflow-y-auto pr-2">
    `;

    danhSach.forEach(item => {
        let jp = item.TuVungJP || "";
        let furi = item.Furigana ? `(${item.Furigana})` : "";
        let vn = item.NghiaVN || "";
        let trang = item.TrangSo ? `Trang ${item.TrangSo}` : "";

        htmlNoiDung += `
            <div class="p-4 bg-slate-50 hover:bg-blue-50/50 border border-slate-200 rounded-xl transition flex flex-col justify-between">
                <div>
                    <div class="flex justify-between items-start">
                        <span class="text-base font-bold text-blue-900">${jp}</span>
                        <span class="text-[10px] bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full font-semibold">${trang}</span>
                    </div>
                    <p class="text-xs text-orange-600 font-medium mt-0.5">${furi}</p>
                </div>
                <div class="mt-3 pt-2 border-t border-slate-200/60 text-sm font-semibold text-slate-700">
                    🇻🇳 ${vn}
                </div>
            </div>
        `;
    });

    htmlNoiDung += `</div></div>`;
    vocabTab.innerHTML = htmlNoiDung;
}

// Hiển thị nội dung câu hỏi trắc nghiệm (Tab Luyện Tập / Thi Thử)
function renderQuestion() {
    if (!questions || questions.length === 0) return;
    
    let q = questions[currentIndex];
    // Nếu vô tình trúng item từ vựng, tự động bỏ qua tìm câu hỏi tiếp theo
    if (q.TuVungJP && !q.NoiDungJP && !q.question) {
        nextQuestion();
        return;
    }
    
    const progressEl = document.getElementById('quiz-progress');
    if (progressEl) {
        progressEl.innerText = `[${q.TrangSo || 'Ôn tập'}] - Câu ${currentIndex + 1} / ${questions.length}`;
    }

    const questionTextEl = document.getElementById('question-text');
    if (questionTextEl) {
        let tieuDe = q.TieuDeCau || q.TieuDe || "";
        let noiDungJp = q.NoiDungJP || q.question || q.DeBaigoc || "Nội dung đang cập nhật...";
        let noiDungVn = q.NoiDungVN || "";
        
        questionTextEl.innerHTML = `
            <span class="text-blue-700 font-bold text-base">${tieuDe}</span><br>
            <div class="my-2 text-slate-900 font-semibold text-base whitespace-pre-line">${noiDungJp}</div>
            <div class="text-slate-500 text-sm italic">${noiDungVn}</div>
        `;
    }

    let optsContainer = document.getElementById('options-container');
    if (optsContainer) {
        optsContainer.innerHTML = '';
        
        let options = q.options || [q.A, q.B, q.C, q.D].filter(Boolean);
        if (options.length === 0) {
            options = ["〇", "✖"];
        }

        options.forEach(opt => {
            let btn = document.createElement('button');
            btn.className = "w-full text-left px-5 py-3.5 bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-300 rounded-xl text-base font-bold transition cursor-pointer flex items-center justify-between mb-2 shadow-sm";
            
            let nhanHienThi = opt;
            if (opt === "〇") nhanHienThi = "〇 — Đúng (Đúng thực tế giáo trình)";
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
