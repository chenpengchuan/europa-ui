angular.module('AuxoApp')
    .controller('BodyController', ['$rootScope', '$scope', '$location', '$state', '$timeout', 'Auth', function($rootScope, $scope, $location, $state,$timeout, Auth) {
        
    $rootScope.loaded = true;

    $scope.getFlag = localStorage.getItem("flag");
     if($scope.getFlag == "true"){
         window.addEventListener("storage", function(event){
             if(event.key == "flag" && event.storageArea.flag == "false"){
                 $scope.logout = function() {
                     Auth.logout(function() {
                         if($scope.getFlag == "true"){
                             location.reload();
                         }
                         // location.reload();
                     }, function() {
                         $rootScope.error = "退出发生错误";
                     });
                 }();
             }
         });
     }
        
    }]);


angular.module('AuxoApp')
    .controller('FooterController', ['$rootScope', '$scope', '$location', '$state', '$timeout', 'Auth', function($rootScope, $scope, $location, $state,$timeout, Auth) {

     

    }]);
