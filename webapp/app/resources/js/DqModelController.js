auxo.meta.zmodel = {
    currUrl:"/qualityAnalysis/zmod",
    restRootPath:"/europa/zmod",
    path:"/qualityAnalysis/zmod",
    detailTemplate : "",
    entityDisplayName:"分析模型",
    getBaseFilter: function() {
        return "";
    },
    rowHeaders : [
        {name : "name", disName : "分析模版", sortName: "name_sort", converter : auxo.same},
        {name : "rules", disName : "规则", converter : auxo.same},
        {name : "id", disName : "相关任务", converter : auxo.same},
        {name : "processDataType", disName : "数据类型", visible: false, converter : auxo.same},
        {name : "processDataId", disName : "数据（Dataset）", converter : auxo.same},
        {name : "preProcessFlowName", disName : "预处理流程", converter : auxo.same},
        {name : "preProcessFlowId", disName : "预处理流程", visible: false, converter : auxo.same},
        {name : "owner", disName : "所有人", converter : auxo.same},
        // {name : "creator", disName : "创建人", converter : auxo.same},
        // {name : "lastModifier", disName : "修改人", converter : auxo.same},
        {name : "lastModifiedTime", disName : "修改时间", converter : auxo.date2str}
    ],
    sort : {predicate:"lastModifiedTime", reverse:true},
    $controller: {},
    flowData: {},
    runOneModel: function (selectedModel, scheduleType) {
        if (!selectedModel || !selectedModel.id)
            return;
        var self = auxo.meta.zmodel;
        self.flowData = {};
        auxo.openConfirmDialog(self.$controller.$scope, self.$controller.ngDialog, "真的要运行" + self.entityDisplayName + " " + selectedModel["name"] + " ？", function(){
            var ids = [selectedModel.id];
            self.$controller.Restangular.all(self.restRootPath).customPOST(ids, "createFlow").then(function(d){
                if (d && d.flowDesc) {
                    self.flowData.dataflow = d.flowDesc
                    self.submitDataflow({scheduleType: scheduleType});
                }
            }, function(err){
                if (err && err.data && err.data.err)
                    auxo.openErrorDialog(self.$controller.$scope, self.$controller.ngDialog, err.data.err);
            });
        });
    },
    submitDataflow: function (options) {
        var self = auxo.meta.zmodel;
        self.saveScheduleData = function (scheduleData) {
            var data = {
                "source": auxo.systemId,
                "configurations": {"startTime": 1464405562406},
                "schedulerId": "once",
                "name": "test AAA",
                "flowId": "fsh-001"
            };
            data.configurations.arguments = scheduleData.arguments || [];
            data.configurations.properties = scheduleData.properties || [];
            if (auxo.isIE()){
                var date = scheduleData.startDate.toString().replace(/-/g, "/");//兼容IE
                data.configurations.startTime = new Date(date).getTime();
            } else {
                data.configurations.startTime = new Date(scheduleData.startDate).getTime();
            }
            if (scheduleData.endDate)
                data.configurations.endTime = new Date(scheduleData.endDate).getTime();
            else
                data.configurations.endTime = new Date().getTime() + (1000 * 3600 * 24);
            data.schedulerId = scheduleData.type;
            if (scheduleData.cronExpression) {
                data.configurations.cronType = "simple";
                data.configurations.cron = scheduleData.cronExpression;
            }
            data.flowId = self.flowData.dataflow.id;
            data.flowName = self.flowData.dataflow.name;
            data.flowType = self.flowData.dataflow.flowType;
            data.name = scheduleData.name;

            console.log("提交scheduler " + JSON.stringify(data));

            self.$controller.Restangular.all("schedulers").post(data)
                .then(function (facetResult) {
                    console.log("return: " + JSON.stringify(facetResult))
                    self.$controller.sgDialogService.alert("提交成功！", "提示");
                    if (auxo.isIE()){
                        var t = Date.now();
                        function sleep(d){
                            while(Date.now - t <= d);
                        }
                        sleep(1000);//sleep for shows the refresh page
                        self.$controller.$location.path('/qualityAnalysis/zdaf/all');
                    } else {
                        self.$controller.$location.path('/qualityAnalysis/zdaf/all');
                    }
                }, function (error) {
                    self.$controller.sgDialogService.alert("错误信息：" + error.err, "错误");
                })
        };

        var openModal = function(options) {
            self.$controller.sgDialogService.openModal({
                templateUrl : 'app/scheduler/Scheduler_form.html',
                controller : 'SchedulerFormController', // specify controller for modal
                //data:{fromParent: {scheduleData: {name: $scope.data.dataflow.name+"-" + auxo.getCurrentTime()},dataflow: $scope.data.dataflow}},
                data:{fromParent: {scheduleData: {name: self.flowData.dataflow.name, type: options.scheduleType}, dataflow: self.flowData.dataflow}},
                callback: function(scheduleData){
                    self.saveScheduleData(scheduleData);
                },
                width: (options.scheduleType == 'once' ? 800 : 950)
            });
        };

        openModal(options);
    }

};

