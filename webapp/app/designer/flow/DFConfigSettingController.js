App.controller('DFConfigSettingController', function($scope, UtilService, StepSchemaService, sgDialogService, Restangular) {

    var readonly = $scope.$parent.readonly
    var dataflow = $scope.$parent.dataflow
    var data = $scope.$parent.data
    var isWorkflow = $scope.$parent.isWorkflow
    var tab = $scope.tab;

    var parameters = $scope.parameters = auxo.clone(dataflow.parameters);

    var selectList = $scope.selectList = {
        ref: [],
        var: [],
    }

    var formMeta = $scope.formMeta = {
        var: {
            id: "dataflow_var",
            paraName: '变量',
            selectList: selectList.var,
            name: "parameters_var",
            data: data.var,
            tooltip: "自定义变量",
            input_length_class: "col-sm-12",
            label: "自定义变量",
            label_length_class: "col-sm-12",
            label_align: 'left',
            label_hidden: false
        },
        ref: {
            id: "dataflow_ref",
            paraName: '引用',
            selectList: selectList.ref,
            name: "dataflow_ref",
            data: data.ref,
            tooltip: "参数变量",
            input_length_class: "col-sm-12",
            label: "参数变量",
            label_length_class: "col-sm-12",
            label_align: 'left',
            label_hidden: false
        }
    };

    var parameters_formMeta = $scope.parameters_formMeta = [formMeta.var, formMeta.ref]


    function getStepById(id) {
        var step;
        auxo.forEachArray(dataflow.steps, function (e, index) {
            if(e.id === id) {
                step = e;
                return false;
            }
        })
        return step;
    }

    function getStepExports(node) {
        //var step = getStepById(step.id);
        var stepSchema = stepData.getSchema(node.$stepId)
        var parameters = []
        auxo.treeWalk(stepSchema,function (key,value,path, parent) {
            if (value && value.$name && value.$name !== "input" && value.$name !== "output"
                && value.type.indexOf("Array") < 0 && value.type !== "label" && path.indexOf(".content.") < 0) {
                var v = {name: value.$name, description: ''}
                parameters.push(v);
                if(node.otherConfigurations[value.$name] !== undefined)
                    v.value = node.otherConfigurations[value.$name];
                else {
                    //TODO more complicated cases
                }
            }
        })
        return parameters;
    }

    function getStepVariables(step) {
        var vars = [];
        var map = {};
        auxo.treeWalk(step.otherConfigurations, function (key, value) {
            if(angular.isString(value)) {
                var vs = auxo.searchVariables(value);
                auxo.forEachArray(vs, function (e) {
                    if(!(e.name in map)) {
                        vars.push(e);
                        map[e.name] = e;
                    }
                })
            }
        })
        var variables = [];
        auxo.forEachArray(vars, function (e) {
            e.description = ''
            variables.push(e)
        })
        return variables;
    }

    function getDataflowExports(step) {
        var parameters = []
        if(step.otherConfigurations.dataflowId$ && step.otherConfigurations.dataflowId$.length>0) {
            for (var i in step.otherConfigurations) {
                if(i != "dataflowId$")
                    parameters.push({ name:i, value:step.otherConfigurations[i]});
            }
        }
        return parameters;
    }

    function buildExports () {
        function pushExports(id, exports) {
            auxo.forEachArray(exports, function (e, i) {
                if (e.alias)
                    selectList.ref.push({ref: id+ "." + e.alias, name: e.alias,defaultVal: e.value, description: e.description})
                else
                    selectList.ref.push({ref: id+ "." + e.name, name: e.name,defaultVal: e.value,description: e.description})
            })
        }

        function pushVariables(id, vars) {
            var map = {};
            auxo.forEachArray(selectList.var, function (e,i) {
                map[e.ref] = e;
            })
            auxo.forEachArray(vars, function (e, i) {
                if(!(e.name in map))
                    selectList.var.push({ref: e.name, name: e.name,defaultVal: e.value,description: e.description})
            })
        }

        auxo.forEachArray(dataflow.steps, function (e, index) {
            if (isWorkflow()) {
                var exports = getDataflowExports(e)
                if (exports && exports.length > 0) {
                    pushExports(e.id, exports)
                }
                var vars = getStepVariables(e)
                if (vars && vars.length > 0) {
                    pushVariables(e.id, vars)
                }
            } else {
                var exports = getStepExports(e);
                if (exports && exports.length > 0) {
                    pushExports(e.id, exports)
                }
                var vars = getStepVariables(e)
                if (vars && vars.length > 0) {
                    pushVariables(e.id, vars)
                }
            }
        })
    }

    var validate = $scope.$parent.validate

    $scope.addRow = function (parameters) {
        parameters.push({refs:[""], name: "", defaultVal: "",description:"", category: parameters === data.var?"var":"ref"})
        validate()
    }

    $scope.removeRow = function (index, parameters) {
        parameters.splice(index, 1)
        validate()
    }

    buildExports();

    if(data.ref.length == 0) {
        if (selectList.ref && selectList.ref.length > 0) {
            //data.ref.push({refs: [""], name: "", defaultVal: "", description: "", category: 'ref'})  //name名称，refs引用，default默认值，desc描述;
        } else
            auxo.array.removeAll(data.ref)
    }

    if(data.var.length == 0) {
        if(selectList.var && selectList.var.length>0)
            data.var.push({refs: [""], name: "", defaultVal: "", description: "",category:'var'})  //name名称，refs引用，default默认值，desc描述;
        else {
            auxo.array.removeAll(data.var)

            var index = 0;
            auxo.forEachArray(parameters_formMeta, function (e, i) {
                if(e.name === 'parameters_var') {
                    index = i;
                    return false;
                }
            })

            parameters_formMeta.splice(index,1);
        }
    }

    $scope.onDataChange = function (obj, selectList) {
        function getExport(refs) {
            var ep;
            auxo.forEachArray(selectList, function (e, index) {
                if (refs[0] == e.ref) { //判断引用
                    ep = e;
                    return false;
                }
            })
            return ep;
        }

        var ep = getExport(obj.refs);
        if (ep) {
            if(!obj.defaultVal)
                obj.defaultVal = ep.defaultVal;
            if(!obj.description)
                obj.description = ep.description
        }
        validate()
        $scope.onRefsChange(obj);
    }

    $scope.onRefsChange = function (obj) {
        delete obj.$stepItem;
        if(obj.refs.length>0 && obj.refs[0]) {
            var stepType = obj.refs[0].replace(/_\d*\..*/,'');
            var field = obj.refs[0].replace(/.*\./,'')
            if(!stepData.getType(stepType)) {
                stepType = ($scope.$parent.dataflow.flowType === 'dataflow'? "spark_":"sf_") + stepType;
            }
            var s = stepData.getSchema(stepType);
            auxo.treeWalk(s, function (key,value) {
                if(value.$name && value.$name === field) {
                    obj.$stepItem = value;
                    return "break"
                }
            })
        }
    }

    validate()
});