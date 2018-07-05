App.controller('SharedInterfaceDetailController', function SharedInterfaceDetailController($scope, $window, $http, $location, ngDialog, Restangular,$stateParams, sgDialogService, Auth,modalInstance ,WizardHandler)
{
    var reloadPage = $scope.reloadPage;
    // 被选中的数据源的字段集合
    $scope.mappingInSelect = [];

// 判断是不是新的
    var isNew = !($stateParams.id||$scope.id)?true:false;

// 声明变量
    $scope.data= {
        id:"",
        name:"",
        description:"",
        resourceId:"",
        sourceDatasetId:"",
        targetDatasetId:"",
        selectedFields:[],
        queryFields:[],
        encryptFields:[],
    }

// mapping需要的字段名称
    $scope.headers = ["输入字段","索引字段","结果字段","脱敏"];

    if(!isNew){
        Restangular.one("europa/open/endpoint/",$scope.id).get().then(function (e) {
            angular.copy(e,$scope.data);
// 获取数据来源
            Restangular.one("/europa/resource",$scope.data.sourceDatasetId).get().then(function (e) {
                $scope.onSelectChangedIn(e)
            })
// 获取目标来源
            Restangular.one("/europa/resource",$scope.data.targetDatasetId).get().then(function (e) {
                $scope.onSelectChangedOut(e)
            })
        })
    }

// 选择数据来源指令之后调用的方法
    $scope.onSelectChangedIn = function (node) {
        var node = node.selectedRow?node.selectedRow:node
        $scope.data.sourceDatasetId = node.id;
        $scope.sourceDatasetName = node.name;
        // 数据来源字段及类型
        $scope.mappingIn = [];
        // 第三页的table的truefalse的映射
        $scope.mappings = [];
        Restangular.one("schemas", node.attributes.schema.id).get().then(function (e) {
            if(e){
                angular.forEach(e.fields,function(field){
                    $scope.mappingIn.push({name:field.name,type:field.type})
                },function(errResponse) {
                    auxo.openErrorDialog($scope, ngDialog, errResponse);
                })
            }else auxo.sgDialogService.alert("获取接口数据字段失败，重新选择数据", "错误");
            console.log('mappingIn\n: ' + angular.toJson($scope.mappingIn))

            if(isNew){
                for(var i = 0; i<$scope.mappingIn.length; i++){
                    $scope.mappings.push({"id": i, "filed" : $scope.mappingIn[i],"selectedFields" : false,"queryFields" : false,"encryptFields" : false})
                }
            }else{
                for(var i = 0; i<$scope.mappingIn.length; i++){
                    $scope.mappings.push({"id": i, "filed" : $scope.mappingIn[i],"selectedFields" : false,"queryFields" : false,"encryptFields" : false})
                    if($scope.mappings[i].selectedFields)
                        $scope.data.selectedFields.push($scope.mappings[i].filed.name)
                    if($scope.mappings[i].queryFields)
                        $scope.data.queryFields.push($scope.mappings[i].filed.name)
                    if($scope.mappings[i].encryptFields)
                        $scope.data.encryptFields.push($scope.mappings[i].filed.name)
                }
                for(var i = 0; i<$scope.mappingIn.length; i++){

                    if($scope.data.selectedFields.indexOf($scope.mappings[i].filed.name) != -1){
                        updateSelected('add', "selectedFields", $scope.mappings[i]);
                    }
                    if($scope.data.queryFields.indexOf($scope.mappings[i].filed.name) != -1){
                        updateSelected('add', "queryFields", $scope.mappings[i]);
                    }
                    if($scope.data.encryptFields.indexOf($scope.mappings[i].filed.name) != -1){
                        updateSelected('add', "encryptFields", $scope.mappings[i]);
                    }
                }
                }
        },function(errResponse) {
            auxo.openErrorDialog($scope, ngDialog, errResponse);
        })
        //获取数据集的各个参数以便于展示
        Restangular.one("datasets", node.attributes.dataset.id).get().then(function (results) {
            $scope.dataSourceView = [];
            $scope.dataSourceView.length = 0;
            for(var key in results){
                // if(key == "name" || key == "schemaName" || key == "storage" || key == "sliceType" || key == "parameters" || key == "table" || key == "driver" || key == "url" || key == "sql" || key == "regex" || key == "protocol" || key == "bind" || key == "port" || key == "partitionColumns" )
                if(key == "name" || key == "schemaName" || key == "storage" )
                    $scope.dataSourceView.push({name:key,value:results[key]})
                else if(key == "storageConfigurations"){
                    var obj= [];
                    obj = results.storageConfigurations;
                    for(var key in obj){
                        if(key != 'relativePath')
                            $scope.dataSourceView.push({name:key,value:obj[key]})
                    }
                }
            }
        })


    }

// // 选择数据目标指令之后调用的方法
    $scope.onSelectChangedOut = function (node) {
        var node = node.selectedRow?node.selectedRow:node
        $scope.data.targetDatasetId = node.id;
        $scope.targetDatasetName = node.name;

        $scope.mappingOut = [];
        Restangular.one("schemas", node.attributes.schema.id).get().then(function (e) {
            if(e){
                angular.forEach(e.fields,function(field){
                    $scope.mappingOut.push({name:field.name,type:field.type})
                },function(errResponse) {
                    auxo.openErrorDialog($scope, ngDialog, errResponse);
                })
            }else auxo.sgDialogService.alert("获取接口数据字段失败，重新选择数据", "错误");

            console.log('mappingOut\n: ' + angular.toJson($scope.mappingOut))
        },function(errResponse) {
            auxo.openErrorDialog($scope, ngDialog, errResponse);
        })
        //获取数据集的各个参数以便于展示
        Restangular.one("datasets", node.attributes.dataset.id).get().then(function (results) {
            $scope.dataStoreView = [];
            $scope.dataStoreView.length = 0;
            for(var key in results){
                // if(key == "name" || key == "schemaName" || key == "storage" || key == "sliceType" || key == "parameters" || key == "table" || key == "driver" || key == "url" || key == "sql" || key == "regex" || key == "protocol" || key == "bind" || key == "port" || key == "partitionColumns" )
                if(key == "name" || key == "schemaName" || key == "storage")
                    $scope.dataStoreView.push({name:key,value:results[key]})
                else if(key == "storageConfigurations"){
                    var obj= [];
                    obj = results.storageConfigurations;
                    for(var key in obj){
                        if(key != 'relativePath')
                            $scope.dataStoreView.push({name:key,value:obj[key]})
                    }
                }
            }
        })
    }

  // 对mapping的表格进行获取值
    var updateSelected = function (action, header, value) {
        var index = value.id;
        if (action == 'add' ) {
            $scope.mappings[index][header] = true;
        }
        if (action == 'remove' ) {
            $scope.mappings[index][header] = false;
        }
    }

    $scope.updateSelection = function ($event, header, value) {
        var checkbox = $event.target;
        var action = (checkbox.checked ? 'add' : 'remove');
        updateSelected(action, header, value);
    };

    // 判断一个map数组中是否含有一个object元素
    var hasObjectElement = function(arr,object){
        var flage = false;
        for(var i in arr){
            if(arr[i].name == object.name && arr[i].type ==object.type){
                flage = true
                break;
            }
        }
        return !flage ? false: true;
    }

    // 对三个数组进行字段判断
    var hasFieldandType = function (allField,selectedFields,queryFields,encryptFields) {
        var hasField = true;
        for(var i = 0;i< selectedFields.length;i++){
            if(!hasObjectElement(allField,selectedFields[i])){
                hasField =false;
                break;
            }
        }
        for(var i = 0;i< queryFields.length;i++){
            if(!hasObjectElement(allField,queryFields[i])){
                hasField =false;
                break;
            }
        }
        for(var i = 0;i< encryptFields.length;i++){
            if(!hasObjectElement(allField,encryptFields[i])){
                hasField =false;
                break;
            }
        }
     return !hasField ? true: false;
    }
// 下一步验证调用方法
    $scope.exitValidation = function(){
        // 获取当前步数
        var stepNumber = WizardHandler.wizard().currentStepNumber();

        if(stepNumber == 3){
            $scope.data.selectedFields = [];
            $scope.data.queryFields = [];
            $scope.data.encryptFields = [];
            $scope.selectedFields = [];
            $scope.queryFields = [];
            $scope.encryptFields = [];
            $scope.mappingInSelect = [];
            for(var i = 0 ;i<$scope.mappings.length; i++){
                if($scope.mappings[i].selectedFields){
                    $scope.data.selectedFields.push($scope.mappings[i].filed.name)
                    var tmp = {name:$scope.mappings[i].filed.name,type:$scope.mappings[i].filed.type}
                    $scope.selectedFields.push(tmp)
                    if(!hasObjectElement($scope.mappingInSelect,tmp)){
                        $scope.mappingInSelect.push(tmp)
                    }
                }

                if($scope.mappings[i].queryFields){
                    $scope.data.queryFields.push($scope.mappings[i].filed.name)
                    var tmp = {name:$scope.mappings[i].filed.name,type:$scope.mappings[i].filed.type}
                    $scope.queryFields.push(tmp)
                    if(!hasObjectElement($scope.mappingInSelect,tmp)){
                        $scope.mappingInSelect.push(tmp)
                    }
                }
                if($scope.mappings[i].encryptFields){
                    $scope.data.encryptFields.push($scope.mappings[i].filed.name)
                    var tmp = {name:$scope.mappings[i].filed.name,type:$scope.mappings[i].filed.type}
                    $scope.encryptFields.push(tmp)
                    if(!hasObjectElement($scope.mappingInSelect,tmp)){
                        $scope.mappingInSelect.push(tmp)
                    }
                }

            }
        }
// 判断为空字段
        if(!$scope.data.name && stepNumber == 1){
            auxo.sgDialogService.alert("名称不能为空","提示");
            return false;
        }else if(!$scope.data.sourceDatasetId && stepNumber == 2){
            auxo.sgDialogService.alert("数据来源不能为空","提示");
            return false;
        }else if($scope.data.selectedFields.length==0 && stepNumber == 3){
            auxo.sgDialogService.alert("至少选中一条结果字段","提示");
            return false;
        }else if($scope.data.queryFields.length==0 && stepNumber == 3){
            auxo.sgDialogService.alert("至少选中一条查询字段","提示");
            return false;
        }else if(!$scope.data.targetDatasetId && stepNumber == 4){
            auxo.sgDialogService.alert("数据目标名称不能为空","提示");
            return false;
        }else if(stepNumber == 4 && hasFieldandType($scope.mappingOut,$scope.selectedFields,$scope.queryFields,$scope.encryptFields)){
            auxo.sgDialogService.alert("数据来源与数据目标字段或者类型不一致，请重新选择","提示");
            return false;
        }else return true;

    };

// 弹出框关闭
    $scope.cancel = function () {
        modalInstance.dismiss();
        auxo.delHotkey($scope)
    };

// 取消按钮
    $scope.cancelledWizard = function () {
        $scope.cancel();
    }

// 完成方法
    $scope.finishedWizard = function () {
        Restangular.all("europa/open/endpoint/save").post( $scope.data).then(
            function(resp){
                reloadPage.call();
                auxo.delHotkey($scope)
                modalInstance.closeModal( $scope.data);
            },
            function(es) {
                auxo.sgDialogService.alert(es.err,"错误")
            });
    }

});
