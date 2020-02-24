const router = require('express').Router()

router.get('/address/:search', async (req, res) => {
	res.send(req.body)
})

module.exports = router
