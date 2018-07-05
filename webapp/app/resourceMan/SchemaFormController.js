App.controller('SchemaFieldsController2', function($scope, $location, UtilService, StepSchemaService,Restangular, $stateParams) {

    $scope.name = "SchemaFieldsController2";
    $scope.dataset = $scope.$parent.datasetEntity;
    $scope.schema = $scope.$parent.schemaEntity;
    $scope.uuid = 0;
    $scope.error = false;
    $scope.fields = [];
    var fieldIndex = 1;

    $scope.fieldDef = {
        name : {type: 'String', label:"字段",  name: "field_name", placeholder:"type field name"},
        type: {type: 'Dropdown', label:"类型",  name: "field_type", removable:true, value:"string",
            enum: ["string", "byte", "short", "bigint", "int", "float", "double", "boolean", "date", "timestamp", "binary", "decimal"]}
    };

    $scope.decimalFormat = {
        allowArray: function () {
            var a = [];
            for(var i=0;i<39;i++) {
                a.push(i)
            }
            return a;
        },
        wholePlaceHolder: "总长度",
        fractionPlaceHolder: "小数长度"
    }

    $scope.data = {
        id: "",
        name :"",
        description: "",
        fields: []
    };

    if ($scope.schema && $scope.schema.fields) {
        $scope.data.fields = $scope.schema.fields?$scope.schema.fields: $scope.dataset.attributes.schema.fields
    }

    $scope.isReadOnly = function () {
        return $scope.schema? $scope.schema.reference==='true': false;
    }

    $scope.updateData = function () {
        $scope.dataset = $scope.$parent.datasetEntity;
        $scope.schema = $scope.$parent.schemaEntity;
        if ($scope.dataset && $scope.schema) {
            if($scope.schema.fields) {
                $scope.data.fields = $scope.schema.fields;
            }else if($scope.dataset.attributes && $scope.dataset.attributes.schema){
                $scope.data.fields = $scope.dataset.attributes.schema.fields;
            }
        } else if ($scope.$parent.fields && $scope.$parent.fields.length > 0) {//如果dataset页面重新选择了schema，刷新下面的字段
            $scope.data.fields = $scope.$parent.fields;
        } else {
            if($scope.editingNode && $scope.editingNode.idPrefix)
                $scope.data = auxo.clone($scope.editingNode);
        }

    }
    $scope.updateData();

    $scope.onTypeChange = function (item) {
        if(item.type === 'decimal') {
            if(item.wholeLength === undefined)
                item.wholeLength = '10';
            if(item.fractionLength === undefined)
                item.fractionLength = '0';
        }
        synchData()
    }

    $scope.onDecimalChange = function (item, name) {
        var wholeLength = item.wholeLength?item.wholeLength*1:10;
        var fractionLength = item.fractionLength?item.fractionLength*1:0;
        if(fractionLength > wholeLength) {
            if(name === 'wholeLength')
                item.fractionLength = item.wholeLength;
            else
                item.wholeLength = item.fractionLength;

        }
        synchData()
    }

    $scope.getId = function () {
        return "schema-form-item-" + $scope.uuid++;
    };

    // str: decimal(10:2)
    function stringToDecimalObj(str) {
        if(str.indexOf('decimal')>-1) {
            var reg = /[(),]/;
            var c = str.split(reg);
            var obj = {};
            obj.type = c[0];
            obj.wholeLength = c[1];
            obj.fractionLength = c[2];
            return obj;
        }
    }
    function decimalObjToString(obj) {
        var wholeLength = obj.wholeLength? obj.wholeLength: '0'
        var fractionLength = obj.fractionLength? obj.fractionLength: '0'
        return "decimal(" + wholeLength +"," + fractionLength + ")";
    }

    function synchData(m2v) {
        if (m2v) {
            auxo.array.removeAll($scope.fields)
            angular.forEach($scope.data.fields, function (e) {
                var field = {name: e.name, type: e.type, selected: false}
                if(e.type && e.type.indexOf('decimal')>-1) { // format: decimal(10,2)
                    angular.extend(field, stringToDecimalObj(e.type))
                    field.type = "decimal"
                }
                $scope.fields.push(field)
            })
        } else {
            auxo.array.removeAll($scope.data.fields)
            angular.forEach($scope.fields, function (e) {
                var field = {name: e.name, type: e.type}
                if(e.type === 'decimal') {
                    field.type = decimalObjToString(e)
                }
                $scope.data.fields.push(field)
            })
        }
        // $scope.$parent.schema.fields = $scope.data.fields;
    }
    $scope.synchData = synchData;

    synchData(true)

    $scope.addFields = function (index) {
        if(index === undefined)
            index = $scope.fields.length - 1;
        function getFieldName() {
            var name = "field_" + fieldIndex++;
            auxo.array.forEach($scope.fields, function (e) {
                if(e.name === name) {
                    name = null;
                    return false;
                }
            })
            if(!name)
                return getFieldName();
            return name;
        }
        $scope.fields.splice(index+1, 0,  {name: getFieldName(), type: 'string',  selected: false})

        synchData()
    };

    $scope.deleteItem = function (index) {
        if(index === undefined)
            return;
        $scope.fields.splice(index, 1);

        synchData()
    };

    $scope.addBatch = function () {

        var batchInput = $scope.batchInput? $scope.batchInput: $scope.$parent.batchInput;
        if(batchInput) {
            var error = ""

            function addError(e) {
                if(error)
                    error += ";"
                error += e;
            }
            var lines = batchInput.split(/\r?\n/);
            var fs = [];
            var reg = /decimal\(\d+,\d+\)/;
            var go = true;
            auxo.array.forEach(lines, function (line, i ) {
                var ss = line.split(/\s+/);
                var ss1 = [];
                auxo.array.forEach(ss,function (e) {
                    if(e)
                        ss1.push(e)
                })
                ss = ss1;

                if(ss.length == 2) {
                    var name = ss[0];
                    var type = ss[1]
                    if(reg.test(type)){
                        var f = {name: name, type:""}
                        angular.extend(f, stringToDecimalObj(type))
                        fs.push(f);

                    } else if ($scope.fieldDef.type.enum.indexOf(type)>=0) {
                        fs.push({name: name, type: type});
                    } else {
                        fs.push({name: name, type:""});
                        addError(name + ": 不支持的类型" + type)
                    }
                } else if(ss.length == 0) {
                } else if(ss.length === 1){
                    fs.push({name: ss[0], type:""});
                } else if(ss.length > 2) {
                    auxo.sgDialogService.alert("第" + (i+1) + "行格式有误！", "错误");
                    go = false;
                    return false;
                }
            })
            if(go) {
                auxo.array.forEach(fs, function (e) {
                    var index = $scope.fields.length - 1;
                    e.selected = false;
                    $scope.fields.splice(index+1, 0,  e)
                })

                synchData()

                if(error) {
                    auxo.sgDialogService.alert(error, "提示");
                }
                delete $scope.batchInput;
                delete $scope.$parent.batchInput;
            }
        }
    }

    $scope.rightList = {items:$scope.fields};
    auxo.list2List.call(this, $scope, synchData);

    $scope.isArray = function(item) {
        return angular.isArray(item)
    }
});