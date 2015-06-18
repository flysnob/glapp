'use strict';

//Requirments_responses service used for communicating with the responses REST endpoints
angular.module('responses').factory('Responses', ['$resource',
	function($resource) {
		return $resource('responses/:responseId', {
			responseId: '@_id'
		}, {
			update: {
				method: 'PUT'
			}
		});
	}
]);