var today_data;
var executes=[];
App.controller('IndexMonitorController', function IndexMonitorController($scope, $window, $http, $stateParams, $location, ngDialog, Restangular, sgDialogService, Auth) {

var week=getWeek();
var days=getAll(week[5],week[week.length-1]);
Restangular.one("europa/index").get().then(function(rt) {
//获取flowexecution的不同状态个数数据
var stats=rt.stats[0];
$scope.RUNNING=stats['executions-RUNNING']||0;
$scope.READY = stats['executions-READY']||0;
$scope.SUCCEEDED=stats['executions-SUCCEEDED']||0;
$scope.FAILED = stats['executions-FAILED']||0;
$scope.KILLED = stats['executions-KILLED']||0;
$scope.UNKNOWN = stats['executions-UNKNOWN']||0;
//昨天，今天每个小时执行任务数画图
 var flowexecution=rt.flowexecution;
 var today=getTotalArray(flowexecution,(days[2].indexOf("T") > 0)?(days[2].split("T")[0]):days[2]);
 var yestoday=getTotalArray(flowexecution,(days[1].indexOf("T") > 0)?(days[1].split("T")[0]):days[1]);
 drawing(task_finished_option,'run_total',today,yestoday);
 //按天取前一周任务调度数据画图
 var weeks=getAll(week[1],week[week.length-1]);
 var schedulers =InitializeData(weeks.length);
 schedulers =getTaskHistoryData(weeks,rt.schedulers.sort(by("facet")),schedulers);
  var legend=['计划'];
  drawing_jobanalysis(indexSchudule_option,'index_schedule_id',weeks,legend,schedulers);
  //系统资源数据画图
  var source=rt.resource[0];
  var cpus=[{value:source.usedCpus, name:'占用内核'}, {value:(source.maxCpus - source.usedCpus), name:'空闲内核'}];
  var memory=[{value:(source.usedRam/1024).toFixed(2), name:'使用内存(G)'},{value:((source.maxRam - source.usedRam)/1024).toFixed(2), name:'剩余内存(G)'}];
   drawing_resource(indexResources_option,'run_total3',cpus,memory);
   //获取任务告警数据画图
   var arr=rt.alarms;
   var alarm_data=[0,0,0];
  for(var i=0;i<arr.length;i++){
     if(arr[i].facet === 'deadly'){
         alarm_data[0]=arr[i].count;
     }else if(arr[i].facet==='serious'){
         alarm_data[1]=arr[i].count;
     }if(arr[i].facet==='warning'){
         alarm_data[2]=arr[i].count;
       }
  }
  drawing_alert(alarm_option,'alarm_id',alarm_data);
 //数据源状态列表
 $scope.datastatuslist=duplicate(rt.datastatus);
});

   Restangular.one("europa", "collectors").get({ offset:0, limit : 5, sorts : '-status'}).then(function(rt1) {
     $scope.nodes=rt1.content;
   });
   $scope.refresh = function(){
      Restangular.one("europa", "collectors").get({ offset:0, limit : 5, sorts : '-status'}).then(function(rt1) {
          $scope.nodes=rt1.content;
      });
   }

});

//从数据源状态列表中去掉重复的
var duplicate=function(array){
    var result = [];
    for(var i in array){
        var b = false;
        for(var j in result){
            if(array[i].path === result[j].path && array[i].owner === result[j].owner && array[i].name === result[j].name){
              b = true;
              break;
            }
        }
        if(!b)
          result.push(array[i]);
    }
    return result;
}

//概览页任务完成情况图根据数据画图
var drawing = function(option,id,today_date,yesterday_date){
　　var myChart = echarts.init(document.getElementById(id));
    task_finished_option.series[0].data= today_date;
    task_finished_option.series[1].data= yesterday_date;
    //使用刚指定的配置项和数据显示图表。
    myChart.setOption(option);
     window.addEventListener("resize",function(){
         myChart.resize();
     });
}

//概览页任务告警根据数据画图
var drawing_alert = function(option,id,alarm_data){
　　var myChart = echarts.init(document.getElementById(id));
    alarm_option.series[0].data= alarm_data;
    //使用刚指定的配置项和数据显示图表。
    myChart.setOption(option);
    window.addEventListener("resize",function(){
         myChart.resize();
    });
}
//概览页系统资源监控画图
var drawing_resource=function(option,id,cpus,memory){
    var myChart = echarts.init(document.getElementById(id));
    option.series[0].data=cpus;
    option.series[1].data=memory;
    // 使用刚指定的配置项和数据显示图表。
     myChart.setOption(option);
     window.addEventListener("resize",function(){
         myChart.resize();
     });
};
var getArray=function(datas,key){
	var Array = [];
	for(var i=0;i < datas.length;i++){
            Array[i]=datas[i][key] || 0;
        }
       return Array;
	}

var getTotalArray=function(arr,day){
	var Array = [];
	var days=[];
	var date=new Date();
	var now=date.getFullYear();
	((date.getMonth()+1)<10) ? now=now+"0"+(date.getMonth()+1) : now=now+""+(date.getMonth()+1);
	(date.getDate()<10) ? now=now+"0"+date.getDate() : now=now+""+date.getDate();
	(date.getHours()<10) ? now=now+'0'+date.getHours() : now=now+''+date.getHours();
	for(var i=0;i<24;i++){
	   (i<10) ? days[i]=day+'0'+i : days[i]=day+''+i;
	  for(var r=0;r< arr.length;r++){
	     if(i<10 && day+'0'+i === arr[r].facet){
      	     Array[i]=arr[r].count;
      	     break;
      	   }else if(i>=10 && day+''+i === arr[r].facet){
      	       Array[i]=arr[r].count;
               break;
      	   }
	  }
	  if(r>=arr.length){
	   Array[i]=0;
	  }
	}
	for(var i=23;i>=0;i--){
	  if(days[i]>now){
	   Array[i]=null;
	  }else{break;}
	}
       return Array;
	}