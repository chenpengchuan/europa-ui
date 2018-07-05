angular.module('AuxoApp')
    .controller('TestController', function ($scope, $location, $window, $http, $uibModal, sgDialogService, Restangular) {

        var a = {id: 5, name: 'ff', data: [1, 2, 3], obj: {name: 'test'}, other: 'aaaa', test: function (s) {
            
        }}
        var b = {id: 6, name: 'bb', data: [2, 3, 4, 5], obj: {name: 123}, aliax: 'cc'}

        //var c = angular.extend(a, b)

        //alert("a: " + JSON.stringify(a , null," "))

        var newValue = $.extend(true, {}, a);


        $scope.clickMe = function () {

            alert("I am clicking." + ": " + JSON.stringify(newValue, null, " "))
        }

    });
