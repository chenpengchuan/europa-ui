'use strict';

/* Controllers */

angular.module('AuxoApp')
.controller('LicenseController',  function($rootScope, $scope, $location,$uibModal, Restangular, Auth, sgDialogService) {

  $scope.isNew = true;
  $scope.saving = false;
  $scope.entity = {};
  Restangular.one("license/sid").get()
  .then(function(rt){
    $scope.entity.sid = rt.sid;
  })

  $scope.save = function() {
    $scope.saving = true;
    Restangular.one("license").customPOST($scope.entity, "activate").then(function(rt){
        $scope.saving = false;
        if (rt["error"]) {
          $scope.error = {"err" : rt["error"]}
        } else {
          alert("OK!");
          $location.path("/login");
        }
    })
  }

});
