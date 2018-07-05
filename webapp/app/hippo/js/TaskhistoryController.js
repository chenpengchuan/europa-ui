App.controller('TaskhistoryController', function TaskhistoryController($filter, $scope, $location, $window, $http,$stateParams, Restangular, ngDialog) {
 CrudBaseController_hippo.call(this, auxo.meta.execute, $scope, $location, $window, $http, Restangular, ngDialog, $filter);
 //首次进入tasks/history加载的数据
 var week=getWeek();
 var days=[];
 var filter='';
 var success=[];
 var failed=[];
 var Historyinit=function(){
     filter='';
     var lastmodifiedTime = $scope.getDateRangeFilter();
     if(lastmodifiedTime.length >0){
        days=getAll($scope.startDate,$scope.endDate);
        filter=filter+lastmodifiedTime;
     }else{
        days=getAll(week[1],week[8]);
        filter=filter+'lastModifiedTime=['+week[0]+' TO '+week[8]+']';
     }
     if($scope.flowTypeFilter!='all'){
        filter=filter+'&flowType='+$scope.flowTypeFilter;
     }
    if($scope.dateTypeFilter != 'day'){
        days=getHours(days);
     }
    success = InitializeData(days.length);
    failed =InitializeData(days.length);
 }
 Historyinit();
 if(!($scope.systemFlag)){
    var filter_tmp = filter+'&status_stype=SUCCEEDED';
    Restangular.one("jobs", "stats").get({groupFields:$scope.dateTypeFilter,query : $scope.queryWord, offset:0, limit : 0, filter : filter_tmp, sorts : '-createTime'}).then(function(su_rt) {
        filter_tmp = filter+'&status_stype=FAILED';
        Restangular.one("jobs", "stats").get({groupFields:$scope.dateTypeFilter,query : $scope.queryWord, offset:0, limit : 0, filter : filter_tmp, sorts : '-createTime'}).then(function(fa_rt) {
             success=getTaskHistoryData(days,su_rt.facetContent.sort(by("facet")),success);
             failed=getTaskHistoryData(days,fa_rt.facetContent.sort(by("facet")),failed);
             var legend=['成功','失败'];
            drawing_line(taskhistory_option,'taskhistory_id',days,legend,success,failed);
        });
    });
 }else{
    //按系统类别统计
    var filter_tmp = filter+'&status_stype=SUCCEEDED';
    var systems=['rhinos','zebra'];
    Restangular.one("jobs/stats/bysys").get({system:systems,groupFields:$scope.dateTypeFilter,query : $scope.queryWord, offset:0, limit : 0, filter : filter_tmp, sorts : '-createTime'}).then(function(su_rt) {
        filter_tmp = filter+'&status_stype=FAILED';
        Restangular.one("jobs/stats/bysys").get({system:systems,groupFields:$scope.dateTypeFilter,query : $scope.queryWord, offset:0, limit : 0, filter : filter_tmp, sorts : '-createTime'}).then(function(fa_rt) {
            var status=['成功','失败'];
            for(var i=0;i<systems.length;i++){
                success[i] = InitializeData(days.length);
                failed[i] = InitializeData(days.length);
                success[i]=getTaskHistoryData(days,su_rt[systems[i]].sort(by("facet")),success[i]);
                failed[i]=getTaskHistoryData(days,fa_rt[systems[i]].sort(by("facet")),failed[i]);
            }
            drawing_systaskhistory1(taskhistorySystem_option,'taskhistory_id',days,success,failed);
        });
    });
 }
});

App.controller('TaskprobabilityController', function ($filter, $scope, $location, $window, $http,$stateParams, Restangular, ngDialog) {
      CrudBaseController_hippo.call(this, auxo.meta.execute, $scope, $location, $window, $http, Restangular, ngDialog, $filter);
      var conditions='';
      var filter='';
       var Probabilityinit=function(){
         conditions=''
         filter=''
         conditions += 'Flow类型: '+$scope.flowTypeFilter+'\t';
         conditions += '系统类型: '+$scope.systemTypeFilter+'\n';
         conditions += $scope.queryWord+'\n';
         var lastmodifiedTime = $scope.getDateRangeFilter();
         if($scope.startDate !=null && $scope.endDate != null){
            conditions += $scope.startDate+'<-->'+$scope.endDate;
         }
         filter='status_stype=RUNNING';
         if(lastmodifiedTime.length>0){
            filter=filter+'&'+lastmodifiedTime;
         }
         if($scope.flowTypeFilter!='all'){
            filter=filter+'&flowType='+$scope.flowTypeFilter;
         }
         if($scope.systemTypeFilter!='all'){
            filter=filter+'&source='+$scope.systemTypeFilter;
         }
     }
     Probabilityinit();
     Restangular.one("/executions").get({query : $scope.queryWord, offset:0, limit : 10, filter : filter, sorts : '-createTime'}).then(function (result){
       // var data=[{name:'成功',value:result['成功'] },{name:'失败',value:result['失败']},{name:'杀死',value:result['杀死']}];
        var data=getProbabilityData(result);
        drawing_taskprobability(taskprobability_option,'taskprobablility_id',data,conditions);
    });
});

 //任务趋势按系统分类分析画堆叠图
 	var drawing_systaskhistory1 = function(option,id,xAxis,success,failed){
// 	   alert('drawing_taskhistory');
     　　var myChart = echarts.init(document.getElementById(id));
         option.xAxis[0].data= Dataformate(xAxis);
          for(var i=0;i<2;i++){
            option.series[i].data=success[i];
            option.series[i+2].data=failed[i];
          }
         myChart.setOption(option);
         window.onresize = myChart.resize;
     }

 //任务概率分析画图
	var drawing_taskprobability = function(option,id,datas,conditions){
	//alert('drawing_taskprobability');
    　　var myChart = echarts.init(document.getElementById(id));
        option.series[0].data= datas;
        option.title.subtext=conditions;
        //使用刚指定的配置项和数据显示图表。
        myChart.setOption(option);
        window.onresize = myChart.resize;
    }

    var getProbabilityData= function(result){
    var SUCCESS=0;
    var FAILED=0;
    var KILLED=0;
    for(str in result.facetContent){
      if(result.facetContent[str].facet==='SUCCEEDED'){
      SUCCESS=result.facetContent[str].count;
      }else if(result.facetContent[str].facet==='FAILED'){
       FAILED=result.facetContent[str].count;
      }else if(result.facetContent[str].facet==='KILLED'){
       KILLED=result.facetContent[str].count;
      }
    }
    var data=[{name:'成功',value:SUCCESS },{name:'失败',value:FAILED},{name:'杀死',value:KILLED}];
    return data;
    }

