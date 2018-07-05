App.controller('ExportController', function ($scope, modalInstance, $http) {

    var selectedRows = $scope.selectedRows;
    var totalRows = $scope.totalRows;

    function isSelectedRowsValid() {
        return selectedRows&&selectedRows.length>0;
    }

    var validChecker = {
        isSelectedRowsValid:function () {
            return selectedRows&&selectedRows.length>0;
        },
        isSelectedRowsActive:function () {
            return validChecker.isSelectedRowsValid();
        },
        isCurrentQueryValid:function () {
            return totalRows&&totalRows>0;
        },
        isCurrentQueryActive:function () {
            return !validChecker.isSelectedRowsValid()&&validChecker.isCurrentQueryValid();
        },
        isAllActive: function () {
            return !validChecker.isCurrentQueryActive() && validChecker.isSelectedRowsActive();
        }
    }
    var exportOptions = $scope.exportOptions = {

        "scopeName": "范围选择",
        "scopeOption": "",
        'selections': [
            {name: '已选行',value:"selections", active: validChecker.isSelectedRowsActive(), valid: validChecker.isSelectedRowsValid()},
            {name:'当前查询条件下所有行', value:"query", active: validChecker.isCurrentQueryActive(), valid: validChecker.isCurrentQueryValid()},
            {name:'所有行',value:"all", active: validChecker.isAllActive(), valid: true}],
        'depenedency': {name: "级联导出", value: false}
    }

    auxo.array.forEach(exportOptions.selections, function (e,i) {
        if(e.active)
            exportOptions.scopeOption = e.value;
    })

    $scope.onSelectionsChange = function(index) {
        auxo.array.forEach(exportOptions.selections, function (e,i) {
            e.active = false;
            if(i === index) {
                e.active = true;
                exportOptions.scopeOption = e.value;
            }
        })
    }
    
    $scope.ok = function () {

        //currPage&limit&sorts&queryWord&reverse&tagSelection&startDate&endDate";

        function download() {
            var searchParams = $scope.$parent.searchParams;

            var sp = {offset: 0, limit: 0x7fffffff};

            switch (exportOptions.scopeOption) {
                case "selections":
                    var array = []
                    auxo.array.forEach(selectedRows, function (e) {
                        array.push("id=" + e.id)
                    })
                    sp.query = array.join("|")
                    break;
                case "query":
                    sp.sorts = searchParams.sorts;
                    sp.query = searchParams.queryWord;
                    sp.tags = searchParams.tagSelection;
                    sp.startDate = searchParams.startDate;
                    sp.endDate = searchParams.endDate;
                    sp.filter = searchParams.filter;
                    if(!sp.filter)
                        sp.filter = "";

                    if(searchParams.other) {
                        var args = auxo.parseOtherParameter(searchParams.other);
                        if(args.flowTypeFilter) {
                            if(sp.filter)
                                sp.filter += "&";
                            else
                                sp.filter = "";
                            sp.filter += "flowType=" + args.flowTypeFilter;
                        }
                    }
                    if(sp.tags) {
                        if(sp.filter)
                            sp.filter += "&";
                        sp.filter += sp.tags.replace(";","|");
                    }
                    break;
                default :
                    sp.filter = "flowType=dataflow|workflow|streamflow";
                    break;
            }
            if(!sp.query)
                sp.query = "";
            if(!sp.filter)
                sp.filter = "";

            if(exportOptions.depenedency.value)
                sp.withDependencies  = true;
            else
                sp.withDependencies  = false;


            sp['X-AUTH-TOKEN'] = auxo.$rootScope.token;
            var url = '/api/flows/export?'+ $.param(sp);
            console.log("downlaod url:" + url)
            auxo.download(url);
        }

        download();

        auxo.delHotkey($scope)
        modalInstance.closeModal(false)
    }

    // cancel click
    $scope.cancel = function () {
        auxo.delHotkey($scope)
        modalInstance.closeModal(false)
    }

    $scope.closeModal = function () {
        $scope.cancel();
    }

    $scope.title = '导出选项';
    $scope.modalButtons = [
        {
            action: $scope.ok,
            text: "确定", class: "btn-primary"
        },
        {
            action: $scope.cancel,
            text: "取消", class: "btn-warning"
        }
    ];
    auxo.bindEscEnterHotkey($scope)
});



