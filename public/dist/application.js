'use strict';

// Init the application configuration module for AngularJS application
var ApplicationConfiguration = (function() {
	// Init module configuration options
	var applicationModuleName = 'gaap-logic';
	var applicationModuleVendorDependencies = ['ngResource', 'ngCookies',  'ngAnimate',  'ngTouch',  'ui.router', 'ui.bootstrap', 'ui.utils'];

	// Add a new vertical module
	var registerModule = function(moduleName, dependencies) {
		// Create angular module
		angular.module(moduleName, dependencies || []);

		// Add the module to the AngularJS configuration file
		angular.module(applicationModuleName).requires.push(moduleName);
	};

	return {
		applicationModuleName: applicationModuleName,
		applicationModuleVendorDependencies: applicationModuleVendorDependencies,
		registerModule: registerModule
	};
})();
'use strict';

//Start by defining the main module and adding the module dependencies
angular.module(ApplicationConfiguration.applicationModuleName, ApplicationConfiguration.applicationModuleVendorDependencies);

// Setting HTML5 Location Mode
angular.module(ApplicationConfiguration.applicationModuleName).config(['$locationProvider',
	function($locationProvider) {
		$locationProvider.hashPrefix('!');
	}
]);

//Then define the init function for starting up the application
angular.element(document).ready(function() {
	//Fixing facebook bug with redirect
	if (window.location.hash === '#_=_') window.location.hash = '#!';

	//Then init the app
	angular.bootstrap(document, [ApplicationConfiguration.applicationModuleName]);
});
'use strict';

// Use Applicaion configuration module to register a new module
ApplicationConfiguration.registerModule('comments');
'use strict';

// Use Applicaion configuration module to register a new module
ApplicationConfiguration.registerModule('core', ['textAngular']);
'use strict';

// Use Applicaion configuration module to register a new module
ApplicationConfiguration.registerModule('issues');
'use strict';

// Use Application configuration module to register a new module
ApplicationConfiguration.registerModule('pages');

'use strict';

// Use Application configuration module to register a new module
ApplicationConfiguration.registerModule('projects');

'use strict';

// Use Application configuration module to register a new module
ApplicationConfiguration.registerModule('questions');

'use strict';

// Use Application configuration module to register a new module
ApplicationConfiguration.registerModule('responses', ['textAngular']);

'use strict';

// Use Application configuration module to register a new module
ApplicationConfiguration.registerModule('subjects');

'use strict';

// Use Applicaion configuration module to register a new module
ApplicationConfiguration.registerModule('users', ['vcRecaptcha']);
'use strict';

// Use Application configuration module to register a new module
ApplicationConfiguration.registerModule('versions');

'use strict';

// Configuring the Comments module
angular.module('comments').run(['Menus',
	function(Menus) {
		// Set top bar menu items
		//Menus.addMenuItem('topbar', 'Comments', 'comments', 'dropdown', '/comments(/create)?');
		//Menus.addSubMenuItem('topbar', 'comments', 'List Comments', 'comments');
		//Menus.addSubMenuItem('topbar', 'comments', 'New Comment', 'comments/create');
	}
]);
'use strict';

// Setting up route
angular.module('comments').config(['$stateProvider',
	function($stateProvider) {
		// Comments state routing
		$stateProvider.
		state('listComments', {
			url: '/comments',
			templateUrl: 'modules/comments/views/list-comments.client.view.html'
		}).
		state('createComment', {
			url: '/comments/create',
			templateUrl: 'modules/comments/views/create-comment.client.view.html'
		}).
		state('viewComment', {
			url: '/comments/:commentId',
			templateUrl: 'modules/comments/views/view-comment.client.view.html'
		}).
		state('editComment', {
			url: '/comments/:commentId/edit',
			templateUrl: 'modules/comments/views/edit-comment.client.view.html'
		});
	}
]);
'use strict';

