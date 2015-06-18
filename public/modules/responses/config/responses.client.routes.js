'use strict';

// Setting up route
angular.module('responses').config(['$stateProvider',
	function($stateProvider) {
		// Responses state routing
		$stateProvider.	
		state('createPreferenceResponse', {
			url: '/responses/create/preference/:projectId',
			templateUrl: 'modules/responses/views/create-preference-response.client.view.html',
			controller: function($stateParams){
				$stateParams.projectId;
			}
		}).
		state('createBinaryResponse', {
			url: '/responses/create/:projectId',
			templateUrl: 'modules/responses/views/create-response.client.view.html',
			controller: function($stateParams){
				$stateParams.projectId;
			}
		}).
		state('listResponses', {
			url: '/responses/:projectId',
			templateUrl: 'modules/responses/views/list-responses.client.view.html'
		}).
		state('reportRequirementResponses', {
			url: '/responses/report/:projectId',
			templateUrl: 'modules/responses/views/report-response.client.view.html',
		});
	}
]);