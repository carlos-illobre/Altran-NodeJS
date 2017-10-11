const glob = require('glob')

module.exports = () => glob.sync('**/*.route.js', {
	cwd: `${__dirname}/`
})
.reduce(
	(router, filename) => router.use(require(`./${filename}`)),
	require('express').Router({mergeParams: true})
)