angular.module('comments').controller('CommentsController', ['$scope', '$stateParams', '$location', 'Authentication', 'Comments',
	function($scope, $stateParams, $location, Authentication, Comments) {
		$scope.authentication = Authentication;

		$scope.create = function() {
			var comment = new Comments({
				title: this.title,
				content: this.content
			});
			comment.$save(function(response) {
				$location.path('comments/' + response._id);

				$scope.title = '';
				$scope.content = '';
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
			});
		};

		$scope.remove = function(comment) {
			if (comment) {
				comment.$remove();

				for (var i in $scope.comments) {
					if ($scope.comments[i] === comment) {
						$scope.comments.splice(i, 1);
					}
				}
			} else {
				$scope.comment.$remove(function() {
					$location.path('comments');
				});
			}
		};

		$scope.update = function() {
			var comment = $scope.comment;

			comment.$update(function() {
				$location.path('comments/' + comment._id);
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
			});
		};

		$scope.find = function() {
			$scope.comments = Comments.query();
		};

		$scope.findOne = function() {
			$scope.comment = Comments.get({
				commentId: $stateParams.commentId
			});
		};
	}
]);
'use strict';

//Comments service used for communicating with the comments REST endpoints
angular.module('comments').factory('Comments', ['$resource',
	function($resource) {
		return $resource('comments/:commentId', {
			commentId: '@_id'
		}, {
			update: {
				method: 'PUT'
			}
		});
	}
]);
'use strict';

// Setting up route
angular.module('core').config(['$stateProvider', '$urlRouterProvider',
	function($stateProvider, $urlRouterProvider) {
		// Redirect to home view when route not found
		$urlRouterProvider.otherwise('/');

		// Home state routing
		$stateProvider.
		state('home', {
			url: '/',
			templateUrl: 'modules/core/views/home.client.view.html'
		});
	}
]);
'use strict';

angular.module('core').controller('HeaderController', ['$scope', 'Authentication', 'Menus',
	function($scope, Authentication, Menus) {
		$scope.authentication = Authentication;

		$scope.admin = false;

		console.log($scope.authentication);

		angular.forEach($scope.authentication.user.roles, function(role, key){
			console.log(role);
			if (role === 'admin'){
				$scope.admin = true;
			}
		});

		$scope.isCollapsed = false;
		$scope.menu = Menus.getMenu('topbar');

		console.log($scope.admin);

		$scope.toggleCollapsibleMenu = function() {
			$scope.isCollapsed = !$scope.isCollapsed;
		};

		// Collapsing the menu after navigation
		$scope.$on('$stateChangeSuccess', function() {
			$scope.isCollapsed = false;
		});
	}
]);
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
'use strict';

