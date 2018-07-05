
App.controller('DqRuleCategoryController', function DqRuleCategoryController($scope, $window, $http, $stateParams, $location, ngDialog, Restangular, sgDialogService, Auth) {
    $scope.role = Auth.user.role.title;
    console.log($scope.role);

    var id = $stateParams.id;

    $scope.treeOptions = {
        nodeChildren: "children",
        dirSelectable: true,
        multiSelection: false,
        injectClasses: {
            ul: "a1",
            li: "a2",
            liSelected: "a7",
            iExpanded: "a3",
            iCollapsed: "a4",
            iLeaf: "a5",
            label: "a6",
            labelSelected: "a8"
        }
    };

    $scope.treeData =
        [
            { "name" : "数据类型", "value" : "", "children" : [
                { "name" : "列", "value" : "Data-Field", "children" : [
                    { "name" : "任意", "value" : "Field-Any" },
                    { "name" : "数值", "value" : "Field-Number" },
                    { "name" : "字符串", "value" : "Field-String" },
                    { "name" : "日期", "value" : "Field-Date" }
                ]},
                { "name" : "其它", "value" : "Data-Other"}
            ]},
            { "name" : "内建", "value" : "Builtin"},
            { "name" : "扩展", "value" : "Custom-Extend" },
            { "name" : "表达式", "value" : "Custom-EL" },
            { "name" : "SQL", "value" : "Custom-SQL" }
        ];

    $scope.expandedNodes = [$scope.treeData[0],
        $scope.treeData[2],
        $scope.treeData[0].children[0]];

    $scope.showSelected = function (node) {
        $scope.$parent.doRuleFilter(node)
    };

});

