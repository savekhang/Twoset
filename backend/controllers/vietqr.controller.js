const axios = require('axios');

// Tạo mã QR chuyển khoản qua VietQR.io
exports.generateVietQR = async (req, res) => {
  try {
    const payload = {
      bankCode: 'VCB',                 // Vietcombank
      acqId: '970436',
      accountNo: '1025426795',
      accountName: 'LUU HOANG KHANG',
      amount: 100000,                  // ⚠️ CỐ ĐỊNH 100.000 VNĐ
      addInfo: 'Nap Premium Twoset',   // nội dung chuyển khoản cố định
      template: 'compact'
    };

    const response = await axios.post('https://api.vietqr.io/v2/generate', payload);
    const qrDataURL = response?.data?.data?.qrDataURL;

    if (!qrDataURL) {
      return res.status(500).json({ msg: 'Không nhận được QR từ VietQR', raw: response.data });
    }

    return res.json({
      qrDataURL: qrDataURL,
      qrCode: response.data.data.qrCode
    });

  } catch (err) {
    console.error('VietQR err:', err.response?.data || err.message);
    return res.status(500).json({ msg: 'Tạo VietQR thất bại' });
  }
};
