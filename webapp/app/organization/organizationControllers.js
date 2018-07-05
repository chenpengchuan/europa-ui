auxo.meta.organization = {
    currUrl:"/organization",
    restRootPath:"organizations",
    detailTemplate : "",
    entityDisplayName:"机构",
    getBaseFilter: function() {
        return "";
    },
    limit : 100000,
    rowHeaders : [
        //{name : "id", disName : "ID", converter : auxo.same},
        {name : "name", disName : "名称", sortName: "name_sort", converter : auxo.same},
        {name : "createTime", disName : "创建时间", converter : auxo.date2str},
        {name : "creator", disName : "创建人", converter : auxo.same},
        {name : "lastModifier", disName : "修改人", converter : auxo.same},
        {name : "lastModifiedTime", disName : "修改时间", converter : auxo.date2str}
    ]
};
//
// angular.module('AuxoApp').config(['$adConfigProvider', function ($adConfigProvider) {
// //    $adConfigProvider.iconClasses.expand = 'glyphicon glyphicon-folder-close';
// //    $adConfigProvider.iconClasses.collapse = 'glyphicon glyphicon-folder-open';
// //    // component classes
// //    $adConfigProvider.componentClasses.tableLiteClass = 'table my-custom-class';
// }])


angular.module('AuxoApp')
.controller('OrganizationController',function($filter,$scope, $location, $window, $http,$stateParams, Restangular, ngDialog) {

    CrudBaseController.call(this, auxo.meta.organization, $scope, $location, $window, $http, Restangular, ngDialog, $filter);

    $scope.root = { children : [] };

    $scope.afterFetch = function(facetResult) {
        $scope.root.children = [];
        if ($scope.rowCollection) {
            var idMap = {};

            for (var i = 0; i < $scope.rowCollection.length; i++) {
                var entity = $scope.rowCollection[i];
                idMap[entity.id] = entity;
            }

            for (var i = 0; i < $scope.rowCollection.length; i++) {
                var entity = $scope.rowCollection[i];
                if (entity.parent) {
                    var parent = idMap[entity.parent];
                    if (parent) {
                        if (!parent.children) {
                            parent.children = [];
                        }
                        parent.children.push(entity);
                    } else {
                        $scope.root.children.push(entity);
                    }
                } else {
                    $scope.root.children.push(entity);
                }
            }
        }

        $scope.toggleAll($scope.root);
    };

//    $scope.rowClicked = function(item, level, event) {
////       event.stopPropagation();
//       alert('row clicked' + item.name + '/' + level);
//    };

	function toggleAll(item) {
        if(item.children && item.children.length > 0) {
            item._ad_expanded = !item._ad_expanded;
            var i, len;
            for (i = 0, len = item.children.length; i < len; i++) {
                toggleAll(item.children[i]);
            }
        }
    }

    $scope.toggleAll = function(item) {
         toggleAll(item);
    };

    $scope.removeItem = function(item) {
        $scope.selectedRows = [item];
        $scope.remove();
    };

    $scope.fetchPage($scope.ptableState);
});

angular.module('AuxoApp')
.controller('EditOrganizationController', function EditOrganizationController($scope, $window, $http, $stateParams, $location, ngDialog, Restangular) {
	var isNew = $scope.isNew = $stateParams.id == "new";

	$scope.entityDisplayName = "机构";

	var id = $stateParams.id;
	var parent = $stateParams.parent;

	$scope.parentName = $stateParams.parentName;

	$scope.error=false;

    $scope.entity={parent : parent};

    if (!isNew) {
		Restangular.one("organizations", id).get().then(function(entity) {
			angular.extend($scope.entity, entity);

			$scope.userCopy = entity;
        });
	}

    $scope.save = function() {
        $scope.saving = true;
        var entityCopy = auxo.clone($scope.entity);

        if ($scope.isNew) {
            Restangular.all("organizations").post(entityCopy).then(
                    function(){
                        $scope.saving = false;
                        auxo.loadPage(auxo.meta.organization.currUrl,{});
                    },
                    function(es) {
                        $scope.saving = false;
                        auxo.showErrorMsg(es);
                    });
        }else {
            Restangular.one("organizations", entityCopy.id)
                .customPUT(entityCopy)
                .then(
                    function(){
                        $scope.saving = false;
                        auxo.loadPage(auxo.meta.organization.currUrl);
                    },
                    function(es) {
                        $scope.saving = false;
                        auxo.showErrorMsg(es);
                    });
        }
    };

	$scope.cancel = function() {
        //auxo.loadPage(auxo.meta.user.currUrl);
        auxo.goBack();
	}
});