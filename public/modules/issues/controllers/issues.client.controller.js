'use strict';

angular.module('issues').controller('IssuesController', ['$scope', '$stateParams', '$location', 'Authentication', 'Issues', '$filter', 'Comments', 'Subjects',
	function($scope, $stateParams, $location, Authentication, Issues, $filter, Comments, Subjects) {
		$scope.authentication = Authentication;

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

		$scope.create = function() {
			var issue = new Issues({
				title: this.title,
				type: this.type,
				nodeId: this.nodeId,
				subject: this.subject,
				content: this.content,
				permission: $scope.admin ? 'admin' : 'user',
				status: 'open'
			});
			issue.$save(function(response) {
				$location.path('issues');

				$scope.title = '';
				$scope.type = '';
				$scope.nodeId = '';
				$scope.subject = '';
				$scope.content = '';
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
			});
		};

		$scope.createComment = function() {
			console.log($scope.issue._id);
			var comment = new Comments({
				title: $scope.issue.title,
				content: $scope.commentContent,
				issue: $scope.issue._id
			});
			comment.$save(function(response) {
				console.log(response);
				$location.path('issues/' + $scope.issue._id);

				$scope.commentContent = '';
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
			});
		};

		$scope.remove = function(issue) {
			if (issue) {
				issue.$remove();

				for (var i in $scope.issues) {
					if ($scope.issues[i] === issue) {
						$scope.issues.splice(i, 1);
					}
				}
			} else {
				$scope.issue.$remove(function() {
					$location.path('issues');
				});
			}
		};

		$scope.update = function() {
			var issue = $scope.issue;

			issue.$update(function() {
				$location.path('issues');
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
			});
		};

		$scope.find = function() {
			var issuesUser = [];
			Issues.query(function(issues){
				angular.forEach(issues, function(issue, key){	
					if (issue.permission === 'user') issuesUser.push(issue);
				});

				$scope.issues = issues;// $scope.admin ? issues : issuesUser;
				console.log($scope.issues);
				
			});
		};

		$scope.findOne = function() {
			Issues.get({
				issueId: $stateParams.issueId
			}).$promise.then(function(issue){
				$scope.issue = issue;

				if (issue.shortId === '') {
					$scope.issue.shortId = $scope.issue._id.slice(-8);
					$scope.update();
				}

				$scope.showClosed = false;

				if ($scope.issue.status === 'closed') {
					$scope.showClosed = true;					
				};

				Comments.query(function(comments){ // filtered based on selected issue
					var commentsObj = [];
					comments = $scope.order(comments, '-created', true);
					angular.forEach(comments, function(comment, key){	
						if (comment.issue === issue._id) commentsObj.push(comment);
					});
					$scope.comments = commentsObj;
					console.log($scope.comments);
				});
			});
		};

		$scope.close = function() {
			$scope.issue.status = 'closed';
			$scope.issue.closedBy = $scope.authentication.user.username;
			$scope.issue.closedDate = new Date();;
			$scope.update();
		};

		$scope.open = function() {
			$scope.issue.status = 'open';
			$scope.update();
		};

		$scope.getComments = function() {
	  		Comments.query(function(comments){ // filter based on selected issue
				comments = $scope.order(comments, '-created', true);
				$scope.comments = comments;
				console.log(comments);
			});
	  	};

	  	$scope.getSubjects = function() {
	  		var subjectsObj = {};

	  		Subjects.query(function(subjects){
				subjects = $scope.order(subjects, '-name', true);
				angular.forEach(subjects, function(subject, key){
					if (subject.status === 'active') subjectsObj[subject.name] = subject.subjectCode;
				});
				$scope.subjects = subjectsObj;
				console.log($scope.subjects);
			});
	  	};

	  	$scope.getTypes = function() {
	  		var typesObj = {};

	  		typesObj.Accounting = '1';
	  		typesObj.Bug = '2';
	  		typesObj.Support = '3';
	  		typesObj.Other = '4';
	  		typesObj.Enhancement = '5';
	  		typesObj['Content - Summary'] = '6';
	  		typesObj['Content - Question'] = '7';
	  		typesObj['Content - ASC'] = '8';
	  		typesObj['Content - Help'] = '9';
	  		typesObj['Content - FAQ'] = '10';
	  		typesObj['Content - Other'] = '11';
	  		typesObj['Content - Accounting Recommendation'] = '12';
	  		typesObj['Content - Intermediate Decision'] = '13';

	  		$scope.types = typesObj;
	  		console.log($scope.types);
	  	};

	  	$scope.getLists = function() {
	  		$scope.getSubjects();
	  		$scope.getTypes();
	  	};

	  	$scope.filter = function(filter) {
	  		console.log(filter);
	  	};
	}
]);