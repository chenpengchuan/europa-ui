App.controller("ItemSelectionController", function($scope, Restangular, sgDialogService, $controller, modalInstance) {

    $scope.allSelected = false;
    $scope.leftList =  {label: $scope.inputData.leftLabel || "选项", items: [], dragging: false, "allowedTypes": [""],};
    $scope.rightList =  {label: $scope.inputData.rightLabel || "已选", items: [], dragging: false};
    $scope.dragDisabled = false;

    // var returnData = "";

    // $scope.leftList.items = $scope.leftOptions;
    // $scope.rightList.items = $scope.rightSelectedItems;
    if ($scope.inputData.values) {
        $scope.rightSelectedItems = $scope.inputData.values.split(",");
    } else
        $scope.rightSelectedItems = [];

    var buildItemsStr = function (items) {
        s = ""
        auxo.forEachArray(items, function (e, i) {
            s += ( s.length == 0? "" : ",") + e.column;
        })
        return s;
    }

    $scope.refreshInputData = function (tab) {
        var buildInputData = function (step) {
            var fields = [];
            if ($scope.inputData.leftOptions)
                if (angular.isArray($scope.inputData.leftOptions))
                    fields = $scope.inputData.leftOptions;
                else
                    fields = $scope.inputData.leftOptions.split(",");
            if(!fields)
                fields = [];

            var array = [];
            for(var i=0;i<fields.length;i++) {
                if (angular.isString(fields[i]))
                    array.push({column: fields[i].trim(), selected: $scope.allSelected, type: "source", visible: true});
                else if(fields[i].column || fields[i].alias)
                    array.push({column: fields[i].alias && fields[i].alias.length>0? fields[i].alias.trim(): fields[i].column.trim(), selected: $scope.allSelected, type: "source", visible: true});
            }

            $scope.leftList.items = array
            //syncFieldValidation();
        }

        buildInputData();
    }

    function buildRightList () {
        $scope.rightList.items = [];
        auxo.forEachArray($scope.rightSelectedItems, function (e, i) {
            if (angular.isString(e))
                $scope.rightList.items.push({column: e.trim(), alias: e.trim(), valid: true})
            else
                $scope.rightList.items.push({column: e.column.trim(), alias: e.alias.trim(), valid: true})
        })
    }

    $scope.refreshData = function (showError) {
        $scope.refreshInputData()
        $scope.syncData();
    }

    function syncFieldValidation() {
        auxo.forEachArray($scope.rightList.items, function (e, i) {
            e.valid = false;
            auxo.forEachArray($scope.leftList.items, function (e1, j) {
                if(e.column === e1.column) {
                    e.valid = true;
                    return false
                }
            })
        })
        $scope.$parent.setDialogMessage("","error");
        var invalidFields = [];
        auxo.forEachArray($scope.rightList.items, function (e, i) {
            if(!e.valid) {
                invalidFields.push(e.column);
            }
        })
        if(invalidFields.length>0) {
            $scope.$parent.setDialogMessage("非法输入字段: " + invalidFields.join(", "),"error");
        }
    }

    $scope.syncData = function () {
        //var rightItems = [];
        $scope.leftList.items.forEach(function(e) {e.visible = true;})
        for ( var i in $scope.rightList.items) {
            for (var j = $scope.leftList.items.length - 1; j >=0; j--) {
                if ($scope.leftList.items[j].column == $scope.rightList.items[i].column) {
                    $scope.leftList.items[j].visible = false;
                }
            }
        }
    }

    $scope.onChange =function (item) {
        if(!item.valid)
        auxo.forEachArray($scope.leftList.items, function (e,i) {
            if(e.column === item.column) {
                item.valid = true;
                return false;
            }
        })

        //syncData()
    }

    // function activate(tab) {
    //     // if(tab.category === "Output") {
    //     //     $scope.refreshData()
    //     // }
    // }

    auxo._list2List.call(this, $scope);

    buildRightList()
    // $scope.$parent.tabChangeListeners.push({func: activate, tab:tab});

    // ok click
    $scope.ok = function () {
        function yes() {
            //auxo.delHotkey($scope)
            //removeNullValues(data)
            //afterEdit();
            modalInstance.closeModal({value: buildItemsStr($scope.rightList.items)});
        }
        yes();

    };

    // cancel click
    $scope.cancel = function () {
        //auxo.delHotkey($scope)
        modalInstance.closeModal(false)
    }

    $scope.closeModal = function () {
        $scope.cancel();
    }

    $scope.title = "设置";  //data.type + ' 设置';
    $scope.modalButtons = [
        {
            action: $scope.ok,
            text: "确定", class: "btn-primary"
            // disabled: function () {
            //     if ($scope.callbackForm) return $scope.callbackForm.$invalid || !$scope.callbackForm.$dirty;
            // }
        },
        {
            action: $scope.cancel,
            text: "取消", class: "btn-warning"
        }
        // ,{
        //     action: function () {auxo.alert(null, configuration, "configuration")},
        //     text: "查看", class: "btn-warning"
        // }
    ];

    $scope.refreshData()
});

