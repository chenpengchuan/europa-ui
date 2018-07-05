/**
 * Created by youguili on 2016/9/9.
 */
App.controller('CheckListDlgController',function($scope,modalInstance){

    if(!$scope.title)
        $scope.title =  '编辑';
    if(!$scope.label)
        $scope.label = ""
    if(!$scope.allItems)
        $scope.allItems = []
    if(!$scope.selections)
        $scope.selections = []

    $scope.checkAll = function() {
        auxo.array.removeAll($scope.selections);
        angular.extend($scope.selections, $scope.allItems)
    };
    $scope.uncheckAll = function() {
        auxo.array.removeAll($scope.selections);
    };

    $scope.ok=function(){
        modalInstance.closeModal({value:$scope.selections});
        auxo.delHotkey($scope)
    };
    $scope.cancel = function () {
        modalInstance.dismiss();
        auxo.delHotkey($scope)
    };

    $scope.modalButtons =[
        {
            action:$scope.ok,
            text:"确定",class:"btn-primary",
            disabled: function(){  return  false;}
        },
        {
            action:$scope.cancel,
            text:"取消",class:"btn-warning"
        }
    ];
    //$scope.closeModal = $scope.cancel;
    auxo.bindEscEnterHotkey($scope,null, ["INPUT","SELECT","TEXTAREA"])
});