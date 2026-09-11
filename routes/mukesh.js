const express = require('express');
const path = require('path');
const router = express.Router();

// GET /mukesh
router.get('/', (req, res) => {
    res.render('mukesh/mukesh')
});

module.exports = router;