auxo._list2List = function ($scope) {

    $scope.deleteItem = function (index) {
        var item = $scope.rightList.items[index]
        $scope.rightList.items.splice(index, 1)
        $scope.leftList.items.forEach(function(e) {if (e.column == item.column) e.visible = true;})
    }

    $scope.selectAll = function () {
        var leftList = $scope.leftList;
        if(leftList.items.length==0)
            return;
        if (!$scope.inputData.multiple)
            return;
        auxo.forEachArray(leftList.items, function (e,i) {
            if (e.visible)
                e.selected = $scope.allSelected;
            else
                e.selected = false;
        })
    }

    /**
     * dnd-dragging determines what data gets serialized and send to the receiver
     * of the drop. While we usually just send a single object, we send the array
     * of all selected items here.
     */
    $scope.getSelectedItemsIncluding = function(list, item) {
        if(!item.selected) {
            auxo.array.forEach(list.items, function (e) {
                e.selected = false;
            })
        }
        item.selected = true;
        return list.items.filter(function(item) { return item.selected; });
    };

    /**
     * In the dnd-drop callback, we now have to handle the data array that we
     * sent above. We handle the insertion into the list ourselves. By returning
     * true, the dnd-list directive won't do the insertion itself.
     */
    $scope.onDrop = function(list, items, index) {
        if (!$scope.inputData.multiple && items && items.length > 1)
            return;
        angular.forEach(items, function(item) { item.selected = false; item.visible = false;});

        var itemsCopy = auxo.clone(items);
        auxo.forEachArray(itemsCopy, function (e, i) {
            e.valid = true;
        })

        if ($scope.inputData.multiple)
            list.items = list.items.slice(0, index)
                .concat(itemsCopy)
                .concat(list.items.slice(index));
        else
            list.items = itemsCopy;

        $scope.syncData()
        return true;
    }

    /**
     * Last but not least, we have to remove the previously dragged items in the
     * dnd-moved callback.
     */
    $scope.onMoved = function(list) {
        list.items = list.items.filter(function(item) { return !item.selected; });
        //synchData()
    };

    $scope.onSelected = function (list, item, event) {
        if(event.target.nodeName === "SELECT" || event.target.nodeName === "INPUT") return;

        var items = list==='left'? $scope.leftList.items: $scope.rightList.items

        if(event.ctrlKey) {
            item.selected = !item.selected;
        } else if(event.shiftKey) {
            var from=-1, to=-1;
            var isFrom = false;
            auxo.forEachArray(items, function (e,i) {
                if(e === item){
                    if(from < 0) {
                        from = i;
                        isFrom = true;
                    } else {
                        to = i;
                    }
                } else if(e.selected) {
                    if(from < 0) {
                        from = i;
                    } else {
                        if(isFrom) {
                            if(to<0)
                                to = i;
                        } else {
                            from = i;
                        }
                    }
                }
                e.selected = false;
            })
            if(from >=0 && to >=0) {
                auxo.forEachArray(items, function (e,i) {
                    if(i>=from && i<=to)
                        e.selected = e.visible && true;
                })
            } else {
                item.selected = item.visible && true;
            }
        } else {
            auxo.forEachArray(items, function (e) {
                e.selected = false;
            })
            item.selected = item.visible && true;
        }
    }

    $scope.mouseDown = function (event) {
        if(event.target.nodeName === "SELECT" || event.target.nodeName === "INPUT")
            $scope.dragDisabled = true;
        else
            $scope.dragDisabled = false;
    }

    // $scope.deleteInvalid = function () {
    //     auxo.forEachArrayReverse($scope.rightList.items,function (e,i) {
    //         if(!e.valid)
    //             $scope.rightList.items.splice(i,1)
    //     })
    //     //synchData()
    // }

    $scope.deleteAll = function () {
        $scope.rightList.items = []
        $scope.leftList.items.forEach(function(e) {e.visible = true})
    }

    $scope.hasItemWithAttr = function (list, attr, value) {
        return !auxo.array.getItemByAttr(list, attr, value)
    }
}

