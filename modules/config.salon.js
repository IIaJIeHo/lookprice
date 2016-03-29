angular.module("lookPriceApp", ["ngRoute", "ngResource","ui.bootstrap.datepicker","ui.bootstrap.buttons","ui.bootstrap.tpls"])
  .config(function ($routeProvider) {

            $routeProvider.when("/login", {
                    templateUrl: "views/salonLogin.html"
                });

                $routeProvider.when("/registration", {
                    templateUrl: "views/salonRegistration.html"
                });

                $routeProvider.when("/main", {
                    templateUrl: "views/salonMain.html"
                });

                $routeProvider.when("/edit", {
                    templateUrl: "views/salonMain.html"
                });

                $routeProvider.when("/responds", {
                    templateUrl: "views/salonMain.html"
                });

                $routeProvider.when("/forgetpassword", {
                    templateUrl: "views/salonForgetPassword.html"
                });

                $routeProvider.otherwise({
                    redirectTo: "login"
                });
            })
            .config(function($httpProvider) {
                $httpProvider.defaults.withCredentials = true;
            });