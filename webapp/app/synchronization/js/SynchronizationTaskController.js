//点击name的链接页面的contoller
App.controller('SynchronizationTaskController', function SynchronizationTaskController($scope, $window, $http, $stateParams, $location, ngDialog, Restangular, sgDialogService, Auth,modalInstance) {

    $scope.cancel = function () {
       modalInstance.dismiss();
          auxo.delHotkey($scope)
    };

    $scope.cronConfig = {
            allowMultiple: true,
            options: {
                allowWeek : true,
                allowMonth : true,
                allowYear : true
            },
            quartz: true
        };

    Restangular.one("europa/collectors/"+ $scope.id+"/taskJson").get().then(function(entity) {
        $scope.data = entity;
        $scope.dataSource = [];
        $scope.dataStore = [];
        $scope.dataEntity = [];

        var objSource = $scope.data.dataSource;
        if($scope.data.dataSource.operateType == 0){
            delete $scope.data.dataSource.regex;
        }
        for(var key in objSource){
            if(key != 'properties' && key != 'operateType')
            $scope.dataSource.push({name:key,value:objSource[key]})
            if(key == 'operateType'){
                var operateType = objSource[key] == 0? '原样' :objSource[key] == 1? '抽取' :objSource[key] == 2? '分割' : '过滤'
                $scope.dataSource.push({name:"operateType",value:operateType})
            }
        }

        var objStore = $scope.data.dataStore;
        for(var key in objStore){
            if(key == 'mode') $scope.data.dataStore.mode = $scope.data.dataStore.mode == 'append'?'追加':'覆盖' ;
            $scope.dataStore.push({name:key,value:objStore[key]})
        }

        $scope.data.fieldMapping = angular.forEach(entity.fieldMapping , function(e){
            if(e.encrypt === "MIX"){
                e.encrypt = "用*隐藏"
            }else if(e.encrypt === "BLANK"){
                e.encrypt = "去除数据"
            }
        })

        if( $scope.data.partitionPattern)
            $scope.isDate = true;
        $scope.statusType = ($scope.data.dataSource.type == 'JDBC') ? 'DB' : $scope.data.dataSource.type;
        if($scope.data.stopOnSchemaChanged === false){
            $scope.data.stopOnSchemaChanged = "任务继续"
        }else $scope.data.stopOnSchemaChanged = "任务停止"
        $scope.isSeparator = $scope.data.dataStore.format == "csv" ? true: false;

    });


});

//点击name的链接页面的contoller
App.controller('viewPartitionPatternController', function viewPartitionPatternController($scope, $window, $http, $stateParams, $location, ngDialog, Restangular, sgDialogService, Auth,modalInstance) {

    $scope.cancel = function () {
       modalInstance.dismiss();
          auxo.delHotkey($scope)
    };
});