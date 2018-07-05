angular.module('AuxoApp')
    .controller('SuperEditController', function ($scope, modalInstance) {
        //need $scope.obj
        $scope.closeModal = function () {
            modalInstance.closeModal(false)
        }

        function ok() {
            modalInstance.closeModal($scope.json)
        }

        $scope.title =  'SuperEdit';
        $scope.modalButtons = [
            {
                action: ok,
                text: "确定", class: "btn-primary"
            },
            {
                action: $scope.closeModal,
                text: "取消", class: "btn-warning"
            }
        ];
    });