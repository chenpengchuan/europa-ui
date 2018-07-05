App.controller("StepWInputFormController", function($scope, Restangular, sgDialogService) {

    var tab = $scope.tab;
    var dataflow = $scope.$parent.dataflow

    var node = $scope.editingNode;

    var isInput = $scope.isInput = tab.category === 'Input'


    $scope.allSelected = false;
    $scope.leftList =  {label: "备选变量", items: [], dragging: false, "allowedTypes": [""],};
    $scope.rightList =  {label: "已选变量", items: [], dragging: false};
    $scope.dragDisabled = false;
    $scope.selectTargetList = [];
    $scope.selectSourceList = [];


    function buildSelectTargetList() {
        if(tab.rawInput) {
            auxo.forEachArray(tab.rawInput, function (e) {
                $scope.selectTargetList.push(e.name)
            })
        }
    }

    function buildLeftList() {
        if(tab.sourceOutputs) {
            auxo.forEachArray(tab.sourceOutputs,function (e,i) {
                $scope.leftList.items.push({source: e, target: '', valid: true})
                $scope.selectSourceList.push(e);
            })
        }
    }

    function buildRightList () {
        var mapping = tab.data;
        auxo.forEachArray(mapping, function (e, i) {
            $scope.rightList.items.push({source: e.source, target:e.name,  valid: true})
        })
    }

    function syncData() {
        auxo.array.removeAll(tab.data)
        auxo.forEachArray($scope.rightList.items, function (e, i) {
            if(e.target && e.source)
                tab.data.push({name: e.target, source: e.source})
        })
    }
    $scope.onChange =function (item) {
        if(!item.valid)
            auxo.forEachArray($scope.leftList.items, function (e,i) {
                if(e.source === item.source) {
                    item.valid = true;
                    return false;
                }
            })

        syncData()
    }

    auxo.list2List.call(this, $scope, syncData);

    buildSelectTargetList()
    buildLeftList()
    buildRightList()

});
