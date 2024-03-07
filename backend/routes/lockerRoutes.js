const express = require('express');
const router = express.Router();
const lockerController = require('../controllers/LockerController');

// Middleware imports or definitions would go here, if you have any.

// POST route for creating a new locker.
router.post('/create', lockerController.createLocker);

// POST route for granting permissions to a dummy user.
router.post('/grant-permissions', lockerController.grantPermissionsToDummyUser);

// Export the router to use it in your app.js or server.js file
module.exports = router;
