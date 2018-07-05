App.controller('NewAlarmrulesController', function($scope, $location, UtilService, StepSchemaService,Restangular, $stateParams) {
    var isNew = $scope.isNew = $stateParams.id == undefined;
	var isCopy = $scope.isCopy = $stateParams.action == "copy";
	var id = $stateParams.id;
	//$scope.Type = 'all';
    $scope.uuid = 0;
    $scope.error = false;
    $scope.fields = [];
    var fieldIndex = 1;

    $scope.formDef = [
        {type: 'String', label:"名称", $name:"name",required:true},
        {type: 'String', label:"描述", $name:"description",required:false},
        {type: 'String', label:"通知邮箱", $name:"email",required:false},
        {type: 'TimePeriod', label:"过期时间", value:0,  $name:"expiredPeriod"}
    ];

//    $scope.fieldDef = {
//        name : {type: 'String', label:"字段",  name: "field_name", placeholder:"type field name"},
//        type: {type: 'Dropdown', label:"类型",  name: "field_type", removable:true, value:"string",
//            enum: ["单个任务失败超过5次", "单个任务失败超过10次", "单个任务失败超过15次","单个任务失败超过20次","单个任务失败超过30次",
//           "任务等待时间超过20分钟","任务等待时间超过30分钟","CPU资源不足","内存资源不足"]}
//    };

$scope.data = {
            id: "",
            name :"",
            description: "",
            expiredPeriod: 0,
            email:"",
             failed:null,
             waitTime :null,
             resource:null,
             type:"warning",
            creator: "admin",
           // conditions:"单个任务失败超过5次",
            principal:"admin",
    };

    $scope.getId = function () {
        return "schema-form-item-" + $scope.uuid++;
    };


//更新数据
    function synchData(m2v) {
    // alert('111');
        if (m2v) {
            $scope.fields = [];
            angular.forEach($scope.data.fields, function (e) {
                var field = {name: e.name, type: e.type, selected: false}
                $scope.fields.push(field)
            })
        } else {
            $scope.data.fields = [];
            angular.forEach($scope.fields, function (e) {
                var field = {name: e.name, type: e.type}
                $scope.data.fields.push(field)
            })
        }
    }
    $scope.synchData = synchData;

    if (isNew) {
        synchData(true)
    }else {
//        Restangular.one("hippo/alarm/rules", id).get().then(function(entity) {
        Restangular.one("/europa/alarmrules", id).get().then(function(entity) {
            $scope.data = entity;
            if($scope.data.failed===0){
              $scope.data.failed=null;
            }
            if($scope.data.waitTime===0){
              $scope.data.waitTime=null;
            }
            if($scope.data.resource===0){
              $scope.data.resource=null;
            }
            if($scope.data.expiredPeriod > 200000000000){
               $scope.data.expiredPeriod=0;
            }
            synchData(true)
            if (isCopy) {
                delete $scope.data.id;
                $scope.data.name = $scope.data.name + "-copy-" + new Date().toISOString();
            }else {
                $scope.isReadOnlyView = true;
            }
        });
    }

    $scope.addFields = function (index) {
        if(index === undefined)
            index = $scope.fields.length - 1;
        $scope.fields.splice(index+1, 0,  {name: "field_" + ++fieldIndex, type: 'string',  selected: false})

        synchData()
    };

    $scope.deleteItem = function (index) {
        $scope.fields.splice(index, 1)
        synchData()
    }

    $scope.mousedown = function (event) {
        if(event.target.nodeName === "SELECT" || event.target.nodeName === "INPUT"){
            $scope.dragDisabled = true;}
        else
            $scope.dragDisabled = false;
    }

    $scope.onDrop = function(fields, items, index) {
        angular.forEach(items, function(item) { item.selected = false; });

        var itemsCopy = auxo.clone(items);

        $scope.fields = fields.slice(0, index)
            .concat(itemsCopy)
            .concat(fields.slice(index));

        synchData()

        return true;
    }

    $scope.getSelectedItemsIncluding = function(fields, item) {
        item.selected = true;
        return fields.filter(function(item) { return item.selected; });
    };

    $scope.onMoved = function(items) {
        console.log(items)
        $scope.fields = items.filter(function(item) { return !item.selected; });
        synchData()
    };



    // ok click
    $scope.ok = $scope.save = function() {
   // alert($scope.data.id+'--'+$scope.data.conditions+'--'+$scope.data.type);
    	$scope.saving = true;
        if($scope.data && $scope.data.id != undefined && $scope.data.id != "") {
            var remoteItem = Restangular.copy($scope.data);
            remoteItem.expiredPeriod = $scope.data.expiredPeriod;
            remoteItem.name = $scope.data.name;
            remoteItem.description = $scope.data.description;
            remoteItem.type = $scope.data.type;
            remoteItem.owner = $scope.data.owner;
            remoteItem.conditions = $scope.data.conditions;

            remoteItem.put().then(function (facetResult) {
            	$scope.saving = false;
                auxo.delHotkey($scope)
                auxo.loadPage(auxo.meta.rules.currUrl);
            }, function(errResponse) {
            	$scope.saving = false;
            	$scope.error = errResponse.data;
            });
        } else {
            Restangular.all("/europa/alarmrules").post($scope.data)
                .then(function (facetResult) {
                	$scope.saving = false;
                    auxo.delHotkey($scope)
                    auxo.loadPage(auxo.meta.rules.currUrl, {});
                },function(errResponse) {
                	$scope.saving = false;
                	$scope.error = errResponse.data;
                });
        }
    };
    // cancel click
    $scope.cancel = function() {
       // auxo.loadPage(auxo.meta.schema.currUrl);
        auxo.delHotkey($scope)
        auxo.goBack();
    }

    $scope.isArray = function(item) {
        return angular.isArray(item)
    }
    auxo.bindEscEnterHotkey($scope)
});