//Menu service used for managing  menus
angular.module('core').service('Menus', [

	function() {
		// Define a set of default roles
		this.defaultRoles = ['*'];

		// Define the menus object
		this.menus = {};

		// A private function for rendering decision 
		var shouldRender = function(user) {
			if (user) {
				if (!!~this.roles.indexOf('*')) {
					return true;
				} else {
					for (var userRoleIndex in user.roles) {
						for (var roleIndex in this.roles) {
							if (this.roles[roleIndex] === user.roles[userRoleIndex]) {
								return true;
							}
						}
					}
				}
			} else {
				return this.isPublic;
			}

			return false;
		};

		// Validate menu existance
		this.validateMenuExistance = function(menuId) {
			if (menuId && menuId.length) {
				if (this.menus[menuId]) {
					return true;
				} else {
					throw new Error('Menu does not exists');
				}
			} else {
				throw new Error('MenuId was not provided');
			}

			return false;
		};

		// Get the menu object by menu id
		this.getMenu = function(menuId) {
			// Validate that the menu exists
			this.validateMenuExistance(menuId);

			// Return the menu object
			return this.menus[menuId];
		};

		// Add new menu object by menu id
		this.addMenu = function(menuId, isPublic, roles) {
			// Create the new menu
			this.menus[menuId] = {
				isPublic: isPublic || false,
				roles: roles || this.defaultRoles,
				items: [],
				shouldRender: shouldRender
			};

			// Return the menu object
			return this.menus[menuId];
		};

		// Remove existing menu object by menu id
		this.removeMenu = function(menuId) {
			// Validate that the menu exists
			this.validateMenuExistance(menuId);

			// Return the menu object
			delete this.menus[menuId];
		};

		// Add menu item object
		this.addMenuItem = function(menuId, menuItemTitle, menuItemURL, menuItemType, menuItemUIRoute, isPublic, roles, position) {
			// Validate that the menu exists
			this.validateMenuExistance(menuId);

			// Push new menu item
			this.menus[menuId].items.push({
				title: menuItemTitle,
				link: menuItemURL,
				menuItemType: menuItemType || 'item',
				menuItemClass: menuItemType,
				uiRoute: menuItemUIRoute || ('/' + menuItemURL),
				isPublic: ((isPublic === null || typeof isPublic === 'undefined') ? this.menus[menuId].isPublic : isPublic),
				roles: ((roles === null || typeof roles === 'undefined') ? this.menus[menuId].roles : roles),
				position: position || 0,
				items: [],
				shouldRender: shouldRender
			});

			// Return the menu object
			return this.menus[menuId];
		};

		// Add submenu item object
		this.addSubMenuItem = function(menuId, rootMenuItemURL, menuItemTitle, menuItemURL, menuItemUIRoute, isPublic, roles, position) {
			// Validate that the menu exists
			this.validateMenuExistance(menuId);

			// Search for menu item
			for (var itemIndex in this.menus[menuId].items) {
				if (this.menus[menuId].items[itemIndex].link === rootMenuItemURL) {
					// Push new submenu item
					this.menus[menuId].items[itemIndex].items.push({
						title: menuItemTitle,
						link: menuItemURL,
						uiRoute: menuItemUIRoute || ('/' + menuItemURL),
						isPublic: ((isPublic === null || typeof isPublic === 'undefined') ? this.menus[menuId].items[itemIndex].isPublic : isPublic),
						roles: ((roles === null || typeof roles === 'undefined') ? this.menus[menuId].items[itemIndex].roles : roles),
						position: position || 0,
						shouldRender: shouldRender
					});
				}
			}

			// Return the menu object
			return this.menus[menuId];
		};

		// Remove existing menu object by menu id
		this.removeMenuItem = function(menuId, menuItemURL) {
			// Validate that the menu exists
			this.validateMenuExistance(menuId);

			// Search for menu item to remove
			for (var itemIndex in this.menus[menuId].items) {
				if (this.menus[menuId].items[itemIndex].link === menuItemURL) {
					this.menus[menuId].items.splice(itemIndex, 1);
				}
			}

			// Return the menu object
			return this.menus[menuId];
		};

		// Remove existing menu object by menu id
		this.removeSubMenuItem = function(menuId, submenuItemURL) {
			// Validate that the menu exists
			this.validateMenuExistance(menuId);

			// Search for menu item to remove
			for (var itemIndex in this.menus[menuId].items) {
				for (var subitemIndex in this.menus[menuId].items[itemIndex].items) {
					if (this.menus[menuId].items[itemIndex].items[subitemIndex].link === submenuItemURL) {
						this.menus[menuId].items[itemIndex].items.splice(subitemIndex, 1);
					}
				}
			}

			// Return the menu object
			return this.menus[menuId];
		};

		//Adding the topbar menu
		this.addMenu('topbar');
	}
]);
'use strict';

// Configuring the Issues module
angular.module('issues').run(['Menus',
	function(Menus) {
		// Set top bar menu items
		//Menus.addMenuItem('topbar', 'Issues', 'issues', 'dropdown', '/issues(/create)?');
		//Menus.addSubMenuItem('topbar', 'issues', 'List Issues', 'issues');
		//Menus.addSubMenuItem('topbar', 'issues', 'New Issue', 'issues/create');
	}
]);
'use strict';

