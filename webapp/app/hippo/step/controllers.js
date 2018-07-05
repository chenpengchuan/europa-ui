App.controller('DataSourceListController', function StepPopupController($scope, Restangular, modalInstance) {

    $scope.title = "查询";
    $scope.forCallback = "Return to caller";
    $scope.selections = [];
    $scope.selectedRows = [];

    $scope.multiple = false;
    $scope.keyword = 'name';

//    if($scope.inputData.multiple)
//        $scope.multiple = true;

//    if($scope.inputData.keyword && $scope.inputData.keyword.length>0)
//        $scope.keyword = $scope.inputData.keyword;
//
//    if($scope.inputData.values) {
//        var array = $scope.inputData.values.split(/,|;|:/)
//        for(var i in array) {
//            $scope.selections.push({text: $.trim(array[i])});
//        }
//    }

    $scope.$watchCollection('selectedRows', function () {
        console.log("$scope.selectedRows: " + JSON.stringify($scope.selectedRows))
        if($scope.selectedRows.length > 0) {
            var existed = false
            for(var i in $scope.selections) {
                if($scope.selections[i] && $scope.selections[i].text == $scope.selectedRows[0][ $scope.keyword]){
                    existed = true;
                    break;
                }
            }
            if(!existed)
                $scope.selections.push({text: $scope.selectedRows[0][ $scope.keyword]})
        }
    });

    $scope.loadTags = function () {
        return [];
    }

    $scope.ok = function () {
        if(isOkDisabled())
            return;
        if($scope.multiple) {
            $scope.forCallback = [];
            for(var i in $scope.selections) {
                if($scope.selections[i])
                    $scope.forCallback.push($scope.selections[i].text)
            }
        } else
            $scope.forCallback = $scope.selectedRows[0][$scope.keyword];
        auxo.delHotkey($scope);
        modalInstance.closeModal({value:$scope.forCallback,id:$scope.selectedRows[0].id,selectedRow:$scope.selectedRows[0]});
    }

    $scope.cancel = function () {
        auxo.delHotkey($scope)
        modalInstance.closeModal()
    }

    function isOkDisabled() {
        if($scope.multiple){
            if($scope.selections && $scope.selections.length > 0)
                return false;
        }
        if($scope.selectedRows && $scope.selectedRows.length > 0)
            return false;
        return true;
    }

    $scope.modalButtons =[
        {
            action:$scope.ok,
            text:"确定",class:"btn-primary",
            disabled: isOkDisabled
        },
        {
            action: $scope.cancel,
            text:"取消",class:"btn-warning"
        }
    ];
    $scope.closeModal = $scope.cancel

    $scope.openAlert = function(text){
        sgDialogService.alert(text);
    }

    var meta = {
        restRootPath:"europa/data/datasource",
       // restRootPath:"schemas",
        entityDisplayName:"tables",
        getBaseFilter: function() {
            return "";
        },
        rowHeaders : [
            {name : "id", disName : "id", converter : auxo.same, visible: false},
            {name : "name", disName : "表名", converter : auxo.same, visible: true},
            {name : "owner", disName : "用户", converter : auxo.same, visible: true},
            {name : "path", disName : "目录", converter : auxo.same, visible: true},
            {name : "createTime", disName : "创建时间", converter : auxo.date2str, visible: false},
            {name : "lastModifiedTime", disName : "修改时间", converter : auxo.date2str, visible: true}
        ]
    };

    // inputData.route enum: schemas, flows
//    if($scope.inputData.route)
//        meta.restRootPath = $scope.inputData.route;
//    if($scope.inputData.filter) {
//        meta.getBaseFilter = function () {
//            return $scope.inputData.filter;
//        }
//    }

//    if($scope.inputData.title)
//        $scope.title =   $scope.title + $scope.inputData.title;

    StepBaseController.call(this, meta, $scope, Restangular)

    $scope.isSchema = function () {
        return meta.restRootPath === "schemas";
    }
    $scope.isDataset = function () {
        return meta.restRootPath === "datasets";
    }
    $scope.isFlow = function () {
        return meta.restRootPath === "flows";
    }
    $scope.isProcessConfig = function () {
        return meta.restRootPath === "processconfigs";
    }
    $scope.isModel = function () {
            return true;
    }

    auxo.bindEscEnterHotkey($scope)
});

