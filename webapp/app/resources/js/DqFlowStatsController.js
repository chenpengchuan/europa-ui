auxo.meta.zqstats = {
    currUrl:"/qualityAnalysis/zqstats",
    restRootPath:"/europa/zdaf/stats",
    path:"/qualityAnalysis/zqstats",
    detailTemplate : "",
    entityDisplayName:"评估结果统计",
    getBaseFilter: function() {
        return "flowStatus=SUCCEEDED";
    },
    rowHeaders : [
        {name : "_$ROWID", disName : "ID", converter : auxo.same},
        {name : "createTime", disName : "创建时间", converter : auxo.date2str},
        {name : "qualityRank_count", disName : "count", converter : auxo.same},
        {name : "qualityRank_mean", disName : "mean", converter : auxo.same},
        {name : "qualityRank_max", disName : "max", converter : auxo.same},
        {name : "qualityRank_min", disName : "min", converter : auxo.same},
        {name : "badRatio_count", disName : "count", converter : auxo.same},
        {name : "badRatio_mean", disName : "mean", converter : auxo.same},
        {name : "badRatio_max", disName : "max", converter : auxo.same},
        {name : "badRatio_min", disName : "min", converter : auxo.same}
    ],
    sort : {predicate:"", reverse:true}

};

var qaChartOption = {
    title: {
        text: '数据质量',
        subtext: '平均值'
    },
    color: ['#00CD32','#BB0000'],
    tooltip: {
        trigger: 'axis'
    },
    legend: {
        data:['default','']
    },
    toolbox: {
        show: true,
        feature: {
            dataView: {readOnly: true},
            magicType: {type: ['line', 'bar','pie']},
            restore: {},
            saveAsImage: {}
        }
    },
    xAxis:  {
        type: 'category',
        boundaryGap: false,
        data: ['周一','周二','周三','周四','周五','周六','周日']
    },
    yAxis: {
        type: 'value',
        axisLabel: {
            formatter: '{value} '
        }
    },
    dataZoom: [
        {
            type: 'slider',
            xAxisIndex: 0,
            filterMode: 'empty'
        },
        {
            type: 'inside',
            xAxisIndex: 0,
            filterMode: 'empty'
        }
    ],
    series: [
        {
            name:'name1',
            type:'line',
            data:[11, 11, 15, 13, 12, 13, 10],
            markPoint: {
                data: [
                    {type: 'max', name: '最大值'},
                    {type: 'min', name: '最小值'}
                ]
            },
            markLine: {
                data: [
                    {type: 'average', name: '平均值'}
                ]
            }
        },
        {
            name:'name2',
            type:'line',
            data:[],
            markPoint: {
                data: [
                    {type: 'max', name: '最大值'},
                    {type: 'min', name: '最小值'}
                ]
            },
            markLine: {
                data: [
                    {type: 'average', name: '平均值'}
                ]
            }
        }
    ]
};


