/**
 * Created by youguili on 2016/9/21.
 */
angular.module('AuxoApp')
    .controller('testModalController', ['$rootScope', '$scope', '$location', '$stateParams', 'Auth','Restangular','modalInstance',
        function($rootScope, $scope, $location,$stateParams, Auth, Restangular,modalInstance) {
            var id=$scope.rowID;
            $scope.isNew = true;
            if(id && id != 'new' && id.length > 0)
                $scope.isNew = false;

            $scope.title = '更新';
            //var entitys=$scope.entity=angular.toJson($scope.rowData,true);
            $scope.tagUrl=$scope.tagUrl?$scope.tagUrl:"users";

            var oldEntity;
            if ($scope.isNew) {
                $scope.entity={ };
            }else {
                Restangular.one($scope.tagUrl, $scope.rowID).get().then(function(entity) {
                    oldEntity = $scope.entity = entity;
                    $scope.entity=angular.toJson($scope.entity,true);
                });
            }

            $scope.save = function() {
                $scope.saving = true;
                $scope.entity=angular.fromJson($scope.entity);
                if(!$scope.isNew) {
                    for (var i in oldEntity) {
                        if (!$scope.entity[i])
                            $scope.entity[i] = oldEntity[i];
                    }
                }

                if (!$scope.isNew) {
                    Restangular.all($scope.tagUrl).post($scope.entity).then(
                        function(){
                            $scope.saving = false;
                            modalInstance.closeModal($scope.entity);
                        },
                        function(es) {
                            $scope.saving = false;
                            $scope.error = es.err;
                        });
                }else {
                    Restangular.all($scope.tagUrl).post($scope.entity).then(
                        function(){
                            $scope.saving = false;
                            // $location.path("/test_page");
                            modalInstance.closeModal($scope.entity);
                        },
                        function(es) {
                            $scope.saving = false;
                            $scope.error = es.err;
                        });
                }
            }

            $scope.cancel = function () {
                modalInstance.closeModal()
            }

            $scope.modalButtons =[
                {
                    action:$scope.save,
                    text:"确定",class:"btn-primary",
                    disabled: function(){  return  $scope.error;}
                },
                {
                    action:$scope.cancel,
                    text:"取消",class:"btn-warning"
                }
            ];

        }
]);