// Setting up route
angular.module('issues').config(['$stateProvider',
	function($stateProvider) {
		// Issues state routing
		$stateProvider.
		state('listIssues', {
			url: '/issues',
			templateUrl: 'modules/issues/views/list-issues.client.view.html'
		}).
		state('createIssue', {
			url: '/issues/create',
			templateUrl: 'modules/issues/views/create-issue.client.view.html'
		}).
		state('viewIssue', {
			url: '/issues/:issueId',
			templateUrl: 'modules/issues/views/view-issue.client.view.html'
		}).
		state('editIssue', {
			url: '/issues/:issueId/edit',
			templateUrl: 'modules/issues/views/edit-issue.client.view.html'
		});
	}
]);
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
'use strict';

// Configuring the Pages module
angular.module('pages').run(['Menus',
	function(Menus) {
		// Set top bar menu items
		// Menus.addMenuItem('topbar', 'Pages', 'pages', 'dropdown', '/pages(/create)?');
		// Menus.addSubMenuItem('topbar', 'pages', 'List Pages', 'pages');
		// Menus.addSubMenuItem('topbar', 'pages', 'New Page', 'pages/create');
	}
]);
'use strict';

// Setting up route
angular.module('pages').config(['$stateProvider',
	function($stateProvider) {
		// Pages state routing
		$stateProvider.
		state('listPages', {
			url: '/pages',
			templateUrl: 'modules/pages/views/list-pages.client.view.html'
		}).
		state('createPage', {
			url: '/pages/create',
			templateUrl: 'modules/pages/views/create-page.client.view.html'
		}).
		/*state('viewPage', {
			url: '/pages/:pageId',
			templateUrl: 'modules/pages/views/view-page.client.view.html'
		}).*/
		state('viewPage', {
			url: '/pages/:pageId',
			templateUrl: 'modules/pages/views/view-page.client.view.html'
		}).
		state('editPage', {
			url: '/pages/:pageId/edit',
			templateUrl: 'modules/pages/views/edit-page.client.view.html'
		});
	}
]);
'use strict';

angular.module('pages').controller('PagesController', ['$scope', '$stateParams', '$location', 'Authentication', 'Pages',
	function($scope, $stateParams, $location, Authentication, Pages) {
		$scope.authentication = Authentication;

		$scope.create = function() {
			var page = new Pages({
				title: this.title,
				content: this.content,
				url: this.url
			});
			page.$save(function(response) {
				$location.path('pages/' + page.url);

				$scope.title = '';
				$scope.content = '';
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
			});
		};

		$scope.remove = function(page) {
			if (page) {
				page.$remove();

				for (var i in $scope.pages) {
					if ($scope.pages[i] === page) {
						$scope.pages.splice(i, 1);
					}
				}
			} else {
				$scope.page.$remove(function() {
					$location.path('pages');
				});
			}
		};

		$scope.update = function() {
			console.log($scope.page);
			var page = $scope.page;

			page.$update(function() {
				$location.path('pages/' + page.url);
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
			});
		};

		$scope.find = function() {
			$scope.pages = Pages.query();
		};

		$scope.findOne = function() {
			console.log($stateParams.pageId);
			Pages.get({
				pageId: $stateParams.pageId
			}).$promise.then(function(page){
			
				console.log(page);
				$scope.page = page;

			});
		};
	}
]);
'use strict';

//Pages service used for communicating with the pages REST endpoints
angular.module('pages').factory('Pages', ['$resource',
	function($resource) {
		return $resource('pages/:pageId', {
			pageId: '@url'
		}, {
			update: {
				method: 'PUT'
			}
		});
	}
]);
'use strict';

// Configuring the Projects module
angular.module('projects').run(['Menus',
	function(Menus) {
		// Set top bar menu items
		Menus.addMenuItem('topbar', 'Projects', 'projects', 'dropdown', '/projects(/create)?');
		Menus.addSubMenuItem('topbar', 'projects', 'List Projects', 'projects');
		Menus.addSubMenuItem('topbar', 'projects', 'New Project', 'projects/create');
	}
]);
'use strict';

