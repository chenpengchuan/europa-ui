App.controller("ModalInstanceController", function ($scope, $http, $location) {

    $scope.items = [ 'angularjs', 'backbone', 'canjs', 'Ember', 'react' ];

    $scope.selected = {
        item: $scope.items[0]
    };

    // ok click
    $scope.ok = function () {
        $modalInstance.close($scope.selected.item);
    };

    // cancel click
    $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
    }

});