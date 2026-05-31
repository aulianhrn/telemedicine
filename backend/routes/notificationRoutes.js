const express = require('express');
const auth = require('../middleware/auth');
const {
  listNotifications,
  markAllNotificationsRead,
  markNotificationRead,
  processNotificationEvents,
  registerDeviceToken,
  unregisterDeviceToken,
} = require('../controllers/notificationController');

const router = express.Router();

function workerAuth(req, res, next) {
  const expectedSecret = process.env.NOTIFICATION_WORKER_SECRET;
  const providedSecret = req.get('x-worker-secret') || req.get('x-notification-worker-secret');

  if (expectedSecret && providedSecret === expectedSecret) {
    return next();
  }

  return auth(req, res, next);
}

router.post('/device-token', auth, registerDeviceToken);
router.delete('/device-token', auth, unregisterDeviceToken);
router.get('/', auth, listNotifications);
router.patch('/read-all', auth, markAllNotificationsRead);
router.patch('/:id/read', auth, markNotificationRead);
router.post('/process-events', workerAuth, processNotificationEvents);

module.exports = router;
