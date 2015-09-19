'use strict';

angular.module('versions').controller('VersionsController', ['$scope', '$stateParams', '$location', '$filter', 'Authentication', 'Versions', 'Subjects', '$q',
	function($scope, $stateParams, $location, $filter, Authentication, Versions, Subjects, $q) {
		$scope.authentication = Authentication;

		var orderBy = $filter('orderBy');

		$scope.order = function(array, predicate, reverse) {
	    	var sorted = orderBy(array, predicate, reverse);
	    	return sorted;
	  	};

	  	$scope.getSubjects = function() {
	  		var subjectsObj = {};

	  		Subjects.query(function(subjects){
	  			$scope.subjectsMaster = subjects;
				subjects = $scope.order(subjects, '-name', true);
				angular.forEach(subjects, function(subject, key){
					if (subject.status === 'active') subjectsObj[subject.name] = subject.subjectCode;
				});
				$scope.subjects = subjectsObj;
				console.log($scope.subjects);
			});
	  	};

		$scope.create = function() {
			console.log(this.versionJson);
			console.log(this.subject);

			var thisSubject = this.subject;
			var thisVersionId = this.versionId;

			var description;
			var code;

			angular.forEach($scope.subjectsMaster, function(subject, key){
				if (thisSubject === subject.subjectCode) {
					description = subject.name + ' v' + thisVersionId;
					code = subject.prefix + '.' + thisVersionId;
				}
			});

			var version = new Versions({
				subject: this.subject,
				description: description,
				versionId: this.versionId,
				effective: this.effective,
				status: this.status,
				versionCode: code,
				versionJson: angular.fromJson(this.versionJson)
			});
			version.$save(function(response) {
				$location.path('versions');

				$scope.subject = '';
				$scope.description = '';
				$scope.versionId = '';
				$scope.effective = '';
				$scope.status = '';
				$scope.versionCode = '';
				$scope.versionJson = '';
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
			});
		};

		$scope.remove = function(version) {
			if (version) {
				version.$remove();

				for (var i in $scope.versions) {
					if ($scope.versions[i] === version) {
						$scope.versions.splice(i, 1);
					}
				}
			} else {
				$scope.version.$remove(function() {
					$location.path('versions');
				});
			}
		};

		$scope.update = function() {
			console.log($scope.version.versionJson);
			console.log(angular.fromJson($scope.version.versionJson));
			var version = $scope.version;
			console.log(version);

			var description;
			var code;

			angular.forEach($scope.subjectsMaster, function(subject, key){
				if (version.subject === subject.subjectCode) {
					description = subject.name + ' v' + version.versionId;
					code = subject.prefix + '.' + version.versionId;
				}
			});

			version.versionJson = angular.fromJson($scope.version.versionJson);
			version.versionCode = code;
			version.description = description;

			version.$update(function() {
				$location.path('versions');
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
			});
		};

		$scope.find = function() {
			Versions.query(function(versions){
				versions = $scope.order(versions, '-name', true);
				$scope.versions = versions;
			});
		};

		$scope.findOne = function() {
			Versions.get({
				versionId: $stateParams.versionId
			}).$promise.then(function(version){
				version.versionJson = angular.toJson(version.versionJson);

				$scope.version = version;
				console.log($scope.version);

				$scope.getSubjects();
			});
		};

		$scope.test = function() {
			var jsonString = $scope.version;
			console.log(jsonString);

			$scope.versionJson = angular.fromJson($scope.version.versionJson);

			$scope.initVisited();

			$scope.buildObject();

			// how does angular deal with promise/deferred?
			var result = $scope.getNode($scope.versionJson[0].nodeId);

			result.then(function(){
				console.log($scope.visited);
				var notVisted = 0;
				angular.forEach($scope.visited, function(value, key) {
					if (value === 0) {
						notVisted++;
					}
				});
				console.log(notVisted);
			});
		};

		$scope.buildObject = function() {
			$scope.object = {};
			angular.forEach($scope.versionJson, function(node, key) {
				$scope.object[node.nodeId] = {t1: node.target_1, t2: node.target_2, t3: node.target_3};
			});
			console.log($scope.object);
		};

		$scope.initVisited = function() {
			$scope.visited = {};
			angular.forEach($scope.versionJson, function(node, key) {
				$scope.visited[node.nodeId] = 0;
			});
			console.log($scope.visited);

		};

		$scope.getNode = function(target, deferred) {
			//console.log(target);
			//console.log($scope.object[target]);
			//console.log(angular.isObject($scope.object[target]));

			console.log(deferred);

			if (typeof deferred === 'undefined') {
				var deferred = $q.defer();
			}

			if (angular.isObject($scope.object[target]) && $scope.visited[target] !== 1) {
				$scope.visited[target] = 1;
				angular.forEach($scope.object[target], function(t, k) {
					if (t !== '') {
						var def = $q.defer();
						//console.log(k, t);
						$scope.getNode(t, def);
					}
				});
			} else if ($scope.visited[target] !== 1) {
				$scope.visited[target] = 1;
				deferred.resolve();
				//console.log(deferred)
            	return deferred.promise;
			}

			deferred.resolve();
			return deferred.promise;
		};
	}
]);