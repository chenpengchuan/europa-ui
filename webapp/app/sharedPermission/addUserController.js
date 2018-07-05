angular.module('AuxoApp')
    .controller('AddUserController', function ($scope, $window, $http, $stateParams, $location, ngDialog, Restangular, modalInstance) {
        $scope.title = "新增用户";
        // 声明变量
        $scope.data= {
            account:"",
            name:"",
            password:"",
            id:"",
            resources:[],
            //pwdChanged: false
        }
        var reloadPage = $scope.reloadPage;

        console.log($scope.item);

        // 查看接口权限
        if($scope.item != undefined){
            $scope.owner = $scope.item.creator;
            $scope.md5Passworld =  $scope.item.password;
            Restangular.one("europa/open/user",$scope.item.id).get()
                .then(function (e) {
                    $scope.lastPwd = e.password;
                    angular.copy(e,$scope.data);
                    $scope.title = "编辑用户";
                });
        }



        // 进行接口请求 创建owner取当前用户
        if(!$scope.owner){
            $scope.owner = auxo.Auth.user.name;
        }
        Restangular.one("europa/open/endpoint/lists").get({owner:$scope.owner})
            .then(function (data) {
                $scope.resourceData = data;
                if($scope.item != undefined){
                    var res = $scope.data.resources.length;
                    for(var m=0;m<res;m++){
                        for(var item in $scope.resourceData){
                            if($scope.resourceData[item] && $scope.resourceData[item].id && $scope.resourceData[item].id ==  $scope.data.resources[m]){
                                $scope.resourceData[item].isChecked = "true";
                            }
                        }
                    }
                }
            });


        // 进行增加用户
        $scope.submit = function () {
            if($scope.resourceData){
                console.log("lastPwd",$scope.lastPwd)
                console.log("resourceData",$scope.resourceData)
                var len = $scope.resourceData.length;
                var ids = [];
                for(var i=0;i<len;i++){
                    if($scope.resourceData[i].isChecked != "undefined" && $scope.resourceData[i].isChecked === "true"){
                        ids.push($scope.resourceData[i].id);
                        $scope.data.resources = ids;
                    }
                    if($scope.resourceData[i].isChecked == "false"){
                        ids.pop($scope.resourceData[i].id);
                        $scope.data.resources = ids;
                    }
                }
            }
            // 判断是否改变加密后带密码
            /*if($scope.md5Passworld != $scope.data.password){
                $scope.data.pwdChanged = true;
            }*/

            if($scope.data.account == "" || typeof ($scope.data.account) == "undefined"){
                auxo.sgDialogService.alert("用户名不可为空", "错误");
            }else if($scope.data.name == "" || typeof ($scope.data.name) == "undefined"){
                auxo.sgDialogService.alert("验证账号不可为空", "错误");
            }else if($scope.data.password == "" || typeof ($scope.data.password) == "undefined"){
                auxo.sgDialogService.alert("验证key不可为空", "错误");
            }else {
                Restangular.all("europa/open/user/save").post($scope.data).then(function(data){
                    reloadPage.call();
                    $scope.close();
                }, function(err){
                    auxo.openErrorDialog($scope, ngDialog, err.data.err);
                });
            }
        }

        $scope.cancel = function () {
            $scope.close();
        }

        $scope.close = function(){
            modalInstance.dismiss();
        }

    });

