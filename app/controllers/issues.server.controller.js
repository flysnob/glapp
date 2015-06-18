'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	errorHandler = require('./errors.server.controller'),
	Issue = mongoose.model('Issue'),
	_ = require('lodash');

/**
 * Create a issue
 */
exports.create = function(req, res) {
	var issue = new Issue(req.body);
	issue.user = req.user;

	issue.save(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.json(issue);
		}
	});
};

/**
 * Show the current issue
 */
exports.read = function(req, res) {
	res.json(req.issue);
};

/**
 * Update a issue
 */
exports.update = function(req, res) {
	var issue = req.issue;

	issue = _.extend(issue, req.body);

	issue.save(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.json(issue);
		}
	});
};

/**
 * Delete an issue
 */
exports.delete = function(req, res) {
	var issue = req.issue;

	issue.remove(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.json(issue);
		}
	});
};

/**
 * List of Issues
 */
exports.list = function(req, res) {
	Issue.find().sort('-created').populate('user', 'username').exec(function(err, issues) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.json(issues);
		}
	});
};

/**
 * Issue middleware
 */
exports.issueByID = function(req, res, next, id) {
	Issue.findById(id).populate('user', 'username').exec(function(err, issue) {
		if (err) return next(err);
		if (!issue) return next(new Error('Failed to load issue ' + id));
		req.issue = issue;
		next();
	});
};

/**
 * Issue authorization middleware
 */
exports.hasAuthorization = function(req, res, next) {
	if (req.issue.user.id !== req.user.id) {
		return res.status(403).send({
			message: 'User is not authorized'
		});
	}
	next();
};