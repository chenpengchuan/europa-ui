var wf = {
    "id": "flow-012",
    "name": "简单三步流程012",
    "tags": ["simple", "demo"],
    "description": "简单三步流程，供演示使用",
    "steps": [{
        "id": "sdc-001",
        "name": "开始读文件",
        "type": "source_text",
        "x": 0,
        "y": 0,
        "implementation": null,
        "libs": null,
        "inputConfigurations": [],
        "outputConfigurations": [{"id": "output", "fields": "id,name,age"}],
        "otherConfigurations": {
            "schema": "id:bigint,name:string,age:bigint",
            "path": "hdfs://demo-input.txt",
            "delimiter": ","
        }
    }, {
        "id": "sdc-002",
        "name": "过滤出大于1岁的",
        "type": "filter",
        "x": 0,
        "y": 0,
        "implementation": null,
        "libs": null,
        "inputConfigurations": [{"id": "input", "fields": "id,name,age"}],
        "outputConfigurations": [{"id": "output", "fields": "id,name,age"}],
        "otherConfigurations": {"condition": "age>1"}
    }, {
        "id": "sdc-003",
        "name": "结束写文件",
        "type": "sink_text",
        "x": 100,
        "y": 100,
        "implementation": null,
        "libs": null,
        "inputConfigurations": [{"id": "input", "fields": "id,name,age"}],
        "outputConfigurations": [{"id": "output", "fields": "id,age"}],
        "otherConfigurations": {"path": "hdfs://demo-output.txt", "delimiter": ","}
    }],
    "links": [{
        "name": "开始->过滤出大于1岁的",
        "source": "sdc-001",
        "sourceOutput": "output",
        "target": "sdc-002",
        "targetInput": "input"
    }, {
        "name": "过滤出大于1岁的->结束写文件",
        "source": "sdc-002",
        "sourceOutput": "output",
        "target": "sdc-003",
        "targetInput": "input"
    }],
    "creator": "$system",
    "createTime": 1463127758232,
    "lastModifier": "admin",
    "lastModifiedTime": 1463127758958,
    "owner": "$system",
    "version": 13,
    "enabled": 1,
    "route": "flows/flow-012",
    "reqParams": null,
    "restangularized": true,
    "fromServer": true,
    "parentResource": null,
    "restangularCollection": false
}