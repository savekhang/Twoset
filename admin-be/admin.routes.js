const express = require("express");
const router = express.Router();
const admin = require("./admin.controller");
const adminMiddleware = require("./admin.middleware");

// Login
router.post("/login", admin.adminLogin);

// Users
router.get("/users", adminMiddleware, admin.getUsers);
router.get("/users/:id", adminMiddleware, admin.getUserDetail);
router.get("/users/:id/albums", adminMiddleware, admin.getUserAlbum);
router.post("/users/:id/send-mail", adminMiddleware, admin.sendUserMail);
router.put("/users/:id", adminMiddleware, admin.updateUser);      
router.delete("/users/:id", adminMiddleware, admin.deleteUser);
router.post("/users", adminMiddleware, admin.createUser);  // Tạo user mới (không bcrypt)
// Interactions
router.get("/interactions", adminMiddleware, admin.getInteractions);

// Reports
router.get("/reports", adminMiddleware, admin.getReports);

// System stats
router.get("/stats", adminMiddleware, admin.getSystemStats);
router.get("/dashboard-stats", adminMiddleware, admin.getDashboardStats)

module.exports = router;
