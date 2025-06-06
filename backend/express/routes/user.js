const router = require("express").Router();
const userController = require("../controllers/userController");
const upload = require("../middlewares/multer");
const { authorize } = require("../middlewares/adminAuth");

router.get("/", authorize("admin"), userController.getAllUsers);
router.get("/scan-history", userController.getScanHistory);
router.get("/:id", userController.getUserById);
router.patch("/update/:id", upload.single("image"), userController.updateUser);
router.delete("/delete/:id", authorize("admin"), userController.deleteUser);
router.post(
  "/pass-update/:id",
  authorize(["client", "admin"]),
  userController.updatePassword
);
router.get("/status/:id", userController.scanStatus);
// router.post("/scan", userController.sendScanRequst);
router.get("/result/:id", userController.result);
router.get("/scan/:scan_id", userController.getScanResult);
router.get("/scans/:id", userController.getScansByUserId);
router.get(
  "/scan-history",
  authorize(["client", "admin"]),
  userController.getScanHistory
);
router.post(
  "/submit-scan",
  authorize(["client", "admin"]),
  userController.submitScan
);

module.exports = router;
