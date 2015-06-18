'use strict';

/**
 * Module dependencies.
 */
var users = require('../../app/controllers/users.server.controller'),
	subjects = require('../../app/controllers/subjects.server.controller');

module.exports = function(app) {
	// Subject Routes
	app.route('/subjects')
		.get(subjects.list)
		.post(users.requiresLogin, subjects.create);

	app.route('/subjects/:subjectId')
		.get(subjects.read)
		.put(users.requiresLogin, subjects.hasAuthorization, subjects.update)
		.delete(users.requiresLogin, subjects.hasAuthorization, subjects.delete);

	// Finish by binding the subject middleware
	app.param('subjectId', subjects.subjectByID);
};
