const router = require("express").Router();

const {
  getAllCommunityImages,
  getOneCommunityImage,
  getActiveCommunityImages,
  getPendingCommunityImages,
  getCommunityImagesByUser,
  addOneCommunityImage,
  updateOneCommunityImage,
  updateViewCounter,
  addDownloadCounter,
  removeDownloadCounter,
  deleteOneCommunityImageById,
} = require("../controllers/communityController");
const { authorizeUserOrAdmin } = require("../middlewares/AuthorizeUserOrAdmin");

router.get(
  "/community-images/all",
  authorizeUserOrAdmin,
  getAllCommunityImages
);
router.get(
  "/community-images/find/:id",
  authorizeUserOrAdmin,
  getOneCommunityImage
);
router.get(
  "/community-images/active",
  authorizeUserOrAdmin,
  getActiveCommunityImages
);
router.get(
  "/community-images/pending",
  authorizeUserOrAdmin,
  getPendingCommunityImages
);
router.get(
  "/community-images/users/:userId",
  authorizeUserOrAdmin,
  getCommunityImagesByUser
);
router.post(
  "/community-images/add",
  authorizeUserOrAdmin,
  addOneCommunityImage
);
router.patch(
  "/community-images/update/:id",
  authorizeUserOrAdmin,
  updateOneCommunityImage
);
router.patch(
  "/community-images/add-views/:id",
  authorizeUserOrAdmin,
  updateViewCounter
);
router.patch(
  "/community-images/add-downloads/:id",
  authorizeUserOrAdmin,
  addDownloadCounter
);
router.patch(
  "/community-images/remove-downloads/:id",
  authorizeUserOrAdmin,
  removeDownloadCounter
);
router.delete(
  "/community-images/delete/:id",
  authorizeUserOrAdmin,
  deleteOneCommunityImageById
);

module.exports = router;
