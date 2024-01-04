const router = require("express").Router();

// Import routes
const adminRoutes = require("../adminRoutes");
const userRoutes = require("../userRoutes");
const communityRoutes = require("../communityRoutes");
const paymentPerDownloadRoutes = require("../paymentPerDownloadRoutes");
const payoutRoutes = require("../payoutRoutes");
const adServiceRoutes = require("../adServiceRoutes");
const notificationRoutes = require("../notificationRoutes");

// Routes
router.use(adminRoutes);
router.use(userRoutes);
router.use(communityRoutes);
router.use(paymentPerDownloadRoutes);
router.use(payoutRoutes);
router.use(adServiceRoutes);
router.use(notificationRoutes);

module.exports = router;
