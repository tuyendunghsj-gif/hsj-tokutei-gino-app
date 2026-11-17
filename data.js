const APP_DATA = {
    vocab: [
        { TuVung: "製材 (Seizai)", NghiaVN: "Cưa xẻ gỗ" },
        { TuVung: "集成材 (Shuuseizai)", NghiaVN: "Gỗ ghép thanh / Gỗ kỹ thuật" },
        { TuVung: "合板 (Gouban)", NghiaVN: "Gỗ ép / Gỗ dán Plywood" },
        { TuVung: "プレカット (Pre-cut)", NghiaVN: "Gia công cắt sẵn cấu kiện gỗ nhà khung" },
        { TuVung: "含水率 (Kansuiritsu)", NghiaVN: "Tỷ lệ hàm lượng nước trong gỗ (Độ ẩm)" }
    ],
    calc: [
        { TieuDeBai: "Tính thể tích gỗ tròn (丸太の体積計算)", DeBaigoc: "Tính thể tích log gỗ có đường kính đầu nhỏ d = 20cm, chiều dài L = 4m.", CongThuc: "V = (d^2) * L * 0.7854", DapAnDung: "Khoảng 0.1256 m³" }
    ],
    safety: [
        { question: "Nhận diện thiết bị bảo hộ bắt buộc khi vận hành máy cưa vòng (帯鋸)", answer: "Đeo kính bảo hộ, mặc quần áo gọn gàng, mang găng tay phù hợp." }
    ],
    process: [
        { question: "Trình tự các bước trong dây chuyền sản xuất gỗ xẻ", answer: "1. Nhập gỗ tròn -> 2. Bóc vỏ -> 3. Cưa xẻ (Seizai) -> 4. Sấy gỗ -> 5. Phân loại." }
    ],
    questions: [
        { 
            question: "Thuật ngữ tiếng Nhật cho 'An toàn lao động' trong xưởng gỗ là gì?", 
            options: ["A. 安全作業 (Anzen sagyou)", "B. 製造工程 (Seizou katei)", "C. 品質管理 (Hinshitsu kanri)", "D. 乾燥 (Kansou)"], 
            answer: "A. 安全作業 (Anzen sagyou)", 
            GiaiThich: "Anzen sagyou là quy trình làm việc an toàn, bắt buộc tuân thủ trong xưởng chế biến gỗ." 
        }
    ]
};
