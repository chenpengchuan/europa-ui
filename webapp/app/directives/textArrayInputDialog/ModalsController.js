/**
 * Created by youguili on 2016/9/9.
 */
App.controller('ModalsController',function($scope,modalInstance){

    $scope.arrTextarea=$scope.modelValue;
    if(!$scope.title)
        $scope.title =  '编辑';
    if(!$scope.label)
        $scope.label = ""
    if(!$scope.height)
        $scope.height = 100;
    if(!$scope.arrTextarea)
        $scope.arrTextarea = []
    if(!$scope.single)
        $scope.single = false;
    if($scope.arrTextarea.length == 0)
        $scope.arrTextarea.push('')
    else if($scope.single)
        $scope.arrTextarea = [$scope.modelValue]
    $scope.addObj=function(index,arrs){
        arrs.splice(index+1,0,'');
    };
    $scope.removeObj=function(index,arrs){
        arrs.splice(index,1);
    };
    $scope.ok=function(){
        if(validate())
            return;
        for(var i in $scope.arrTextarea){
            if(!$scope.arrTextarea[i]){
                $scope.arrTextarea.splice(i,1)
            }
        }
        if($scope.single) {
            modalInstance.closeModal({value:$scope.arrTextarea.length? $scope.arrTextarea[0]:''});
        } else
            modalInstance.closeModal({value:$scope.arrTextarea});
        auxo.delHotkey($scope)
    };
    $scope.cancel = function () {
        modalInstance.dismiss();
        auxo.delHotkey($scope)
    };
    function validate () {
        var valid = false;

        if($scope.arrTextarea.length == 0)
            valid = false;

        auxo.forEachArray ($scope.arrTextarea, function (e,i) {
            if(e.length > 0) {
                valid = true;
                return false;
            }
        })
        return !valid;
    }

    $scope.modalButtons =[
        {
            action:$scope.ok,
            text:"确定",class:"btn-primary",
            disabled: function(){  return  validate();}
        },
        {
            action:$scope.cancel,
            text:"取消",class:"btn-warning"
        }
    ];
    //$scope.closeModal = $scope.cancel;
    auxo.bindEscEnterHotkey($scope,null, ["INPUT","SELECT","TEXTAREA"])
});