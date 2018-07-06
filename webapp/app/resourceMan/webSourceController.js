angular.module('AuxoApp')
    .controller('EditWebSourceController', function ($scope, $window, $http, $stateParams, $location, ngDialog, Restangular, modalInstance) {
        var isNew = !$scope.editingNode || !$scope.editingNode.id;

        $scope.error="";
//定义entity
        $scope.entity={
            id:"",
            name:"",
            type:"HTTP",
            description:"",
            attributes: {
                method:"GET",
                rootPath:"",
                parameters:"",
                url:"",
                properties:[{name:"",value:""}]
            }
        };

        angular.extend($scope.entity, $scope.editingNode);

        $scope.entityCopy = $scope.editingNode;
        $scope.entityCopy.type = $scope.editingNode.type = $scope.entity.type = "HTTP";
//定义显示内容

        $scope.meta = {
            title: "数据源设置",
            fields : [
                        {$name: "name", label: "名称",type:"String",  tooltip: ["汉字,字母,数字和下划线的组合,长度4-30，同一目录下唯一"],
                            maxLength:100, minLength:1, noMatch:/[^\u4e00-\u9fbfa-zA-Z0-9_]/g, noMatchMsg: "汉字,字母,数字和下划线的组合!",
                            data: $scope.entity
                        },
                        {$name: "description", label: "描述",type:"String", data: $scope.entity, tooltip: "描述", validator:"", isOptional: function () {return true; }},

                        {$name: "rootPath", label: "根路径",type:"String", data: $scope.entity.attributes, tooltip: ['根路径'], validator:"" ,isOptional: function () {return true; }},
                        {$name: "method", label: "获取类型",type:"Select", data: $scope.entity.attributes,selectObjEnum:[{value:"GET", name:"GET"},{value:"POST",name:"POST"}]},
                        {$name: "url", label: "URL",type:"String", data: $scope.entity.attributes, tooltip: [''], validator:""},
                        {$name: "properties", label: "其他参数",type:"DataFrame",data: $scope.entity.attributes,  validator:"",
                            hidden:function (item) { return (currentDBMeta && currentDBMeta.driverEditable) },
                            content: [
                                {
                                    $name: 'name',
                                    label: '参数',
                                    type: 'String',
                                    optional: true,
                                    onChange: $scope.onChange
                                },
                                {
                                    $name: 'value',
                                    label: '值',
                                    type:"String",
                                    optional: true,
                                    onChange: $scope.onChange
                                }
                            ]
                        }
                    ],
            itemValidator:function (item) {
                $scope.error = "";
                var v = item.data[item.$name] +"";
                if($scope.entityCopy && v === $scope.entityCopy[item.$name])
                    return;

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
            },
            init: function () {
                auxo.array.forEach($scope.meta.fields, function (item) {
                    if(item.tooltip) {
                        item.tooltip = auxo.tooltips(item.tooltip);
                    }

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
                        if($scope.entityCopy && v === $scope.entityCopy[i.$name])
                            return;

                        $scope.meta.itemValidator(i);
                        if($scope.error)
                            return;
                        if(i.validator2)
                            i.validator2(i);
                        if(!$scope.error) {
                            auxo.array.forEach($scope.meta.fields,function (f) {
                                $scope.meta.itemValidator(f);
                                if($scope.error)
                                    return "break";
                                if(f.validator2)
                                    f.validator2(f);
                                if($scope.error)
                                    return "break";
                            })
                        }
                    }
                })
            }
        }

//判断是都符合要求
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

//保存
        $scope.save = function() {
            $scope.validate();
            if($scope.error)
                return;
            $scope.saving = true;
            if($scope.entity.enabled == "正常"){
                $scope.entity.enabled = 1;
            }else $scope.entity.enabled =0;

            if($scope.entity.resType){
                delete $scope.entity.resType;
            }
            var entityCopy = auxo.clone($scope.entity);

            if (isNew) {
                Restangular.all("europa/datasource").post(entityCopy).then(
                    function(resp){
                        $scope.saving = false;
                        yes(resp.id)
                    },
                    function(es) {
                        $scope.saving = false;
                        auxo.showErrorMsg(es);
                    });
            } else {
                if(entityCopy.isSelected){
                    delete entityCopy.isSelected
                }
                Restangular.one("europa/datasource", entityCopy.id)
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

//确定时的判断
        function yes(data) {
            auxo.delHotkey($scope)
            modalInstance.closeModal(data);
        }

//取消
        $scope.cancel = function () {
            auxo.delHotkey($scope)
            modalInstance.closeModal(false)
        }

//关闭
        $scope.closeModal = function () {
            $scope.cancel();
        }

//按钮设置
        $scope.title =  '数据源设置';
        $scope.modalButtons = [
            {
                action: $scope.save,
                text: "确定", class: "btn-primary",
                disabled: function () {
                    if ($scope.entity.attributes.url && $scope.entity.name)
                        return false;
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

