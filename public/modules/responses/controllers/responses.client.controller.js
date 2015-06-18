'use strict';

angular.module('responses').controller('ResponsesController', ['$scope', '$stateParams', '$location', '$filter', '$modal', '$log', 'Authentication', 'Responses', 'Questions', 'Projects', '$templateCache', '$compile', '$window', '$element', 'Versions',
	function($scope, $stateParams, $location, $filter, $modal, $log, Authentication, Responses, Questions, Projects, $templateCache, $compile, $window, $element, Versions) {
		$scope.authentication = Authentication;

		var orderBy = $filter('orderBy');

		$scope.order = function(array, predicate, reverse) {
	    	var sorted = orderBy(array, predicate, reverse);
	    	return sorted;
	  	};

		/* TO DOs


				
		*/

		$scope.templates = [
			{ name: 'question_template.html', url: 'modules/responses/views/question_template.html' },
	        { name: 'decision_template.html', url: 'modules/responses/views/decision_template.html' },
	        { name: 'recommendation_template.html', url: 'modules/responses/views/recommendation_template.html' },
	        { name: 'info_template.html', url: 'modules/responses/views/info_template.html' }
		];

		$templateCache.get('modules/responses/views/question_template.html');
		$templateCache.get('modules/responses/views/decision_template.html');
		$templateCache.get('modules/responses/views/recommendation_template.html');
		$templateCache.get('modules/responses/views/info_template.html');

		$scope.getQuestions = function() {
			$scope.projectId = $stateParams.projectId;
			
			Projects.get({
				projectId: $stateParams.projectId
			}).$promise.then(function(project){

				console.log(project);

				$scope.project = project;

				Versions.get({
					versionId: $scope.project.version._id
				}).$promise.then(function(version){

					$scope.versionJson = version.versionJson;

					console.log(version);

					$scope.version = version;

					Responses.query(function(responses){ // modify to return only for this project, not all projects
						
						$scope.responses = $scope.order(responses, '-questionId', true);


					}).$promise.then(function(){

						var nodes = [];
						
						angular.forEach($scope.responses, function(value, key){
							if (value.projectId === $scope.projectId){
								nodes.push(value);	
							}
						});

						$scope.nodes = $scope.order(nodes, '-sequence', true);

						$scope.count = 0;

						$scope.breadcrumbs = [];
						$scope.conclusions = [];
						$scope.sequence = 1;

						if ($scope.nodes.length > 0){
							// load the saved nodes

							$scope.existingNodes();

						} else {
							// no saved nodes, so set the first node

							var startId;

							$scope.template = $scope.templates[3];

							console.log($scope.versionJson[0]);

							$scope.current = $scope.sequence;

							Questions.get({
								questionId: $scope.versionJson[0].nodeId
							}).$promise.then(function(content){

								console.log(content);

								$scope.content = content;

								$scope.showContinueButton = true;

								$scope.addJson($scope.versionJson[0].nodeId);

								$scope.questionId = $scope.content.questionId;

								$scope.resetShows();

								var breadcrumb = {};
								breadcrumb.sequence = $scope.sequence;
								breadcrumb.questionId = $scope.content.questionId;
								breadcrumb.question = $scope.content.question;
								breadcrumb.summary = $scope.content.summary;
								breadcrumb.type = $scope.content.type;
								$scope.breadcrumbs.push(breadcrumb); // add temporary breadcrumb
							});
						}
					});
				});
			});
		};

		$scope.addJson = function(nodeId) {
			console.log(nodeId);
			console.log(typeof nodeId);
			angular.forEach($scope.versionJson, function(json, key){
				if (json.nodeId === nodeId){
					console.log(nodeId);
					$scope.currentJson = json;
					$scope.content.response_1 = $scope.currentJson.response_1;
					$scope.content.response_2 = $scope.currentJson.response_2;
					$scope.content.response_3 = $scope.currentJson.response_3;
					$scope.content.target_1 = $scope.currentJson.target_1;
					$scope.content.target_2 = $scope.currentJson.target_2;
					$scope.content.target_3 = $scope.currentJson.target_3;
				}
			});
		};

		$scope.nextQuestion = function(response){

			console.log(response);

			switch(response){
				case '1':
					$scope.response = {response: 'response_1', target: 'target_1', conclusion: 'conclusion_1', comment: $scope.content.comment};
					break;
				case '2':
					$scope.response = {response: 'response_2', target: 'target_2', conclusion: 'conclusion_2', comment: $scope.content.comment};
					break;
				case '3':
					$scope.response = {response: 'response_3', target: 'target_3', conclusion: 'conclusion_3', comment: $scope.content.comment};
					break;
				default:
					$scope.response = '';
					break;
			}

			var priorAnswer;
			var lastTarget;
			var thisBreadcrumb;

			angular.forEach($scope.breadcrumbs, function(breadcrumb, key){
				if (breadcrumb.sequence === $scope.current && typeof breadcrumb.answer !== 'undefined'){
					priorAnswer = breadcrumb.answer.response.slice(-1);
					thisBreadcrumb = breadcrumb;
				}
				if (typeof breadcrumb.answer !== 'undefined') lastTarget = breadcrumb.answer.targetValue;
			});

			if (typeof priorAnswer !== 'undefined' && priorAnswer !== response) {
				
				// answer has changed (and possibly the comment) so update the db

				thisBreadcrumb.comment = $scope.content.comment;
				thisBreadcrumb.saved.comment = $scope.content.comment;

				var currentAnswer = {questionId: $scope.content.questionId, question: $scope.content.question, summary: $scope.content.summary, comment: $scope.content.comment, response: $scope.response.response, responseValue: $scope.content[$scope.response.response], target: $scope.response.target, targetValue: $scope.content[$scope.response.target], conclusion: $scope.response.conclusion, conclusionValue: $scope.content[$scope.response.conclusion]};

				thisBreadcrumb.answer = currentAnswer;
				thisBreadcrumb.saved.answer = currentAnswer;

				// and drop the subsequent nodes
				
				$scope.dropNodes(thisBreadcrumb);

				$scope.update(thisBreadcrumb);

				$scope.showReportButton = false;
			
			} else if (typeof priorAnswer !== 'undefined' && priorAnswer === response) {
				
				// answer hasn't changed, so update in case comment has changed

				thisBreadcrumb.comment = $scope.content.comment;
				thisBreadcrumb.saved.comment = $scope.content.comment;
				thisBreadcrumb.saved.answer.comment = $scope.content.comment;
				$scope.update(thisBreadcrumb);

				// and then just show the last target node
				$scope.content.response = false; // reset radios

				$scope.currentJson = $scope.project.version.versionJson[0];
				
				Questions.get({
					questionId: lastTarget
				}).$promise.then(function(content){

					$scope.content = content;

					$scope.addJson(lastTarget);
					//$scope.content = $scope.questions[lastTarget];
					$scope.current = $scope.sequence;
				});
			
			} else {

				// new answer so save it and generate the new node

				$scope.saveNode(response); 

				$scope.newNode(response);
				
			}
		};

		$scope.dropNodes = function(thisBreadcrumb) {
			console.log($scope.breadcrumbs);
			console.log($scope.current);

			var number = 0;

			angular.forEach($scope.breadcrumbs, function(breadcrumb, key){
				if (breadcrumb.sequence > $scope.current) {
					console.log(breadcrumb.sequence);
					$scope.remove($scope.breadcrumbs[key].saved); // drop all subsequent nodes from the database
					number++;
				}
			});

			var start = -1 * number;

			$scope.breadcrumbs.splice(start, number); // and drop them from the breadcrumbs object too

			$scope.sequence = $scope.current; // reset the sequence to $scope.current plus 1

			$scope.newNode(thisBreadcrumb.answer.targetValue); // generate the new target node
		};

		$scope.saveNode = function(response) {
			// generate the next target node

			var currentAnswer = {questionId: $scope.content.questionId, question: $scope.content.question, summary: $scope.content.summary, comment: $scope.content.comment, response: $scope.response.response, responseValue: $scope.content[$scope.response.response], target: $scope.response.target, targetValue: $scope.content[$scope.response.target], conclusion: $scope.response.conclusion, conclusionValue: $scope.content[$scope.response.conclusion]};

			var response = new Responses({ // save the last response
				projectId: $scope.projectId,
				type: $scope.content.type,
				question: $scope.content.question,
				questionId: $scope.content.questionId,
				answer: currentAnswer,
				sequence: Number($scope.sequence),
				comment: $scope.content.comment,
				conclusion: $scope.content[$scope.response.conclusion]
			});

			response.$save(function(response) {

				console.log(response);
				var breadcrumb = {};
				breadcrumb.saved = response;

				console.log(breadcrumb);

				breadcrumb.sequence = $scope.sequence;
				breadcrumb.questionId = $scope.content.questionId;
				breadcrumb.question = $scope.content.question;
				breadcrumb.summary = $scope.content.summary;
				breadcrumb.comment = typeof $scope.content.comment !== 'undefined' ? $scope.content.comment : '';
				breadcrumb.type = $scope.content.type;
				breadcrumb.answer = currentAnswer; // add node to breadcrumbs
				$scope.breadcrumbs.pop(); // drop the temporary breadcrumb
				$scope.breadcrumbs.push(breadcrumb); // add the persisted breadcrumb

			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;

			});
		};	

		$scope.newNode = function(response) {

			if (typeof response !== 'undefined') {
				
				console.log(response);

				var target = $scope.content[$scope.response.target];
				console.log(target);
				
				console.log($scope.breadcrumbs);

				var breadcrumb = {};

				Questions.get({
					questionId: target
				}).$promise.then(function(content){

					console.log(content);

					$scope.content = content;
					console.log($scope.content);

					$scope.addJson(target);

					if ($scope.content.type === 'q') { // get the next question
						$scope.template = $scope.templates[0];
						console.log($scope.breadcrumbs);

						//$scope.content = $scope.questions[target];
						$scope.sequence++; // increment sequencer
						console.log($scope.sequence);
						$scope.current = $scope.sequence;
						$scope.content.response = false; // reset radios
						
						breadcrumb.sequence = $scope.sequence;
						breadcrumb.questionId = $scope.content.questionId;
						breadcrumb.question = $scope.content.question;
						breadcrumb.summary = $scope.content.summary;
						breadcrumb.type = $scope.content.type;
						$scope.breadcrumbs.push(breadcrumb); // add temporary breadcrumb
						console.log($scope.breadcrumbs);

						$scope.resetShows();

					} else if ($scope.content.type === 'r') { // or terminate
						$scope.template = $scope.templates[2];
						console.log($scope.breadcrumbs);

						//$scope.content = $scope.questions[target];
						$scope.sequence++; // increment sequencer
						$scope.current = $scope.sequence;
						$scope.content.response = false; // reset radios
						$scope.showReportButton = true;

						breadcrumb.sequence = $scope.sequence;
						breadcrumb.questionId = $scope.content.questionId;
						breadcrumb.question = $scope.content.question;
						breadcrumb.summary = $scope.content.summary;
						breadcrumb.type = $scope.content.type;
						$scope.breadcrumbs.push(breadcrumb); // add temporary breadcrumb
						console.log($scope.breadcrumbs);

						$scope.resetShows();

					} else if ($scope.content.type === 'i') { // or terminate
						$scope.template = $scope.templates[3];
						console.log($scope.breadcrumbs);

						//$scope.content = $scope.questions[target];
						$scope.sequence++; // increment sequencer
						$scope.current = $scope.sequence;
						$scope.content.response = false; // reset radios
						$scope.showReportButton = true;

						breadcrumb.sequence = $scope.sequence;
						breadcrumb.questionId = $scope.content.questionId;
						breadcrumb.question = $scope.content.question;
						breadcrumb.summary = $scope.content.summary;
						breadcrumb.type = $scope.content.type;
						$scope.breadcrumbs.push(breadcrumb); // add temporary breadcrumb
						console.log($scope.breadcrumbs);

						$scope.resetShows();

					} else if ($scope.content.type === 'd') { // or terminate

						$scope.decisionNode(target);
						/*
						var nextTarget = $scope.decisionNode(target);
						console.log(nextTarget);
						
						$scope.answer = false; // reset radios
						$scope.content = $scope.questions[target];
						$scope.sequence++; // increment sequencer
						$scope.current = $scope.sequence;

						var breadcrumb = {};
						breadcrumb.sequence = $scope.sequence;
						breadcrumb.questionId = $scope.content.questionId;
						$scope.breadcrumbs.push(breadcrumb); // add temporary breadcrumb

						$scope.resetShows();
						*/
						
					}
				});
			}
		};

// This uses stored a question. Consider querying for the question based on questionId each time in case the question content changes.

		$scope.existingNodes = function() {
			var content;
			var response;
			var target;

			console.log($scope.nodes);

			angular.forEach($scope.nodes, function(node, key){
				console.log(node.sequence);
				$scope.breadcrumbs.push({saved: node, sequence: Number(node.sequence), questionId: node.questionId, question: node.question, type: node.type, summary: node.answer.summary, comment: node.comment, answer: {questionId: node.answer.questionId, question: node.answer.question, response: node.answer.response, responseValue: node.answer.responseValue, target: node.answer.target, targetValue: node.answer.targetValue, conclusion: node.answer.conclusion, conclusionValue: node.answer.conclusionValue, comment: node.comment}});
				if (node.type === 'd') $scope.conclusions.push(node.conclusion);
				target = node.answer.targetValue;
				response = node.answer.response;
				$scope.sequence = node.sequence;
			});

			$scope.breadcrumbs = $scope.order($scope.breadcrumbs, '-sequence', true);

			console.log($scope.breadcrumbs);
			console.log($scope.conclusions);

			console.log(target);

			var len = $scope.breadcrumbs.length;
			var lastCrumb = $scope.breadcrumbs[len - 1];
			console.log(lastCrumb);

			if (lastCrumb.type === 'r' ) { // no need to get a new node, just show the last node

				$scope.content = lastCrumb;

				$scope.template = $scope.templates[2];
				$scope.sequence = Number(lastCrumb.sequence); // set sequencer
				$scope.current = $scope.sequence;
				$scope.content.response = false; // reset radios
				$scope.showReportButton = true;

				$scope.resetShows();

			} else {

				var breadcrumb = {};

				Questions.get({
					questionId: target
				}).$promise.then(function(content){

					$scope.content = content;

					$scope.addJson(target);

					if ($scope.content.type === 'q') { // get the next question

						//$scope.content = $scope.questions[lastCrumb.answer.targetValue];
						$scope.template = $scope.templates[0];
						$scope.sequence = Number(lastCrumb.sequence) + 1; // increment sequencer
						$scope.current = $scope.sequence;
						$scope.content.response = false; // reset radios

						breadcrumb = {};
						breadcrumb.sequence = $scope.sequence;
						breadcrumb.questionId = $scope.content.questionId;
						breadcrumb.question = $scope.content.question;
						breadcrumb.summary = $scope.content.summary;
						breadcrumb.type = $scope.content.type;
						$scope.breadcrumbs.push(breadcrumb); // add temporary breadcrumb

						$scope.resetShows();

					} else if ($scope.content.type === 'r') { // or terminate

						$scope.template = $scope.templates[2];
						$scope.sequence = Number(lastCrumb.sequence) + 1; // increment sequencer
						$scope.current = $scope.sequence;
						$scope.content.response = false; // reset radios
						$scope.showReportButton = true;

						breadcrumb = {};
						breadcrumb.sequence = $scope.sequence;
						breadcrumb.questionId = $scope.content.questionId;
						breadcrumb.question = $scope.content.question;
						breadcrumb.summary = $scope.content.summary;
						breadcrumb.type = $scope.content.type;
						$scope.breadcrumbs.push(breadcrumb); // add temporary breadcrumb

						$scope.resetShows();

					} else if ($scope.content.type === 'i') { // or terminate

						$scope.template = $scope.templates[3];
						$scope.sequence = Number(lastCrumb.sequence) + 1; // increment sequencer
						$scope.current = $scope.sequence;
						$scope.content.response = false; // reset radios
						$scope.showReportButton = true;

						breadcrumb = {};
						breadcrumb.sequence = $scope.sequence;
						breadcrumb.questionId = $scope.content.questionId;
						breadcrumb.question = $scope.content.question;
						breadcrumb.summary = $scope.content.summary;
						breadcrumb.type = $scope.content.type;
						$scope.breadcrumbs.push(breadcrumb); // add temporary breadcrumb

						$scope.resetShows();

					} else if ($scope.content.type === 'd') {
						$scope.template = $scope.templates[1];
						
						console.log($scope.breadcrumbs);
						$scope.decisionNode(target);
						/*
						var nextTarget = $scope.decisionNode(target);
						console.log(nextTarget);
						*/
						
						$scope.sequence++; // increment sequencer
						$scope.current = $scope.sequence;
						$scope.content.response = false; // reset radios

						breadcrumb = {};
						breadcrumb.sequence = $scope.sequence;
						breadcrumb.questionId = $scope.content.questionId;
						breadcrumb.question = $scope.content.question;
						breadcrumb.summary = $scope.content.summary;
						breadcrumb.type = $scope.content.type;
						$scope.breadcrumbs.push(breadcrumb); // add temporary breadcrumb

						$scope.resetShows();
					}
				});
			}
		};

		$scope.resetShows = function() {
			$scope.content.show_1 = $scope.content.response_1 === '' ? false : true;
			$scope.content.show_2 = $scope.content.response_2 === '' ? false : true;
			$scope.content.show_3 = $scope.content.response_3 === '' ? false : true;
			$scope.content.showSummary = $scope.content.summary === '' ? false : true;
			$scope.content.showHelp = $scope.content.help === '' ? false : true;
			$scope.content.showFaq = $scope.content.faq === '' ? false : true;
			$scope.content.showAsc = $scope.content.asc === '' ? false : true;
			$scope.content.showExamples = $scope.content.examples === '' ? false : true;
			$scope.content.showInfo = $scope.content.showHelp || $scope.content.showFaq || $scope.content.showAsc || $scope.content.showExamples ?  true : false;
		};

		$scope.showNode = function(sequence) {
			$scope.content.response = false; // reset radios
			console.log(sequence);
			console.log($scope.breadcrumbs);
			console.log($scope.breadcrumbs[sequence - 1]);
			console.log($scope.breadcrumbs[sequence - 1].questionId);
			
			Questions.get({
				questionId: $scope.breadcrumbs[sequence - 1].questionId
			}).$promise.then(function(content){

				$scope.content = content;
				$scope.content.comment = $scope.breadcrumbs[sequence - 1].comment;

				$scope.addJson($scope.content.questionId);

				console.log($scope.breadcrumbs[sequence - 1]);

				//$scope.content = $scope.questions[$scope.breadcrumbs[sequence - 1].questionId]; // load the selected node
				console.log($scope.content);

				switch($scope.breadcrumbs[sequence - 1].type) {
					case 'q':
						$scope.template = $scope.templates[0];
						break;
					case 'd':
						$scope.template = $scope.templates[1];
						$scope.conclusion = $scope.content[$scope.breadcrumbs[sequence - 1].answer.conclusion];
						break;
					case 'r':
						$scope.template = $scope.templates[2];
						break;
					case 'i':
						$scope.template = $scope.templates[3];
						break;
					default:
						$scope.template = $scope.templates[0];
						break;
				}

				$scope.resetShows();

				if (typeof $scope.breadcrumbs[sequence - 1].answer !== 'undefined') {
					switch($scope.breadcrumbs[sequence - 1].answer.response) {
						case 'response_1':
							$scope.content.response = '1';
							break;
						case 'response_2':
							$scope.content.response = '2';
							break;
						case 'response_3':
							$scope.content.response = '3';
							break;
						default:
							$scope.content.response = '';
							break;
					}
				}

				$scope.current = sequence; // set the current sequence
			});
		};

		$scope.getRequirementsResponseList = function() {
			Responses.query(function(responses){
				var array = [];
				$scope.requirementId = $stateParams.requirementId;
				angular.forEach(responses, function(value, key){
					if (value.requirementId === $scope.requirementId){
						array.push(value);	
					}
				});
				$scope.responses = array;
			});
		};

		$scope.showText = function(event) {			
			var ele = angular.element(event.target);
			$scope.content.text = $scope.content[ele[0].id];
			$scope.content.showText = true;

		};

		$scope.remove = function(response) {
			if (response) {
				response.$remove();
			}
		};

		$scope.decisionNode = function(target) {
			

			var pass = true;
			var nextAnswer;
			console.log(target);
			console.log($scope.breadcrumbs);
			var conclusion;
			var fails = {};

			Questions.get({
				questionId: target
			}).$promise.then(function(content){

				$scope.content = content;

				$scope.addJson(target);

				Questions.query(function(questions){ // list of all questions in the db // let's trim this down with decisionNodeId filter
					angular.forEach(questions, function(value, key){
						if (value.decisionNodeId === target) {
							fails[value.questionId] = value.failResponse;
						}
					});
					console.log(fails);

					angular.forEach($scope.breadcrumbs, function(breadcrumb, b){
						angular.forEach(fails, function(failResponse, failId){
							console.log(pass);
							if (pass === true && breadcrumb.questionId === failId && breadcrumb.answer.responseValue === failResponse) pass = false;
						});
					});

					console.log(pass);

					console.log($scope.content);					

					if (pass) {
						conclusion = $scope.content.conclusion_1;
					} else {
						conclusion = $scope.content.conclusion_2;
					}

					console.log(conclusion);

					$scope.conclusion =  conclusion;
					
					$scope.showConclusions = true;

					if (pass) {
						nextAnswer = '1';
					} else {
						nextAnswer = '2';
					}
					
					console.log($scope.conclusion);
					console.log(nextAnswer);

					$scope.content.response = false; // reset radios

					$scope.sequence++; // increment sequencer
					$scope.current = $scope.sequence;

					var breadcrumb = {};
					breadcrumb.sequence = $scope.sequence;
					breadcrumb.questionId = $scope.content.questionId;
					breadcrumb.question = $scope.content.question;
					breadcrumb.summary = $scope.content.summary;
					breadcrumb.type = $scope.content.type;
					$scope.breadcrumbs.push(breadcrumb); // add temporary breadcrumb

					$scope.resetShows();
					
					$scope.nextQuestion(nextAnswer);
				});
			});
		};

		// Update existing Response
		$scope.update = function(thisBreadcrumb) {
			var response = thisBreadcrumb.saved;
			console.log(response);

			response.$update(function(result) {
				angular.forEach($scope.breadcrumbs, function(breadcrumb, key){
					if (breadcrumb.sequence === result.sequence){
						$scope.breadcrumbs[key].saved = result;
					}
				});

				//$location.path('questions');
				//$location.path('questions/' + question._id);
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
			});
		};

		$scope.code = 'Demonstrate two-way da binding';
		
		$scope.items = [
			'The quick brown fox jumps over the lazy dog 1',
			'The quick brown fox jumps over the lazy dog 2',
		];

		$scope.greeting = 'Hello, World!';
      		
      	$scope.genReport = function(greeting) {
        	$scope.html = '<!DOCTYPE html>' + 
			'<html lang="en" xmlns="http://www.w3.org/1999/xhtml">' + 

			'<head>' +
				'<title>GAAP Logic - Project Report</title>' +

				'<!-- General META -->' +
				'<meta charset="utf-8">' +
				'<meta http-equiv="Content-type" content="text/html;charset=UTF-8">' +
				'<meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1">' +
				'<meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1">' +
				'<meta name="apple-mobile-web-app-capable" content="yes">' +
				'<meta name="apple-mobile-web-app-status-bar-style" content="black">' +

				'<!-- Semantic META -->' +
				'<meta name="keywords" content="">' +
				'<meta name="description" content="">' +

				'<!-- Facebook META -->' +
				'<meta property="fb:app_id" content="APP_ID">' +
				'<meta property="og:site_name" content="GAAP Logic - Project Report">' +
				'<meta property="og:title" content="GAAP Logic - Project Report">' +
				'<meta property="og:description" content="">' +
				'<meta property="og:url" content="http://localhost:3000/">' +
				'<meta property="og:image" content="/img/brand/logo.png">' +
				'<meta property="og:type" content="website">' +

				'<!-- Twitter META -->' +
				'<meta name="twitter:title" content="GAAP Logic - Development Environment">' +
				'<meta name="twitter:description" content="">' +
				'<meta name="twitter:url" content="http://localhost:3000/">' +
				'<meta name="twitter:image" content="/img/brand/logo.png">' +

				'<!-- Fav Icon -->' +
				'<link href="/modules/core/img/brand/favicon.ico" rel="shortcut icon" type="image/x-icon">' +

				'<!--Application CSS Files-->' +
				
					'<link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.4/css/bootstrap.min.css">' +
				
					'<link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.4/css/bootstrap-theme.min.css">' +

				'<!-- HTML5 Shim -->' +
				'<!--[if lt IE 9]>' +
					'<script src="http://html5shim.googlecode.com/svn/trunk/html5.js"></script>' +
				'<![endif]-->' +
			'</head>';

			$scope.html += '<div>' +
				'<h3>' +
					'Project Title: ' + $scope.project.title +
				'</h4>' +
				'<h4>' +
					'Project ID: ' + $scope.project._id +
				'</h4>' +
				'<h4>' +
					'Project Description: ' + $scope.project.description +
				'</h4>' +
				'<h4>' +
					'Created on: ' + $scope.project.created +
				'</h4>' +
				'<h4>' +
					'Created by: ' + $scope.project.user.displayName +
				'</h4>' +
			'</div>';

        	angular.forEach($scope.breadcrumbs, function(breadcrumb, key){
        		console.log(breadcrumb);
        		var comment;
        		if (breadcrumb.type === 'q' && typeof breadcrumb.saved !== 'undefined'){
					if (breadcrumb.comment === '' || typeof breadcrumb.comment === 'undefined'){
						comment = 'none';
					} else {
						comment = breadcrumb.comment;
					}
					$scope.html += '<div>' +
						'<h5><strong>Question (Node #' + breadcrumb.sequence + '): </strong>' + breadcrumb.question + '</h5>' + 
						'<ul><li><strong>Question summary: </strong>' + breadcrumb.summary + '</li>' + 
						'<li><strong>Response: </strong>' + breadcrumb.saved.answer.responseValue + '</li>' +  
						'<li><strong>Comments: </strong>' + comment + '</li></ul></div>';
				} else if (breadcrumb.type === 'd' && typeof breadcrumb.saved !== 'undefined'){
					if (breadcrumb.comment === '' || typeof breadcrumb.comment === 'undefined'){
						comment = 'none';
					} else {
						comment = breadcrumb.comment;
					}
					$scope.html += '<div>' +
						'<h5><strong>Intermediate conclusion (Node #' + breadcrumb.sequence + '): </strong>' + breadcrumb.question + '</h5>' + 
						'<ul><li><strong>Question summary: </strong>' + breadcrumb.summary + '</li>' + 
						'<li><strong>Response: </strong>' + breadcrumb.saved.answer.conclusionValue + '</li>' + // need to either update response answer or query the question and use that in case responseValue has changed since the response was saved. This is only needed for decision nodes since question nodes I THINK
						'<li><strong>Comments: </strong>' + comment + '</li></ul></div>';
				} else if (breadcrumb.type === 'r'){
					if (breadcrumb.comment === '' || typeof breadcrumb.comment === 'undefined'){
						comment = 'none';
					} else {
						comment = breadcrumb.comment;
					}
					$scope.html += '<div>' +
						'<div style="border: solid lightblue 1px; padding: 5px;"><h4><strong>Accounting recommendation (Node #' + breadcrumb.sequence + '): </strong>' + breadcrumb.question + '</h4>' + 
						'<h5><strong>Recommendation summary: </strong>' + breadcrumb.summary + '</h5></div>' + 
						'<li><strong>Comments: </strong>' + comment + '</li>' + 
						'<br /></div>';
				}
			});
			console.log($scope.html);
			$scope.newWindow = $window.open('','_blank');

        	console.log($scope.newWindow);
			angular.element($scope.newWindow.document.body).append($scope.html);
			$scope.newWindow.print();
		};

		$scope.open = function (value) {
			$scope.items = $scope.conclusions;

		    console.log(value);
		    var modalInstance = $modal.open({
				templateUrl: 'myModalContent.html',
				controller: 'ModalInstanceCtrl',
				resolve: {
					items: function () {
						return $scope.items;
					}
				}
		    });

		    modalInstance.result.then(function (selectedItem) {
				$scope.selected = selectedItem;
		    }, function () {
				$log.info('Modal dismissed at: ' + new Date());
			});
		};

		$scope.getContent = function(questionId) {
			$scope.content = Questions.get({
				questionId: questionId
			});
		};

		$scope.continue = function() {
			$scope.nextQuestion('1');

			$scope.showContinueButton = false;
		};

	}
]);

angular.module('responses').directive('newWindow', ['$window', '$compile', function($window, $compile) {
	return {
		restrict: 'EA',
		link: function($scope, $element, attr) {
			$element.on('$destroy', function() {
				$scope.window.close();
			});
		},
		controller: function($scope, $element) {
			$scope.window = $window.open('','_blank');
			angular.element($scope.window.document.body).append($compile($element.contents())($scope));
		}
	};
}]);

angular.module('responses').controller('ModalInstanceCtrl', function ($scope, $modalInstance, items) {
	$scope.items = items;
	$scope.selected = {
		item: $scope.items[0]
	};

	$scope.ok = function () {
		$modalInstance.close($scope.selected.item);
	};

	$scope.cancel = function () {
		$modalInstance.dismiss('cancel');
	};
});