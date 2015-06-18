'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	errorHandler = require('./errors.server.controller'),
	Question = mongoose.model('Question'),
	_ = require('lodash');

/**
 * Create a question
 */
exports.create = function(req, res) {
	var question = new Question(req.body);
	question.user = req.user;

	question.save(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.json(question);
		}
	});
};

/**
 * Show the current question
 */
exports.read = function(req, res) {
	res.json(req.question);
};

/**
 * Update a question
 */
exports.update = function(req, res) {
	var question = req.question;

	question = _.extend(question, req.body);

	question.save(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.json(question);
		}
	});
};

/**
 * Delete an question
 */
exports.delete = function(req, res) {
	var question = req.question;

	question.remove(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.json(question);
		}
	});
};

/**
 * List of Questions
 */
exports.list = function(req, res) {
	Question.find().sort('-created').populate('user', 'displayName').exec(function(err, questions) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.json(questions);
		}
	});
};

/**
 * Question middleware
 */
exports.questionByID = function(req, res, next, id) {

	console.log(id);

	if (id === '' && !mongoose.Types.ObjectId.isValid(id)) {
		return res.status(400).send({
			message: 'Question is invalid'
		});
	} else if (mongoose.Types.ObjectId.isValid(id)) {
		Question.findById(id).populate('user', 'displayName').exec(function(err, question) {
			if (err) return next(err);
			if (!question) {
				var message = '_id ' + id + ' not found'; 
				return res.status(404).send({
					message: message
				});
			}
			req.question = question;
			next();
		});
	} else if (id !== '') {
		console.log(id);
		Question.findOne({ questionId: id }).populate('user', 'displayName').exec(function(err, question) {
			if (err) return next(err);
			if (!question) {
				var message = 'questionId ' + id + ' not found'; 
				return res.status(404).send({
					message: message
				});
			}
			req.question = question;
			next();
		});
	}
};

/**
 * Question authorization middleware
 */
exports.hasAuthorization = function(req, res, next) {
	/*if (req.question.user.id !== req.user.id) {
		return res.status(403).send({
			message: 'User is not authorized'
		});
	}*/
	next();
};
