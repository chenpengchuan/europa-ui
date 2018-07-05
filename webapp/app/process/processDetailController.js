angular.module('AuxoApp')
    .controller('processDetailController', function (readOnly, $state, $filter, $rootScope, $scope, $location, $window, $http, $stateParams, Restangular) {
        $scope.initialise = function () {
            $scope.go = function (state) {
                $state.go(state);
            };

            $scope.tabData = [
                {
                    heading: '<i class="glyphicon mdi mdi-file-document text-info"></i><span class="left-margin-5">设计</span>',
                    route: 'design.process_detail.design'
                },
                {
                    heading: '<i class="glyphicon mdi mdi-calendar-clock text-info"></i><span class="left-margin-5">计划</span>',
                    route: 'design.process_detail.plan',
                    disable: readOnly
                },
                {
                    heading: '<i class="glyphicon glyphicon-list text-info"></i><span class="left-margin-5">执行历史</span>',
                    route: 'design.process_detail.execution_history',
                    disable: readOnly
                },
                {
                    heading: '<i class="glyphicon glyphicon-list text-info"></i><span class="left-margin-5">执行详细</span>',
                    route: 'design.process_detail.execution',
                    disable: readOnly
                }
            ];
        };
        $scope.initialise();
    });
