'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	errorHandler = require('./errors.server.controller'),
	Page = mongoose.model('Page'),
	_ = require('lodash');

/**
 * Create a page
 */
exports.create = function(req, res) {
	var page = new Page(req.body);
	page.user = req.user;

	page.save(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.json(page);
		}
	});
};

/**
 * Show the current page
 */
exports.read = function(req, res) {
	res.json(req.page);
};

/**
 * Update a page
 */
exports.update = function(req, res) {
	var page = req.page;

	page = _.extend(page, req.body);

	page.save(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.json(page);
		}
	});
};

/**
 * Delete an page
 */
exports.delete = function(req, res) {
	var page = req.page;

	page.remove(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.json(page);
		}
	});
};

/**
 * List of Pages
 */
exports.list = function(req, res) {
	Page.find().sort('-created').populate('user', 'displayName').exec(function(err, pages) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.json(pages);
		}
	});
};

/**
 * Page middleware
 */
exports.pageByID = function(req, res, next, id) {

	console.log(id);

	if (id !== '') {
		console.log(id);
		Page.findOne({ url: id }).populate('user', 'displayName').exec(function(err, page) {
			if (err) return next(err);
			if (!page) {
				var message = 'pageId ' + id + ' not found'; 
				return res.status(404).send({
					message: message
				});
			}
			req.page = page;
			next();
		});
	}
};

/**
 * Page authorization middleware
 */
exports.hasAuthorization = function(req, res, next) {
	if (req.page.user.id !== req.user.id) {
		return res.status(403).send({
			message: 'User is not authorized'
		});
	}
	next();
};