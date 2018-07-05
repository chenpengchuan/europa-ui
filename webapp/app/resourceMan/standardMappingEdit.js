angular.module('AuxoApp')
.controller('StandardMappingEditController', function ($filter, $scope, $location, $window, $http,$stateParams, Restangular,ngTreetableParams,modalInstance, ngDialog) {
        var isNew = !$scope.editingNode || !$scope.editingNode.id;

        $scope.error="";

        $scope.entity={id:"", sId:"", source:"", target:"",index:0};
        angular.extend($scope.entity, $scope.editingNode);

        $scope.meta = {
            title: "标准编辑",
            fields : [
                auxo.form.buildItem( { $name: 'source', label: '源', tooltip:["映射源"], selectEnum:$scope.sourceItems}),
                auxo.form.buildItem( { $name: 'target', label: '目标', tooltip:["映射目标"], optional:true, selectEnum:$scope.targetItems}),
                auxo.form.buildItem( { $name: 'target', label: '其它', tooltip:["手动输入目标"], optional:true}),
            ],
            init: function () {
                auxo.array.forEach($scope.meta.fields, function (item) {
                    if(item.tooltip) {
                        item.tooltip = auxo.tooltips(item.tooltip);
                    }
                    item.input_length_class = "col-sm-12";
                    item.label_length_class = "col-sm-12";
                    item.label_align = "left";
                    item.data = $scope.entity;

                    item.validator2 = item.validator;
                    item.validator = function (i) {
                        $scope.error = "";
                        var v = i.data[i.$name];
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

            var e = $scope.entity;
            if(!e.source) {
                $scope.error ="源不能为空"
            } else if (!e.target) {
                $scope.error ="目标不能为空值"
            }

            return !$scope.error;
        }

        function save() {
            $scope.validate();
            if($scope.error)
                return;
            var entityCopy = auxo.clone($scope.entity);
            yes(entityCopy);
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

        $scope.title =  '映射编辑';
        $scope.modalButtons = [
            {
                action: save,
                text: "确定", class: "btn-primary",
                disabled: function () {
                    if ($scope.entity.source && $scope.entity.target && !$scope.error)
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