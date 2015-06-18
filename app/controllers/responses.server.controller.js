'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	errorHandler = require('./errors.server.controller'),
	Response = mongoose.model('Response'),
	_ = require('lodash');

/**
 * Create a response
 */
exports.create = function(req, res) {
	var response = new Response(req.body);
	response.user = req.user;

	response.save(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.json(response);
		}
	});
};

/**
 * Show the current response
 */
exports.read = function(req, res) {
	res.json(req.response);
};

/**
 * Update a response
 */
exports.update = function(req, res) {
	var response = req.response;

	response = _.extend(response, req.body);

	response.save(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.json(response); // response?
		}
	});
};

/**
 * Delete a response
 */
exports.delete = function(req, res) {
	var response = req.response;

	response.remove(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.json(response); // response?
		}
	});
};

/**
 * List of Responses
 */
exports.list = function(req, res) {
	Response.find().sort('-created').populate('user', 'displayName').exec(function(err, responses) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.json(responses);
		}
	});
};

/**
 * Response middleware
 */
exports.responseByID = function(req, res, next, id) {

	if (!mongoose.Types.ObjectId.isValid(id)) {
		return res.status(400).send({
			message: 'Response is invalid'
		});
	}

	Response.findById(id).populate('user', 'displayName').exec(function(err, response) {
		if (err) return next(err);
		if (!response) {
			return res.status(404).send({
  				message: 'Response not found'
  			});
		}
		req.response = response;
		next();
	});
};

/**
 * Response authorization middleware
 */
exports.hasAuthorization = function(req, res, next) {
	if (req.response.user.id !== req.user.id) {
		return res.status(403).send({
			message: 'User is not authorized'
		});
	}
	next();
};