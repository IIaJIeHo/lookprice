angular.module("lookPriceApp", ["ngRoute", "ngResource",'ui.bootstrap.datepicker','ui.bootstrap.buttons',"ui.bootstrap.tpls"])
  .config(function ($routeProvider) {

            $routeProvider.when("/login", {
                    templateUrl: "views/autoLogin.html"
                });

                $routeProvider.when("/registration", {
                    templateUrl: "views/autoRegistration.html"
                });

                $routeProvider.when("/main", {
                    templateUrl: "views/autoMain.html"
                });

                $routeProvider.when("/edit", {
                    templateUrl: "views/autoMain.html"
                });

                $routeProvider.when("/responds", {
                    templateUrl: "views/autoMain.html"
                });

                $routeProvider.when("/forgetpassword", {
                    templateUrl: "views/autoForgetPassword.html"
                });

                $routeProvider.otherwise({
                    redirectTo: "login"
                });
            })
            .config(function($httpProvider) {
                $httpProvider.defaults.withCredentials = true;
            });