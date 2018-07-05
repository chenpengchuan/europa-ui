App.controller('StepFormController', function ($scope, UtilService, StepSchemaService, modalInstance, sgDialogService, Restangular) {

    //$scope.readonly

    var node = $scope.editingNode;
    var dataflow = $scope.dataflow;
    var configuration;
    var flowNodeData;
    $scope.map = {
        advancedShown: false
    }
    $scope.tabChangeListeners = [];

    //var data = auxo.clone($scope.node);
    var formItemUuid = 0;

    var data = {
        type: node.type,
        name: node.name,
        inputConfigurations: node.inputConfigurations,
        outputConfigurations: node.outputConfigurations,
        otherConfigurations: node.otherConfigurations
    }

    // make a copy
    data = $scope.data = auxo.clone(data);

    $scope.nodeNameDef = {
        "type": "String",
        "$name": "name",
        "label": "节点名称",
        "maxLength":30,
        "label_align": "left",
        "tooltip":["节点显示名称, 最长30"],
        'label_length_class':'col-sm-2',
        'input_length_class':'col-sm-8',
        "style": function (self) {
            return {'padding-bottom':'20px'}
        },
        "data": data
    }

    $scope.inputs = []
    $scope.outputs = []

    function getOtherTab() {
        if (configuration.tabs && configuration.tabs.length > 0) {
            var tab;
            auxo.forEachArray(configuration.tabs, function (e) {
                if(e.category == "Other") {
                    tab = e;
                    return false;
                }
            })
            return tab;
        }
    }

    function getDataflowSources() {
        var dataflowSources = []

        function getSources(nodeId) {
            auxo.forEachArray(dataflow.links, function (e) {
                if (e.target === nodeId) {
                    var n = auxo.array.getItemByAttr(dataflow.steps, 'id', e.source)
                    if (n) {
                        if (n.type === 'dataflow' || n.type === "streamflow")
                            dataflowSources.push(n)
                        else
                            getSources(n.id)
                    }
                }
            })
        }

        getSources(node.id)
        return dataflowSources;
    }

    function init() {
        if (dataflow.links) {
            auxo.forEachArray(dataflow.links, function (e, i) {
                if (e.source == node.id && $scope.outputs.indexOf(e.target) < 0) {
                    $scope.outputs.push(e.target)
                }
                if (e.target == node.id && $scope.outputs.indexOf(e.source) < 0) {
                    $scope.inputs.push(e.source)
                }
            })
        }

        //auxo.alert(sgDialogService, data,"Data of beginning:")
        console.log("Data of beginning: " + JSON.stringify(data, null, " "))

        // init boolean value, transform string to boolean
        auxo.treeWalk(data, function (key, value, path, parent) {
            if (value === 'true' || value === 'false') {
                if (parent && key) {
                    parent[key] = value == 'true' ? true : false;
                }
            }
        })

        $scope.otherTabState = {currentTab: 0}

        $scope.configuration = stepData.toSchema(node.$stepId, data)
        configuration = $scope.configuration
        configuration.type = data.type
        console.log("Configuration of beginning: \n" + JSON.stringify(configuration, null, " "))

        //Matrix42
        if (configuration.type == "cache") {
            var eleArr = configuration.tabs[1].content
            var item = eleArr[0]
            var dataset = item.data.dataset
            if (dataset && dataset.length > 0) {
                Restangular.one("datasets").get({query: "name_sort=" + dataset, limit: 1})
                    .then(function (facetResult) {
                        // if (facetResult.content && facetResult.content.length > 0) {
                        //     for (var i = 2; i < eleArr.length - 2; i++) {
                        //         if (eleArr[i]) {
                        //             if (eleArr[i].$name == "keyColumn" || eleArr[i].$name == "valueColumns" || eleArr[i].$name == "path") {
                        //                 continue
                        //             }else {
                        //                 if(!(eleArr[i].readonly))
                        //                     eleArr[i].readonly = true;
                        //             }
                        //         }
                        //     }
                        // }
                    })
            }
            if(item.data.engine==undefined){
                item.data.engine="MapDB"
            }
        }
        //Matrix42

        // set default input output data
        function initInputOutput() {
            var setValueForInputOrOutput = function (tab) {

                if (!tab.content[0].data.$inputFields || tab.content[0].data.$inputFields.length == 0) {
                    if (tab.content[0].data.fields && tab.content[0].data.fields.length > 0) {
                        tab.content[0].data.$inputFields = auxo.clone(tab.content[0].data.fields);
                    }
                }
            }

            // convert input and output values for form edit
            for (var k = 0; k < $scope.configuration.tabs.length; k++) {
                var tab = $scope.configuration.tabs[k];
                if (tab.category == "Input" || tab.category == "Output") {
                    //for test
                    setValueForInputOrOutput(tab);
                }
            }
        };

        initInputOutput();

        if (flowNodeData) {
            var sources = getDataflowSources();
            stepData.initWorkflowInputTabs(data, configuration, sources, flowNodeData)
        }

        // set default value
        function initDefaultValue() {
            // cast number
            auxo.treeWalk($scope.configuration, function (key, value, path, parent) {
                if (value && value.type == 'Number' && value.data) {
                    var v = value.data[value.$name];
                    if ($.isNumeric(v))
                        value.data[value.$name] = parseInt(v);
                }

                if (value && value.type == 'ObjectArray') {
                    if (!value.data[value.$name])
                        value.data[value.$name] = [];
                    if (value.data[value.$name].length == 0)
                        value.data[value.$name].push({});
                }

                if (value && value.type == 'TextArray') {
                    if (!value.data[value.$name])
                        value.data[value.$name] = [];
                    if (value.data[value.$name].length == 0)
                        value.data[value.$name].push([]);
                }
            })
        }

        initDefaultValue();
    } // init end

    var fieldsToArray = function (fields, optional, isName) {
        var array = [];
        if (optional)
            array.push("")
        for (var i = 0; i < fields.length; i++) {
            var item = fields[i];
            if (isName)
                array.push(item.column)
            else
                array.push(item.alias ? item.alias : item.column);
        }
        return array
    }

    function updateStarJoinConditions(item) {
        var factTableChanged = false;

        item.dimTables = [];
        item.$inputFields = {unknown: []};
        auxo.forEachArray(data.inputConfigurations, function (input) {
            if (!item.data.factTable || item.data.factTable != input.$source)
                item.dimTables.push(input.$source)
            item.$inputFields[input.$source] = fieldsToArray(input.fields)
        })

        if (!item.data.joinConditions || item.data.joinConditions.length == 0) {
            item.data.joinConditions = [];
        } else if (item.data.joinConditions.length > data.inputConfigurations.length - 1) {
            var list = []
            // find all the items with the tablename unmatched
            auxo.forEachArray(item.data.joinConditions, function (e, i) {
                if (e.tableName && item.dimTables.indexOf(e) >= 0)
                    list.push(i);
            })
            // delete the unmatched items
            auxo.forEachArrayReverse(list, function (e) {
                item.data.joinConditions.splice(e, 1);
            })
            // remove more items to make joinConditions count is correct
            /*
                        var num = item.data.joinConditions.length - (data.inputConfigurations.length - 1)
                        for (i = 0; i < num; i++) {
                            item.data.joinConditions.splice(0, 1);
                        }
            */
        }

        // added new item for joinConditions
        for (var i = item.data.joinConditions.length; i < data.inputConfigurations.length - 1; i++) {
            item.data.joinConditions.push({tableName: "unknown", dimColumn: "", factColumn: ""})
        }
    }

    $scope.onTabChange = function (tabs, newIndex, callback) {

        auxo.forEachArray(tabs, function (e, i) {
            if (i === newIndex)
                e.active = true;
            else
                e.active = false;
        })

        if (callback)
            callback();

        auxo.array.forEach($scope.tabChangeListeners, function (e) {
            if(tabs[newIndex] === e.tab)
                e.func(tabs[newIndex]);
        })
    }

    $scope.afterTabChange = function () {
        auxo.treeWalk($scope.configuration, function (key, value, path, parent) {
            if (value && (value.type == 'Select' || value.type == 'SelectArray' || value.type == 'ObjectArray') && value.selectSource) {
                var source = value.selectSource;


                if (source == 'input' || source == 'left') {
                    value.selectEnum = fieldsToArray(data.inputConfigurations[0].fields, value.optional)
                } else if (source == 'inputOriginal') {
                    value.selectEnum = fieldsToArray(data.inputConfigurations[0].fields, value.optional, true)
                    if(value.$name === 'orderBy') {
                        var selections = [];
                        auxo.array.forEach(value.selectEnum, function (e) {
                            if(e) {
                                selections.push(e + " asc");
                                selections.push(e + " desc");
                            }
                        })
                        value.selectEnum = selections;
                    }
                } else if (source == 'right') {
                    value.selectEnum = fieldsToArray(data.inputConfigurations[1].fields, value.optional)
                } else if (source == "sourceName") { // starjoin
                    var srcs = [];
                    for (var k = 0; k < data.inputConfigurations.length; k++) {
                        srcs.push(data.inputConfigurations[k].$source);
                    }
                    value.selectEnum = srcs
                }
            }

            // starjoin joinConditions
            if (value && value.type == 'ObjectArray' && value.$name == 'joinConditions' && auxo.isStepType(data.type, 'starjoin')) {
                updateStarJoinConditions(value)
            }

            if (value && value.type == 'SelectArray') {
                var array = [];
                var model = value.data[value.$name];
                for (var i = 0; i < model.length; i++) {
                    array.push({text: model[i]});
                }
                value.tags = array;
            }
            if (value && value.type == 'sink'){
                onSinkCdoChange(value.tabs[1].content[0], value.tabs[1], null);
            }
        })
    }

    var getCDC = function (group) {
        var cdc;
        auxo.treeWalk(group, function (key, value, path, parent) {
            if (value && value.$name == "schema") {
                cdc = value.data[value.$name];
                return 'break';
            } else if(value && value.$name == 'dataset' && value.data['schema']) {
                cdc = encodeURIComponent(value.data['schema'])
            }
        })
        return cdc;
    }

    var refreshRuleValueColumn = function (group, cdc) {
        if (!cdc || cdc == null)
            return;

        if(!group)
            return;

        Restangular.one("schemas", "name").customGET(cdc).then(function (facetResult) {

            auxo.treeWalk(group, function (key, value, path, parent) {
                if (value && value.$name == 'name') {
                    var array = [];
                    for (var i = 0; i < facetResult.fields.length; i++) {
                        var v = facetResult.fields[i];
                        array.push(v.alias && v.alias.length > 0 ? v.alias : v.name);
                    }
                    value.selectEnum = array;
                    return 'break';
                }
            })
        }, function (facetResult) {

        })
    }

    //refreshRuleValueColumn
    function initRuleValueColumn() {
        var groups = getOtherGroups();
        /*
        if (groups) {
            auxo.treeWalk(configuration, function (key, value, path, parent) {
                if (value && value.$name == "schema") {
                    var cdc = value.data[value.$name];
                    refreshRuleValueColumn(parent, cdc)
                    return 'break';
                }
            })
        }
        */

        if (groups) {
            auxo.forEachArray(groups.content, function (group,i) {
                var cdc = getCDC(group);
                refreshRuleValueColumn(group, cdc)
            })
        }
    };

    $scope.isArray = function (item) {
        return angular.isArray(item);
    }

    $scope.isNotArray = function (item) {
        return !angular.isArray(item);
    }

    $scope.selectTab = function (index) {
        $scope.currentTab = index;
    }

    var getId = $scope.getId = function () {
        return "step-form-item-" + formItemUuid++;
    }

    var setId = function () {
        auxo.treeWalk(configuration, function (key, value) {
            if (value && value.$name && value.id == undefined) {
                value.id = getId();
            }
        })
    }

    function updateDataflowArguments(flowId, item, updateData) {
        if (flowId && flowId.length > 0) {
            if (updateData) {
                var args = [];
                for (var i in data.otherConfigurations) {
                    if (!angular.isNumber(i) && i.indexOf('$') < 0) {
                        args.push(i);
                    }
                }
                // clearup old auguments
                if (args.length > 0) {
                    var other = getOtherTab();
                    auxo.forEachArrayReverse(other.content, function (e, i) {
                        if (args.indexOf(e.$name) >= 0 && e.generated) {
                            auxo.removeObj(i, other.content);
                            delete data.otherConfigurations[e.$name]
                        }
                    })
                }
            }

            Restangular.one("flows", flowId).get()
                .then(function (facetResult) {
                    $scope.flowConfigurations = facetResult.configurations;
                    if (facetResult.parameters && facetResult.parameters.length > 0) {
                        item.parameters = facetResult.parameters
                        auxo.forEachArray(facetResult.parameters, function (e, i) {
                            if (updateData || !item.data[e.name])
                                item.data[e.name] = e.defaultVal;
                            // item.parameters[e.name] = e;
                        })
                        beforeEdit("dataflowId$")
                        setId();
                    }
                })
        } else {
            //clear
            auxo.keepAttributes(item.data, ["dataflowId$","endpoints"])
        }
    }

    function beforeEdit(name, specials) {
        auxo.treeWalk(configuration, function (key, value, path, parent) {
            if (value && value.before_edit) {
                if (specials && specials.indexOf(value.$name) >= 0) {
                    if (value.$name == "dataflowId$") {
                        updateDataflowArguments(data.otherConfigurations.dataflowId$, value)
                    }
                } else if (name) {
                    if (value.$name == name)
                        value.before_edit(value.data[value.$name], value, parent)
                } else
                    value.before_edit(value.data[value.$name], value, parent)
            }
        })
    }

    $scope.removeCol = function (tab, column) {
        var index = tab.content[0].data.fields.indexOf(column);
        tab.content[0].data.fields.splice(index, 1);
    }

    $scope.addColAfter = function (tab, column) {
        var index = tab.content[0].data.fields.indexOf(column);
        if (index == tab.content[0].data.fields.length - 1)
            tab.content[0].data.fields.push({name: column.name, alias: ""});
        else
            tab.content[0].data.fields.splice(index + 1, 0, {name: column.name, alias: ""});
    }

    function getOtherGroups(content) {
        if(!content)
            content = configuration.tabs
        var tabs;
        auxo.treeWalk(content, function (key,value,path,parent) {
            if(value && value.type === 'tabs') {
                tabs = value;
                return false
            }
        })
        return tabs;
    }

    $scope.addGroup = function (tab, index) {
        var groups = getOtherGroups(tab)
        var group = groups.content[index]
        var tabData0;
        auxo.treeWalk(group, function (key, value, path, parent) {
            if (value && value.data) {
                tabData0 = value.data;
                return "break;"
            }
        })
        var copy = auxo.clone(group)
        groups.content.push(copy);
        //set data
        var tabDataN;
        auxo.treeWalk(copy, function (key, value, path, parent) {
            if (value && value.data) {
                if (!tabDataN)
                    tabDataN = value.data;
                else
                    value.data = tabDataN
            }
        })
        auxo.treeWalk(data, function (key, value, path, parent) {
            if (value === tabData0) {
                parent.push(tabDataN)
                return "break;"
            }
        })

        setId();


        tab.currentTab = groups.content.length - 1;
    };

    //todo set id for item
    $scope.removeGroup = function (tab, index) {
        sgDialogService.confirm("确定要删除页签" + (index + 1) + "吗？", function (result) {
            if (result) {
                stepData.removeGroup(index, data, $scope.configuration)
                //$scope.otherTabState.currentTab = 0;
                tab.currentTab = 0;
            }
        });
    }

    $scope.removeObj = function (index, array) {
        auxo.removeObj(index, array)
    }

    $scope.addObjAfter = function (index, array, obj) {
        if(index === null)
            index = array.length-1;
        if(!obj) {
            obj = {};
        }
        obj.$id = getId()
        array.splice(index + 1, 0, obj);
    }

    $scope.addStrAfter = function (index, array) {
        array.splice(index + 1, 0, "");
    }

    $scope.refreshInputData = function (tab) {
        var buildInputData = function (step) {
            var fields = step.outputConfigurations[0].fields
            var array = [];
            for (var i = 0; i < fields.length; i++) {
                array.push(fields[i].alias && fields[i].alias.length > 0 ? fields[i].alias : fields[i].column);
            }

            var newFields = []
            for (var i = 0; i < array.length; i++) {
                newFields.push({column: array[i]})
            }

            tab.content[0].data.fields = newFields
            tab.content[0].data.$inputFields = auxo.clone(newFields);
        }

        var source = tab.content[0].data.$source;
        for (var i = 0; i < $scope.dataflow.steps.length; i++) {
            var step = $scope.dataflow.steps[i]
            if (step.id == source) {
                buildInputData(step);
            }
        }
        console.log("tab data: " + JSON.stringify(tab, null, " "))
    }

    $scope.loadTagInputSource = function (item) {
        if (item.selectEnum) {
            return item.selectEnum;
        }

        //return ['aa','bb']
    }

    $scope.arrayToTags = function (item) {
        var tags = [];
        if ($.isArray(item.data[item.$name])) {
            for (var i = 0; i < item.data[item.$name].length; i++) {
                tags.push({id: i, text: item.data[item.$name][i]})
            }
        }
        item.tags = tags;
        buildArrayCountForValidate(item)
    }


    $scope.onTagAdded = function (tag, item) {
        var maxId = 0;
        if (item.tags) {
            for (var i = 0; i < item.tags.length; i++) {
                if (item.tags[i].id && item.tags[i].id > maxId)
                    maxId = item.tags[i].id;
            }
        } else { // to fix input tag's bug: the first tag is not added after tags is cleaned.
            item.tags = [];
            item.tags.push(tag);
        }
        tag.id = maxId + 1;

        refreshDataArrayFromTags(item)
    }

    $scope.onExportChange = function (obj) {
        function getExport(name) {
            var ep;
            auxo.forEachArray($scope.flowConfigurations.exports, function (e, index) {
                if (name == e.alias) {
                    ep = e;
                    return false;
                }
            })
            return ep;
        }

        var ep = getExport(obj.name);
        if (ep) {
            obj.alias = ep.alias;
            obj.value = ep.value;
        }
    }

    function tabToMap(tab, callback) {
        var itemMap = {}
        auxo.forEachArray(tab.content, function (e, i) {
            if (e.$name) {
                itemMap[e.$name] = e;
                if (callback)
                    callback(e);
            }
        })
        return itemMap;
    }

    //Matrix42
    function onCacheDataSetChange(item, tab) {
        if (item.$name !== "dataset")
            return;

        if (!auxo.isStepType(data.type, "cache"))
            return;

        var itemMap = tabToMap(tab, function (e) {
            e.readonly = false;
        })

        var dataset = item.data.dataset
        var engine = item.data.engine
        if (dataset && dataset.length > 0) {
            Restangular.one("datasets").get({query: "name_sort=" + dataset, limit: 1})
                .then(function (facetResult) {
                    if (facetResult.content && facetResult.content.length > 0) {
                        var c = facetResult.content[0]
                        var schema = c.schemaName;

                        var storage = c.storage
                        if (storage == "REDIS") {
                            item.data.engine = "REDIS"
                        } else if (storage == "HDFS") {
                            item.data.engine = "MapDB"
                        }else if(storage == "IGNITE"){
                            item.data.engine == "IGNITE"
                        }

                        if(c.expiredPeriod)
                            angular.extend(item.data.expiredTime, c.expiredPeriod);

                        if (c.storageConfigurations) {
                            angular.extend(item.data, c.storageConfigurations);

                            for (var e in c.storageConfigurations) {
                                if (itemMap[e]&&itemMap[e].$name!="path") {
                                    itemMap[e].readonly = true;
                                }
                            }
                        }

                        auxo.forEachArray(tab.content, function (e) {
                            if ((e.$name === "engine") && e.onChange) {
                                e.onChange(e.data[e.$name], e, tab.content)
                            }
                        })

                    }
                })
        }
        $scope.onRandomChanged(item)
    }

    //Matrix42

    function onSinkCdoChange(item, tab, fromInit) {
        if(item.$name !== "dataset")
            return;

        if(!(auxo.isStepType(data.type, "sink") || auxo.isStepType(data.type, "cache")))
            return;

        var itemMap = tabToMap(tab, function (e) {
            e.readonly = false;
        })
        tab.content[1].btn_hidden = false;
        item.data['sql'] = "";
        if (item.data.path && item.data.path.indexOf("#{") >= 0){
            fromInit = true;
        }

        var cdo = item.data[item.$name]
        if (cdo && cdo.length > 0 && !fromInit) {
            var queryArgs = {query: "name_sort=" + cdo, limit: 1};
            Restangular.one("datasets").get(queryArgs)
                .then(function (facetResult) {
                    if (facetResult.content && facetResult.content.length > 0) {
                        var c = facetResult.content[0]
                        var cdc = c.schemaName;
                        item.data.schema = cdc;
                        item.data.type = c.storage;
                        if(itemMap.type) {
                            itemMap.type.readonly = true;
                        } else if(itemMap.engine) { // handle cache related fields
                            itemMap.engine.readonly = true;
                        }

                        if(tab.content[1].$name == "schema"){
                            tab.content[1].btn_hidden = true;
                            tab.content[1].readonly = true;
                        }

                        if(c.expiredPeriod)
                            angular.extend(item.data.expiredTime, c.expiredPeriod);

                        if (c.storageConfigurations) {
                            angular.extend(item.data, c.storageConfigurations);

                            // handle cache related fields
                            if(itemMap.engine) {
                                item.data.keyColumn = item.data.keySchema.split(":")[0];
                                itemMap['keyColumn'].readonly = true;
                                item.data.valueColumns = [];
                                auxo.array.forEach(item.data.valueSchema.split("|"), function (f) {
                                    item.data.valueColumns.push(f.split(":")[0]);
                                });
                                if(tab.content) {
                                    auxo.array.forEach(tab.content, function (f) {
                                        if (f.type === 'SelectArray' && f.$name === 'valueColumns') {
                                            f.tags = [];
                                            f.readonly = true;
                                            auxo.array.forEach(item.data.valueColumns, function (v) {
                                                f.tags.push(v);
                                            })
                                        }
                                    });
                                }
                            }
                            for (var e in c.storageConfigurations) {
                                if(itemMap[e]) {
                                    itemMap[e].readonly = true;
                                }
                            }
                        }

                        auxo.forEachArray(tab.content, function (e) {
                            if ((e.$name === "type" || e.$name=== "format") && e.onChange) {
                                e.onChange(e.data[e.$name], e, tab.content)
                                //return false;
                            }
                        })
                    }
                })
        }
    }

    $scope.removeValue = function(item, group, tab) {
        item.data[item.$name] = ''
        if(item.$name === 'filterClass') {
            delete item.data.filterClassName
        }
    }

    $scope.showAdvanced = function () {
        $scope.state.advancedShown = !$scope.state.advancedShown
    }

    $scope.onChange = function (item, group, tab, attrName, obj) {
        if( item.originDataset !== item.data.dataset){
            tab.content[1].btn_hidden = false;
        }
        if(item.changed === false)
            return;

        if(attrName === 'name' && obj) {
            //todo
        }

        if (group)
            if (item.$name == 'schema') {
                var cdc = item.data[item.$name];
                refreshRuleValueColumn(group, cdc);
            }



        if (auxo.isStepType(data.type , 'starjoin') && item.$name == 'factTable') {
            var joinConditions;
            auxo.treeWalk(configuration, function (key, value) {
                if (value && value.$name == "joinConditions") {
                    joinConditions = value;
                    return "break"
                }
            })
            updateStarJoinConditions(joinConditions);
        }

        if (data.type == "dataflow" && item.$name == "dataflowId$") {

            //updateDataflowArguments(item.data.dataflowId$, item, true);
        }

        if (item.onChange) {
            item.onChange(item.data[item.$name], item, tab.content)
        }

        onSinkCdoChange(item, tab)

        item.change = false;
    }

    var buildArrayCountForValidate = function (item) {
        item.arrayCount = ''
        var array = item.data[item.$name];
        if (array && array.length > 0)
            item.arrayCount = array.length
    }

    var refreshDataArrayFromTags = function (item) {
        var array = [];
        if (item.tags != undefined)
            for (var i = 0; i < item.tags.length; i++) {
                array.push(item.tags[i].text)
            }
        item.data[item.$name] = array;
        buildArrayCountForValidate(item);
    }
    $scope.onTagRemoved = function (tag, item) {
        refreshDataArrayFromTags(item)
    }

    $scope.refreshOutputData = function (tab) {
        var newData = {
            type: node.type,
            name: node.name,
            inputConfigurations: auxo.clone(data.inputConfigurations),
            outputConfigurations: auxo.clone(data.outputConfigurations),
            otherConfigurations: auxo.clone(data.otherConfigurations)
        }

        auxo.treeWalk(newData, function (key, value, path, parent) {
            if (key && key.length > 1 && key[0] == '$' && parent)
                delete parent[key]
        })

        Restangular.all("steps/output/fields/" + dataflow.flowType).post(newData)
            .then(function (facetResult) {
                var cols = facetResult;
                var columns = [];
                for (var i = 0; i < cols.length; i++) {
                    columns.push({column: cols[i]})
                }
                tab.content[0].data.fields = columns;
                tab.content[0].data.$inputFields = auxo.clone(columns);
            }, function (facetResult) {
                sgDialogService.alert(JSON.stringify(facetResult.data.err, null, " "), "错误")
            })
    }

    $scope.moveDown = function (fields, $index) {
        auxo.arrayMove(fields, $index, $index + 1);
    }

    $scope.moveUp = function (fields, $index) {
        auxo.arrayMove(fields, $index, $index - 1);
    }


    $scope.addExport = function (index) {
        data.otherConfigurations.exports.push({name: "", alias: "", value: ""})
    }

    $scope.removeExport = function (index) {
        data.otherConfigurations.exports.splice(index, 1)
    }

    //Matrix42
    //产生uuid
    $scope.onRandomChanged = function (item) {
        if (item.readonly)
            return

        if(item.data.engine != "REDIS" && item.data.engine != "IGNITE"){
            return
        }

        if (item.$name == "key"|| item.$name == "cacheName" ||item.$name == "dataset") {
            var s = [];
            var hexDigits = "0123456789abcdef";
            for (var i = 0; i < 36; i++) {
                s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1);
            }
            s[14] = "4";  // bits 12-15 of the time_hi_and_version field to 0010
            s[19] = hexDigits.substr((s[19] & 0x3) | 0x8, 1);  // bits 6-7 of the clock_seq_hi_and_reserved to 01
            s[8] = s[13] = s[18] = s[23] = "-";

            var uuid = s.join("");
            item.data.key = uuid;
            item.data.cacheName = uuid;
        }

    }

    $scope.onResourceSelectChanged = function(item, tab, data) {
        item.originDataset = item.data.dataset;
        if (item.$name == "dataset") {
            if (item.data.schema == undefined)
                return;

            initRuleValueColumn();
            //Matrix42
            onCacheDataSetChange(item, tab)
            //Matrix42
            if(data.selectedRow && !auxo.isMine(data.selectedRow)) {
                var current = auxo.Auth.user.tenant + ":" + auxo.Auth.user.name;
                var shareString =  current+":r|" + current + ":rw|";

                onSinkCdoChange(item, tab, shareString)
            } else {
                onSinkCdoChange(item, tab)
            }

        }
    }
    $scope.onResourceNameBlur = function (item, group, tab) {
        if (item.$name == "dataset") {
            if(item.change) { // if dataset be edited, restore other configurations to default values defined in stepData.js
                var dsName = item.data.dataset;
                angular.extend(item.data, stepData.getType(node.$stepId).data.otherConfigurations);
                if(item.data.valueColumns && tab.content) {
                    auxo.array.forEach(tab.content, function (f) {
                        if(f.type === 'SelectArray' && f.$name === 'valueColumns') {
                            f.tags = [];
                        }
                    });
                }
                item.data.dataset = dsName;
            }
            $scope.onRandomChanged(item);
            $scope.onChange(item, group, tab)
        }
    }

    $scope.onSelectChanged = function (item, tab, selectedRow) {
        if (item.$name == "dataset") {
            if (item.data.schema == undefined)
                return;

            // var cdo = item.data[item.$name];
            item.data.schema = selectedRow.schemaName
            initRuleValueColumn();

            /*
             Restangular.one("datasets").get({query : "name="+cdo, limit: 1})
             .then(function(facetResult){
             var cdc = facetResult.content[0].schemaName;
             item.data.schema = cdc;
             initRuleValueColumn();
             })
             */
        }

        if (item.$name === 'dataflowId$') {
            if (selectedRow) {
                data.name = selectedRow.name;
                if (selectedRow.id)
                    item.data.dataflowId$ = selectedRow.id;
            }
            initialize();
        }

        if (item.$name === 'filterClass') {
            if(selectedRow) {
                item.data.filterClassName = selectedRow.className;
            }
        }

        if (item.$name === 'udf') {
            if (selectedRow) {
                item.data.udfClassName = selectedRow.className;
            }
        }

        //Matrix42
        onCacheDataSetChange(item, tab)
        //Matrix42
        onSinkCdoChange(item, tab)
    }

    $scope.initTextArray = function (item) {
        if (!item.data[item.$name])
            item.data[item.$name] = []

        if (item.data[item.$name].length == 0)
            item.data[item.$name].push("")

    }

    $scope.getAllInputFields = function (inputId) {
        var fs = []
        if (data.inputConfigurations) {
            function fetchFields(e) {
                auxo.array.forEach(e.fields, function (f) {
                    if (f.alias)
                        fs.push(f.alias);
                    else
                        fs.push(f.column);
                })
            }

            auxo.array.forEach(data.inputConfigurations, function (e) {
                if (inputId) {
                    if (e.id === inputId) {
                        fetchFields(e);
                    }
                }
                else
                    fetchFields(e);
            });
        }
        return fs;
    }

    function removeNullValues(data) {
        if (data.otherConfigurations && data.otherConfigurations.exports) {
            auxo.forEachArrayReverse(data.otherConfigurations.exports, function (e, index) {
                if (!e.name || e.name.length == 0 || !e.alias || e.alias.length == 0 || e.value === undefined || e.value.length == 0)
                    data.otherConfigurations.exports.splice(index, 1)
            })
        }
        if (data.type == "lookup") {
            if(data.otherConfigurations.ruleSettings) {
                auxo.forEachArray(data.otherConfigurations.ruleSettings, function (e, i) {
                    auxo.forEachArrayReverse(e.valueColumns, function (item, j) {
                        if(!item.name && !item.alias && !item.defaultNoMatch && !item.defaultNullKey) {
                            e.valueColumns.splice(j, 1)
                        }
                    })
                })
            }
        }

        if (data.type == "parallel" || data.type == "exclusive")
            if (data.otherConfigurations.conditions) {
                auxo.forEachArrayReverse(data.otherConfigurations.conditions, function (e, index) {
                    if (!e.output || e.output.length == 0 || !e.condition || e.condition.length == 0)
                        data.otherConfigurations.conditions.splice(index, 1)
                })
            }

        if (data.otherConfigurations.aggregations) {
            for (var i = 0; i < data.otherConfigurations.aggregations.length;) {
                if (data.otherConfigurations.aggregations[i].alias || data.otherConfigurations.aggregations[i].function || data.otherConfigurations.aggregations[i].column) {
                    i++
                } else {
                    data.otherConfigurations.aggregations.splice(i, 1);
                }
            }
        }
    }

    var validate = function(dataForSave){
        var separator = dataForSave.otherConfigurations.separator;
        var enum_separators = ['\\b','\\t','\\f','\\"','\\\'','\\0',
            '\\u0000','\\u0001','\\u0002','\\u0003','\\u0004','\\u0005','\\u0006','\\u0007','\\u0008',
            '\\u0009','\\u000a','\\u000b','\\u000c','\\u000d','\\u000e','\\u000f','\\u0010','\\u0011',
            '\\u0012','\\u0013','\\u0014','\\u0015','\\u0016','\\u0017','\\u0018','\\u0019','\\u001a',
            '\\u001b','\\u001c','\\u001d','\\u001e','\\u001f','\\u0020','\\u00a0','\\u3000'];
        if(!separator||(separator.length >1 && dataForSave.otherConfigurations.type==='HDFS' && dataForSave.otherConfigurations.format ==='csv' && !IsInArray(enum_separators,separator))){
            return "分隔符(separator) \""+separator+"\" 类型错误,请输入单字符分隔符或标准的unicode转义字符分隔符("+['\\b','\\t','\\f','\\"','\\\'','\\0']+",\\u0000~\\u0020,\\u00a0,\\u3000)";
        }
    }
    function IsInArray(arr,val){
        var testStr=','+arr.join(",")+",";
        return testStr.indexOf(","+val+",")!=-1;
    }


    // ok click
    $scope.ok = function () {
        auxo.treeWalk(data, function (key, value, path, parent) {
            if (key && key.length > 2 && parent && key.substr(0, 2) == '$$')
                delete parent[key]
        })

        //console.log("Data of Ok clicking: \n" + JSON.stringify(data, null, " "))
        //console.log("Configuration of Ok Clicking: \n" + JSON.stringify(configuration, null, " "))
        var msg =(data.type && data.type==='sink') ? validate(data):null;
        if(msg) {
            auxo.sgDialogService.alert(msg, "错误", "提示")
            return;
        }
        var dataCopy = auxo.clone(data);
        auxo.treeWalk(dataCopy, function (key, value, path, parent) {
            if (key && key[0] == "$")
                delete parent[key]
        })
        //alert("Data of Ok clicking:" + JSON.stringify(dataCopy, null, " "))

        function afterEdit(name) {
            auxo.treeWalk(configuration, function (key, value, path, parent) {
                if (value && value.after_edit) {
                    if (name) {
                        if (value.$name == name)
                            value.after_edit(value.data[value.$name], value, parent)
                    } else
                        value.after_edit(value.data[value.$name], value, parent)
                }
            })
        }

        function yes() {
            //auxo.delHotkey($scope)
            removeNullValues(data)
            afterEdit();
            modalInstance.closeModal(data);
        }

        function confirm(errors) {
            sgDialogService.confirm("<div style='color: red'> " + errors + "</div><br> 要继续吗？", function (result) {
                if (result) {
                    yes()
                }
            }, "确认");
        }


        if(stepData.getType(node.$stepId).beforeValidate) {
            dataCopy = stepData.getType(node.$stepId).beforeValidate(dataCopy);
        }

        Restangular.all("steps/validate/" + dataflow.flowType).post(dataCopy)
            .then(function (facetResult) {
                var errors = auxo.getResponseErrorMsg(facetResult);
                if(errors) {
                    confirm(errors);
                }
                else {
                    yes();
                }
            }, function (facetResult) {
                var errors = auxo.getResponseErrorMsg(facetResult);
                if(errors) {
                    confirm(errors);
                }
            })

        //modalInstance.closeModal(data)
    };
    // cancel click
    $scope.cancel = function () {
        //auxo.delHotkey($scope)
        modalInstance.closeModal(false)
    }

    $scope.closeModal = function () {
        $scope.cancel();
    }

    $scope.title = data.type + ' 设置';
    $scope.modalButtons = [
        {
            action: $scope.ok,
            text: "确定", class: "btn-primary",
            disabled: function () {
                if ($scope.callbackForm) return $scope.callbackForm.$invalid || !$scope.callbackForm.$dirty;
            }
        },
        {
            action: $scope.cancel,
            text: "取消", class: "btn-warning"
        }
        // ,{
        //     action: function () {auxo.alert(null, configuration, "configuration")},
        //     text: "查看", class: "btn-warning"
        // }
    ];

    function init2() {
        init();

        $scope.onTabChange(configuration.tabs, 0, $scope.afterTabChange);
        //console.log("Data of loading: \n" + JSON.stringify(data, null, " "))
        //console.log("Configuration of loading: \n" + JSON.stringify(configuration, null, " "))
        initRuleValueColumn();

        beforeEdit(null, ["dataflowId$"]);

        setId();

        if ($scope.readonly)
            $scope.modalButtons.splice(0, 1);

        if (auxo.isStepType(data.type, "sink")) {
            var other = getOtherTab()
            var itemMap = tabToMap(other);
            onSinkCdoChange(itemMap.dataset, other,true);
        }

        $scope.map.nestTabs=getOtherGroups();
    }

    function initialize() {
        if (data.otherConfigurations.dataflowId$) {
            Restangular.one("flows", data.otherConfigurations.dataflowId$).get()
                .then(function (facetResult) {
                    flowNodeData = facetResult;
                    init2()
                })
        } else
            init2();
    }

    initialize();

    auxo.bindEscEnterHotkey($scope)

    $scope.setDialogMessage = function (message, type, append) {
        if(!$scope.dialogMessage) {
            $scope.dialogMessage = {error: "", warning: ""};
        }
        if(type === "warning") {
            if(append) {
                $scope.dialogMessage.warning += message;
            } else
                $scope.dialogMessage.warning = message;
        }
        else  {
            if(append) {
                $scope.dialogMessage.error += message;
            } else
                $scope.dialogMessage.error = message;
        }
    }

});
