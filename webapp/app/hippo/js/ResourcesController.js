App.controller('ResourcesController', function TaskhistoryController($filter, $scope, $location, $window, $http,$stateParams, Restangular, ngDialog) {

 CrudBaseController_hippo.call(this, auxo.meta.execute, $scope, $location, $window, $http, Restangular, ngDialog, $filter);
  $scope.dataGroupArray = [
      {name:"minute", value:"minute"},
      {name:"hour", value:"hour"}
  ];
  $scope.selectSourceType = [{name:"当前用户", value:"user"}];
  if($scope.userFilter != null && $scope.userFilter != undefined){
     $scope.sourceType=$scope.userFilter;
  }else{
     $scope.sourceType="user";
  }
filter='sourceType='+$scope.sourceType;
var week=getWeek();
var limit=100;
var lastmodifiedTime = $scope.getDateRangeFilter();
 if(lastmodifiedTime.length >0){
        days=getAll($scope.startDate,$scope.endDate);
        filter=filter+'&'+lastmodifiedTime;
        limit='';
     }else{
       days=getAll(week[0],week[8]);
       filter=filter+'&lastModifiedTime=['+week[6]+' TO '+week[7]+']';
     }

   Restangular.one("sysresource/trend").get({sourceType:$scope.sourceType,filter:filter,offset:0,limit:limit,statsFields:'usedRam,usedCpus',statsFacets:$scope.statsFacetsFilter,sorts : '-createTime'}).then(function(result) {
       var total = result.sourceTotal[0]
       var select = result.select;
       if(select.length >1){
          var filed={name:"", value:""}
          filed.name="当前租户";
          filed.value=select[1];
          $scope.selectSourceType.push(filed);
       }
//      Restangular.one("hippo/resource/gquery").get({filter:filter,offset:0,limit:limit,statsFields:'usedRam,usedCpus',statsFacets:$scope.statsFacetsFilter,sorts : '-createTime'}).then(function (result){
         sourceArray=result.resource;
         var maxRam=[];
         var maxCpus=[];
         var cores=[];
         var memory=[];
         var xAxis=[];
         var legend_memory=['使用内存','最大内存'];
         var legend_core=['使用内核','总内核'];
         var yName='内存使用趋势(G)';
         var i=0;
       if(sourceArray.length>0){
         for(var rt = 0; rt < sourceArray.length;rt++){
          maxRam[i]=(total.maxRam/1024).toFixed(2)
          maxCpus[i]=total.maxCpus
          cores[i]=sourceArray[rt][$scope.statsFacetsFilter].usedCpus.max || 0;
          memory[i]=sourceArray[rt][$scope.statsFacetsFilter].usedRam.max/1024 || 0;
          xAxis[i]=sourceArray[rt]['_$ROWID'];
          i++;
         }
          xAxis=Dataformate(xAxis);
          drawing_resource1(resource_option,'resources_id',legend_memory,xAxis,yName,maxRam,memory);
          drawing_resource1(resource_option,'resources_id1',legend_core,xAxis,'内核使用趋势(核)',maxCpus,cores);
          }else{
              xAxis=($scope.startDate && $scope.endDate)?[days[0]+'0000',days[days.length-1]+'2359']:[days[7]+'0000',days[7]+DatetoLocaleString()];
             if($scope.statsFacetsFilter === 'hour'){
                for(var i in  xAxis)
                  xAxis[i]=xAxis[i].substring(0,10);
             }
             xAxis=Dataformate(xAxis);
             for(i = 0;i<xAxis.length;i++){
              maxRam[i] = (total.maxRam/1024).toFixed(2);
              maxCpus[i] = total.maxCpus;
              memory[i] = 0;
              cores[i] = 0;
             }
             drawing_resource1(resource_option,'resources_id',legend_memory,xAxis,yName,maxRam,memory);
             drawing_resource1(resource_option,'resources_id1',legend_core,xAxis,'内核使用趋势(核)',maxCpus,cores);
          }
//       });
   });
});

var drawing_resource1=function(option,id,legend,xAxis,yName,yMax,datas){
　　var myChart = echarts.init(document.getElementById(id));
    option.legend.data =legend;
    option.xAxis.data=xAxis;
    option.yAxis.name=yName;
    option.yAxis.max=yMax[0];
    option.series[0].name= legend[0];
    option.series[1].name= legend[1];
    option.series[0].data= datas;
    option.series[1].data= yMax;
    myChart.setOption(option);
}

var DatetoLocaleString = function() {
          var tmpdate=new Date();
//          return tmpdate.getFullYear() + "/" + (tmpdate.getMonth() + 1) + "/" + tmpdate.getDate() + "/ " + tmpdate.getHours() + ":" + tmpdate.getMinutes();
          var hour_minute = (tmpdate.getHours()>9?tmpdate.getHours():'0'+tmpdate.getHours()) +''+ (tmpdate.getMinutes()>9?tmpdate.getMinutes():'0'+tmpdate.getMinutes());
          return hour_minute;
    };