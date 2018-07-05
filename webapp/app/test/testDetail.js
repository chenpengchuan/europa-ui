/**
 * Created by youguili on 2016/9/19.
 */
angular.module('AuxoApp')
    .controller('testDetailController', ['$rootScope', '$scope', '$location', '$stateParams', 'Auth','Restangular',
        function($rootScope, $scope, $location,$stateParams, Auth, Restangular) {
            var id=$stateParams.id;
            var tagUrl=$stateParams.urls;
            var select=$stateParams.select;
            var isNew = true;
            if(id && id != 'new' && id.length > 0)
                isNew = false;

            $scope.isNew = isNew;
            var entitys;

            if (isNew) {
                $scope.entity={ };
            }else {
                Restangular.one(tagUrl, id).get().then(function(entity) {
                    entitys=$scope.entity = entity;
                    $scope.entity=angular.toJson($scope.entity,true);

                    /*$scope.name = entity.name;
                    $scope.id =entity.id;
                    $scope.password = entity.password;
                    $scope.role = entity.roles[0].replace(/ROLE_/, '');
                    console.log("user: " + JSON.stringify(entity))*/
                });
            }

            $scope.save = function() {
                $scope.saving = true;
                $scope.entity=angular.fromJson($scope.entity);
                for(var i in entitys){
                    /*if($scope.entity[i]&&entitys[i]!=$scope.entity[i]){
                        entitys[i]=$scope.entity[i];
                    }*/
                    if(!$scope.entity[i])
                        $scope.entity[i]=entitys[i];

                }
                if (!$scope.isNew) {
                    Restangular.all(tagUrl).post($scope.entity).then(
                        function(){
                            $scope.saving = false;
                            $location.path("/test_page/" + tagUrl+'/'+select);
                            //document.location.hash = "/test_page/" + tagUrl+'/'+select;
                        },
                        function(es) {
                            $scope.saving = false;
                            $scope.error = es.err;
                        });
                }else {
                    $scope.entity.put().then(
                        function(){
                            $scope.saving = false;
                            $location.path("/test_page/" + tagUrl+'/'+select);
                            //document.location.hash = "/test_page/" + tagUrl+'/'+select;
                        },
                        function(es) {
                            $scope.saving = false;
                            $scope.error = es.err;
                        });
                }
            }

            $scope.cancel = function() {

               // document.location.hash = "/test_page/" + tagUrl+'/'+select;
                auxo.goBack();
            }

        }]);