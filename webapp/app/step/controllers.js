
function StepBaseController(meta, $scope, Restangular) {

    /**
     * meta MUST contains fields:
     *
     * (1) restRootPath = "flows"
     * (2) entityDisplayName = "流程"
     * (3) getBaseFilter
     * (4) rowHeaders = [{name : "name", disName : "名称", converter : auxo.same}, ..]
     */

    $scope.limit = 10;

    for (var mf in meta) {
        this[mf] = meta[mf];
        $scope[mf] = meta[mf];
    }

    $scope.tagfacets = [];

    this.ptableState = {}

    $scope.rowCollection = [];

    if($scope.view === undefined)
        $scope.view = {currentPageNumber:1};

    $scope.selectedRows = [];

    $scope.tagfilters = {};

    auxo.initTagsAndTagColorMap(Restangular, $scope);
    if (!$scope.sort) {
        var predicate = 'createTime';
        angular.forEach($scope.rowHeaders, function (e) {
            if(e.name === 'lastModifiedTime')
                predicate = e.name;
        })
        $scope.sort = {predicate : predicate , reverse : true}
    }

    $scope.reloadPage = function(limit) {
        $scope.limit = limit;
        $scope.changeCurrentPageNumber(1);
    }

    $scope.changeCurrentPageNumber = function(cp) {
        if (cp < 1) {
            cp = 1;
        }else if (cp > $scope.totalPages) {
            cp = $scope.totalPages;
        }
        $scope.view.currentPageNumber = cp;
        $scope.ptableState.pagination.start = cp - 1;
        $scope.fetchPage($scope.ptableState);
    }

    $scope.doTagFilter = function() {
        $scope.changeCurrentPageNumber(1);
    }

    $scope.doQuery = function(queryWord) {
        $scope.queryWord = queryWord;
        $scope.tagfilters = [];
        $scope.changeCurrentPageNumber(1);
    }

    function findSortIndex(name, $scope) {
        for (var i = 0; i < $scope.rowHeaders.length; i++) {
            if ($scope.rowHeaders[i].name == name) {
                return $scope.rowHeaders[i].sortName || name;
            }
        }
    }

    function computeQueryWord(qw) {
        return qw;
    }

    $scope.fetchPage = function(tableState) {
        var queryWord = computeQueryWord($scope.queryWord);
        var tagfacets = $scope.tagfacets = []
        $scope.ptableState = tableState;
        var filter = $scope.getBaseFilter();
        var ftags = [];
        var sorts = "";

        if (!tableState.sort.predicate) {
            tableState.sort.predicate = $scope.sort.predicate;
            tableState.sort.reverse = $scope.sort.reverse;
        }

        sorts = (tableState.sort.reverse ? "-" : "+") + findSortIndex(tableState.sort.predicate, $scope)

        for (var tag in $scope.tagfilters) {
            if ($scope.tagfilters[tag]) {
                ftags.push(tag);
            }
        }

        if (ftags.length > 0) {
            if (filter.length > 0) {
                filter += "&";
            }
            filter += "tags="+ftags.join("|")
        }

        Restangular.one($scope.restRootPath).get({query : queryWord, offset: tableState.pagination.start * $scope.limit, limit : $scope.limit, filter : filter, sorts : sorts})
            .then(function(facetResult){
                $scope.rowCollection = facetResult.content;
                $scope.total = facetResult.total;
                $scope.totalPages = facetResult.totalPages;
                var fc = facetResult.facetContent;
                for (var fci in fc) {
                    if ( fc[fci].field == "status_stype") {
                        if ($scope[fc[fci].facet.toLowerCase()+"Tab"]) {
                            $scope[fc[fci].facet.toLowerCase()+"Tab"].count = fc[fci].count;
                        }
                    } else {
                        tagfacets.push({name : fc[fci].facet, count : fc[fci].count, color : $scope.tagsColorMap[fc[fci].facet]})
                    }
                }
                console.log("tagfacets: " + JSON.stringify($scope.tagfacets))
            })
    }

    function getSelectRowIds() {
        var ids = [];
        for (var i = 0; i < $scope.selectedRows.length; i++) {
            ids.push($scope.selectedRows[i].id);
        }
        return ids;
    }
}

