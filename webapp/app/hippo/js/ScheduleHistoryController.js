
App.controller('ScheduleHistoryController', function JobanalysisController($filter, $scope, $location, $window, $http,$stateParams, Restangular, ngDialog) {
    CrudBaseController_hippo.call(this, auxo.meta.schedule, $scope, $location, $window, $http, Restangular, ngDialog, $filter);
     var week=getWeek();
     var days=[];
     var filter_schedule='';
     var schedules=[];
     var Jobinit=function(){
         filter_schedule='';
         var lastmodifiedTime = $scope.getDateRangeFilter();
         if(lastmodifiedTime && lastmodifiedTime.length > 0){
            days=getAll($scope.startDate,$scope.endDate);
            filter_schedule=filter_schedule+lastmodifiedTime;
         }else{
            days=getAll(week[1],week[8]);
               filter_schedule=filter_schedule+'lastModifiedTime=['+week[0]+' TO '+week[7]+']';
         }
         if($scope.flowTypeFilter!='all'){
            filter_schedule=filter_schedule+'&flowType='+$scope.flowTypeFilter;
         }
         if($scope.dateTypeFilter != 'day'){
                 days=getHours(days);
              }
         schedules =InitializeData(days.length);
     }
    Jobinit();
    Restangular.one("jobs", "schedulers").get({groupFields:$scope.dateTypeFilter,query : $scope.queryWord, offset:0, limit : 0, filter : filter_schedule, sorts : '-createTime'}).then(function(rt) {
             schedules=getTaskHistoryData(days,rt.facetContent.sort(by("facet")),schedules);
               var legend=['计划'];
                drawing_jobanalysis(jobanalysis_option,'jobanalysis_id',days,legend,schedules);
     });

 });

//
////任务趋势按系统分类分析画堆叠图
// 	var drawing_systaskhistory = function(option,id,xAxis,datas){
// 	   //alert('drawing_taskhistory');
//     　　var myChart = echarts.init(document.getElementById(id));
//          option.xAxis[0].data=xAxis;
//          for(var i=0;i<option.series.length;i++){
//            option.series[i].data=datas[i];
//          }
//         myChart.setOption(option);
//     }