// Setting up route
angular.module('projects').config(['$stateProvider',
	function($stateProvider) {
		// Projects state routing
		$stateProvider.
		state('listProjects', {
			url: '/projects',
			templateUrl: 'modules/projects/views/list-projects.client.view.html'
		}).
		state('createProject', {
			url: '/projects/create',
			templateUrl: 'modules/projects/views/create-project.client.view.html'
		}).
		state('viewProject', {
			url: '/projects/:projectId',
			templateUrl: 'modules/projects/views/view-project.client.view.html'
		}).
		state('editProject', {
			url: '/projects/:projectId/edit',
			templateUrl: 'modules/projects/views/edit-project.client.view.html'
		});
	}
]);
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
				});
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
'use strict';

//Projects service used for communicating with the projects REST endpoints
angular.module('projects').factory('Projects', ['$resource',
	function($resource) {
		return $resource('projects/:projectId', {
			projectId: '@_id'
		}, {
			update: {
				method: 'PUT'
			}
		});
	}
]);
'use strict';

// Configuring the Questions module
angular.module('questions').run(['Menus',
	function(Menus) {
		// Set top bar menu items
		//Menus.addMenuItem('topbar', 'Questions', 'questions', 'dropdown', '/questions(/create)?');
		//Menus.addSubMenuItem('topbar', 'questions', 'List Questions', 'questions');
		//Menus.addSubMenuItem('topbar', 'questions', 'New Question', 'questions/create');
	}
]);
'use strict';

// Setting up route
angular.module('questions').config(['$stateProvider',
	function($stateProvider) {
		// Questions state routing
		$stateProvider.
		state('listQuestions', {
			url: '/questions',
			templateUrl: 'modules/questions/views/list-questions.client.view.html'
		}).
		state('createQuestion', {
			url: '/questions/create',
			templateUrl: 'modules/questions/views/create-question.client.view.html'
		}).
		state('viewQuestion', {
			url: '/questions/:questionId',
			templateUrl: 'modules/questions/views/view-question.client.view.html'
		}).
		state('editQuestion', {
			url: '/questions/:questionId/edit',
			templateUrl: 'modules/questions/views/edit-question.client.view.html'
		});
	}
]);
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
'use strict';

//Questions service used for communicating with the questions REST endpoints
angular.module('questions').factory('Questions', ['$resource',
	function($resource) {
		return $resource('questions/:questionId', {
			questionId: '@_id'
		}, {
			update: {
				method: 'PUT'
			}
		});
	}
]);
'use strict';

// Configuring the Requirements-responses module
angular.module('responses').run(['Menus',
	function(Menus) {
		// Set top bar menu items
	}
]);
'use strict';

// Setting up route
angular.module('responses').config(['$stateProvider',
	function($stateProvider) {
		// Responses state routing
		$stateProvider.	
		state('createPreferenceResponse', {
			url: '/responses/create/preference/:projectId',
			templateUrl: 'modules/responses/views/create-preference-response.client.view.html',
			controller: ["$stateParams", function($stateParams){
				$stateParams.projectId;
			}]
		}).
		state('createBinaryResponse', {
			url: '/responses/create/:projectId',
			templateUrl: 'modules/responses/views/create-response.client.view.html',
			controller: ["$stateParams", function($stateParams){
				$stateParams.projectId;
			}]
		}).
		state('listResponses', {
			url: '/responses/:projectId',
			templateUrl: 'modules/responses/views/list-responses.client.view.html'
		}).
		state('reportRequirementResponses', {
			url: '/responses/report/:projectId',
			templateUrl: 'modules/responses/views/report-response.client.view.html',
		});
	}
]);
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

			console.log($scope.current);
			console.log(priorAnswer);
			console.log(thisBreadcrumb);
			console.log(lastTarget);
			console.log($scope.content);

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

			console.log($scope.content);

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
						$scope.template = $scope.templates[1];
						$scope.sequence++; // increment sequencer
						$scope.current = $scope.sequence;
						$scope.content.response = false; // reset radios
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
						$scope.sequence = Number(lastCrumb.sequence) + 1; // increment sequencer
						$scope.current = $scope.sequence;
						$scope.content.response = false; // reset radios
						$scope.decisionNode(target);

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
						//$scope.conclusion = $scope.content[$scope.breadcrumbs[sequence - 1].answer.conclusion];
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

					$scope.conclusion = conclusion;
					
					$scope.showConclusions = true;

					if (pass) {
						nextAnswer = '1';
					} else {
						nextAnswer = '2';
					}
					
					console.log($scope.conclusion);
					console.log(nextAnswer);

					var breadcrumb = {};
					breadcrumb.sequence = $scope.sequence;
					breadcrumb.questionId = $scope.content.questionId;
					breadcrumb.question = $scope.content.question;
					breadcrumb.summary = $scope.content.summary;
					breadcrumb.type = $scope.content.type;
					$scope.breadcrumbs.push(breadcrumb); // add temporary breadcrumb

					$scope.resetShows();
					
					$scope.content.response = nextAnswer;

					console.log($scope.content.response);
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
						'<h5><strong>Intermediate conclusion (Node #' + breadcrumb.sequence + ')' + 
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
						'<li><strong>Comments: </strong>' + comment + '</li></div>' + 
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
		controller: ["$scope", "$element", function($scope, $element) {
			$scope.window = $window.open('','_blank');
			angular.element($scope.window.document.body).append($compile($element.contents())($scope));
		}]
	};
}]);

