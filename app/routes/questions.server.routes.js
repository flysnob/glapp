'use strict';

/**
 * Module dependencies.
 */
var users = require('../../app/controllers/users.server.controller'),
	questions = require('../../app/controllers/questions.server.controller');

module.exports = function(app) {
	// Question Routes
	app.route('/questions')
		.get(questions.list)
		.post(users.requiresLogin, questions.create);

	app.route('/questions/:questionId')
		.get(questions.read)
		.put(users.requiresLogin, questions.hasAuthorization, questions.update)
		.delete(users.requiresLogin, questions.hasAuthorization, questions.delete);

	// Finish by binding the question middleware
	app.param('questionId', questions.questionByID);
};
