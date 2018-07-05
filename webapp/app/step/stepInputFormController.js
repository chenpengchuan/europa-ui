App.controller("StepInputFormController", function($scope, Restangular, sgDialogService) {

    var tab = $scope.tab;
    var dataflow = $scope.$parent.dataflow

    var node = $scope.editingNode;
    if(node.inputConfigurations!=null && tab.category === "Input"){
        var currentNodeStyle=node.inputConfigurations[$scope.$index].$outputOption;
    }

    var isInput = $scope.isInput = tab.category === 'Input'


    $scope.allSelected = false;
    $scope.leftList =  {label: "备选字段", items: [], dragging: false, "allowedTypes": [""],};
    $scope.rightList =  {label: "已选字段", items: [], dragging: false};
    $scope.dragDisabled = false;

    $scope.refreshInputData = function (tab) {
        var buildInputData = function (step) {
            if(currentNodeStyle){
                for(var i=0;i<step.outputConfigurations.length;i++){
                    if(currentNodeStyle===step.outputConfigurations[i].id){
                        var fields = step.outputConfigurations[i].fields
                    }
                }
            } else{
                var fields = step.outputConfigurations[0].fields
            }
            if(!fields)
                fields = [];


            var array = [];
            for(var i=0;i<fields.length;i++) {
                if(fields[i].column || fields[i].alias)
                    array.push({column: fields[i].alias && fields[i].alias.length>0? fields[i].alias: fields[i].column, selected: $scope.allSelected, type: "source"});
            }

            $scope.leftList.items = array
            // tab.content[0].data.$inputFields = array;
            syncFieldValidation();
        }

        var source = tab.content[0].data.$source;
        for(var i=0; i<dataflow.steps.length;i++) {
            var step = dataflow.steps[i]
            if(step.id == source) {
                buildInputData(step);
            }
        }
    }

    $scope.refreshOutputData = function (tab, showError) {
        var data = $scope.$parent.data
        var newData = {
            type: node.type,
            name: node.name,
            inputConfigurations: auxo.clone(data.inputConfigurations),
            outputConfigurations:  auxo.clone(data.outputConfigurations),
            otherConfigurations: auxo.clone(data.otherConfigurations)
        }

        auxo.treeWalk(newData, function (key, value, path, parent) {
            if(key && key.length>1 &&  key[0]=='$' && parent)
                delete parent[key]
        })


        if(data.type == 'merge'){
            //debugger
            var inputConfigurations = newData.inputConfigurations;
            var inputs = [];
            var columns = [];
            //debugger
            if(tab.title == 'leftOut'){
                for(var i = 0; i < inputConfigurations.length; i++){
                    var conf = inputConfigurations[i];
                    if(conf['id'] == 'left'){
                        inputs = conf['fields'];
                    }
                }
                var selectsOnRight = newData.otherConfigurations['selectsOnRight'];
                for(var i = 0; i < selectsOnRight.length; i ++){
                    var obj = selectsOnRight[i]
                    if(obj['alias']){
                        obj['column'] = obj['alias']
                    }
                    inputs.push(obj)
                }
            }
            else if(tab.title == 'rightOut'){
                for(var i = 0; i < inputConfigurations.length; i++){
                    var conf = inputConfigurations[i];
                    if(conf['id'] == 'right'){
                        inputs = conf['fields'];
                    }
                }
                var selectsOnLeft = newData.otherConfigurations['selectsOnLeft'];
                for(var i = 0; i < selectsOnLeft.length; i ++){
                    var obj = selectsOnLeft[i]
                    if(obj['alias']){
                        obj['column'] = obj['alias']
                    }
                    inputs.push(obj)
                }
            }

            for(var i = 0; i < inputs.length; i++){
                columns.push(inputs[i]);
            }

            //debugger
            $scope.leftList.items = columns;
            //auxo.forEachArray($scope.leftList.items, function (e, i) {
            //    $scope.rightList.items.push({column: e.column, alias: e.alias, valid: true})
            //})
            //var left_columns = [];
            //var right_columns = [];
            //
            //for(var i = 0; i < right_inputs.length; i++){
            //    right_columns.push(right_inputs[i]);
            //}
            //debugger
            //console.log('left_columns = ' + left_columns)
            //console.log('right_columns = ' + right_columns)
            //$scope.leftList.items = left_columns;
            //$scope.rightList.items = right_columns;
            syncData();
            //syncFieldValidation();
            return;
        }
        //newData = auxo.replaceAttribute(newData, "dataset", "dataset")
        //newData = auxo.replaceAttribute(newData, "schema", "schema")
        //debugger;
        //var columns = [];
        //columns.push({
        //    column: '111',
        //    alias: '111',
        //    selected: true
        //})
        //$scope.leftList.items = columns
        Restangular.all("steps/output/fields/" + dataflow.flowType).customPOST(newData,tab.title=="error"?"?branch=error":"")
            .then(function (facetResult) {
                var cols =  facetResult;
                var columns = [];
                for(var i=0;i<cols.length;i++) {
                    if(cols[i] !== '' && (cols[i].name || cols[i].alias)) {
                        columns.push({column: cols[i].name, alias: cols[i].alias, selected: $scope.allSelected})
                    }
                }
                // validate's error output need append detailcolumn
                //if(auxo.isStepType(newData.type,'validate') && tab.title === 'error' && columns.length>0 && newData.otherConfigurations.detailColumn) {
                //    columns.push({column: newData.otherConfigurations.detailColumn, alias: '', selected: $scope.allSelected})
                //}

                $scope.leftList.items = columns
                if($scope.rightList.items.length === 0 && $scope.leftList.items.length > 0) {
                    auxo.forEachArray($scope.leftList.items, function (e, i) {
                        $scope.rightList.items.push({column: e.column, alias: e.alias, valid: true})
                    })
                    syncData();
                }
                syncFieldValidation();
            },function (facetResult) {
                if(showError)
                    sgDialogService.alert(JSON.stringify(facetResult.data.err, null, " "), "错误")
                syncFieldValidation();
            })
    }

    function buildRightList () {
        var fields = tab.content[0].data.fields;
        auxo.forEachArray(fields, function (e, i) {
            $scope.rightList.items.push({column: e.column, alias: e.alias, valid: true})
        })
    }

    $scope.refreshData = function (showError) {
        if(isInput)
            $scope.refreshInputData(tab)
        else
            $scope.refreshOutputData(tab, showError)
    }

    function syncFieldValidation() {
        auxo.forEachArray($scope.rightList.items, function (e, i) {
            e.valid = false;
            auxo.forEachArray($scope.leftList.items, function (e1, j) {
                if(e.column === e1.column) {
                    e.valid = true;
                    return false
                }
            })
        })
        $scope.$parent.setDialogMessage("","error");
        var invalidFields = [];
        auxo.forEachArray($scope.rightList.items, function (e, i) {
            if(!e.valid) {
                invalidFields.push(e.column);
            }
        })
        if(invalidFields.length>0) {
            $scope.$parent.setDialogMessage("非法输入字段: " + invalidFields.join(", "),"error");
        }
    }

    function syncData() {
        tab.content[0].data.fields = [];
        auxo.forEachArray($scope.rightList.items, function (e, i) {
            tab.content[0].data.fields.push({column: e.column, alias: e.alias})
        })
        syncFieldValidation();
    }

    $scope.onChange =function (item) {
        if(!item.valid)
        auxo.forEachArray($scope.leftList.items, function (e,i) {
            if(e.column === item.column) {
                item.valid = true;
                return false;
            }
        })

        syncData()
    }

    function activate(tab) {
        if(tab.category === "Output") {
            $scope.refreshData()
        }
    }

    auxo.list2List.call(this, $scope, syncData);

    buildRightList()
    $scope.$parent.tabChangeListeners.push({func: activate, tab:tab});
    $scope.refreshData()
});
