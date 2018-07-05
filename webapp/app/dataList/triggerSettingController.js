angular.module('AuxoApp')
    .controller('TriggerSettingController', function ($scope, $window, $http, $stateParams, $location, ngDialog, Restangular, modalInstance) {
        $scope.data ={
            trigger:"",
            dataSource:{
                id:"",
                name:"",
                url : "",
                dbType:"",
            },
            dataStore:{
                name:"",
                id:"",
            },
            oldName:"",
            resourceId:""
        }
        $scope.isShow = true;

        if(!auxo.isAdmin()){
            $scope.isShow = false;
        }


       // 判断能否有数据
        Restangular.one("europa/statistics/settings").get()
            .then(function (data) {
                console.log(data);
                if (data.trigger != "" && typeof(data.trigger) != "undefined"){
                    $scope.data.trigger = data.trigger;
                    if(data.enable == false){
                        $scope.data.selectData = "off";
                        $scope.isEnable = false;
                    }else {
                        $scope.data.selectData = "";
                        $scope.isEnable = true;
                    }
                }else{  // 设置trigger默认值为每分
                    $scope.data.trigger = "* * * * *";
                }
                if(data.name){
                    $scope.data.dataStore.name = data.name;
                    $scope.data.dataStore.id = data.resourceId;
                }
            })

        $scope.submit =function () {
           $scope.triggerView = $scope.data.trigger;
           if ($scope.data.selectData != "off"){
               $scope.data.selectData = "";
               $scope.isEnable = true;
           }else{
               $scope.data.selectData = "off";
               $scope.isEnable = false;
           }
            if(!auxo.isAdmin()){
                $scope.isEnable = false;
                Restangular.all("europa/statistics/settings").post({enable :$scope.isEnable,resourceId:$scope.data.dataStore.id,name:$scope.data.dataStore.name}).then(function(data){
                    location.reload();
                    //console.log(data);
                });
            }else {
                Restangular.all("europa/statistics/settings").post({enable :$scope.isEnable,trigger : $scope.triggerView,resourceId:$scope.data.dataStore.id,name:$scope.data.dataStore.name,tenant:auxo.Auth.user.tenant, user:auxo.Auth.user.name}).then(function(data){
                    location.reload();
                    //console.log(data);
                });
            }
            auxo.delHotkey($scope)
            modalInstance.closeModal(false)
        }
        // 权限分配方法
        $scope.permissionAssignment = function (selectID) {
            console.log(selectID);
            $scope.openDialog = function(){
                auxo.sgDialogService.openModal({
                    templateUrl : 'app/dataList/permissionAssignment.html',
                    //data:{passId:$scope.aa},
                    callback: function(result){
                    },
                    width:500,
                    height:800,
                });
            }();
        }

        $scope.cancel = function () {
           /* auxo.delHotkey($scope)
            modalInstance.closeModal(false)*/
           $scope.close();
        }

        $scope.close = function(){
            modalInstance.dismiss();
        }

        $scope.onSelectChanged = function (data, rootId) {
            if( data && data.parentId == rootId){
                console.log('onSelectChanged rootId = ', rootId)
                $scope.data.dataStore.id = data.id;
                $scope.passId =  data.id;
                $scope.data.resourceId = data.id;
                $scope.oldName = data.name;
                $scope.data.dataStore.name = data.name;
                $scope.data.oldName = data.name;
            }else{
                //alert('only select second level items')
                //alert('only select second level items')
                //auxo.sgDialogService.alert("only select second level items", "错误");
                 alert('只可选择二级目录')
            }
        }
    });

