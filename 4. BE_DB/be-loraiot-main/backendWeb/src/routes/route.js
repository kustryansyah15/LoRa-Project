const router = require('express').Router();
const { mon } = require('../controllers');

router.get('/data', mon.getData);
router.get('/data/:date', mon.getDataByDate);
router.get('/monthly-data/:month', mon.getDataByMonth);
router.get('/available-dates', mon.getAvailableDates);
router.get('/download-data/:date', mon.downloadDataByDate);
router.get('/nodes', mon.getNodes);

module.exports = router;