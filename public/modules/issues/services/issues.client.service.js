'use strict';

//Issues service used for communicating with the issues REST endpoints
angular.module('issues').factory('Issues', ['$resource',
	function($resource) {
		return $resource('issues/:issueId', {
			issueId: '@_id'
		}, {
			update: {
				method: 'PUT'
			}
		});
	}
]);