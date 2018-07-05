App.controller('DFConfigController', function($scope, UtilService, StepSchemaService, modalInstance, sgDialogService, Restangular) {

    var readonly = $scope.readonly

    var dataflow = $scope.dataflow
    if(!dataflow.parameters)
        dataflow.parameters = [];
    if(!dataflow.inputs) {
        dataflow.inputs = []
    }
    if(!dataflow.outputs){
        dataflow.outputs = []
    }

    var parameters = $scope.parameters = auxo.clone(dataflow.parameters);

    function  isHidden(tab) {
        if(tab === 'Input' || tab === 'Output') {
            var steps = [];
            var stepType = tab === 'Input'?'source':'sink'
            auxo.forEachArray(dataflow.steps, function (e) {
                if(auxo.isStepType(e.type,stepType))
                    steps.push(e);
            })
            if(steps.length == 0)
                return true;
        }
    }

    var tabStates = {
        Input: {hidden: isHidden('Input')},
        Other: {hidden: false},
        Output: {hidden: isHidden('Output')}
    }

    var tabs = $scope.tabs = [
        {category: "Input",  title: "输入", active: true, state: tabStates.Input},
        {category: "Other",  title: "参数", active: false,  state: tabStates.Other },
        {category: "Output", title: "输出", active: false, state: tabStates.Output}
    ]

    var data = $scope.data = {
        ref: parameters.filter(function(item) { return !item.category || item.category === 'ref'; }),
        var: parameters.filter(function(item) { return item.category === 'var'; }),
        inputs: tabStates.Input.hidden?[]: auxo.clone(dataflow.inputs),
        outputs : tabStates.Output.hidden? []:auxo.clone(dataflow.outputs)
    }

    var isWorkflow = $scope.isWorkflow = function () {
        return dataflow.flowType == "workflow"
    }

    $scope.validate = function () {
        combineParameters();
        $scope.error = false;
        $scope.errmessage={};
        var tab = "Input";
        auxo.forEachArray(tabs, function (e) {
            if(e.active)
                tab = e.category;
        })

        auxo.forEachArray(parameters, function (e, i){
            delete e.error
        })
        auxo.forEachArray(data.inputs, function (e, i){
            delete e.error
        })
        auxo.forEachArray(data.outputs, function (e, i){
            delete e.error
        })

        function validateData(array, label, fields) {
            if( $scope.error)
                return;
            var exit = false
            auxo.forEachArray(array, function (e, i) {
                if(fields.name && auxo.isEmpty(e.name)) {
                    $scope.errmessage['empty'] = label + '名称不能为空!';
                    e.error = "名称为空"
                    $scope.error = true;
                    return false;
                }
                if(fields.refs && auxo.isEmpty(e.refs.join(''))) {
                    $scope.errmessage['empty'] = label + '引用不能为空!';
                    e.error = "引用为空"
                    $scope.error = true;
                    return false;
                }
                if(fields.defaultVal && auxo.isEmpty(e.defaultVal)) {
                    $scope.errmessage['empty'] = label + '默认值不能为空!';
                    e.error = "默认值为空"
                    $scope.error = true;
                    return false;
                }

                auxo.forEachArray(array, function (e1, j) {
                    if (i < j) {
                        if (e.name && e.name === e1.name) {
                            $scope.errmessage['message'] = label + '名称不能重复!';
                            e.error = e1.error = "名称重复"
                            $scope.error = true;
                            exit = true
                            return false;
                        }
                    }
                })
                if (exit)
                    return false;
            })
        }

        if(tab === 'Input') {
            validateData(data.inputs, "", {name: true, refs: true})
            validateData(parameters,"参数页: ", {name: true, refs: true, defaultVal: true})
            validateData(data.outputs,"输出页: ", {name: true, refs: true})
        } else if(tab === 'Other') {
            validateData(parameters,"", {name: true, refs: true, defaultVal: true})
            validateData(data.inputs,"输入页: ", {name: true, refs: true})
            validateData(data.outputs, "输出页: ", {name: true, refs: true})
        } else {
            validateData(data.outputs, "", {name: true, refs: true})
            validateData(data.inputs, "输入页: ", {name: true, refs: true})
            validateData(parameters,"参数页: ", {name: true, refs: true, defaultVal: true})
        }
    }

    function combineParameters() {
        parameters = data.ref.concat(data.var);
    }

    $scope.onTabChange = function (tab) {
        auxo.forEachArray(tabs, function (e) {
            e.active = false;
        })
        tab.active = true;
    }

    // ok click
    $scope.ok = function() {
        if($scope.error)
            return;
        combineParameters()
        dataflow = {};
        dataflow.parameters = auxo.removeNullFromArray(parameters);
        dataflow.inputs = auxo.removeNullFromArray(data.inputs);
        dataflow.outputs = auxo.removeNullFromArray(data.outputs);
        auxo.forEachArrayReverse(parameters, function (e, i) {
            auxo.removeNullFromArray(e.refs);
        })
        auxo.forEachArrayReverse(dataflow.inputs, function (e, i) {
            auxo.removeNullFromArray(e.refs);
        })
        auxo.forEachArrayReverse(dataflow.outputs, function (e, i) {
            auxo.removeNullFromArray(e.refs);
        })

        auxo.treeWalk(dataflow, function (key,value) {
            if(key && key[0] === '$'){
                delete value[key];
            }
        })

        modalInstance.closeModal(dataflow)
        auxo.delHotkey($scope)
    };
    // cancel click
    $scope.cancel = function() {
        modalInstance.dismiss();
        auxo.delHotkey($scope)
    }

    $scope.closeModal = function () {
        $scope.cancel();
    }

    $scope.title =  '参数声明';
    $scope.modalButtons =[
        {
            action:$scope.ok,
            text:"确定",class:"btn-primary",
            disabled: function(){ $scope.validate(); return  $scope.error;}
        },
        {
            action:$scope.cancel,
            text:"取消",class:"btn-warning"
        }
    ];

    if($scope.readonly)
        $scope.modalButtons.splice(0,1);

    auxo.bindEscEnterHotkey($scope)
});