/**
 * One of the issue we'll be facing is the fact that internal URLs used by our app
 * can be generated at initial page load in templates, be found in JS code or generated on the client side.
 * This won't let us benefit fully from the routing mechanism and the separation of environments of Symfony2 .
 * 
 * Intercepting AJAX calls to rewrite URLs and add '/app_{env}.php' if necessary provides an alternative.
 * At least, it's a start.
 */
$.ajaxPrefilter(function(options) {
	options.url = root + options.url;
});

/**
 * We're namespacing all our object to avoid polluting the global namespace
 */
var Paz = {};

/**
 * The model representing a user of our app, users are restricted resources only accessible to authenticated users with ROLE_ADMIN
 */
Paz.User = Backbone.Model.extend({
	isLoggedIn: function() {
		return (this.has('username')); // It works, as a user is either an empty shell or full of attributes
	},
	hasRole: function(role) {
		return (this.has('roles') && this.get('roles').indexOf(role) != -1);
	}
});

/**
 * A collection of users
 */
Paz.UserCollection = Backbone.Collection.extend({
	model: Paz.User,
	url: 'users'
});

/**
 * The model representing a fruit, fruits are restricted resources only accessible to authenticated users
 */
Paz.Fruit = Backbone.Model.extend({
	
});

/**
 * A collection of fruits
 */
Paz.FruitCollection = Backbone.Collection.extend({
	model: Paz.Fruit,
	url: 'fruits'
});

/**
 * The model representing an alert (success, warning, error, etc...)
 */
Paz.Alert = Backbone.Model.extend({
});

/**
 * The header view : an ItemView backed by our logged in (or not) user
 */
Paz.HeaderView = Marionette.ItemView.extend({
	template: '#header_tpl',
	initialize: function() {
		this.model.bind('change', this.render);
	}
});

/**
 * The homepage view : an ItemView (but with no model bound) shown to unauthenticated users on landing
 */
Paz.HomepageView = Marionette.ItemView.extend({
	template: '#homepage_tpl'
});

/**
 * The dashboard view : a layout composed of multiple views depending on the user's roles
 */
Paz.DashboardView = Marionette.Layout.extend({
	template: '#dashboard_tpl',
	regions: {
		fruits: '#fruits',
		users: '#users'
	},
	initialize: function() {
		this.model.bind('change', this.render);
	}
});

/**
 * The view used to render a fruit item in the list
 */
Paz.FruitListItemView = Marionette.ItemView.extend({
	template: '#fruit_list_item_tpl'
});

/**
 * The view used to render a list of fruits
 */
Paz.FruitsListView = Marionette.CollectionView.extend({
	template: '#fruits_list_tpl',
	itemView: Paz.FruitListItemView
});

/**
 * The view used to render a user item in the list
 */
Paz.UserListItemView = Marionette.ItemView.extend({
	template: '#user_list_item_tpl'
});

/**
 * The view used to render a list of users
 */
Paz.UsersListView = Marionette.CollectionView.extend({
	template: '#users_list_tpl',
	itemView: Paz.UserListItemView
});

/**
 * The login view
 */
Paz.LoginView = Marionette.ItemView.extend({
	template: '#login_tpl',
	id: 'login',
	initialize: function() {
		this.model = new Paz.Alert();
		this.model.bind('change', this.render);
	},
	events: {
		'submit form': 'login'
	},
	// We catch the submit and submit the form via AJAX instead
	login: function(event) {
		event.preventDefault();
		var form = $(event.target);
		$.ajax({
			context: this,
			type: 'POST',
			url: 'login_check',
			data: form.serialize(),
			dataType: 'json',
			success: function(data, textStatus, errorThrown) {
				Paz.app.user.set(data);
				// As the user is now authenticated, he has access to the fruits
				Paz.app.data.fruits = new Paz.FruitCollection();
				Paz.app.data.fruits.fetch();
				// If the authenticated user has the ROLDE_ADMIN, he has access to the users too
				if (Paz.app.user.hasRole('ROLE_ADMIN')) {
					Paz.app.data.users = new Paz.UserCollection();
					Paz.app.data.users.fetch();
				}
				// We redirect to the dashboard
				Backbone.history.navigate('#/dashboard', { trigger: true });
			},
			error: function(jqXHR, textStatus, errorThrown) {
				this.model.set($.parseJSON(jqXHR.responseText)); // TODO Handle edge cases of network problem and responseText = null
			}
		});
	}
});

