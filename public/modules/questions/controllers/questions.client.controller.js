'use strict';

// Questions controller
angular.module('questions').controller('QuestionsController', ['$scope', '$stateParams', '$location', '$filter', 'Authentication', 'Questions', '$templateCache', 'Subjects', 'Issues', 'Versions',
	function($scope, $stateParams, $location, $filter, Authentication, Questions, $templateCache, Subjects, Issues, Versions) {
		$scope.authentication = Authentication;

		var orderBy = $filter('orderBy');

		$scope.order = function(array, predicate, reverse) {
	    	var sorted = orderBy(array, predicate, reverse);
	    	return sorted;
	  	};

	  	$scope.admin = false;

		angular.forEach($scope.authentication.user.roles, function(role, key){
			console.log(role);
			if (role === 'admin'){
				$scope.admin = true;
			}
		});

	  	$scope.changeCreate = function() {
	  		console.log($scope.type);
	  		var question = {};
	  		switch($scope.type){
	  			case 'q':
	  				$scope.template = $scope.templates[0];
	  				break;
	  			case 'd':
	  				$scope.template = $scope.templates[1];
	  				break;
	  			case 'r':
	  				$scope.template = $scope.templates[2];
	  				break;
	  			case 'i':
	  				$scope.template = $scope.templates[7];
	  				break;
	  			default:
	  				$scope.template = $scope.templates[0];
	  				break;
	  		}
	  		console.log($scope.template);
	  	};

	  	$scope.changeEdit = function() {
	  		console.log($scope.question.type);
	  		var question = {};
	  		switch($scope.question.type){
	  			case 'q':
	  				$scope.template = $scope.templates[3];
	  				break;
	  			case 'd':
	  				$scope.template = $scope.templates[4];
	  				break;
	  			case 'r':
	  				$scope.template = $scope.templates[5];
	  				break;
	  			case 'i':
	  				$scope.template = $scope.templates[8];
	  				break;
	  			default:
	  				$scope.template = $scope.templates[3];
	  				break;
	  		}
	  		console.log($scope.template);
	  	};

	  	$scope.getVersions = function() {
	  		Versions.query(function(versions){
				versions = $scope.order(versions, '-description', true);
				$scope.versions = versions;
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

	  	$scope.getLists = function() {
	  		$scope.getVersions();
	  		$scope.getSubjects();

	  		$scope.showVersions = false;
	  	};

	  	$scope.filterVersions = function() {
	  		console.log($scope.subjects);
	  		console.log($scope.versions);

	  		var subject = typeof $scope.question !== 'undefined' ? $scope.question.subject : $scope.subject;

	  		if (typeof $scope.question !== 'undefined') {
	  			$scope.question.firstVersion = '';
	  			$scope.question.lastVersion = '';
	  		}

	  		console.log(subject);

	  		var versions = {};

	  		angular.forEach($scope.versions, function(version, key){
				if (subject === version.subject) {
					versions[version.description] = version.versionId;
				}
			});

			$scope.subjectVersions = versions;

			console.log($scope.subjectVersions);

			$scope.showVersions = true;
	  	};

	  	$scope.templates = [
			{ name: 'create-question_template.html', url: 'modules/questions/views/create-question_template.html' },
	        { name: 'create-decision_template.html', url: 'modules/questions/views/create-decision_template.html' },
	        { name: 'create-recommendation_template.html', url: 'modules/questions/views/create-recommendation_template.html' },
	        { name: 'edit-question_template.html', url: 'modules/questions/views/edit-question_template.html' },
	        { name: 'edit-decision_template.html', url: 'modules/questions/views/edit-decision_template.html' },
	        { name: 'edit-recommendation_template.html', url: 'modules/questions/views/edit-recommendation_template.html' },
	        { name: 'create-info_template.html', url: 'modules/questions/views/create-info_template.html' },
	        { name: 'edit-info_template.html', url: 'modules/questions/views/edit-info_template.html' },
		];

		$templateCache.get('modules/questions/views/create-question_template.html');
		$templateCache.get('modules/questions/views/create-decision_template.html');
		$templateCache.get('modules/questions/views/create-recommendation_template.html');
		$templateCache.get('modules/questions/views/edit-question_template.html');
		$templateCache.get('modules/questions/views/edit-decision_template.html');
		$templateCache.get('modules/questions/views/edit-recommendation_template.html');
		$templateCache.get('modules/questions/views/create-info_template.html');
		$templateCache.get('modules/questions/views/edit-info_template.html');

		// Create new Question
		$scope.create = function(question) {
			// Create new Question object
			console.log(question);
			console.log(question.question);
			console.log($scope.type);
			var newQuestion = new Questions({
				questionId: question.questionId,
				question: question.question,
				summary: question.summary,
				reportSummary: question.reportSummary,
				type: $scope.type,
				subject: $scope.subject,
				help: question.help,
				faq: question.faq,
				asc: question.asc,
				examples: question.examples,
				response_1: $scope.type === 'r' ? '' : question.response_1,
				response_2: $scope.type === 'r' ? '' : question.response_2,
				response_3: $scope.type === 'r' ? '' : question.response_3,
				target_1: $scope.type === 'r' ? '' : question.target_1,
				target_2: $scope.type === 'r' ? '' : question.target_2,
				target_3: $scope.type === 'r' ? '' : question.target_3,
				conclusion_1: $scope.type === 'd' ? question.conclusion_1 : '',
				conclusion_2: $scope.type === 'd' ? question.conclusion_2 : '',
				conclusion_3: $scope.type === 'd' ? question.conclusion_3 : '',
				failResponse: question.failResponse,
				decisionNodeId: question.decisionNode
			});

			// Redirect after save
			newQuestion.$save(function(response) {
				$location.path('questions');
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
			});
		};

		// Remove existing Question
		$scope.remove = function(question) {
			if (question) {
				question.$remove();

				for (var i in $scope.questions) {
					if ($scope.questions[i] === question) {
						$scope.questions.splice(i, 1);
					}
				}
			} else {
				$scope.question.$remove(function() {
					$location.path('questions');
				});
			}
		};

		// Update existing Question
		$scope.update = function() {
			var question = $scope.question;

			console.log(question);

			question.conclusion_1 = question.type === 'd' ? question.conclusion_1 : '';
			question.conclusion_2 = question.type === 'd' ? question.conclusion_2 : '';
			question.conclusion_3 = question.type === 'd' ? question.conclusion_3 : '';

			question.$update(function() {
				$location.path('questions');
				//$location.path('questions/' + question._id);
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
			});
		};

		// Find a list of Questions
		$scope.find = function() {
			$scope.getLists();
			Questions.query(function(questions){
				$scope.questions = $scope.order(questions, '-sort', true);

				$scope.all = true;
			});
		};

		// Find existing Question
		$scope.findOne = function() {
			Questions.get({
				questionId: $stateParams.questionId
			}).$promise.then(function(question){
				$scope.question = question;
				console.log(question);
				$scope.getLists();

				switch($scope.question.type){
		  			case 'q':
		  				$scope.template = $scope.templates[3];
		  				break;
		  			case 'd':
		  				$scope.template = $scope.templates[4];
		  				break;
		  			case 'r':
		  				$scope.template = $scope.templates[5];
		  				break;
		  			case 'i':
		  				$scope.template = $scope.templates[8];
		  				break;
		  			default:
		  				$scope.template = $scope.templates[3];
		  				break;
		  		}
			}).then(function(){

				var issuesObj = [];

				Issues.query(function(issues){
					issues = $scope.order(issues, '-sort', true);

					var issuedObj = [];
					angular.forEach(issues, function(issue, key){
						console.log(issue.nodeId);
						console.log($scope.question.questionId);
						if (issue.nodeId === $scope.question.questionId) issuesObj.push(issue);
					});

					$scope.issues = issuesObj;
					console.log($scope.issues);

					$scope.showIssues = $scope.issues.length && $scope.admin > 0 ? true : false;
				});
			});
		};

		// Find existing Question
		$scope.searchOne = function() {
			console.log($scope.nodeId);
			angular.forEach($scope.questions, function(question, key){
				if (question.questionId === $scope.nodeId) {
					$location.path('questions/' + question._id);
				}
			});
			
		};

		// Filter list of projects
		$scope.filterList = function() {
			Questions.query(function(questions){
				
				var questionList = [];

				if ($scope.projectType === 'all') {
					questionList = questions;
				} else {
					angular.forEach(questions, function(question, key){
						if (question.subject === $scope.projectType) questionList.push(question);
					});
				}
				
				$scope.questions = $scope.order(questionList, '-questionId', true);

			});
		};

		$scope.assignType = function() {
			Questions.query(function(questions){

				var count = 0;
				var max = 1;
				
				angular.forEach(questions, function(question, key){
					if (question.projectType === '') {
						if (Number(question.questionId) <= 150) {
							question.projectType = '1';
							question.$update(function() {
								//$location.path('questions');
								//$location.path('questions/' + question._id);
							}, function(errorResponse) {
								$scope.error = errorResponse.data.message;
							});
							count++;
						} else if (Number(question.questionId) <= 500) {
							question.projectType = '2';
							question.$update(function() {
								//$location.path('questions');
								//$location.path('questions/' + question._id);
							}, function(errorResponse) {
								$scope.error = errorResponse.data.message;
							});	
							count++;
						}
					}
				});

				/*
				var questionList = [];

				if ($scope.projectType === 'all') {
					questionList = questions;
				} else {
					angular.forEach($scope.questions, function(question, key){
						if (question.projectType === $scope.projectType) questionList.push(question);
					});
				}
				
				$scope.questions = $scope.order(questionList, '-questionId', true);
				*/

			});
		};

		$scope.cleanCollection = function() {
			var count = 0;
			var max = 1;

			Questions.query(function(questions){
				angular.forEach(questions, function(question, key){
					
					console.log(question.target_1);
					if (count < max && typeof question.target_1 !== 'undefined') {

						var newQuestion = new Questions({
							questionId: question.questionId,
							question: question.question,
							summary: question.summary,
							reportSummary: question.reportSummary,
							type: question.type,
							subject: question.projectType,
							help: question.help,
							faq: question.faq,
							asc: question.asc,
							examples: question.examples,
							conclusion_1: question.conclusion_1,
							conclusion_2: question.conclusion_2,
							conclusion_3: question.conclusion_3,
						});
						
						console.log(newQuestion);
						console.log(question);

						newQuestion.$save(function(response) {
							$scope.remove(question);
						}, function(errorResponse) {
							$scope.error = errorResponse.data.message;
						});

						count++;

					}

				});
			});
		};
	}
]);

/* TO DOs

1. Consider moving content elements to a separate module so that a single 'set' can be attached to muliple nodes
2. Does the content need to be versioned for each node version?

*/