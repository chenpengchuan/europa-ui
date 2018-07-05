auxo.meta.dataset = {
	currUrl:"/data",
	restRootPath:"datasets",
	path:"/data",
	detailTemplate : "",
	entityDisplayName:"Dataset",
	getBaseFilter: function() {
		return "";
	},
	rowHeaders : [
		//{name : "id", disName : "ID", converter : auxo.same},
		{name : "name", disName : "名称", sortName: "name_sort", converter : auxo.same},
		{name : "schemaName", disName : "Schema", converter : auxo.same},
		{name : "schemaVersion", disName : "Schema版本", converter : auxo.same},
		{name : "storage", disName : "存储方式", converter : auxo.same},
		{name : "createTime", disName : "创建时间", converter : auxo.date2str},
		{name : "creator", disName : "创建人", converter : auxo.same},
		{name : "lastModifier", disName : "修改人", converter : auxo.same},
		{name : "lastModifiedTime", disName : "修改时间", converter : auxo.date2str}
	],
	sort : {predicate:"lastModifiedTime", reverse:true}

};
App.controller('DatasetController', function($filter, $scope, $location, $window, $http,$stateParams, Restangular, ngDialog) {
	CrudBaseController.call(this, auxo.meta.dataset, $scope, $location, $window, $http, Restangular, ngDialog, $filter);
})

