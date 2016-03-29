angular.module("lookPriceApp", ["ngRoute", "ngResource","ui.bootstrap.datepicker","ui.bootstrap.buttons","ui.bootstrap.tpls"])
.config(function ($routeProvider) {

    $routeProvider.when("/login", {
        templateUrl: "views/userLogin.html"
    });

    $routeProvider.when("/registration", {
        templateUrl: "views/userRegistration.html"
    });

    $routeProvider.when("/main", {
        templateUrl: "views/userMain.html"
    });

    $routeProvider.when("/auto", {
        templateUrl: "views/userMain.html"
    });

    $routeProvider.when("/leaverequest", {
        templateUrl: "views/userMain.html"
    });

    $routeProvider.when("/edit", {
        templateUrl: "views/userMain.html"
    });

    $routeProvider.when("/forgetpassword", {
        templateUrl: "views/userForgetPassword.html"
    });

    $routeProvider.otherwise({
        redirectTo: "login"
    });
})
.config(function($httpProvider) {
    $httpProvider.defaults.withCredentials = true;
});