App.controller('DqFlowStatsController', function($filter, $scope, $location, $window, $http,$stateParams, Restangular, ngDialog) {
    $scope.statsType = $stateParams.statsType || "Total";
    $scope.statsField = $stateParams.statsField;
    $scope.dateRangeFilterField = "createTime";
    $scope.sorts = "";

    $scope.rowStyles = {
        qualityRank: {'color': 'red', 'background-color': '#CCEEFC', 'text-align': 'right'},
        badRatio: {'color': 'blue', 'background-color': '#CCFFCC', 'text-align': 'right'}
    };

    // initialize statsField, fieldsSelected
    if (!$scope.statsField) {
        $scope.statsField = "qualityRank";
        $scope.fieldsSelected = {qualityRank: true, badRatio: false};
    } else {
        var fa = $scope.statsField.split(",");
        $scope.fieldsSelected = {};
        for (var f in fa) {
            $scope.fieldsSelected[fa[f]] = true;
        }
        if (!$scope.fieldsSelected.qualityRank)
            $scope.fieldsSelected.qualityRank = false;
        if (!$scope.fieldsSelected.badRatio)
            $scope.fieldsSelected.badRatio = false;
    }
    var statsFieldArr = $scope.statsField.split(",");

    auxo.meta.zqstats.restRootPath = "/europa/zdaf/stats/" + $scope.statsField + "/" + $scope.statsType;
    $scope.onStatsTypeSelected = function (s) {
        $scope.statsType = s;
        if (!$scope.statsType)
            $scope.statsType = "Total";
        if ($scope.statsField) {
            auxo.meta.zqstats.restRootPath = "/europa/zdaf/stats/" + $scope.statsField + "/" + $scope.statsType;
            auxo.go("/qualityAnalysis/zqstats/" + $scope.statsField + "/" + $scope.statsType + "?");
        }
    }

    $scope.refreshStatPage = function () {
        if ($scope.statsField) {
            auxo.meta.zqstats.restRootPath = "/europa/zdaf/stats/" + $scope.statsField + "/" + $scope.statsType;
            auxo.go("/qualityAnalysis/zqstats/" + $scope.statsField + "/" + $scope.statsType + "?");
        }
    }

    $scope.onStatsFieldsSelected = function() {
        $scope.statsField = "";
        console.log($scope.fieldsSelected);
        if ($scope.fieldsSelected["qualityRank"] == true && $scope.fieldsSelected["badRatio"] == true) {
            $scope.statsField = "qualityRank,badRatio";
            $scope.sorts = "qualityRank";
        } else
        if ($scope.fieldsSelected["qualityRank"] == true) {
            $scope.statsField = "qualityRank";
            $scope.sorts = "qualityRank";
        } else
        if ($scope.fieldsSelected["badRatio"] == true) {
            $scope.statsField = "badRatio";
            $scope.sorts = "badRatio";
        } else
            return;
        statsFieldArr = $scope.statsField.split(",");
        $scope.onStatsTypeSelected($scope.statsType);
        $scope.refreshStatPage();
    }

    $scope.statTimeScope = [
        {id:"Total", name:"总计"},
        {id:"processDataId", name:"按分析数据统计"},
        {id:"modelName", name:"按模板统计"},
        {id:"datamon", name:"按月统计"},
        {id:"dataday", name:"按日统计"}
    ];
    $scope.statTypeDesc = {};
    for (var i in $scope.statTimeScope) {
        $scope.statTypeDesc[$scope.statTimeScope[i].id] = $scope.statTimeScope[i].name;
    }

    $scope.fieldsOption = [
        {id:"qualityRank", name:"质量评级", value: true},
        {id:"badRatio", name:"坏数据占比", value: false}
    ];

    $scope.statCalcFields = [
        {id:"qualityRank", sortName:"", name:"质量评级", func: ""},
        {id:"qualityRank", sortName:"qualityRank_count", name:"总数", func: "count"},
        {id:"qualityRank", sortName:"qualityRank_mean", name:"平均值", func: "mean"},
        {id:"qualityRank", sortName:"qualityRank_max", name:"最大值", func: "max"},
        {id:"qualityRank", sortName:"qualityRank_min", name:"最小值", func: "min"},
        {id:"badRatio", sortName:"", name:"坏数据占比", func: ""},
        {id:"badRatio", sortName:"badRatio_count", name:"总数", func: "count"},
        {id:"badRatio", sortName:"badRatio_mean", name:"平均值", func: "mean"},
        {id:"badRatio", sortName:"badRatio_max", name:"最大值", func: "max"},
        {id:"badRatio", sortName:"badRatio_min", name:"最小值", func: "min"}
    ];

    $scope.statCalcTotal = [
        {id:"Total", name:"质量评级", func: ""},
        {id:"Total", name:"总数", func: "count"},
        {id:"Total", name:"平均值", func: "mean"},
        {id:"Total", name:"最大值", func: "max"},
        {id:"Total", name:"最小值", func: "min"}
    ];

    $scope.valueAggTypes = [
        {name:"总数", value:"count"},
        {name:"平均值", value:"mean"},
        {name:"最大值", value:"max"},
        {name:"最小值", value:"min"}
        //{name:"偏差", value:"stddev"},
    ];

    $scope.valueTypeFilter = "mean";
    var myChart = null;

    $scope.drawChart = function(aggTypeSelected)
    {
        if (statsFieldArr && $scope.statsType && $scope.statsType != "Total" && $scope.rowCollection && $scope.rowCollection.length > 0) {
            var content = $scope.rowCollection;
            var xAxis=[];
            var chartData = [];
            for (var ai in statsFieldArr)
                chartData[ai] = [];

            if(content.length > 0){
                if (!myChart)
                    myChart = echarts.init(document.getElementById('dataquality_id'));
                qaChartOption.title.text = '数据质量: ' + $scope.statTypeDesc[$scope.statsType];
                for (var i in $scope.valueAggTypes) {
                    if ($scope.valueAggTypes[i].value == aggTypeSelected)
                        qaChartOption.title.subtext = $scope.valueAggTypes[i].name;
                }
                for(var rt in content){
                    xAxis[rt] = content[rt]._$ROWID;
                    for (var ai in statsFieldArr) {
                        chartData[ai][rt] = content[rt][$scope.statsType][statsFieldArr[ai]][aggTypeSelected];
                    }
                }
                qaChartOption.legend.data = statsFieldArr;
                qaChartOption.xAxis.data = xAxis;
                qaChartOption.series = new Array(statsFieldArr.length);
                for (var ai in statsFieldArr) {
                    qaChartOption.series[ai] = {type:'line', data:[], markLine: {data:[]}, markPoint:{data:[]}};
                    qaChartOption.series[ai].name= statsFieldArr[ai];
                    qaChartOption.series[ai].data= chartData[ai];
                }
                myChart.setOption(qaChartOption);
            }
        }
    };

    CrudBaseController.call(this, auxo.meta.zqstats, $scope, $location, $window, $http, Restangular, ngDialog, $filter);

});

