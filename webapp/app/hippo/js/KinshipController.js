App.controller("KinshipController", function($filter, $scope, $location, $window, $http,$stateParams, Restangular, ngDialog,sgDialogService) {
	 CrudBaseController_hippo.call(this, auxo.meta.execute, $scope, $location, $window, $http, Restangular, ngDialog, $filter);
     restRootPath="lineage";
    $scope.fieldsGroupArray = [];
    $scope.valueGroupArray = [{name:"数据集", value:"Dataset"},
                              {name:"字段级", value:"Filed"},
                              {name:"库级", value:"Database"},
                              {name:"流程级", value:"Flow"},];
    if($scope.valueTypeFilter==='mean'){
        $scope.valueTypeFilter='Dataset';
    }
//  选择数据源时的弹出框按钮
    $scope.initTitle='选择数据集';
    $scope.rootDir='数据集';
    $scope.keyWord= 'dataset';
//  选择target时更新的data数据
    $scope.onSelectChanged = function (node) {
       $scope.other.dataId = $scope.dataId = node.attributes[$scope.keyWord].id;
       $scope.other.Fileds = $scope.Fileds =null;
       $scope.doQuery(node.attributes[$scope.keyWord].name);
    }
    if($scope.valueTypeFilter === 'Filed'){
        //根据选择的Dataset获取对应的字段
         getAllfileds(Restangular,$scope);
     }
   if($scope.dataId != null){
         refresh($scope,Restangular,restRootPath);
     }
 drawing_kinship=function(option,id,datas,depth){
   var myChart = echarts.init(document.getElementById(id));
   option.series[0].data[0]=datas;
   //根据树的深度设置左右图距左右边框的距离
   if(depth<=2){
       option.series[0].left=option.series[0].right='40%';
   }else if(depth>2 && depth<=5){
       option.series[0].left=option.series[0].right = depth==3 ? '35%':depth==4 ? '25%':'20%';
   }else{option.series[0].left=option.series[0].right='10%';}
    option.series[0].initialTreeDepth=($scope.valueTypeFilter === 'Flow') ? 2 : 1;
    myChart.setOption(option);
    window.onresize = myChart.resize;
 }

});
var refresh=function($scope,Restangular,restRootPath){
   if($scope.dataId.length >0 && $scope.dataId != undefined){
        var fileds=[];
        if($scope.Fileds!=null && $scope.Fileds != undefined && $scope.valueTypeFilter === 'Filed'){
             fileds[0]=$scope.Fileds;
             Restangular.all("lineage/"+$scope.dataId+"/fieldslineage").post(fileds).then(function(rt) {
                var tree =specificationTree($scope,rt);
                if(!tree.name){tree=null}
                var depth=getMaxDomTreeDepth_recursive(tree);
                drawing_kinship(lineage_option,'kinship_id',tree,depth);
             });
        }else{
           Restangular.one(restRootPath+'/'+$scope.dataId).get({datasetId:$scope.dataId}).then(function(rt) {
                if($scope.valueTypeFilter != 'Flow')
                    var tree =specificationTree($scope,rt);
                else
                    var tree =valueFlowTree($scope,rt);
                var depth=getMaxDomTreeDepth_recursive(tree);
                drawing_kinship(lineage_option,'kinship_id',tree,depth);
           });
        }
   }
}
/**
*根据选中的DatasetName获取该Dataset下的字段列表
*/
var getAllfileds=function(Restangular,$scope){
    if($scope.queryWord !=null && $scope.queryWord.length>0 ){
     var filter='dataset='+$scope.queryWord;
       Restangular.one("lineage/fields").get({facetLimit:0, offset:0, limit : 10, filter : filter, sorts : '-lastModifiedTime'}).then(function(rt) {
            for(var i=0;i<rt.length;i++){
            var filed={name:"", value:""}
              filed.name=rt[i];
              filed.value=rt[i];
              $scope.fieldsGroupArray.push(filed);
            }
       });
     }
}

