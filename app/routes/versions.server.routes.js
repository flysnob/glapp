'use strict';

/**
 * Module dependencies.
 */
var users = require('../../app/controllers/users.server.controller'),
	versions = require('../../app/controllers/versions.server.controller');

module.exports = function(app) {
	// Version Routes
	app.route('/versions')
		.get(versions.list)
		.post(users.requiresLogin, versions.create);

	app.route('/versions/:versionId')
		.get(versions.read)
		.put(users.requiresLogin, versions.hasAuthorization, versions.update)
		.delete(users.requiresLogin, versions.hasAuthorization, versions.delete);

	// Finish by binding the version middleware
	app.param('versionId', versions.versionByID);
};
