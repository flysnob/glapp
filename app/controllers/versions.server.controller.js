'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	errorHandler = require('./errors.server.controller'),
	Version = mongoose.model('Version'),
	_ = require('lodash');

/**
 * Create a version
 */
exports.create = function(req, res) {
	var version = new Version(req.body);
	version.user = req.user;

	version.save(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.json(version);
		}
	});
};

/**
 * Show the current version
 */
exports.read = function(req, res) {
	res.json(req.version);
};

/**
 * Update a version
 */
exports.update = function(req, res) {
	var version = req.version;

	version = _.extend(version, req.body);

	version.save(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.json(version);
		}
	});
};

/**
 * Delete an version
 */
exports.delete = function(req, res) {
	var version = req.version;

	version.remove(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.json(version);
		}
	});
};

/**
 * List of Versions
 */
exports.list = function(req, res) {
	Version.find().sort('-created').populate('user', 'displayName').exec(function(err, versions) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.json(versions);
		}
	});
};

/**
 * Version middleware
 */
exports.versionByID = function(req, res, next, id) {

	if (!mongoose.Types.ObjectId.isValid(id)) {
		return res.status(400).send({
			message: 'Version is invalid'
		});
	}

	Version.findById(id).populate('user', 'displayName').exec(function(err, version) {
		if (err) return next(err);
		if (!version) {
			return res.status(404).send({
				message: 'Version not found'
			});
		}
		req.version = version;
		next();
	});
};

/**
 * Version authorization middleware
 */
exports.hasAuthorization = function(req, res, next) {
	/*if (req.version.user.id !== req.user.id) {
		return res.status(403).send({
			message: 'User is not authorized'
		});
	}*/
	next();
};
