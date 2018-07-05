
App.controller('CollectorRegisteredController', function CollectorRegisteredController($scope, $window, $http, $stateParams, $location, ngDialog, Restangular, sgDialogService, Auth, modalInstance) {

    $scope.cancel = function () {
        modalInstance.dismiss();
        auxo.delHotkey($scope)
    };

    //console.log($scope.fromParent);
    // 编辑采集器
    console.log($scope);
    if(typeof ($scope.fromparent) != "undefined"){
        $scope.collector = "编辑采集器";

        $scope.source = $scope.fromparent.selected[0];
        $scope.id = $scope.source.id;
        $scope.readOnly = true;
        $scope.name = $scope.source.name;
        $scope.secretKey = $scope.source.secretKey;
        $scope.javaPath = $scope.source.javaPath;
        $scope.installPath  = $scope.source.installPath;
        $scope.cVersion = $scope.source.cVersion;
        $scope.startedTime = $scope.source.startedTime;
        $scope.status = $scope.source.status;
        $scope.platform = $scope.source.platform;

        var reloadPage = $scope.reloadPage

        var source = {
            id: $scope.id,
            name : $scope.name,
            secretKey: $scope.secretKey
        };

        // 提交
        $scope.submit = function(){
            source.id = $scope.id;
            source.name = $scope.name;
            source.secretKey = $scope.secretKey;
            source.javaPath = $scope.javaPath;
            source.installPath = $scope.installPath;
            source.cVersion = $scope.cVersion;
            source.platform = $scope.platform;
            Restangular.all("europa/collectors/submit").post(source)
                .then(function (facetResult) {
                    reloadPage.call();
                })
            $scope.cancel();
        }

    }else{
        // 注册采集器
        $scope.collector = "注册采集器";
        var reloadPage = $scope.reloadPage;

        function guid() {
            return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
                var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
                return v.toString(16);
            });
        }

        //$scope.id = guid()
        //$scope.javaPath = "/usr/jdk64/jdk1.8.0_77";
        //$scope.installPath = "/app/linkoop/collecter";
        //$scope.option.value = "1.0";

        $scope.submit = function(){
            if(typeof($scope.selected)=="undefined"){
                $scope.selected = "1.0";
            }
            if(typeof ($scope.platform)=="undefined"){
                $scope.platform = "linux";
            }
            $scope.readonly = false;
            var source = {
                id: $scope.id,
                name : $scope.name,
                secretKey: $scope.secretKey,
                javaPath: $scope.javaPath,
                installPath: $scope.installPath,
                cVersion: $scope.selected,
                platform: $scope.platform,
            };
            Restangular.all("europa/collectors/submit").post(source)
                .then(function (facetResult) {
                    reloadPage.call();
                })
            $scope.cancel();
        }
    }

});