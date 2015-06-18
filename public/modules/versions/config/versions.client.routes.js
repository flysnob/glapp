'use strict';

// Setting up route
angular.module('versions').config(['$stateProvider',
	function($stateProvider) {
		// Versions state routing
		$stateProvider.
		state('listVersions', {
			url: '/versions',
			templateUrl: 'modules/versions/views/list-versions.client.view.html'
		}).
		state('createVersion', {
			url: '/versions/create',
			templateUrl: 'modules/versions/views/create-version.client.view.html'
		}).
		state('viewVersion', {
			url: '/versions/:versionId',
			templateUrl: 'modules/versions/views/view-version.client.view.html'
		}).
		state('editVersion', {
			url: '/versions/:versionId/edit',
			templateUrl: 'modules/versions/views/edit-version.client.view.html'
		});
	}
]);