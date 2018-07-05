App.controller("DFConfigInOutputController", function($scope, Restangular, sgDialogService) {

    var tab = $scope.tab;
    var dataflow = $scope.$parent.dataflow
    var data = $scope.$parent.data;
    var isInput = $scope.isInput = tab.category === 'Input'
    var readonly = $scope.$parent.readonly
    var isWorkflow = $scope.$parent.isWorkflow
    var selectList = $scope.selectList = []
    var validate = $scope.$parent.validate

    var formMeta = $scope.formMeta = {
            id: "dataflow_input",
            paraName: '引用',
            selectList: selectList,
            name: "dataflow_input",
            data: isInput? data.inputs: data.outputs,
            tooltip: isInput? "输入变量":"输出变量",
            input_length_class: "col-sm-12",
            label: isInput? "输入变量":"输出变量",
            label_length_class: "col-sm-12",
            label_align: 'left',
            label_hidden: true
    };
    $scope.formMetas = [formMeta]

    function buildSelectList() {
        var type = isInput? "source":"sink"
        auxo.forEachArray(dataflow.steps, function (e) {
            if(auxo.isStepType(e.type, type)) {
                selectList.push({ref: e.id, name: e.name? e.name:""})
            }
        })
    }
    buildSelectList();

    $scope.addRow = function (parameters) {
        formMeta.data.push({refs:[""], name: "", description:""})
        validate()
    }

    $scope.removeRow = function (index) {
        formMeta.data.splice(index, 1)
        validate()
    }

    /*
    if(formMeta.data.length == 0) {
        if (selectList.length > 0)
            formMeta.data.push({refs: [""], name: "", description: ""})  //name名称，refs引用，desc描述;
    }
    */

    $scope.onDataChange = function () {
        validate()
    }

    validate()
});
