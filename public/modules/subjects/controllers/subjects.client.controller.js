'use strict';

angular.module('subjects').controller('SubjectsController', ['$scope', '$stateParams', '$location', '$filter', 'Authentication', 'Subjects',
	function($scope, $stateParams, $location, $filter, Authentication, Subjects) {
		$scope.authentication = Authentication;

		var orderBy = $filter('orderBy');

		$scope.order = function(array, predicate, reverse) {
	    	var sorted = orderBy(array, predicate, reverse);
	    	return sorted;
	  	};

		$scope.create = function() {
			var subject = new Subjects({
				name: this.name,
				description: this.description,
				subjectType: this.subjectType,
				subjectCode: this.subjectCode,
				subjectStartNode: this.subjectStartNode,
				status: this.status,
				testStatus: this.testStatus,
				prefix: this.prefix
			});
			subject.$save(function(response) {
				$location.path('subjects');

				$scope.name = '';
				$scope.description = '';
				$scope.subjectType = '';
				$scope.subjectCode = '';
				$scope.subjectStartNode = '';
				$scope.status = '';
				$scope.testStatus = '';
				$scope.prefix = '';
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
			});
		};

		$scope.remove = function(subject) {
			if (subject) {
				subject.$remove();

				for (var i in $scope.subjects) {
					if ($scope.subjects[i] === subject) {
						$scope.subjects.splice(i, 1);
					}
				}
			} else {
				$scope.subject.$remove(function() {
					$location.path('subjects');
				});
			}
		};

		$scope.update = function() {
			var subject = $scope.subject;

			subject.user = $scope.authentication.user._id;

			subject.$update(function() {
				$location.path('subjects');
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
			});
		};

		$scope.find = function() {
			Subjects.query(function(subjects){
				subjects = $scope.order(subjects, '-name', true);
				$scope.subjects = subjects;
			});
		};

		$scope.findOne = function() {
			$scope.admin = false;

			console.log($scope.authentication);

			angular.forEach($scope.authentication.user.roles, function(role, key){
				console.log(role);
				if (role === 'admin'){
					$scope.admin = true;
				}
			});

			console.log($scope.admin);
			
			
			Subjects.get({
				subjectId: $stateParams.subjectId
			}).$promise.then(function(subject){
				$scope.subject = subject;

				$scope.subject.editable = $scope.admin || $scope.authentication.user._id === subject.user._id ? true : false;
			});
		};
	}
]);