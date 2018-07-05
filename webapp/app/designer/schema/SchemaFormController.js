App.controller('SchemaFormController', function($scope, $location, UtilService, StepSchemaService,Restangular, $stateParams) {
    var isNew = $scope.isNew = $stateParams.id == undefined;
	var isCopy = $scope.isCopy = $stateParams.action == "copy";
	var id = $stateParams.id;
    $scope.uuid = 0;
    $scope.error = false;
    $scope.fields = [];
    var fieldIndex = 1;

    $scope.formDef = [
        {type: 'String', label:"名称", $name:"name",required:true},
        {type: 'String', label:"描述", $name:"description",required:false},
        {type: 'TimePeriod', label:"过期时间", value:0,  $name:"expiredPeriod"}
    ];

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
            expiredPeriod: 0,
            fields: [
                {name : "field_1", type: "string"}
        ]
    };

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
            //obj.name = c[0];
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
            $scope.fields = [];
            angular.forEach($scope.data.fields, function (e) {
                var field = {name: e.name, type: e.type, selected: false}
                if(e.type.indexOf('decimal')>-1) { // format: decimal(10,2)
                    angular.extend(field, stringToDecimalObj(e.type))
                    field.type = "decimal"
                }
                $scope.fields.push(field)
            })
        } else {
            $scope.data.fields = [];
            angular.forEach($scope.fields, function (e) {
                var field = {name: e.name, type: e.type}
                if(e.type === 'decimal') {
                    field.type = decimalObjToString(e)
                }
                $scope.data.fields.push(field)
            })
        }
    }
    $scope.synchData = synchData;

    if (isNew) {
        synchData(true)
    }else {
        Restangular.one("schemas", id).get().then(function(entity) {
            $scope.data = entity;
            synchData(true)
            if (isCopy) {
                delete $scope.data.id;
                $scope.data.name = $scope.data.name + "-copy-" + new Date().toISOString();
            }else {
                $scope.isReadOnlyView = true;
            }
        });
    }

    $scope.addFields = function (index) {
        if(index === undefined)
            index = $scope.fields.length - 1;
        $scope.fields.splice(index+1, 0,  {name: "field_" + ++fieldIndex, type: 'string',  selected: false})

        synchData()
    };

    $scope.deleteItem = function (index) {
        $scope.fields.splice(index, 1)
        synchData()
    }

    $scope.mousedown = function (event) {
        if(event.target.nodeName === "SELECT" || event.target.nodeName === "INPUT")
            $scope.dragDisabled = true;
        else
            $scope.dragDisabled = false;
    }

    $scope.onDrop = function(fields, items, index) {
        angular.forEach(items, function(item) { item.selected = false; });

        var itemsCopy = auxo.clone(items);

        $scope.fields = fields.slice(0, index)
            .concat(itemsCopy)
            .concat(fields.slice(index));

        synchData()

        return true;
    }

    $scope.getSelectedItemsIncluding = function(fields, item) {
        item.selected = true;
        return fields.filter(function(item) { return item.selected; });
    };

    $scope.onMoved = function(items) {
        console.log(items)
        $scope.fields = items.filter(function(item) { return !item.selected; });
        synchData()
    };

    $scope.onSelected = function (list, item, event) {
        if(event.target.nodeName === "SELECT" || event.target.nodeName === "INPUT") return;

        var items = list
        if(event.ctrlKey) {
            item.selected = !item.selected;
        } else if(event.shiftKey) {
            var from=-1, to=-1;
            var isFrom = false;
            auxo.forEachArray(items, function (e,i) {
                if(e === item){
                    if(from < 0) {
                        from = i;
                        isFrom = true;
                    } else {
                        to = i;
                    }
                } else if(e.selected) {
                    if(from < 0) {
                        from = i;
                    } else {
                        if(isFrom) {
                            if(to<0)
                                to = i;
                        } else {
                            from = i;
                        }
                    }
                }
                e.selected = false;
            })
            if(from >=0 && to >=0) {
                auxo.forEachArray(items, function (e,i) {
                    if(i>=from && i<=to)
                        e.selected = true;
                })
            } else {
                item.selected = true;
            }
        } else {
            auxo.forEachArray(items, function (e) {
                e.selected = false;
            })
            item.selected = true;
        }
    }

    // ok click
    $scope.ok = $scope.save = function() {
    	$scope.saving = true;

        if($scope.data && $scope.data.id != undefined && $scope.data.id != "") {
            var remoteItem = Restangular.copy($scope.data);
            remoteItem.fields = $scope.data.fields;
            remoteItem.name = $scope.data.name;
            remoteItem.description = $scope.data.description;

            // now you can put on remoteItem
            remoteItem.put().then(function (facetResult) {
            	$scope.saving = false;
                auxo.delHotkey($scope)
                auxo.loadPage(auxo.meta.schema.currUrl);
            }, function(errResponse) {
            	$scope.saving = false;
            	$scope.error = errResponse.data;
            });
        } else {
            Restangular.all("schemas").post($scope.data)
                .then(function (facetResult) {
                	$scope.saving = false;
                    auxo.delHotkey($scope)
                    auxo.loadPage(auxo.meta.schema.currUrl, {});
                },function(errResponse) {
                	$scope.saving = false;
                	$scope.error = errResponse.data;
                });
        }
    };
    // cancel click
    $scope.cancel = function() {
       // auxo.loadPage(auxo.meta.schema.currUrl);
        auxo.delHotkey($scope)
        auxo.goBack();
    }

    $scope.isArray = function(item) {
        return angular.isArray(item)
    }
    auxo.bindEscEnterHotkey($scope)
});