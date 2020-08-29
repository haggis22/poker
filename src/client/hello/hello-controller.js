(function(app) {

    'use strict';

    app.controller('HelloCtrl', ['$scope',

        function($scope) {


            $scope.name = 'Danny';
        

        }  // outer function

    ]);

})(angular.module('HelloApp'));