App.controller('DqModelController', function($filter, $scope, $location, $window, $http,$stateParams, Restangular, ngDialog, sgDialogService) {
    CrudBaseController.call(this, auxo.meta.zmodel, $scope, $location, $window, $http, Restangular, ngDialog, $filter);
    auxo.meta.zmodel.$controller.$scope = $scope;
    auxo.meta.zmodel.$controller.$location = $location;
    auxo.meta.zmodel.$controller.Restangular = Restangular;
    auxo.meta.zmodel.$controller.ngDialog = ngDialog;
    auxo.meta.zmodel.$controller.sgDialogService = sgDialogService;

    $scope.createFlow = function (selectedRows) {
        console.log(JSON.stringify(selectedRows));
        if ($scope.selectedRows.length != 1)
            return;
        auxo.openConfirmDialog($scope, ngDialog, "需要为 " + $scope.entityDisplayName + " " + $scope.selectedRows[0]["name"] + " 生成FLow ？", function(){
            var ids = [$scope.selectedRows[0].id];
            Restangular.all($scope.restRootPath).customPOST(ids, "createFlow").then(function(d){
                if (d && d.flowDesc) {
                    //$scope.data.dataflow = d.flowDesc
                    if ($scope.selectedRows[0]["id"])
                        auxo.go("/qualityAnalysis/zdaf/all?queryWord=modelId="+$scope.selectedRows[0]["id"]);
                    else
                        auxo.go("/qualityAnalysis/zdaf/all");
                }
            }, function(err){
                auxo.openErrorDialog($scope, ngDialog, err.data.err);
            });
        });
    };

    $scope.runModel = function (selectedRows, scheduleType) {
        console.log(JSON.stringify(selectedRows));
        if ($scope.selectedRows.length != 1)
            return;
        auxo.meta.zmodel.runOneModel($scope.selectedRows[0], scheduleType);
    };


});

App.controller('EditDqModelController', function EditDqModelController($scope, $window, $http, $stateParams, $location, ngDialog, Restangular, sgDialogService, Auth, uuid2) {
    $scope.role = Auth.user.role.title;
    console.log($scope.role);

    var id = $stateParams.id;
    $scope.onSelectFlowChanged=function(selectedRow){   // selection of flows
        if (selectedRow) {
            $scope.entity.preProcessFlowId = selectedRow["id"]
            $scope.entity.preProcessFlowName =  selectedRow["name"]
        }
    }
    $scope.onEntityChanged = function(entity) {
        if (!entity.preProcessFlowId)
            entity.preProcessFlowName = null;
    }

    var entities = {
        "model": {
            processDataType: "Dataset",
            description: "",
            expiredPeriod : 0
        }
    }

    auxo.meta.zmodel.onNew = function(entity) {
        $scope.entity = auxo.clone(entities.model);
        $scope.entity.id = uuid2.newguid();
        $scope.previewLoading = false;
    }

    auxo.meta.zmodel.onSave = function(entity) {
        if (!entity.preProcessFlowId)
            entity.preProcessFlowName = null;
    }

    EditBaseController.call(this, auxo.meta.zmodel, $scope, $window, $http, $stateParams, $location, ngDialog, Restangular);

    $scope.saveOld = function($scope, meta) {
        $scope.saving = true;
        meta.onSave && meta.onSave($scope.entity);
        if ($scope.isNew) {
            Restangular.all(meta.restRootPath).post($scope.entity).then(
                function(){
                    $scope.saving = false;
                    auxo.delHotkey($scope)
                    auxo.loadPage(meta.currUrl, {});
                },
                function(es) {
                    $scope.saving = false;
                    $scope.error = es.data;
                });
        }else {
            $scope.entity.put().then(
                function(){
                    $scope.saving = false;
                    auxo.delHotkey($scope)
                    auxo.loadPage(meta.currUrl);
                },
                function(es) {
                    $scope.saving = false;
                    $scope.error = es.data;
                });
        }
    }

    $scope.save = function(editRules) {
        if (editRules) {
            auxo.meta.zmodel.currUrl = "/qualityAnalysis/zmodrules/" + $scope.entity.id;
        } else
            auxo.meta.zmodel.currUrl = "/qualityAnalysis/zmod";
        if ($scope.isNew || $scope.entityForm.$dirty)
            $scope.saveOld($scope, auxo.meta.zmodel);
        else if (editRules)
            auxo.loadPage("/qualityAnalysis/zmodrules/" + $scope.entity.id);
    }

    $scope.disableEdit = !$scope.isNew; // !isNew

    $scope.switchLock= function() {
        $scope.disableEdit = !$scope.disableEdit;
    }

});
