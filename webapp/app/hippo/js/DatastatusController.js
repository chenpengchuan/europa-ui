/**
 * DatastatusController
 * @constructor
 */
auxo.meta.datasource = {
		currUrl:"/europa/data/datastatuslist",
		restRootPath:"/europa/data/datastatuslist",
		detailTemplate : "",
		entityDisplayName:"DataSource",
		getBaseFilter: function() {
			return "";
		},
		rowHeaders : [{name : "name", disName : "数据源", sortName: "name_sort", converter : auxo.same},
		              {name : "dataSourceId", disName : "数据源ID", sortName: "name_sort", converter : auxo.same},
		              {name : "path", disName : "存储路径", sortName: "name_sort", converter : auxo.same},
					  {name : "owner", disName : "owner", converter : auxo.same},
					  {name : "createTime", disName : "创建时间", converter : auxo.date2str},
//					  {name : "testTime", disName : "检测时间", converter :  function(obj){
//					  　if(obj.length === 12)
//					    return obj.substring(0,4)+'-'+obj.substring(4,6)+'-'+obj.substring(6,8)+' '+obj.substring(8,10)+':'+obj.substring(10,12)+':00';
//					    else
//					        return obj;
//					   }},
					  {name : "status", disName : "连接状态", converter : auxo.same}
					  ]
};
App.controller("DatasSourceListController", function($filter, $scope, $location, $window, $http,$stateParams, Restangular, ngDialog) {
//  查看source的详情
    $scope.viewDataSource = function(row){
        var url = 'app/resourceMan/dataSourceEditing.html';
        Restangular.one("europa/resource", row.dataSourceId).get().then(function (entity) {
            if(entity.resType == 'HTTP'){
                url = 'app/resourceMan/webSourceEditing.html';
            }
            auxo.sgDialogService.openModal({
                templateUrl : url,
                data:{editingNode:entity},
                callback: function(newData){
                },
                width:800
            });
        });
    }
$scope.goback=function(){
  $location.path("/hippo/data/status");
}
	CrudBaseController_hippo.call(this, auxo.meta.datasource, $scope, $location, $window, $http, Restangular, ngDialog, $filter);

});
App.controller("DatastatusController", function($filter, $scope, $location, $window, $http,$stateParams, Restangular, ngDialog,sgDialogService) {
	CrudBaseController_hippo.call(this, auxo.meta.datasourcestatus, $scope, $location, $window, $http, Restangular, ngDialog, $filter);
      var week=getWeek();
      var suX=[];
      var faX=[];
      var success=[];
      var failed=[];
      var filter_schedule='';
      var xAxis=[];
      var Jobinit=function(){
          filter_schedule='';
          var lastmodifiedTime = $scope.getDateRangeFilter();
          if( lastmodifiedTime && lastmodifiedTime.length > 0){
             filter_schedule=filter_schedule+lastmodifiedTime;
          }else{
             filter_schedule=filter_schedule+'lastModifiedTime=['+week[4]+' TO '+week[7]+']';
          }
      }
      Jobinit();
      //alert($scope.queryWord);
     Restangular.one("europa/data/status").get({groupFields:'testTime',dataSourceId:$scope.dataId, offset:0, limit : 0, filter : filter_schedule, sorts : '-createTime'}).then(function(result) {
        var rt_success=result.SUCCEEDED;
        var rt_failed=result.FAILED;
        for(var r in rt_success){
           suX[r]=rt_success[r].facet;
        }
        for(var r in rt_failed){
             faX[r]=rt_failed[r].facet;
        }
                //去重合并成功的x轴和失败的X轴数据
                var res=$.unique($.merge(suX,faX))
                var xAxis = res.sort(function(a, b) { return a - b; });
                success=InitializeData(xAxis.length);
                failed=InitializeData(xAxis.length);
                success=getTaskHistoryData(xAxis,result.SUCCEEDED,success);
                failed=getTaskHistoryData(xAxis,result.FAILED,failed);
                var legend=['SUCCESSED','FAILED'];
                if(xAxis.length >0){
                    drawing_line(taskhistory_option,'datastatus_id',xAxis,legend,success,failed);
                }else{
                    if($scope.startDate){
                        var days=getAll($scope.startDate,$scope.endDate);
                        xAxis = [days[0]+'0000',days[days.length-1]+'2359'];
                    }else{
                        xAxis[0]='yyyyMMddHHmm'
                    }
                    for(var i in xAxis)
                        success[i]=failed[i]=0;
                    drawing_line(taskhistory_option,'datastatus_id',xAxis,legend,success,failed);
                }
     });
     //  选择数据源时的弹出框按钮
         $scope.initTitle='选择数据源';
          $scope.rootDir='Datasources';
             $scope.keyWord= 'datasource';
         //  选择target时更新的data数据
             $scope.onSelectChanged = function (node) {
                $scope.other.dataId = $scope.dataId = node.id;
                $scope.other.Fileds = $scope.Fileds =null;
                $scope.doQuery(node.path);
             }
//         $scope.addTableFromDB = function () {
//             sgDialogService.openModal({
//                  templateUrl : 'app/hippo/step/stepPopupDialog.html',
//                  controller : 'DataSourceListController', // specify controller for modal
//                  data: {
//                         editingNode: {}
//                  },
//                  callback: function(newData){
//                      if(newData) {
//                       $scope.other.dataId = $scope.dataId = newData.selectedRow.id;
//                         $scope.doQuery(newData.selectedRow.name);
//                         //alert(newData.selectedRow.tableName);
//                       }
//                  },
//                  width:800
//             });
//         }
});

