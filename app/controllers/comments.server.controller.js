'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	errorHandler = require('./errors.server.controller'),
	Comment = mongoose.model('Comment'),
	_ = require('lodash');

/**
 * Create a comment
 */
exports.create = function(req, res) {
	var comment = new Comment(req.body);
	comment.user = req.user;

	comment.save(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.json(comment);
		}
	});
};

/**
 * Show the current comment
 */
exports.read = function(req, res) {
	res.json(req.comment);
};

/**
 * Update a comment
 */
exports.update = function(req, res) {
	var comment = req.comment;

	comment = _.extend(comment, req.body);

	comment.save(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.json(comment);
		}
	});
};

/**
 * Delete an comment
 */
exports.delete = function(req, res) {
	var comment = req.comment;

	comment.remove(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.json(comment);
		}
	});
};

/**
 * List of Comments
 */
exports.list = function(req, res) {
	Comment.find().sort('-created').populate('user', 'username').exec(function(err, comments) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.json(comments);
		}
	});
};

/**
 * Comment middleware
 */
exports.commentByID = function(req, res, next, id) {
	Comment.findById(id).populate('user', 'username').exec(function(err, comment) {
		if (err) return next(err);
		if (!comment) return next(new Error('Failed to load comment ' + id));
		req.comment = comment;
		next();
	});
};

/**
 * Comment authorization middleware
 */
exports.hasAuthorization = function(req, res, next) {
	if (req.comment.user.id !== req.user.id) {
		return res.status(403).send({
			message: 'User is not authorized'
		});
	}
	next();
};