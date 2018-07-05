/*
 ***组件状态监控Controller
*/
App.controller("ComponentController", function($filter, $scope, $location, $window, $http,$stateParams, Restangular, ngDialog) {
	$scope.go_schema_editOrCopy=function(id,action){
	//alert(action);
		$location.path("/hippo/component/preview/"+id+'/'+action);
	}
$scope.components = [{category:"loading"}];

		$scope.fetchComponentsStatus = function() {
		    Restangular.one("hippo/components").get().then(function(componentsMap){
        		    $scope.components = [];
        		    for (var category in componentsMap) {
        		       var cs = componentsMap[category];

                       if (!$.isArray(cs)) continue;

                       if (cs.length == 0) {
                    		$scope.components.push({category : category, addr : "-", state : "DEAD"});
                       } else {
                    		$scope.components = $scope.components.concat(cs);
                       }
        		    }
        		}, function(error) {
        		    $scope.components = [{category : "Error happens! auxo-ui server is OK?"}];
        		})
		};
		$scope.fetchComponentsStatus();
$scope.stop = function(id) {
if(id !=null && id != 'undefined'){
  	auxo.openConfirmDialog($scope, ngDialog, "确认要停止"+id, function(){
  //  				Restangular.all($scope.restRootPath).customPOST(ids, "enable").then(function(d){
  //  					$scope.fetchPage($scope.ptableState);
    				}, function(err){
    				});
      }
}
$scope.restart = function(id) {
if(id !=null && id != 'undefined'){
  			auxo.openConfirmDialog($scope, ngDialog, "确认要重启"+id, function(){

  				}, function(err){
  				});
  }
}
CrudBaseController.call(this, auxo.meta.components, $scope, $location, $window, $http, Restangular, ngDialog, $filter);
});

App.controller("ComponentPreviewController", function($filter, $scope, $location, $window, $http,$stateParams, Restangular, ngDialog) {
	var id = $stateParams.id;
	alert(id);
});