App.controller('EditDatasetController', function EditDatasetController($scope, $window, $http, $stateParams, $location, ngDialog, Restangular, sgDialogService, Auth) {


	$scope.role = Auth.user.role.title;
	console.log($scope.role);
	
	var id = $stateParams.id;

	$scope.schemaName = ""
	$scope.onSelectChanged=function(selectedRow){
		$scope.entity.schema=selectedRow["id"]
		$scope.entity.schemaName=selectedRow["name"]
		$scope.entity.schemaVersion=selectedRow["version"]
		buildSchemaDisplayName();
	}
	$scope.onInputChanged = function (inputText, inputName) {
		$scope.entity.storageConfigurations[inputName] = inputText;
	}
	var storages = {
			   "HDFS"	: [
			   		{name : "format", options : ["csv", "parquet"]},
			        {name : "path", required:true}
			   ],
			   "HIVE"	: [
			   		{name: "sql", required:true, isRequired: function (d, s) {if(d.table)return false; return true; }},
				    {name : "table", required:true,  isRequired: function (d, s) {if(d.sql)return false; return true; }},
				    {name: "partitionColumns"}
			   ],
			   "JDBC"	: [
				   {name: "driver", options: auxo.jdbc.driverList, required:true},
				   {name : "url", required:true},
				   {name: "sql", required:true, isRequired: function (d, s) {if(d.table)return false; return true; }},
				   {name : "table", required:true,  isRequired: function (d, s) {if(d.sql)return false; return true; }},
				   {name: "user", label: "User", required:true},
				   {name: "password", label: "Password",type:"password", required:true}
			   ],
				"KAFKA": [
				    {name : "format", options : ["csv", "json", "xml"]},
					{name: "zookeeper", required:true},
					{name: "brokers", required:true},
					{name: "topic", required:true},
					{name: "groupId", required:true},
					{name: "version", options : ["0.8", "0.9", "0.10"]}
				],
				"HBASE": [
					{name: "table", required:true},
					{name: "namespace", required:true},
					{name: "columns", required:true, type: "pairInput", tooltip:"描述hbase的列，与schema中的列要一一对应，形如，columnFamily1:qualifier1,columnFamily1:qualifier2,columnFamily1:qualifier3,columnFamily2:qualifier1... 其中，rowKey对应的那一列，应写成rowKey:key"},
				],
				"FTP": [
					{name: "url", required:true},
					{name: "user", required:false},
					{name: "password", required:false},
				]
			};
	auxo.treeWalk(storages, function (key, value) {
		if(value.name) {
			if(!value.isRequired)
				value.isRequired  = function (d ) {return value.required};
           if(!value.type) {
			   if (value.options)
				   value.type = "select"
			   else
				   value.type = 'string';
		   }
		}
	})

	var formats = {
			  "csv" : [{name : "header", options : ["true", "false"]},
		         	   {name : "separator", },
		         	   {name : "quoteChar", required: false},
		         	   {name : "escapeChar", required: false}
			  ],
			  "parquet" : [],
			  "xml" : [{name : "reader", required : true}],

				"table" : [{name : "table"}, {name: "partitionColumns"}, {name: "sql"}],
				"sql" : [{name: "sql"}]
			};


	var entities = {
		"HDFS": {
			storage: "HDFS",
			storageConfigurations: {format: "csv", path: "", header: "false", separator: ",", quoteChar: "\"", escapeChar: "\\"},
			expiredPeriod : 0
		},
		"HIVE": {
			storage: "HIVE",
			storageConfigurations: { sql: "", table: "", partitionColumns: ""},
			expiredPeriod : 0
		},
		"JDBC": {
			storage: "JDBC",
			storageConfigurations: { driver: "", url: "", sql: "", table: "", user: "", password: ""},
			expiredPeriod : 0
		},
		"KAFKA": {
			storage: "KAFKA",
			storageConfigurations: {format : "csv", brokers: "", topic: "", groupId: "", separator: ",", quoteChar: "\"", escapeChar: "\\"},
			expiredPeriod : 0
		},
		"HBASE": {
			storage: "HBASE",
			storageConfigurations: { table: "", namespace: "", columns: ""},
			expiredPeriod : 0
		},
		"FTP": {
			storage: "FTP",
			storageConfigurations: { url: "", user: "", password: ""},
			expiredPeriod : 0
		}
	}

	auxo.meta.dataset.onNew = function(entity) {
		$scope.entity = auxo.clone(entities.HDFS);
		$scope.previewLoading = false;
		$scope.storageDesc = storages[$scope.entity.storage];
		$scope.formatDesc = formats[$scope.entity.storageConfigurations.format];
	}

	$scope.previewLoading = true;
	auxo.meta.dataset.onFetch = function(entity) {
		$scope.previewLoading = true;
		$scope.entity = entity;
		buildSchemaDisplayName();
		$scope.storageDesc = storages[$scope.entity.storage];
		$scope.formatDesc = formats[$scope.entity.storageConfigurations.format];
		Restangular.one("datasets", id).customGET("preview", {rows : 100}).then(
				function(pdo) {
					$scope.previewLoading = false;
					Restangular.one("schemas", entity.schema).get().then(function(dc) {
					    $scope.previewError = null;
						$scope.rowHeaders = dc.fields;
						$scope.rowCollection = pdo;
					});
				}, function (errorResponse) {
					$scope.previewError = errorResponse.data;
					$scope.previewLoading = false;
				});
	}

    $scope.doRefreshPreview = function() {
      $scope.previewLoading = true;
      Restangular.one("datasets", id ? id : "$new").customPOST($scope.entity, "preview", {rows : 100}, {}).then(
      				function(pdo) {
      					$scope.previewLoading = false;
      					Restangular.one("schemas", $scope.entity.schema).get().then(function(dc) {
      					    $scope.previewError = null;
      						$scope.rowHeaders = dc.fields;
      						$scope.rowCollection = pdo;
      					});
      				}, function (errorResponse) {
      					$scope.previewError = errorResponse.data;
      					$scope.previewLoading = false;
      				});
    };

	EditBaseController.call(this, auxo.meta.dataset, $scope, $window, $http, $stateParams, $location, ngDialog, Restangular)

    $scope.disableEdit = !$scope.isNew; // !isNew

    $scope.switchLock= function() {
        $scope.disableEdit = !$scope.disableEdit;
    }

	$scope.supportedStorages = ["HDFS","HIVE","JDBC", "KAFKA", "HBASE", "FTP"];
	
	$scope.onStorageChange = function() {

		angular.extend($scope.entity, auxo.clone(entities[$scope.entity.storage]))

		$scope.storageDesc = storages[$scope.entity.storage];
		$scope.formatDesc =  formats[$scope.entity.storageConfigurations.format];
	}

	$scope.onStorageDescChange = function (s) {
		if(s.name === 'format')
			$scope.formatDesc =  formats[$scope.entity.storageConfigurations.format];
		else if(s.name === 'driver')
			$scope.entity.storageConfigurations.url = auxo.jdbc.getUrl($scope.entity.storageConfigurations[s.name])

	}

	function buildSchemaDisplayName() {
		$scope.schemaName = $scope.entity.schemaName+'(ver='+$scope.entity.schemaVersion+')';
	}

	$scope.openSelectSchemaDialog = function() {
		  var dlg = ngDialog.open({
			    template: 'app/data/schemasDialog.html',
			    className: 'ngdialog-theme-default custom-width',
		  });
		  dlg.closePromise.then(function (data) {
			  if ( $.isArray(data.value) ) {
				  $scope.entity.schema = data.value[0].id;
				  $scope.entity.schemaName = data.value[0].name;
				  $scope.entity.schemaVersion = data.value[0].version;
				  buildSchemaDisplayName()
				  if (!$scope.entity.expiredPeriod || $scope.entity.expiredPeriod == 0) {
					  $scope.entity.expiredPeriod = data.value[0].expiredPeriod;
				  }
				  if($scope.entity.expiredPeriod === undefined)
					  $scope.entity.expiredPeriod = 0;
			  }
		  });
		}	

});