/**
*根据获取的结果把结果转换成echarts的树图的数据结构
*/
var specificationTree=function($scope,tree){
    var echartsTree={
        name:"",
        storage:"",
        path:"",
        tablename:"",
        valuetype:"",
        children:[]
    }
    if($scope.valueTypeFilter === 'Dataset'|| $scope.valueTypeFilter === 'Filed'){
        var n = tree.name.lastIndexOf('/');
        echartsTree.name= n>=0 ? tree.name.substring(n+1,tree.name.length):tree.name;
        echartsTree.path= n>=0 ? tree.name.substring(0,n+1):"/";
        echartsTree.storage=tree.storage;
    }else if($scope.valueTypeFilter === 'Database'){
        echartsTree.valuetype="Database";
        echartsTree.storage=tree.storage;
         echartsTree.name = tree.storage+': ';
        if(tree.storageConfiguration){
            if(tree.storage === 'JDBC'){
                var n = tree.storageConfiguration.url.indexOf("?");
                echartsTree.path= n>=0 ? tree.storageConfiguration.url.substring(0,n):tree.storageConfiguration.url;
                var driver = tree.storageConfiguration.driver;
                if('oracle.jdbc.driver.OracleDriver'===driver||'sun.jdbc.odbc.JdbcOdbcDriver'===driver){
                    n = echartsTree.path.lastIndexOf(":");
                }else if('com.mysql.jdbc.Driver'===driver||'net.sourceforge.jtds.jdbc.Driver'===driver||
                         'org.postgresql.Driver'===driver|| 'org.hsqldb.jdbcDriver'===driver){
                    n = echartsTree.path.lastIndexOf("/");
                }else if('com.microsoft.sqlserver.jdbc.SQLServerDriver'===driver||'com.pivotal.jdbc.GreenplumDriver'===driver||
                         'com.teradata.jdbc.TeraDriver'===driver){
                    n= echartsTree.path.lastIndexOf("=");
                }
                 echartsTree.name += tree.storageConfiguration.url.substring(n+1,echartsTree.path.length);
                 echartsTree.tablename=tree.storageConfiguration.table;
            }else if(tree.storage === 'HIVE'|| tree.storage === 'HBASE'){
                echartsTree.name+=tree.storageConfiguration.table ? tree.storageConfiguration.table : tree.storageConfiguration.sql;
            }else if(tree.storage === 'HDFS'|| tree.storage === 'FTP'){
                var n = tree.storageConfiguration.path.lastIndexOf('/');
                var length = tree.storageConfiguration.path.length;
                if(n+1!=length){
                    echartsTree.name+= n>=0 ? tree.storageConfiguration.path.substring(n+1,length):tree.storageConfiguration.path;
                    echartsTree.path= n>=0 ? tree.storageConfiguration.path.substring(0,n+1):"/";
                }else{
                    echartsTree.name+= tree.storageConfiguration.path;
                    echartsTree.path= tree.storageConfiguration.path;
                }
            }else if(tree.storage === 'KAFKA'){
                echartsTree.name+=tree.storageConfiguration.topic;
                echartsTree.path=tree.storageConfiguration.zookeeper;
            }
        }
    }else if($scope.valueTypeFilter === 'Flow'&& tree.flowName){
        var n = tree.flowName.lastIndexOf('/');
        echartsTree.name = n>=0 ? tree.flowName.substring(n+1,tree.flowName.length) : tree.flowName;
        echartsTree.path = n>=0 ? tree.flowName.substring(0,n+1) : "/";
    }
    for(var i=0;i<tree.parents.length;i++){
        if($scope.valueTypeFilter === 'Flow'){
            if(tree.parents[i].flowName )
                echartsTree.children[i]=specificationTree($scope,tree.parents[i]);
        }else
            echartsTree.children[i]=specificationTree($scope,tree.parents[i]);
    }
    if(!echartsTree.name){
        echartsTree.name="手动创建"
    }
    return echartsTree;
}
/**
*获取树的最大深度
*/
var getMaxDomTreeDepth_recursive=function(domRoot) {
    var childrenDepth = [];
    var child = domRoot.children;
    if (!child) {return 1;}
    for(var i=0;i< child.length;i++){
        childrenDepth.push(getMaxDomTreeDepth_recursive(child[i]));
    }
    var max = 0;
    for(var i in childrenDepth){
        max = childrenDepth[i]>max?childrenDepth[i]:max;
    }
    return max + 1;
}
//var removeDuplicate=function(list){
//    var newList = [];
//    var n = 0;
//    var k = false;
//    for(var i in list){
//        k=false;
//        for(var j in newList){
//            if(list[i].name==newList[j].name){
//                k = true;
//                break;
//            }
//        }
//        if(!k){
//            newList[n++] = list[i];
//        }
//    }
//    return newList;
//}
var valueFlowTree=function($scope,tree){
var echartsTree={
    name:"数据集: ",
    fullname:"",
    storage:"",
    path:"",
    valuetype:"Flow",
    children:[]
}
    var n = tree.name.lastIndexOf('/');
    echartsTree.fullname = n>=0 ? tree.name.substring(n+1,tree.name.length):tree.name;
    echartsTree.name+= (echartsTree.fullname&&echartsTree.fullname.length>5) ? echartsTree.fullname.substring(0,5)+'...':echartsTree.fullname;
    echartsTree.path= n>=0 ? tree.name.substring(0,n+1):"/";
    echartsTree.storage=tree.storage;
    if(tree.flowName){
        var echartsTreetmp={
            name:"流程: ",
            fullname:"",
            storage:"",
            path:"",
            valuetype:"Flow",
            children:[]
        }
        var n = tree.flowName.lastIndexOf('/');
        echartsTreetmp.fullname = n>=0 ? tree.flowName.substring(n+1,tree.flowName.length) : tree.flowName;
        echartsTreetmp.name += (echartsTreetmp.fullname&&echartsTreetmp.fullname.length>5) ? echartsTreetmp.fullname.substring(0,5)+'...' : echartsTreetmp.fullname;
        echartsTreetmp.path = n>=0 ? tree.flowName.substring(0,n+1) : "/";
        echartsTree.children[0]=echartsTreetmp;
    }
    for(var i=0;i<tree.parents.length;i++){
      if(echartsTree.children.length>0)
         echartsTree.children[0].children[i]=valueFlowTree($scope,tree.parents[i]);
      else
         echartsTree.children[i]=valueFlowTree($scope,tree.parents[i]);
    }
    return echartsTree;
}
