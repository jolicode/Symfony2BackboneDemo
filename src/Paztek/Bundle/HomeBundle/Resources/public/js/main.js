/**
 * One of the issue we'll be facing is the fact that internal URLs used by our app
 * can be generated at initial page load in templates, be found in JS code or generated on the client side.
 * This won't let us benefit fully from the routing mechanism and the separation of environments of Symfony2 .
 * 
 * Intercepting AJAX calls to rewrite URLs and add '/app_{env}.php' if necessary provides an alternative.
 * At least, it's a start
 */
$.ajaxPrefilter(function(options) {
	options.url = root + options.url;
});

/**
 * We're namespacing all our object to avoid polluting the global namespace
 */
var Paz = {};

/**
 * The model representing a user of our app
 */
Paz.User = Backbone.Model.extend({
});

/**
 * The representing an alert (success, warning, error, etc...)
 */
Paz.Alert = Backbone.Model.extend({
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
	content: '#content',
	modal: '#modal'
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
 * The dashboard view : a layout composed of many views depending on the user's roles
 */
Paz.DashboardView = Marionette.ItemView.extend({
	template: '#dashboard_tpl'
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
			url: '/login_check',
			data: form.serialize(),
			dataType: 'json',
			success: function(data, textStatus, errorThrown) {
				Paz.app.user.set(data);
				Backbone.history.navigate('#');
			},
			error: function(jqXHR, textStatus, errorThrown) {
				this.model.set($.parseJSON(jqXHR.responseText)); // TODO Handle edge cases of network problem and responseText = null
			}
		});
	}
});

Paz.Router = Marionette.AppRouter.extend({
	routes: {
		'': 			'home',
		'login': 		'login',
		'logout': 		'logout'
	},
	home: function() {
		console.log('appel à home');
		this.showHeader();
		this.showContent();
	},
	login: function() {
		// If the user is already connected, we 'redirect' to the home
		if (Paz.app.user.username) {
			Backbone.history.navigate('#');
		}
		// else we display the header and the login form
		this.showHeader();
		this.showLogin();
	},
	logout: function() {
		$.ajax({
			context: this,
			type: 'GET',
			url: '/logout',
			dataType: 'json',
			success: function(data, textStatus, errorThrown) {
				Paz.app.user.clear();
				Backbone.history.navigate('#');
			}
		});
	},
	showHeader: function() {
		if (!Paz.app.header.currentView) {
			var headerView = new Paz.HeaderView({
				model: Paz.app.user
			});
			Paz.app.header.show(headerView);
		}
	},
	showContent: function() {
		// We show a different view depending on whether the user is authenticated or not
		if (!Paz.app.user.username) {
			var homepageView = new Paz.HomepageView();
			Paz.app.content.show(homepageView);
		} else {
			var dashboardView = new Paz.DashboardView();
			Paz.app.content.show(dashboardView);
		}
	},
	showLogin: function() {
		var loginView = new Paz.LoginView();
		Paz.app.content.show(loginView);
	}
});

/**
 * We bootstrap the app :
 * 1) Instantiate the user
 * 2) Launch the router
 */
Paz.app.addInitializer(function(options) {
	this.user = new Paz.User(user);
});
Paz.app.addInitializer(function(options) {
	this.router = new Paz.Router();
	Backbone.history.start({ root: root });
});

/**
 * Now we launch the app
 */
Paz.app.start();
