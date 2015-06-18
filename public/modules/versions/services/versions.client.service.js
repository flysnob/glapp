'use strict';

//Versions service used for communicating with the versions REST endpoints
angular.module('versions').factory('Versions', ['$resource',
	function($resource) {
		return $resource('versions/:versionId', {
			versionId: '@_id'
		}, {
			update: {
				method: 'PUT'
			}
		});
	}
]);