    require("dotenv").config();
    const express = require("express");
    const cors = require("cors");

    const adminRoutes = require("./admin.routes");

    const app = express();

    app.use(cors());
    app.use(express.json());

    // API for admin
    app.use("/admin", adminRoutes);

    const PORT = process.env.PORT || 4001;
    app.listen(PORT, () => {
        console.log(`🚀 Admin backend running on port ${PORT}`);
    });