App.controller('DatadirectoryController', function ($filter, $scope, $location, $window, $http,$stateParams, Restangular, ngDialog) {
        //获取用户列表
        $scope.userFilter=null;
        $scope.userArray = [];
        Restangular.one("users").get().then(function (result){
             var rt=result.content;
             if($scope.userFilter ===  null){
                 $scope.userFilter=rt[0].loginId;
             }
             for(var i=0;i<rt.length;i++){
                    var filed={name:"", id:""}
                      filed.name=rt[i].loginId;
                      filed.id=rt[i].id;
                      $scope.userArray.push(filed);
                    }
        });
       CrudBaseController_hippo.call(this, auxo.meta.execute, $scope, $location, $window, $http, Restangular, ngDialog, $filter);
       var week=getWeek();
       var filter='';
       var lastmodifiedTime = $scope.getDateRangeFilter();
       if(lastmodifiedTime.length > 0){
            filter=filter+lastmodifiedTime;
         }else{
            filter=filter+'lastModifiedTime=['+week[0]+'T00:00:00Z TO '+week[7]+'T00:00:00Z]';
         }
//         filter+="&owner="+$scope.userFilter;
     Restangular.one("europa/data/directory").get({userName:$scope.userFilter, query : $scope.queryWord,facetLimit:0, offset:0, limit : 10, filter : filter, sorts : '+createTime'}).then(function (result){
         data_result=result.content;
         var xAxis=[];
         var rowNumber=[];
         var byteSize=[];
         for(var content in data_result){
             xAxis[content]=data_result[content].day;
             rowNumber[content]=data_result[content].rowNumber;
             byteSize[content]=data_result[content].byteSize;
         }
         var legend=['行数','大小(Mb)'];
         if(xAxis.length>0){
            drawing_line(taskhistory_option,'datadirectory_id',xAxis,legend,rowNumber,byteSize);
          }else{
            $scope.reCount();
          }
    });
     $scope.reCount=function(){
             Restangular.one("europa/data/directory/recount").get({userName:$scope.userFilter, query : $scope.queryWord,facetLimit:0, offset:0, limit : 10, filter : filter, sorts : '+createTime'}).then(function (result){
                      data_result=result.content;
                      var xAxis=[];
                      var rowNumber=[];
                      var byteSize=[];
                      for(var content in data_result){
                          xAxis[content]=data_result[content].day;
                          rowNumber[content]=data_result[content].rowNumber;
                          byteSize[content]=data_result[content].byteSize;
                      }
                      var legend=['行数','大小'];
                       drawing_line(taskhistory_option,'datadirectory_id',xAxis,legend,rowNumber,byteSize);
                 });
           }

});