App.controller('TableController', function StepPopupController($scope, Restangular, modalInstance) {

    $scope.title = "查询";
    $scope.forCallback = "Return to caller";
    $scope.selections = [];
    $scope.selectedRows = [];

    $scope.multiple = false;
    $scope.keyword = 'name';

//    if($scope.inputData.multiple)
//        $scope.multiple = true;

//    if($scope.inputData.keyword && $scope.inputData.keyword.length>0)
//        $scope.keyword = $scope.inputData.keyword;
//
//    if($scope.inputData.values) {
//        var array = $scope.inputData.values.split(/,|;|:/)
//        for(var i in array) {
//            $scope.selections.push({text: $.trim(array[i])});
//        }
//    }

    $scope.$watchCollection('selectedRows', function () {
        console.log("$scope.selectedRows: " + JSON.stringify($scope.selectedRows))
        if($scope.selectedRows.length > 0) {
            var existed = false
            for(var i in $scope.selections) {
                if($scope.selections[i] && $scope.selections[i].text == $scope.selectedRows[0][ $scope.keyword]){
                    existed = true;
                    break;
                }
            }
            if(!existed)
                $scope.selections.push({text: $scope.selectedRows[0][ $scope.keyword]})
        }
    });

    $scope.loadTags = function () {
        return [];
    }

    $scope.ok = function () {
        if(isOkDisabled())
            return;
        if($scope.multiple) {
            $scope.forCallback = [];
            for(var i in $scope.selections) {
                if($scope.selections[i])
                    $scope.forCallback.push($scope.selections[i].text)
            }
        } else
            $scope.forCallback = $scope.selectedRows[0][$scope.keyword];
        auxo.delHotkey($scope);
        modalInstance.closeModal({value:$scope.forCallback,id:$scope.selectedRows[0].id,selectedRow:$scope.selectedRows[0]});
    }

    $scope.cancel = function () {
        auxo.delHotkey($scope)
        modalInstance.closeModal()
    }

    function isOkDisabled() {
        if($scope.multiple){
            if($scope.selections && $scope.selections.length > 0)
                return false;
        }
        if($scope.selectedRows && $scope.selectedRows.length > 0)
            return false;
        return true;
    }

    $scope.modalButtons =[
        {
            action:$scope.ok,
            text:"确定",class:"btn-primary",
            disabled: isOkDisabled
        },
        {
            action: $scope.cancel,
            text:"取消",class:"btn-warning"
        }
    ];
    $scope.closeModal = $scope.cancel

    $scope.openAlert = function(text){
        sgDialogService.alert(text);
    }

    var meta = {
        restRootPath:"europa/datamap/tables",
       // restRootPath:"schemas",
        entityDisplayName:"tables",
        getBaseFilter: function() {
            return "";
        },
        rowHeaders : [
            {name : "id", disName : "id", converter : auxo.same, visible: false},
            {name : "object", disName : "源表名", converter : auxo.same, visible: false},
            {name : "name", disName : "任务名", converter : auxo.same, visible: true},
            {name : "dataStore", disName : "目标表", converter : auxo.same, visible: true},
            {name : "lastModifiedTime", disName : "修改时间", converter : auxo.date2str, visible: true}
        ]
    };

    // inputData.route enum: schemas, flows
//    if($scope.inputData.route)
//        meta.restRootPath = $scope.inputData.route;
//    if($scope.inputData.filter) {
//        meta.getBaseFilter = function () {
//            return $scope.inputData.filter;
//        }
//    }

//    if($scope.inputData.title)
//        $scope.title =   $scope.title + $scope.inputData.title;

    StepBaseController.call(this, meta, $scope, Restangular)

    $scope.isSchema = function () {
        return meta.restRootPath === "schemas";
    }
    $scope.isDataset = function () {
        return meta.restRootPath === "datasets";
    }
    $scope.isFlow = function () {
        return meta.restRootPath === "flows";
    }
    $scope.isProcessConfig = function () {
        return meta.restRootPath === "processconfigs";
    }
    $scope.isModel = function () {
            return true;
    }

    auxo.bindEscEnterHotkey($scope)
});

