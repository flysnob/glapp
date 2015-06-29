'use strict';

// Projects controller
angular.module('projects').controller('ProjectsController', ['$scope', '$stateParams', '$location', '$filter', 'Authentication', 'Projects', 'Responses', 'Subjects', 'Versions',
	function($scope, $stateParams, $location, $filter, Authentication, Projects, Responses, Subjects, Versions) {
		$scope.authentication = Authentication;

		console.log($scope.authentication);

		angular.forEach($scope.authentication.user.roles, function(role, key){
			console.log(role);
			if (role === 'admin'){
				$scope.admin = true;
			} else {
				$scope.admin = false;
			}
		});

		var orderBy = $filter('orderBy');

		$scope.order = function(array, predicate, reverse) {
	    	var sorted = orderBy(array, predicate, reverse);
	    	return sorted;
	  	};

	  	$scope.getVersions = function() {
	  		Versions.query(function(versions){
				versions = $scope.order(versions, '-description', true);
				$scope.versions = versions;
			});
	  	};

	  	$scope.getSubjects = function() {
	  		Subjects.query(function(subjects){
				subjects = $scope.order(subjects, '-name', true);
				
				var subjectsObj = [];

				angular.forEach(subjects, function(subject, key){
					if (subject.status === 'active' && (subject.testStatus === 'live' || subject.testStatus === 'beta')) {
						if (subject.testStatus === 'beta') subject.name = subject.name += ' (beta)';
						subjectsObj.push(subject);
					}
				});
				$scope.subjects = subjectsObj;
				console.log($scope.subjects);
			});
	  	};

	  	$scope.getLists = function() {
	  		$scope.getVersions();
	  		$scope.getSubjects();

	  		$scope.showVersions = false;
	  		$scope.showFilteredVersions = false;
	  		$scope.showDescription = false;
	  	};

	  	$scope.filterVersions = function() {
	  		console.log($scope.subjects);
	  		console.log($scope.versions);

	  		var subject = typeof $scope.project !== 'undefined' ? $scope.project.subject : $scope.subject;

	  		var versions = [];

	  		angular.forEach($scope.versions, function(version, key){
				if (subject.subjectCode === version.subject) {
					versions.push(version);
				}
			});

			$scope.subjectVersions = versions;

			$scope.showFilteredVersions = true;

			console.log(subject);

			$scope.subject = subject;
			
			$scope.showDescription = subject.description !== '' ? true : false;
	  	};

		$scope.types = [
			{typeCode: '1', typeShort: 'elt', typeLong: 'Equity-Linked Transactions', typeStartNode: '1'},
			{typeCode: '2', typeShort: 'vie', typeLong: 'Variable Interest Entity Consolidation Model', typeStartNode: '301'},
			{typeCode: '3', typeShort: 'revrec', typeLong: 'Revenue Recognition', typeStartNode: ''},
			{typeCode: '4', typeShort: 'der', typeLong: 'Freestanding Derivatives', typeStartNode: '1001'},
			{typeCode: '4', typeShort: 'fcdr', typeLong: 'Forward Commitment Dollar Roll', typeStartNode: '1002'}
		];

		console.log($scope.types);
		console.log($scope.types[1].typeCode);

		// Create new Project
		$scope.create = function() {			

			var project = new Projects({
				title: this.title,
				entity: this.entity,
				description: this.description,
				subject: $scope.subject,
				version: $scope.version
			});

			// Redirect after save
			project.$save(function(response) {
				$location.path('responses/create/' + response._id);

				// Clear form fields
				$scope.title = '';
				$scope.entity = '';
				$scope.description = '';
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
			});
		};

		// Remove existing Project
		$scope.remove = function(project) {
			if (project) {
				Responses.query(function(responses){
					angular.forEach(responses, function(response, key){
						if (response.projectId === project._id) {
							response.$remove();
						}
					});
				});

				project.$remove();

				for (var i in $scope.projects) {
					if ($scope.projects[i] === project) {
						$scope.projects.splice(i, 1);
					}
				}

			} else {
				Responses.query(function(responses){
					angular.forEach(responses, function(response, key){
						if (response.projectId === $scope.project._id) {
							response.$remove();
						}
					});
				}).$promise.then(function(){
					$scope.project.$remove(function() {
						$location.path('projects');
					});
				})
			}
		};

		// Update existing Project
		$scope.update = function() {
			var project = $scope.project;
			console.log($scope.version);

			if (typeof $scope.version !== 'undefined') project.version = $scope.version;

			project.$update(function() {
				$location.path('projects/' + project._id);
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
			});
		};

		// Find a list of Projects
		$scope.find = function() { // To do: modify .query() to return projects for user instead of all; delete the forEach loop
			console.log($scope.admin);
			if ($scope.admin) {
				$scope.projects = Projects.query();
			} else {
				$scope.projects = [];

				Projects.query(function(projects){
					console.log(projects);

					angular.forEach(projects, function(project, key){
						console.log(project);
						if (project.user._id === $scope.authentication.user._id){
							$scope.projects.push(project);
						}
					});
				});
			}
		};

		// Find existing Project
		$scope.findOne = function() {
			Projects.get({
				projectId: $stateParams.projectId
			}).$promise.then(function(project){
				$scope.showVersions = false;
				$scope.project = project;
				$scope.getLists();
			});
		};
	}
]);

/* TO DOs

1. Multiple "projects" within a project (e.g., several embedded derivatives within a single instrument)
2. Link projects to a single transaction (e.g., convertible debt issued issued with freestanding warrants are related but are separate instruments)
3. Company and/or client name for report
4. Project billing
5. Tool versioning process and change description

*/