/**
 * Our router
 */
Paz.Router = Marionette.AppRouter.extend({
	routes: {
		'': 			'home',
		'dashboard': 	'dashboard',
		'login': 		'login',
		'logout': 		'logout'
	},
	home: function() {
		// If the user is already authenticated, we display his dashboard instead
		if (Paz.app.user.isLoggedIn()) {
			Backbone.history.navigate('#/dashboard', { trigger: true });
		} else {
			// We display the header and the homepage
			this.showHeader();
			this.showHomepage();
		}
	},
	dashboard: function() {
		// If the user isn't authenticated yet, we redirect to the login page
		if (!Paz.app.user.isLoggedIn()) {
			Backbone.history.navigate('#/login', { trigger: true });
		} else {
			// We display the header and the dashboard
			this.showHeader();
			this.showDashboard();
		}
	},
	login: function() {
		// If the user is already authenticated, we 'redirect' to the home
		if (Paz.app.user.isLoggedIn()) {
			Backbone.history.navigate('#/dashboard', { trigger: true });
		}
		// else we display the header and the login form
		else {
			this.showHeader();
			this.showLogin();
		}
	},
	logout: function() {
		$.ajax({
			context: this,
			type: 'GET',
			url: 'logout',
			dataType: 'json',
			success: function(data, textStatus, errorThrown) {
				Paz.app.user.clear();
				// We need to destroy the data that was accessible by the authenticated user: fruits and maybe users
				delete Paz.app.data.fruits;
				delete Paz.app.data.users;
				Backbone.history.navigate('#', { trigger: true });
			}
		});
	},
	showHeader: function() {
		// We generate the header only if it doesn't exist yet
		if (!Paz.app.header.currentView) {
			var headerView = new Paz.HeaderView({
				model: Paz.app.user
			});
			Paz.app.header.show(headerView);
		}
	},
	showHomepage: function() {
		var homepageView = new Paz.HomepageView();
		Paz.app.content.show(homepageView);
	},
	showDashboard: function() {
		var dashboardView = new Paz.DashboardView({
			model: Paz.app.user
		});
		Paz.app.content.show(dashboardView);
		// The authenticated user has access to fruits
		var fruitsListView = new Paz.FruitsListView({
			collection: Paz.app.data.fruits
		});
		dashboardView.fruits.show(fruitsListView);
		// If the authenticated user has the ROLE_ADMIN, he has access to users too
		if (Paz.app.user.hasRole('ROLE_ADMIN')) {
			var usersListView = new Paz.UsersListView({
				collection: Paz.app.data.users
			});
			dashboardView.users.show(usersListView);
		}
	},
	showLogin: function() {
		var loginView = new Paz.LoginView();
		Paz.app.content.show(loginView);
	}
});

/**
 * Our Marionette app
 */
Paz.app = new Marionette.Application();

/**
 * The main regions of our app
 */
Paz.app.addRegions({
	header: '#header',
	content: '#content'
});

/**
 * We bootstrap the app :
 * 1) Instantiate the user
 * 2) Instantiate the collections from the bootstrapped data
 * 3) Launch the router and process the first route
 */
Paz.app.addInitializer(function(options) {
	this.user = new Paz.User(user);
});
Paz.app.addInitializer(function(options) {
	Paz.app.data = {};
	if (typeof(fruits) != 'undefined') {
		Paz.app.data.fruits = new Paz.FruitCollection(fruits);
	}
	if (typeof(users) != 'undefined') {
		Paz.app.data.users = new Paz.UserCollection(users);
	}
});
Paz.app.addInitializer(function(options) {
	this.router = new Paz.Router();
	Backbone.history.start({ root: root });
});

/**
 * Now we launch the app
 */
Paz.app.start();
