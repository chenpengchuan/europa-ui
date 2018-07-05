
App.controller('JobanalysisController', function JobanalysisController($filter, $scope, $location, $window, $http,$stateParams, Restangular, ngDialog) {
    CrudBaseController_hippo.call(this, auxo.meta.execute, $scope, $location, $window, $http, Restangular, ngDialog, $filter);
     var week=getWeek();
     var days=[];
     var filter_execute='';
     var executes=[];
     var Jobinit=function(){
         filter_execute='';
         var lastmodifiedTime = $scope.getDateRangeFilter();
         if(lastmodifiedTime .length>0){
            days=getAll($scope.startDate,$scope.endDate);
            filter_execute=filter_execute+lastmodifiedTime;
         }else{
            days=getAll(week[1],week[8]);
            filter_execute=filter_execute+'lastModifiedTime=['+week[0]+' TO '+week[7]+']';
         }
         if($scope.flowTypeFilter!='all'){
            filter_execute=filter_execute+'&flowType='+$scope.flowTypeFilter;
         }
         if($scope.dateTypeFilter != 'day'){
             days=getHours(days);
          }
         executes =InitializeData(days.length);
     }
    Jobinit();
    if(!($scope.systemFlag)){
        Restangular.one("jobs", "stats").get({groupFields:$scope.dateTypeFilter,query : $scope.queryWord, offset:0, limit : 0, filter : filter_execute, sorts : '-createTime'}).then(function(rt) {
            executes=getTaskHistoryData(days,rt.facetContent.sort(by("facet")),executes);
            var legend=['执行'];
            drawing_jobanalysis(jobanalysis_option,'jobanalysis_id',days,legend,executes);
        });
    }else{
        //按系统类别统计
        var groupfields=$scope.dateTypeFilter;
        var systems=['rhinos','zebra'];
        Restangular.one("jobs/stats/bysys").get({system:systems,groupFields:groupfields,query : $scope.queryWord, offset:0, limit : 0, filter : filter_execute, sorts : '-createTime'}).then(function(rt) {
            for(var i in systems){
                executes[i]=InitializeData(days.length);
                executes[i]=getTaskHistoryData(days,rt[systems[i]].sort(by("facet")),executes[i])
            }
            drawing_systaskhistory(jobanalysisSystem_option,'jobanalysis_id',systems,days,executes);
        });
    }
});


//任务趋势按系统分类分析画堆叠图
 	var drawing_systaskhistory = function(option,id,legend,xAxis,datas){
 	   //alert('drawing_taskhistory');
     　　var myChart = echarts.init(document.getElementById(id));
          option.legend.data=legend;
          option.xAxis[0].data= Dataformate(xAxis);
          for(var i=0;i<option.series.length;i++){
            option.series[i].data=datas[i];
          }
         myChart.setOption(option);
         window.onresize = myChart.resize;
     }