App.controller('DatasetsList', function StepPopupController($scope, Restangular, modalInstance) {

    $scope.title = "查询";
    $scope.forCallback = "Return to caller";
    $scope.selections = [];
    $scope.selectedRows = [];

    $scope.multiple = false;
    $scope.keyword = 'name';

//    if($scope.inputData.multiple)
//        $scope.multiple = true;

//    if($scope.inputData.keyword && $scope.inputData.keyword.length>0)
//        $scope.keyword = $scope.inputData.keyword;
//
//    if($scope.inputData.values) {
//        var array = $scope.inputData.values.split(/,|;|:/)
//        for(var i in array) {
//            $scope.selections.push({text: $.trim(array[i])});
//        }
//    }

    $scope.$watchCollection('selectedRows', function () {
        console.log("$scope.selectedRows: " + JSON.stringify($scope.selectedRows))
        if($scope.selectedRows.length > 0) {
            var existed = false
            for(var i in $scope.selections) {
                if($scope.selections[i] && $scope.selections[i].text == $scope.selectedRows[0][ $scope.keyword]){
                    existed = true;
                    break;
                }
            }
            if(!existed)
                $scope.selections.push({text: $scope.selectedRows[0][ $scope.keyword]})
        }
    });

    $scope.loadTags = function () {
        return [];
    }

    $scope.ok = function () {
        if(isOkDisabled())
            return;
        if($scope.multiple) {
            $scope.forCallback = [];
            for(var i in $scope.selections) {
                if($scope.selections[i])
                    $scope.forCallback.push($scope.selections[i].text)
            }
        } else
            $scope.forCallback = $scope.selectedRows[0][$scope.keyword];
        auxo.delHotkey($scope);
        modalInstance.closeModal({value:$scope.forCallback,id:$scope.selectedRows[0].id,selectedRow:$scope.selectedRows[0]});
    }

    $scope.cancel = function () {
        auxo.delHotkey($scope)
        modalInstance.closeModal()
    }

    function isOkDisabled() {
        if($scope.multiple){
            if($scope.selections && $scope.selections.length > 0)
                return false;
        }
        if($scope.selectedRows && $scope.selectedRows.length > 0)
            return false;
        return true;
    }

    $scope.modalButtons =[
        {
            action:$scope.ok,
            text:"确定",class:"btn-primary",
            disabled: isOkDisabled
        },
        {
            action: $scope.cancel,
            text:"取消",class:"btn-warning"
        }
    ];
    $scope.closeModal = $scope.cancel

    $scope.openAlert = function(text){
        sgDialogService.alert(text);
    }

    var meta = {
        restRootPath:"/europa/kinship/datasets",
       // restRootPath:"schemas",
        entityDisplayName:"Dataset",
        getBaseFilter: function() {
            return "";
        },
        rowHeaders : [
            {name : "id", disName : "id", converter : auxo.same, visible: false},
            {name : "name", disName : "Dataset名称", converter : auxo.same, visible: true},
            {name : "createTime", disName : "创建时间", converter : auxo.date2str, visible: false},
            {name : "lastModifiedTime", disName : "修改时间", converter : auxo.date2str, visible: true}
        ]
    };

    // inputData.route enum: schemas, flows
//    if($scope.inputData.route)
//        meta.restRootPath = $scope.inputData.route;
//    if($scope.inputData.filter) {
//        meta.getBaseFilter = function () {
//            return $scope.inputData.filter;
//        }
//    }

//    if($scope.inputData.title)
//        $scope.title =   $scope.title + $scope.inputData.title;

    StepBaseController.call(this, meta, $scope, Restangular)

    $scope.isSchema = function () {
        return meta.restRootPath === "schemas";
    }
    $scope.isDataset = function () {
        return meta.restRootPath === "/europa/kinship/datasets";
    }
    $scope.isFlow = function () {
        return meta.restRootPath === "flows";
        return meta.restRootPath === "processconfigs";
    }
    $scope.isProcessConfig = function () {
    }
//    $scope.isModel = function () {
//            return true;
//    }

    auxo.bindEscEnterHotkey($scope)
});