App.controller('StepPopupController', function StepPopupController($scope, Restangular, modalInstance) {

    /*
       The input parameter is assigned to $scope.inputData with format like { route: 'flows', filter: '', title: ''}
   */
    $scope.title = "查询";
    $scope.forCallback = "Return to caller";
    $scope.selections = [];
    $scope.selectedRows = [];

    $scope.multiple = false;
    $scope.keyword = 'name';

    if($scope.inputData.multiple)
        $scope.multiple = true;

    if($scope.inputData.keyword && $scope.inputData.keyword.length>0)
        $scope.keyword = $scope.inputData.keyword;

    if($scope.inputData.values) {
        var array = $scope.inputData.values.split(/,|;|:/)
        for(var i in array) {
            $scope.selections.push({text: $.trim(array[i])});
        }
    }

    $scope.$watchCollection('selectedRows', function () {
        console.log("$scope.selectedRows: " + JSON.stringify($scope.selectedRows))
        if($scope.selectedRows.length > 0) {
            var existed = false
            for(var i in $scope.selections) {
                if($scope.selections[i] && $scope.selections[i].text == $scope.selectedRows[0][ $scope.keyword]){
                    existed = true;
                    break;
                }
            }
            if(!existed)
                $scope.selections.push({text: $scope.selectedRows[0][ $scope.keyword]})
        }
    });

    $scope.loadTags = function () {
        return [];
    }

    $scope.ok = function () {
        if(isOkDisabled())
            return;
        if($scope.multiple) {
            $scope.forCallback = [];
            for(var i in $scope.selections) {
                if($scope.selections[i])
                    $scope.forCallback.push($scope.selections[i].text)
            }
        } else
            $scope.forCallback = $scope.selectedRows[0][$scope.keyword];
        auxo.delHotkey($scope);
        modalInstance.closeModal({value:$scope.forCallback,id:$scope.selectedRows[0].id,selectedRow:$scope.selectedRows[0]});
    }

    $scope.cancel = function () {
        auxo.delHotkey($scope)
        modalInstance.closeModal()
    }

    function isOkDisabled() {
        if($scope.multiple){
            if($scope.selections && $scope.selections.length > 0)
                return false;
        }
        if($scope.selectedRows && $scope.selectedRows.length > 0)
            return false;
        return true;
    }

    $scope.modalButtons =[
        {
            action:$scope.ok,
            text:"确定",class:"btn-primary",
            disabled: isOkDisabled
        },
        {
            action: $scope.cancel,
            text:"取消",class:"btn-warning"
        }
    ];
    $scope.closeModal = $scope.cancel

    $scope.openAlert = function(text){
        sgDialogService.alert(text);
    }

    var meta = {
        restRootPath:"schemas",
        entityDisplayName:"Schema",
        getBaseFilter: function() {
            return "";
        },
        rowHeaders : [
            {name : "id", disName : "id", converter : auxo.same, visible: false},
            {name : "name", disName : "名称", converter : auxo.same, visible: true},
            {name : "createTime", disName : "创建时间", converter : auxo.date2str, visible: false},
            {name : "lastModifiedTime", disName : "修改时间", converter : auxo.date2str, visible: true}
        ]
    };

    // inputData.route enum: schemas, flows
    if($scope.inputData.route)
        meta.restRootPath = $scope.inputData.route;
    if($scope.inputData.filter) {
        meta.getBaseFilter = function () {
            return $scope.inputData.filter;
        }
    }

    if($scope.inputData.title)
        $scope.title =   $scope.title + $scope.inputData.title;

    StepBaseController.call(this, meta, $scope, Restangular)

    $scope.isSchema = function () {
        return meta.restRootPath === "schemas";
    }
    $scope.isDataset = function () {
        return meta.restRootPath === "datasets";
    }
    $scope.isFlow = function () {
        return meta.restRootPath === "flows";
    }
    $scope.isProcessConfig = function () {
        return meta.restRootPath === "processconfigs";
    }
    $scope.isSource = function () {
        return meta.restRootPath === "source";
    }
    $scope.isRule = function () {
        return meta.restRootPath === "europa/rule";
    }

    auxo.bindEscEnterHotkey($scope)
});