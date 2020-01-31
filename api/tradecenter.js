const router = require('express').Router();
const tools = require('./apiTools');
const discordauth = require('./tradecenter/discordauth');

router.use('/discordauth', discordauth);

router.use('*', tools.APIerror('Invalid Trade Center Endpoint'));

module.exports = router;