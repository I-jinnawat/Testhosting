const express = require("express");
const router = express.Router();

const { list } = require("../Controllers/profile");

router.get("/profile", list);

module.exports = router;
