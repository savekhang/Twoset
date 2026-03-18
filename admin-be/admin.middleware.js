const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
    const auth = req.headers.authorization;

    if (!auth || !auth.startsWith("Bearer ")) {
        return res.status(401).json({ message: "Missing token" });
    }

    const token = auth.split(" ")[1];

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // ❗ KIỂM TRA ROLE ADMIN
        if (!decoded.role || decoded.role !== "admin") {
            return res.status(403).json({ message: "Permission denied. Admin only." });
        }

        req.admin = decoded;
        next();
    } catch (err) {
        return res.status(401).json({ message: "Invalid token" });
    }
};
