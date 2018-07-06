angular.module('AuxoApp')
    .controller('DataSpoolController', function ($scope, $window, $http, $stateParams, $location, ngDialog, Restangular, modalInstance) {
        var isNew = !$scope.editingNode || !$scope.editingNode.id;

        $scope.error="";

        // from caller
        // $scope.editingNode

        $scope.entity={id:"", name:"", resType:"data_spool",parentId:"",index:0, description:"",
            attributes: {
                storeType:"",
                chineseName:""
            }
        };
        angular.extend($scope.entity, $scope.editingNode);

        $scope.onChange = function(item) {

        }

        $scope.meta = {
            title: "存储池设置",
            fields : [
                {$name: "name", label: "名称",type:"String",  tooltip: ["汉字,字母,数字和下划线的组合,长度4-30，同一目录下唯一"],
                    maxLength:100, minLength:1, noMatch:/[^\u4e00-\u9fbfa-zA-Z0-9_]/g, noMatchMsg: "汉字,字母,数字,下划线的组合!",
                    data: $scope.entity
                },
                {$name: "description", label: "描述",type:"String", data: $scope.entity, tooltip: "", validator:"", isOptional: function () {return true; }},
                {$name: "storeType", label:"存储类型",type:"Select",data:$scope.entity.attributes,
                    selectObjEnum:[{value:"HDFS",name:"分布式文件系统"},
                        {value:"KV", name:"Key-Value数据库"},
                        {value:"MQ",name:"消息队列"},
                        {value:"HIVE",name:"HIVE"},
                        {value:"FTP",name:"FTP"},
                        {value:"ElasticSearch",name:"分布式搜索引擎"}
                    ]},
                {$name: "chineseName", label: "中文名",type:"String", data: $scope.entity.attributes, tooltip: "", validator:"", isOptional: function () {return true; }},
                {$name: "path", label: "path",type:"String", data: $scope.entity.attributes,  tooltip:['目录'],
                    maxLength:300, minLength:1,noMatch:/[^\u4e00-\u9fbfa-zA-Z0-9_/:.]/g, noMatchMsg: "汉字,字母,数字,点,下划线,冒号和斜杠的组合!",
                    hidden:function (item) { return $scope.entity.attributes.storeType != "HDFS" &&
                        $scope.entity.attributes.storeType != "FTP"; }
                }
            ],
            itemValidator:function (item) {
                $scope.error = "";
                var v = item.data[item.$name] +"";

                if(!item.isOptional && auxo.isEmpty(v))
                    return $scope.error = item.label +  "不能为空!";
                if(auxo.isEmpty(v))
                    return;

                if (item.noMatch) {
                    var v2 = v.replace(item.noMatch, '')
                    if(v !== v2) {
                        item.data[item.$name] = v2;
                        return $scope.error = item.label +  item.noMatchMsg? item.noMatchMsg: "有非法字符!";
                    }
                }
                if(item.minLength && v.length < item.minLength)
                    return $scope.error = item.label + "最小长度为:" + item.minLength;
                if(item.maxLength && v.length > item.maxLength){
                    item.data[item.$name] = v.substring(0, item.maxLength);
                    return $scope.error = item.label + "最大长度为:" + item.maxLength;
                }
                if(item.min !== undefined) {
                    var v2 = parseFloat(v);
                    if(v2 < min){
                        item.data[item.$name] = min+"";
                        return $scope.error = item.label + "最小值为:" + item.min;
                    }
                }
                if(item.max !== undefined) {
                    var v2 = parseFloat(v);
                    if(v2 > min){
                        item.data[item.$name] = max+"";
                        return $scope.error = item.label + "最大值为:" + item.max;
                    }
                }
            },
            init: function () {
                auxo.array.forEach($scope.meta.fields, function (item) {
                    if(item.tooltip) {
                        item.tooltip = auxo.tooltips(item.tooltip);
                    }
                    item.input_length_class = "col-sm-10";
                    item.label_length_class = "col-sm-2";
                    //item.label_align = "left";
                    //item.data = $scope.entity;
                    if(!item.isOptional)
                        item.isOptional = function () { return false; }
                    if(auxo.array.contains(["id"],item.$name)){
                        item.readonly = function () {
                            return !isNew
                        }
                    }
                    item.validator2 = item.validator;
                    item.validator = function (i) {
                        $scope.error = "";
                        var v = i.data[i.$name];
                        $scope.meta.itemValidator(i);
                        if($scope.error)
                            return;
                        if(i.validator2)
                            i.validator2(i);
                    }
                })
            }
        }
        $scope.meta.init();

        $scope.validate = function() {
            $scope.error = "";
            auxo.array.forEach($scope.meta.fields, function (e) {
                if(e.validator) {
                    e.validator(e);
                }
                if($scope.error)
                    return false;
            })

            return !$scope.error;
        }

        function save() {
            $scope.validate();
            if($scope.error)
                return;
            $scope.saving = true;

            var entityCopy = auxo.clone($scope.entity);
            //adjust data begin
            //adjust data end

            if (isNew) {
                Restangular.all("europa/resource").post(entityCopy).then(
                    function(resp){
                        $scope.saving = false;
                        yes(resp.id)
                    },
                    function(es) {
                        $scope.saving = false;
                        auxo.showErrorMsg(es);
                    });
            } else {
                Restangular.one("europa/resource", entityCopy.id)
                    .customPUT(entityCopy)
                    .then(
                        function(){
                            $scope.saving = false;
                            yes(entityCopy.id)
                        },
                        function(es) {
                            $scope.saving = false;
                            auxo.showErrorMsg(es);
                        });
            }
        }

        function yes(data) {
            auxo.delHotkey($scope)
            modalInstance.closeModal(data);
        }
        // cancel click
        $scope.cancel = function () {
            auxo.delHotkey($scope)
            modalInstance.closeModal(false)
        }

        $scope.closeModal = function () {
            $scope.cancel();
        }

        $scope.title =  '存储设置';
        $scope.modalButtons = [
            {
                action: save,
                text: "确定", class: "btn-primary",
                disabled: function () {
                    if ($scope.entity.name && $scope.entity.attributes.storeType) {
                        if($scope.entity.attributes.path || ($scope.entity.attributes.storeType != "HDFS" &&
                                $scope.entity.attributes.storeType != "FTP")) {
                            return false;
                        }
                    }
                    return true;
                }
            },
            {
                action: $scope.cancel,
                text: "取消", class: "btn-warning"
            }
        ];

        auxo.bindEscEnterHotkey($scope)
    });