App.controller('ImportController', ['$scope', 'Upload', '$timeout', 'modalInstance', function ($scope, Upload, $timeout, modalInstance) {

    var selectedNode = $scope.selectedNode;
    var path = $scope.path;

    function init() {
        $scope.flow = [];
        $scope.dataset = [];
        $scope.schema = [];
        $scope.tag = [];
        $scope.browserEnabled = true;
        $scope.okEnabled = false;
        $scope.f = {};
    }
    init();

    $scope.importOptions = {
        mode: {
            label:"覆盖(如果已经存在, 默认为跳过)",
            overWrite: false
        }
    }

    $scope.uploadFiles = function(file, errFiles) {
        $scope.f = file;
        $scope.errFile = errFiles && errFiles[0];
        if (file) {
            file.upload = Upload.upload({
                url: '/api/europa/mis/upload',
                data: {file: file}
            });
            file.upload.then(function (response) {
                $timeout(function () {
                    file.result = response.data;
                    $scope.flow = response.data.cfd;
                    $scope.dataset = response.data.cds;
                    $scope.schema = response.data.csm;
                    $scope.tag = response.data.tag;
                    $scope.uploadDir = response.data.uploadDir;
                    $scope.okEnabled = true;

                    /* only for test
                    for(var i=0;i<400;i++) {
                        $scope.flow.push(auxo.clone($scope.flow[0]))
                        $scope.dataset.push(auxo.clone($scope.dataset[0]))
                    }
                    */

                });
            }, function (response) {
                if (response.status > 0)
                    $scope.errorMsg = response.status + ': ' + response.data;
            }, function (evt) {
                file.progress = Math.min(100, parseInt(100.0 *
                    evt.loaded / evt.total));
            });
        }
    }

    $scope.ok = function () {
        $scope.okEnabled = false;
        var flows = [];
        auxo.array.forEach($scope.flow, function (e) {
            if(e.valid !== false)
                flows.push(e.path);
        })
        var datasets = [];
        auxo.array.forEach($scope.dataset, function (e) {
            if(e.valid !== false)
                datasets.push(e.path);
        })
        var schemas = [];
        auxo.array.forEach($scope.schema, function (e) {
            if(e.valid !== false)
                schemas.push(e.path);
        })
        var tags = [];
        auxo.array.forEach($scope.tag, function (e) {
            if(e.valid !== false)
                tags.push(e.path);
        })
        auxo.Restangular.all("europa/mis/import").post({cfd:flows, cds:datasets, csm: schemas,tag: tags, processDirId: selectedNode.id,
            uploadDirectory: $scope.uploadDir, overWrite: $scope.importOptions.mode.overWrite }).then (function (data) {

            //init();
            $scope.cancel(
                function (data) {
                    auxo.sgDialogService.alert("导入成功. " + (data?JSON.stringify(data):""), "提示");
                },
                data
            );
        }, function (error) {
            auxo.sgDialogService.alert("导入错误. " + JSON.stringify(error), "提示");
        })
    }

    // cancel click
    $scope.cancel = function (callback, data) {
        auxo.delHotkey($scope)
        modalInstance.closeModal(false);
        if(callback)
            callback(data);
    }

    $scope.closeModal = function () {
        $scope.cancel();
    }

    $scope.title = '导入选项';
    $scope.modalButtons = [
        {
            action: $scope.ok,
            text: "确定", class: "btn-primary",
            disabled: function() {return !$scope.okEnabled}
        },
        {
            action: $scope.cancel,
            text: "取消", class: "btn-warning"
        }
    ];
    auxo.bindEscEnterHotkey($scope)
}]);