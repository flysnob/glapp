'use strict';

/**
 * Module dependencies.
 */
var users = require('../../app/controllers/users.server.controller'),
	responses = require('../../app/controllers/responses.server.controller');

module.exports = function(app) {
	// Response Routes
	app.route('/responses')
		.get(responses.list)
		.post(users.requiresLogin, responses.create);

	app.route('/responses/:responseId')
		.get(responses.read)
		.put(users.requiresLogin, responses.hasAuthorization, responses.update)
		.delete(users.requiresLogin, responses.hasAuthorization, responses.delete);

	// Finish by binding the response middleware
	app.param('responseId', responses.responseByID);
};