angular.module('responses').controller('ModalInstanceCtrl', ["$scope", "$modalInstance", "items", function ($scope, $modalInstance, items) {
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
}]);
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
'use strict';

// Configuring the Subjects module
angular.module('subjects').run(['Menus',
	function(Menus) {
		// Set top bar menu items
		//Menus.addMenuItem('topbar', 'Subjects', 'subjects', 'dropdown', '/subjects(/create)?');
		//Menus.addSubMenuItem('topbar', 'subjects', 'List Subjects', 'subjects');
		//Menus.addSubMenuItem('topbar', 'subjects', 'New Subject', 'subjects/create');
	}
]);
'use strict';

// Setting up route
angular.module('subjects').config(['$stateProvider',
	function($stateProvider) {
		// Subjects state routing
		$stateProvider.
		state('listSubjects', {
			url: '/subjects',
			templateUrl: 'modules/subjects/views/list-subjects.client.view.html'
		}).
		state('createSubject', {
			url: '/subjects/create',
			templateUrl: 'modules/subjects/views/create-subject.client.view.html'
		}).
		state('viewSubject', {
			url: '/subjects/:subjectId',
			templateUrl: 'modules/subjects/views/view-subject.client.view.html'
		}).
		state('editSubject', {
			url: '/subjects/:subjectId/edit',
			templateUrl: 'modules/subjects/views/edit-subject.client.view.html'
		});
	}
]);
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
'use strict';

//Subjects service used for communicating with the subjects REST endpoints
angular.module('subjects').factory('Subjects', ['$resource',
	function($resource) {
		return $resource('subjects/:subjectId', {
			subjectId: '@_id'
		}, {
			update: {
				method: 'PUT'
			}
		});
	}
]);
'use strict';

// Config HTTP Error Handling
angular.module('users').config(['$httpProvider',
	function($httpProvider) {
		// Set the httpProvider "not authorized" interceptor
		$httpProvider.interceptors.push(['$q', '$location', 'Authentication',
			function($q, $location, Authentication) {
				return {
					responseError: function(rejection) {
						switch (rejection.status) {
							case 401:
								// Deauthenticate the global user
								Authentication.user = null;

								// Redirect to signin page
								$location.path('signin');
								break;
							case 403:
								// Add unauthorized behaviour 
								break;
						}

						return $q.reject(rejection);
					}
				};
			}
		]);
	}
]);
'use strict';

