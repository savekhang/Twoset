const express = require("express");
const router = express.Router();
const multer = require("multer");
const axios = require("axios");
const fs = require("fs");
const path = require("path");
const FormData = require("form-data");
const { createCanvas, loadImage } = require("canvas");

// ================== CONFIG ==================
const upload = multer({
  dest: path.join(__dirname, "../uploads")
});

const ROBOFLOW_API_KEY = "saH3ifFQggXjzYmoVBxZ";
const ROBOFLOW_MODEL = "vape-yfqob/1";

// thư mục outputs tuyệt đối
const OUTPUT_DIR = path.join(__dirname, "../outputs");

// tạo outputs nếu chưa có
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR);
}

// ================== ROUTE ==================
router.post("/vape", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        detected: false,
        message: "No image uploaded"
      });
    }

    // ========= 1. GỬI ẢNH LÊN ROBOFLOW =========
    const form = new FormData();
    form.append("file", fs.createReadStream(req.file.path));

    const rfResponse = await axios.post(
      `https://serverless.roboflow.com/${ROBOFLOW_MODEL}`,
      form,
      {
        params: { api_key: ROBOFLOW_API_KEY },
        headers: form.getHeaders(),
      }
    );

    const predictions = rfResponse.data?.predictions || [];
    const detected = predictions.some(p => p.confidence >= 0.4);

    // ========= 2. LOAD ẢNH GỐC =========
    const image = await loadImage(req.file.path);
    const canvas = createCanvas(image.width, image.height);
    const ctx = canvas.getContext("2d");

    ctx.drawImage(image, 0, 0);

    // ========= 3. VẼ BOUNDING BOX =========
    ctx.strokeStyle = "red";
    ctx.fillStyle = "red";
    ctx.lineWidth = 3;
    ctx.font = "20px Arial";

    predictions.forEach(p => {
  if (p.confidence >= 0.4) {
    const x = p.x - p.width / 2;
    const y = p.y - p.height / 2;

    // vẽ box
    ctx.strokeRect(x, y, p.width, p.height);

    const label = `VAPE ${(p.confidence * 100).toFixed(1)}%`;

    // đo chiều cao chữ
    const textHeight = 20;

    // nếu sát mép trên → vẽ trong box
    const textY = y - 10 < 0 ? y + textHeight + 5 : y - 5;

    // nền label (đẹp + dễ đọc)
    ctx.fillStyle = "red";
    ctx.fillRect(
      x,
      textY - textHeight,
      ctx.measureText(label).width + 10,
      textHeight + 4
    );

    // chữ
    ctx.fillStyle = "white";
    ctx.fillText(label, x + 5, textY);
  }
});


    // ========= 4. LƯU ẢNH KẾT QUẢ =========
    const filename = `result-${Date.now()}.png`;
    const outputPath = path.join(OUTPUT_DIR, filename);

    const buffer = canvas.toBuffer("image/png");
    fs.writeFileSync(outputPath, buffer);

    // ========= 5. XÓA ẢNH UPLOAD TẠM =========
    fs.unlinkSync(req.file.path);

    // ========= 6. TRẢ KẾT QUẢ =========
    return res.json({
      detected,
      predictions,
      result_image: `/outputs/${filename}` // URL CHUẨN
    });

  } catch (err) {
    console.error("❌ Detect vape error:", err);

    if (req.file?.path && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    return res.status(500).json({
      detected: false,
      error: err.message
    });
  }
});

module.exports = router;
