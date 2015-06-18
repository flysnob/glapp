'use strict';

/**
 * Module dependencies.
 */
var users = require('../../app/controllers/users.server.controller'),
	issues = require('../../app/controllers/issues.server.controller');

module.exports = function(app) {
	// Issue Routes
	app.route('/issues')
		.get(issues.list)
		.post(users.requiresLogin, issues.create);

	app.route('/issues/:issueId')
		.get(issues.read)
		.put(users.requiresLogin, issues.hasAuthorization, issues.update)
		.delete(users.requiresLogin, issues.hasAuthorization, issues.delete);

	// Finish by binding the issue middleware
	app.param('issueId', issues.issueByID);
};