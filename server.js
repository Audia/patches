"use strict";

var fspath = require('path')
var connect = require('express')
var fs = require('fs')

var WEBROOT = './browser/'
var PROJECT = process.argv[2] || WEBROOT

console.log('using webroot ', WEBROOT, 'project root', PROJECT)

function showFolderListing(reTest) {
	return function(req, res, next) {
		console.log('showFolderListing', req.path)

		fs.readdir(PROJECT + req.path, function(err, files) {
			if (err)
				return next(err)

			res.send(files.filter(function(file) {
				return reTest.test(file)
			}))
		})
	}
}

var app = connect()

	.use(connect.logger(':remote-addr :method :url :status :res[content-length] - :response-time ms'))

	.use(function(req, res, next) {
		if (req.url.indexOf('?_') > -1)
			req.url = req.url.substring(0, req.url.indexOf('?_'))
		next()
	})

	// Engi static files
	.use(connect['static'](WEBROOT, { maxAge: 60 * 60 * 24 * 1000 }))

	// Project static files
	.use(connect['static'](PROJECT, { maxAge: 0 }))

	// Textures
	.get('/data/textures', showFolderListing(/^[^.].*$/))

	// set no-cache headers for the rest
	.use(function(req, res, next) {
		res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate, max-age=0')
		res.setHeader('Expires', 0)
		next()
	})

	// Graphs
	.get('/graphs', showFolderListing(/\.json$/))
	.post(/\/graphs\/.*/, function(req, res, next) {
		var savePath = decodeURIComponent(req.path)
			.replace(/graphs\/[^a-zA-Z0-9\ \.\-\_]/, '_')

		if (!/\.json$/.test(savePath))
			savePath = savePath+'.json'

		var stream = fs.createWriteStream(PROJECT + savePath)

		stream.on('error', next)
		stream.on('close', function() {
			res.send({})
		})

		req.pipe(stream)
	})

	.use(connect.errorHandler())

	.listen(8000, '127.0.0.1')


