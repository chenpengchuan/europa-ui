angular.module('AuxoApp')
    .controller('collectorResourceDirController', function ($filter, $scope, $location, $window, $http,$stateParams, Restangular, ngDialog,$interval) {
        var CollectorId = $scope.ResourceId = $stateParams.id;
        var ResourceId = $scope.CollectorId = $stateParams.resId;

        $scope.rowCollection = []
        $scope.selectedRows = []

//  采集器目录的详情页面弹出框
        $scope.editDataSource = function (node) {
            var openDialog = function(entity){
                var url = 'app/collector/collectorSourceEditing.html';
                if(entity.resType == "HTTP"){
                    url = 'app/resourceMan/webSourceEditing.html';
                }
                auxo.sgDialogService.openModal({
                    templateUrl : url,
                    data:{editingNode:entity,CollectorId:CollectorId},
                    callback: function(newData){
                        history.go(0);
                    },
                    width:800
                });
            }
            Restangular.one("resource", node.id).get().then(function (entity) {
                openDialog(entity);
            })
        }

        $scope.synchronizationDataTest = function(selectedRows){
            selectedRows.map(function(row,taskId){
                var entity1={
                    id:  row.id,
                    name:  row.name,
                    type:"JDBC",
                    driver: row.attributes.driver,
                    url :  row.attributes.url,
                    username: row.attributes.user,
                    password: row.attributes.password,
                    table:"",
                    selectSQL:"",
                    dbType: row.attributes.DBType
                };
                var taskId ;
                Restangular.all("europa/collectors/"+CollectorId+"/datasource/test").post( entity1)
                    .then(function (resp) {
                        if(resp ==="true"){
                            Restangular.all("europa/collectors/"+CollectorId+"/schema/fetch").post( entity1)
                                .then(function (rest) {
                                    if(rest){
                                        taskId = rest;
                                        row.attributes.lastSyncTaskId = taskId;
                                    }

                                },function (error) {
                                    auxo.showErrorMsg(error);
                                })
                        }else if(resp ==="false"){
                            auxo.sgDialogService.alert("连接不可用！","提示");
                        }
                    },function (error) {
                        auxo.showErrorMsg(error);
                    })
            })
        }

//  同步元数据按钮可以同时同步多条
        $scope.synchronizationData = function(selectedRows){
            if(selectedRows === undefined || selectedRows.length == 0){
                auxo.sgDialogService.alert("请选择一条数据！","提示");
            }else{
                for(var i = 0;i<selectedRows.length;i++){
                    row = selectedRows[i];
                    (function(row){
//  测试链接和元数据同步需要上传的entit
                        var entityDB={
                                id:  row.id,
                                name:  row.name,
                                type:"JDBC",
                                driver: row.attributes.driver,
                                url :  row.attributes.url,
                                username: row.attributes.user,
                                password: row.attributes.password,
                                table:"",
                                selectSQL:"",
                                dbType: row.resType
                            };

                        var taskId ;
                        if(row.resType === 'DB'){
                            Restangular.all("europa/collectors/"+CollectorId+"/datasource/test").post( entityDB)
                                .then(function (resp) {
                                    if(resp ==="true"){
                                        Restangular.all("europa/collectors/"+CollectorId+"/schema/fetch").post( entityDB)
                                            .then(function (rest) {
                                                if(rest){
                                                    taskId = rest;
                                                    row.attributes.lastSyncTaskId = taskId;
                                                }
                                            },function (error) {
                                                auxo.sgDialogService.alert("连接不可用！","提示");
                                            })
                                    }else if(resp ==="false"){
                                        auxo.sgDialogService.alert(row.name+"连接不可用！","提示");
                                    }
                                },function (error) {
                                    auxo.showErrorMsg(error);
                                })
                        }
                        else if(row.resType === 'HTTP'){
                            auxo.sgDialogService.alert("http类型数据无法同步！","提示");
                        }
                    })(row)

                }

            }

        }

        var that = this
//    指定数据池的id
        $scope.appointSpool = function(data,row){
            var spoolId = data.id;
            var dataSourceId = row.id;
            var node = data;

            delete node.enabled;
            delete node.isSelected;
            Restangular.all("resource").customPUT(node,node.id).then (function (result) {
            }, function (errmsg) {
                auxo.showErrorMsg(errmsg)
            })
            Restangular.one("europa/collectors/" + CollectorId + "/dataspool/bind")
                .get({dataSourceId:dataSourceId,dataSpoolId:spoolId})
                .then(function(rest){
                    $scope.reloadPage()
                })
        }

//  跳转到采集的的详情或者任务页面
        $scope.showTab = function(statusPage){
            $location.url("collector/" +CollectorId+ "#"+statusPage);
        }

        $scope.back = function(){
            auxo.go("/collector")

            // $location.url("collector/" +CollectorId+ "#tasks");
        }

//  获取当前展示页面的数据
        auxo.meta.collectorResource = {
            currUrl:"/collectorResourceDir",
            restRootPath:"resource",
            detailTemplate : "",
            entityDisplayName:"ResourceDir",
            getBaseFilter: function() {
                return "parentId=" + ResourceId + "&resType=dataset_db|dataset_spool|DB|data_spool|HTTP";
            },
            displayMap: {"dir":"目录","dataset_spool":"内部存储","dataset_db":"外部数据源","DB":"JDBC",
                "data_spool":"HDFS","MQ":"消息队列","KV":"Key-Value数据库","HDFS":"分布文件系统"},
            rowHeaders : [
                {name : "name", disName : "名称", sortName: "name_sort", converter : auxo.same},
                {name : "resType", "disName" : "类型", converter : function (value, row) {
                    if(value == 'data_spool' && row.attributes.storeType)
                        value = row.attributes.storeType;
                    var r= auxo.meta.collectorResource.displayMap[value];
                    return r? r: value;
                }},
                {name : "version", "disName" : "版本", converter : auxo.same},
                {name : "creator", disName : "创建人", converter : auxo.same},
                {name : "lastModifier", disName : "修改人", converter : auxo.same},
                {name : "lastModifiedTime", disName : "修改时间", converter : auxo.date2str},
                {name : "createTime", disName : "创建时间", converter : auxo.date2str},
                {name : "attributes", hiddenName:"lastSyncTime",disName : "最后同步时间", converter : function(attributes){
                    return auxo.date2str(attributes.lastSyncTime);
                }},
                {name : "attributes", hiddenName:"lastSyncTaskId",disName : "同步进度", converter : auxo.date2str},
                {name : "attributes", hiddenName:"dataSpoolName",disName : "存储池", converter : function(attributes){
                    return attributes.dataSpoolName? attributes.dataSpoolName: 'N/A';
                }}

            ],
            sort : {predicate:"lastModifiedTime", reverse:true}
        };
        CrudBaseController.call(this, auxo.meta.collectorResource, $scope, $location, $window, $http, Restangular, ngDialog, $filter);
        //每隔两秒更新进度条数据
        var timer = $interval(function(){
            var rows = $scope.rowCollection
            if(rows)
                for(var i = 0; i< rows.length; i +=1){
                    var row = rows[i]
                    if(row && row['attributes'] && row['attributes']['lastSyncTaskId']){
                        var taskId = row['attributes']['lastSyncTaskId'];
                        (function(row, taskId){
                            Restangular.one("europa/tasks/" + taskId + "/progress")
                                .get()
                                .then(function (resp) {
                                    var val = Math.round(resp.value);
                                    row.progressValue = val
                                    if(val == 100){
                                        delete row['attributes']['lastSyncTaskId']
                                    }
                                    console.log(taskId,val)
                                })
                        })(row, taskId);
                    }
                }
        }, 2000)
//切换页面时停止定时更新任务
        $scope.$on("$destroy", function() {
            if (timer) {
                $interval.cancel(timer);
            }
        });
    });

