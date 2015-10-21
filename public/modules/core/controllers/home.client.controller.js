'use strict';


angular.module('core').controller('HomeController', ['$scope', 'Authentication', 'Subjects', '$filter',
	function($scope, Authentication, Subjects, $filter) {
		// This provides Authentication context.
		$scope.authentication = Authentication;

		angular.forEach($scope.authentication.user.roles, function(role, key){
			console.log(role);
			if (role === 'admin'){
				$scope.admin = true;
			}
		});

		$scope.isCollapsed = false;

		var orderBy = $filter('orderBy');

		$scope.order = function(array, predicate, reverse) {
	    	var sorted = orderBy(array, predicate, reverse);
	    	return sorted;
	  	};

		$scope.getSubjects = function() {
	  		var subjectsBetaObj = [];
	  		var subjectsLiveObj = [];
	  		var subjectsDevObj = [];

	  		Subjects.query(function(subjects){
				subjects = $scope.order(subjects, '-name', true);
				angular.forEach(subjects, function(subject, key){
					if (subject.status === 'active') {
						subject.prefix = subject.prefix.toLowerCase();
						if (subject.testStatus === 'beta') {
							subjectsBetaObj.push(subject);
						} else if (subject.testStatus === 'live') {
							subjectsLiveObj.push(subject);
						} else {
							subjectsDevObj.push(subject);
						}
					}
				});
				$scope.subjectsLive = subjectsLiveObj;
				$scope.showLive = $scope.subjectsLive.length > 0 ? true : false;
				$scope.subjectsBeta = subjectsBetaObj;
				$scope.showBeta = $scope.subjectsBeta.length > 0 ? true : false;
				$scope.subjectsDev = subjectsDevObj;
				$scope.showDev = $scope.subjectsDev.length > 0 ? true : false;
				console.log($scope.subjectsLive);
				console.log($scope.subjectsBeta);
				console.log($scope.subjectsDev);
			});
	  	};

	  	$scope.getLists = function() {
	  		$scope.getSubjects();
	  	};
	}
]);