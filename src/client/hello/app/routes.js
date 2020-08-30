"use strict";

(function (app) {

    app.config(function ($stateProvider, $urlRouterProvider) {

        // For any unmatched url, send to /rules
        $urlRouterProvider.otherwise("/main");

        $stateProvider

            .state('main', {
                url: "/main",
                templateUrl: "../main/index.html"
            });

    });

})  (angular.module('HelloApp'));

