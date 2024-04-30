const express = require('express');
const router = express.Router();
const documentTagController = require('../controllers/DocumentTagController');


router.post('/tags', /* authMiddleware, */ documentTagController.createTag);

router.patch('/tags/:tagId', /* authMiddleware, */ documentTagController.updateTag);

router.delete('/tags/:tagId', /* authMiddleware, */ documentTagController.deleteTag);

router.post('/associate-tag', /* authMiddleware, */ documentTagController.associateTagWithDocument);

module.exports = router;
