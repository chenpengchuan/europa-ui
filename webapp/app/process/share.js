angular.module('AuxoApp')
    .controller('ProcessShareController', function ($filter, $scope, $location, $window, $http,$stateParams, Restangular,ngTreetableParams,modalInstance, ngDialog) {
        var isNew = !$scope.editingNode || !$scope.editingNode.sharedUsers || !$scope.editingNode.sharedUsers.length ;

        $scope.error="";

        if(isNew)
            delete $scope.editingNode.sharedUsers;
        else {
            var list = [];
            auxo.array.forEach($scope.editingNode.sharedUsers, function (e) {
                var arr = e.split(":")
                list.push({tenant: arr[0], user: arr[1], rights: arr[2]})
            })
            $scope.editingNode.sharedUsers = list;
        }

        $scope.entity= {sharedUsers: [{tenant:"default", user:"", rights:"r"}]};
        angular.extend($scope.entity, $scope.editingNode);

        $scope.meta = {
            title: "标准编辑",
            fields : [
                {
                    $name:"sharedUsers",
                    label:"共享列表",
                    type:"DataFrame",
                    data:$scope.entity,
                    newItem: function () { return {tenant: auxo.Auth.user.tenant, user:"", rights:"r"} },
                    content: [
                        auxo.form.buildItem({$name: 'tenant', label: '租户ID',minLength:1,illegal:"[^a-zA-Z0-9_.]", tooltip: ["合法的字符为字母,数字和下划线!"]}),
                        auxo.form.buildItem({$name: 'user', label: '用户登录名',minLength:1,illegal:"[^a-zA-Z0-9_]", tooltip: ["合法的字符为字母,数字和下划线!"]}),
                        auxo.form.buildItem({$name: 'rights', label: '权限', selectObjEnum:[{name:"只读",value:"r"},{name:"读写",value:"rw"}]})
                    ]
                }
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

            auxo.array.forEach($scope.entity.sharedUsers, function (e) {
                if(!e.tenant) {
                    $scope.error ="租户不能为空值"
                } else if (!e.user) {
                    $scope.error ="用户名不能为空值"
                }
            })

            return !$scope.error;
        }

        function save() {
            $scope.validate();
            if($scope.error)
                return;
            var sharedUsers = auxo.clone($scope.entity.sharedUsers);
            //adjust data begin
            //adjust data end
            Restangular.all("europa/process").customPOST(sharedUsers, 'update/share', {
                id: $scope.editingNode.id
            }).then(
                function(resp){
                    $scope.cancel();
                },
                function(es) {
                    auxo.showErrorMsg(es);
                });
        }

        // cancel click
        $scope.cancel = function () {
            auxo.delHotkey($scope)
            modalInstance.closeModal(false)
        }

        $scope.closeModal = function () {
            $scope.cancel();
        }

        $scope.title =  '标准编辑';
        $scope.modalButtons = [
            {
                action: save,
                text: "确定", class: "btn-primary",
                disabled: function () {
                    if ($scope.entity.sharedUsers && !$scope.error)
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