// Setting up route
angular.module('users').config(['$stateProvider',
	function($stateProvider) {
		// Users state routing
		$stateProvider.
		state('profile', {
			url: '/settings/profile',
			templateUrl: 'modules/users/views/settings/edit-profile.client.view.html'
		}).
		state('password', {
			url: '/settings/password',
			templateUrl: 'modules/users/views/settings/change-password.client.view.html'
		}).
		state('accounts', {
			url: '/settings/accounts',
			templateUrl: 'modules/users/views/settings/social-accounts.client.view.html'
		}).
		state('signup', {
			url: '/signup',
			templateUrl: 'modules/users/views/authentication/signup.client.view.html'
		}).
		state('signin', {
			url: '/signin',
			templateUrl: 'modules/users/views/authentication/signin.client.view.html'
		}).
		state('forgot', {
			url: '/password/forgot',
			templateUrl: 'modules/users/views/password/forgot-password.client.view.html'
		}).
		state('reset-invalid', {
			url: '/password/reset/invalid',
			templateUrl: 'modules/users/views/password/reset-password-invalid.client.view.html'
		}).
		state('reset-success', {
			url: '/password/reset/success',
			templateUrl: 'modules/users/views/password/reset-password-success.client.view.html'
		}).
		state('reset', {
			url: '/password/reset/:token',
			templateUrl: 'modules/users/views/password/reset-password.client.view.html'
		});
	}
]);
'use strict';

angular.module('users').controller('AuthenticationController', ['$scope', '$http', '$location', 'Authentication', 'vcRecaptchaService',
	function($scope, $http, $location, Authentication, vcRecaptchaService) {
		$scope.authentication = Authentication;
		$scope.response = null;
        $scope.widgetId = null;

		// If user is signed in then redirect back home
		if ($scope.authentication.user) $location.path('/');

		$scope.signup = function() {
			console.log('signup started');
            $http.post('/auth/signup', $scope.credentials).success(function(response) {
				// If successful we assign the response to the global user model
				$scope.authentication.user = response;

				// And redirect to the index page
				$location.path('/');
			}).error(function(response) {
				$scope.error = response.message;
			});
		};

		$scope.signin = function() {
			$http.post('/auth/signin', $scope.credentials).success(function(response) {
				// If successful we assign the response to the global user model
				$scope.authentication.user = response;

				// And redirect to the index page
				$location.path('/');
			}).error(function(response) {
				$scope.error = response.message;
			});
		};
        /*
		$scope.model = {
            key: '6LfTogoTAAAAALwBT4dpOZSCtUO9dmLayA86yYMw'
        };
        $scope.showSubmit = false;
        $scope.setResponse = function (response) {
            console.info('Response available');
            console.log(response);
            $scope.response = response;
            $scope.showSubmit = true;
        };
        $scope.setWidgetId = function (widgetId) {
            console.info('Created widget ID: %s', widgetId);
            $scope.widgetId = widgetId;
        };
        $scope.cbExpiration = function() {
            console.info('Captcha expired. Resetting response object');
            $scope.response = null;
         };
        $scope.submit = function () {
            console.log('sending the captcha response to the server', $scope.response);
            $http.post('/auth/recaptcha', {response: $scope.response}).success(function(response) {
            	response = angular.fromJson(response);
                console.log('Success');
            	console.log(response);
                console.log(response.success);
                console.log(typeof response.success);
            	$scope.recaptchaDetails = null;
                if (response.success === true) {
                    $scope.signup();
                } else {
                    vcRecaptchaService.reload($scope.widgetId);
                }
            }).error(function(response) {
				console.log('Failed validation');
                // In case of a failed validation you need to reload the captcha
                // because each response can be checked just once
                vcRecaptchaService.reload($scope.widgetId);
			});
        };
        */
	}
]);
'use strict';

angular.module('users').controller('PasswordController', ['$scope', '$stateParams', '$http', '$location', 'Authentication',
	function($scope, $stateParams, $http, $location, Authentication) {
		$scope.authentication = Authentication;

		//If user is signed in then redirect back home
		if ($scope.authentication.user) $location.path('/');

		// Submit forgotten password account id
		$scope.askForPasswordReset = function() {
			$scope.success = $scope.error = null;

			$http.post('/auth/forgot', $scope.credentials).success(function(response) {
				// Show user success message and clear form
				$scope.credentials = null;
				$scope.success = response.message;

			}).error(function(response) {
				// Show user error message and clear form
				$scope.credentials = null;
				$scope.error = response.message;
			});
		};

		// Change user password
		$scope.resetUserPassword = function() {
			$scope.success = $scope.error = null;

			$http.post('/auth/reset/' + $stateParams.token, $scope.passwordDetails).success(function(response) {
				// If successful show success message and clear form
				$scope.passwordDetails = null;

				// Attach user profile
				Authentication.user = response;

				// And redirect to the index page
				$location.path('/password/reset/success');
			}).error(function(response) {
				$scope.error = response.message;
			});
		};
	}
]);
'use strict';

