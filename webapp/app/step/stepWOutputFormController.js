App.controller("StepWOutputFormController", function($scope, Restangular, sgDialogService) {

    var tab = $scope.tab;
    var dataflow = $scope.$parent.dataflow

    var node = $scope.editingNode;

    var isInput = $scope.isInput = tab.category === 'Input'

    $scope.allSelected = false;
    $scope.leftList =  {label: "备选变量", items: [], dragging: false, "allowedTypes": [""],};
    $scope.rightList =  {label: "已选变量", items: [], dragging: false};
    $scope.dragDisabled = false;
    $scope.selectList = [];

    function buildLeftList() {
         if(tab.rawOutput) {
            auxo.forEachArray(tab.rawOutput,function (e,i) {
                $scope.leftList.items.push({name: e.name,  alias: '', valid: true})
            })
        }
    }

    function buildRightList () {
        var mapping = tab.data;
        auxo.forEachArray(mapping, function (e, i) {
            $scope.rightList.items.push({name: e.name, alias: e.alias, valid: true})
        })
    }

    function syncData() {
        auxo.array.removeAll(tab.data)
        auxo.forEachArray($scope.rightList.items, function (e, i) {
            if(e.name && e.alias)
                tab.data.push({name: e.name, alias: e.alias})
        })
    }
    $scope.onChange =function (item) {
        if(!item.valid)
            auxo.forEachArray($scope.leftList.items, function (e,i) {
                if(e.name === item.name) {
                    item.valid = true;
                    return false;
                }
            })

        syncData()
    }

    auxo.list2List.call(this, $scope, syncData);

    buildLeftList()
    buildRightList()
});