auxo.meta.selectSchemas = {
		restRootPath:"schemas",
		detailTemplate : "",
		entityDisplayName:"Schema",
		getBaseFilter: function() {
			return "";
		},
		selectedTabStatus : "RUNNING",
		rowHeaders : [   {name : "id", disName : "ID", converter : auxo.same},
						 {name : "name", disName : "名称", converter : auxo.same},
						 {name : "version", disName : "版本", converter : auxo.same},
						 {name : "createTime", disName : "创建时间", converter : auxo.date2str},
						 ]
};
App.controller('SelectSchemaController', function SelectSchemaController($filter,$scope, $location, $window, $http, $stateParams, ngDialog, Restangular) {
	CrudBaseController.call(this, auxo.meta.selectSchemas, $scope, $location, $window, $http, Restangular, ngDialog, $filter)
});

App.controller('cdoHistoryController', function CdoHistoryController($scope, Restangular, modalInstance) {

    $scope.title = "历史信息";

    $scope.cancel = function () {
        auxo.delHotkey($scope)
        modalInstance.closeModal()
    }

    $scope.modalButtons =[
        {
            action: $scope.cancel,
            text:"关闭",class:"btn-warning"
        }
    ];
    $scope.closeModal = $scope.cancel

    $scope.datasetHistory = $scope.datasetHistory || {};
	var datasetHistory = $scope.datasetHistory;
	datasetHistory.header = [
			{"display":"Name", "origin":"cdoName", "converter" : auxo.same},
			{"display":"SchedulerName", "origin":"schedulerName", "converter" : auxo.same},
			{"display":"FlowName", "origin":"flowName", "converter" : auxo.same},
			{"display":"Type", "origin":"type", "converter" : auxo.same},
			{"display":"Time", "origin":"timer", "converter" : auxo.date2str},
			{"display":"Operator", "origin":"userName", "converter" : auxo.same}
		];
	datasetHistory.content = [];
	datasetHistory.originContent = [];
//	console.info($scope.inputData.values);
	Restangular.one("dataHistory", $scope.inputData.values).get().then(function(ent){
		$scope.datasetHistory.content = ent.fields;
	});
});