angular.module('users').controller('SettingsController', ['$scope', '$http', '$location', 'Users', 'Authentication',
	function($scope, $http, $location, Users, Authentication) {
		$scope.user = Authentication.user;

		// If user is not signed in then redirect back home
		if (!$scope.user) $location.path('/');

		// Check if there are additional accounts 
		$scope.hasConnectedAdditionalSocialAccounts = function(provider) {
			for (var i in $scope.user.additionalProvidersData) {
				return true;
			}

			return false;
		};

		// Check if provider is already in use with current user
		$scope.isConnectedSocialAccount = function(provider) {
			return $scope.user.provider === provider || ($scope.user.additionalProvidersData && $scope.user.additionalProvidersData[provider]);
		};

		// Remove a user social account
		$scope.removeUserSocialAccount = function(provider) {
			$scope.success = $scope.error = null;

			$http.delete('/users/accounts', {
				params: {
					provider: provider
				}
			}).success(function(response) {
				// If successful show success message and clear form
				$scope.success = true;
				$scope.user = Authentication.user = response;
			}).error(function(response) {
				$scope.error = response.message;
			});
		};

		// Update a user profile
		$scope.updateUserProfile = function(isValid) {
			if (isValid) {
				$scope.success = $scope.error = null;
				var user = new Users($scope.user);

				user.$update(function(response) {
					$scope.success = true;
					Authentication.user = response;
				}, function(response) {
					$scope.error = response.data.message;
				});
			} else {
				$scope.submitted = true;
			}
		};

		// Change user password
		$scope.changeUserPassword = function() {
			$scope.success = $scope.error = null;

			$http.post('/users/password', $scope.passwordDetails).success(function(response) {
				// If successful show success message and clear form
				$scope.success = true;
				$scope.passwordDetails = null;
			}).error(function(response) {
				$scope.error = response.message;
			});
		};
	}
]);
'use strict';

// Authentication service for user variables
angular.module('users').factory('Authentication', [
	function() {
		var _this = this;

		_this._data = {
			user: window.user
		};

		return _this._data;
	}
]);
'use strict';

// Users service used for communicating with the users REST endpoint
angular.module('users').factory('Users', ['$resource',
	function($resource) {
		return $resource('users', {}, {
			update: {
				method: 'PUT'
			}
		});
	}
]);
'use strict';

// Configuring the Versions module
angular.module('versions').run(['Menus',
	function(Menus) {
		// Set top bar menu items
		//Menus.addMenuItem('topbar', 'Versions', 'versions', 'dropdown', '/versions(/create)?');
		//Menus.addSubMenuItem('topbar', 'versions', 'List Versions', 'versions');
		//Menus.addSubMenuItem('topbar', 'versions', 'New Version', 'versions/create');
	}
]);
'use strict';

// Setting up route
angular.module('versions').config(['$stateProvider',
	function($stateProvider) {
		// Versions state routing
		$stateProvider.
		state('listVersions', {
			url: '/versions',
			templateUrl: 'modules/versions/views/list-versions.client.view.html'
		}).
		state('createVersion', {
			url: '/versions/create',
			templateUrl: 'modules/versions/views/create-version.client.view.html'
		}).
		state('viewVersion', {
			url: '/versions/:versionId',
			templateUrl: 'modules/versions/views/view-version.client.view.html'
		}).
		state('editVersion', {
			url: '/versions/:versionId/edit',
			templateUrl: 'modules/versions/views/edit-version.client.view.html'
		}).
		state('testVersion', {
			url: '/versions/:versionId/test',
			templateUrl: 'modules/versions/views/test-version.client.view.html'
		});
	}
]);
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