App.controller('DataqualityController', function ($filter, $scope, $location, $window, $http,$stateParams, Restangular, ngDialog) {
    CrudBaseController_hippo.call(this, auxo.meta.execute, $scope, $location, $window, $http, Restangular, ngDialog, $filter);
$scope.valueArray = [
    {name:"平均值", value:"mean"},
    {name:"平方和", value:"sums"},
    {name:"求和", value:"sum"},
    {name:"偏差", value:"stddev"},
    {name:"行数", value:"count"}
];
$scope.dataGroupArray = [
    {name:"day", value:"day"},
    {name:"month", value:"month"}
];
     var url;
     var filter='';
     var week=getWeek();
     var dataType='dataday';
     var Jobinit=function(){
         filter='flowStatus=SUCCEEDED';
//         url='zebra/zdaf/stats/qualityRank,badRatio/';
         url='europa/data/quality/qualityRank,badRatio/';
         var lastmodifiedTime = $scope.getDateRangeFilter();
         if($scope.startDate && $scope.endDate){
            filter += '&'+lastmodifiedTime.replace("lastModifiedTime","createTime");
         }else{
            filter=($scope.dateTypeFilter != 'day')?'flowStatus=SUCCEEDED': filter+ '&createTime=['+week[0]+' TO '+week[7]+']';
         }
         if($scope.dateTypeFilter != 'day'){
             url=url+'datamon';
             dataType='datamon';
         }else{
            url=url+'dataday';
            dataType='dataday';
         }
     }
    Jobinit();
     Restangular.one(url).get({filter:filter,sorts:'-createTime'}).then(function (result){
         var legend=['qualityRank','badRatio'];
         var xAxis=[];
         var qualityRank=[];
         var badRatio=[];
      if(result.content.length>0){
        for(var rt in result.content){
           xAxis[rt]=result.content[rt]._$ROWID;
           qualityRank[rt]=result.content[rt][dataType].qualityRank[$scope.valueTypeFilter];
           badRatio[rt]=result.content[rt][dataType].badRatio[$scope.valueTypeFilter];
         }
         drawing_line(taskhistory_option,'dataquality_id',xAxis,legend,qualityRank,badRatio);
      }else{
           xAxis[0]=($scope.dateTypeFilter != 'day')?'yyyyMM':'yyyyMMdd';
           qualityRank[0]=0;
           badRatio[0]=0;
           drawing_line(taskhistory_option,'dataquality_id',xAxis,legend,qualityRank,badRatio);
        }
    });
});

App.controller('DataMapController', function ($filter, $scope, $location, $window, $http,$stateParams, Restangular, ngDialog,sgDialogService) {
CrudBaseController_hippo.call(this, auxo.meta.execute, $scope, $location, $window, $http, Restangular, ngDialog, $filter);
       var filter='';
       var limit =50;
       var lastmodifiedTime = $scope.getDateRangeFilter();
             if(lastmodifiedTime && lastmodifiedTime.length > 0){
                  limit =10000;
                  filter=filter+lastmodifiedTime.replace("lastModifiedTime","createTime");
               }
     Restangular.one("europa/datamap").get({query : $scope.dataId,facetLimit:0, offset:0, limit : limit, filter : filter, sorts : '-createTime'}).then(function (result){
      if(result.total>0){
         data_result=result.content;
         var xAxis=[];
         var records=[];
         var currentcout=[];
         for(var i=0;i< data_result.length;i++){
             xAxis[i]=data_result[i].createTime;
             records[i]=data_result[i].writeOut;
         }
         xAxis=formatDates(xAxis);
          var legend=['导入行数'];
          if($scope.queryWord.length>0 && $scope.queryWord != undefined){
             legend[0] += '('+$scope.queryWord+')';
          }
          if($scope.currentCount != null && $scope.currentCount != undefined){
              legend[1]='设定阈值';
             for(var i=0;i<data_result.length;i++){
                currentcout[i]=$scope.currentCount;
             }
          }
          drawing_line(taskhistory_option,'datamap_id',xAxis,legend,records,currentcout);
       }else{
         drawing_line(taskhistory_option,'datamap_id',["yyyyMMddHHmm"],['导入行数(未选择目标表或该表未导入过数据)'],[0],null);
       }

   });

//  选择数据源时的弹出框按钮
    $scope.initTitle='选择表(必填)';
    $scope.addTableFromDB = function () {
        sgDialogService.openModal({
             templateUrl : 'app/hippo/step/stepPopupDialog.html',
             controller : 'TableController', // specify controller for modal
             data: {
                    editingNode: {}
             },
             callback: function(newData){
                 if(newData) {
                    $scope.other.dataId = $scope.dataId = newData.selectedRow.id;
                    $scope.doQuery(newData.selectedRow.dataStore);
                    //alert(newData.selectedRow.id);
                  }
             },
             width:800
        });
    }
});

//把时间戳格式化成yyyymmddhhmm格式，如 201708120305
var formatDates=function(times){
   var dates=[];
   for(var i=0;i<times.length;i++){
    var time = new Date(times[i]);
    var y = time.getFullYear();//年
    var m = (time.getMonth() + 1)>9 ? (time.getMonth() + 1) : '0'+(time.getMonth() + 1);//月
    var d = time.getDate()>9 ? time.getDate() : '0'+time.getDate();//日
    var h = time.getHours()>9 ? time.getHours() : '0'+time.getHours();//时
    var mm = time.getMinutes()>9 ? time.getMinutes() : '0'+time.getMinutes();//分
  //  var s = time.getSeconds()>9 ? time.getSeconds() : '0'+time.getSeconds();//秒
    //alert(y+"-"+m+"-"+d+" "+h+":"+mm+":"+s);
    dates[i]=y+""+m+""+d+""+h+""+mm;
    }
    return dates;
 }