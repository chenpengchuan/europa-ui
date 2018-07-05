//$("#treetable").treetable({ 	expandable: true,// 展示 	initialState :"expanded",//默认打开所有节点 	stringCollapse:'关闭', 	stringExpand:'展开', 	onNodeExpand: function() {// 分支展开后的回调函数 		var node = this; 		//判断当前节点是否已经拥有子节点 		var childSize = $("#treetable").find("[data-tt-parent-id='" + node.id + "']").length; 		if (childSize > 0) {  			 return;  		} 		var data = "pageId=" + node.id; 		// Render loader/spinner while loading 加载时渲染 		$.ajax({ 			loading : false, 			sync: false,// Must be false, otherwise loadBranch happens after showChildren? 			url : context + "/document/loadChild.json", 			data: data, 			success:function(result) { 				if(0 == result.code ){	 					if(!com.isNull(result.body)){ 						if(0 == eval(result.body['chilPages']).length){//不存在子节点 							var $tr = $("#treetable").find("[data-tt-id='" + node.id + "']"); 							$tr.attr("data-tt-branch","false");// data-tt-branch 标记当前节点是否是分支节点，在树被初始化的时候生效 							$tr.find("span.indenter").html("");// 移除展开图标 							return; 						} 						 						var rows = this.getnereateHtml(result.body['chilPages']); 						$("#treetable").treetable("loadBranch", node, rows);// 插入子节点 						$("#treetable").treetable("expandNode", node.id);// 展开子节点 					} 				}else{ 					alert(result.tip); 				}	 			} 		}); 	  } });
$("#treetable").treetable({
    onNodeExpand: function() {
        // 分支展开后的回调函数
        var node = this;
        //判断当前节点是否已经拥有子节点
        var childSize = $("#treetable").find("[data-tt-parent-id='" + node.id + "']").length;
        if (childSize > 0) {
            return;
        }
        var data = "pageId=" + node.id;
        // Render loader/spinner while loading 加载时渲染
        $.ajax({
            loading: false,
            sync: false,
            // Must be false, otherwise loadBranch happens after showChildren?
            url: context + "/document/loadChild.json",
            data: data,
            success: function(result) {
                if (0 == result.code) {
                    if (!com.isNull(result.body)) {
                        if (0 == eval(result.body['chilPages']).length) {
                            //不存在子节点
                            var $tr = $("#treetable").find("[data-tt-id='" + node.id + "']");
                            $tr.attr("data-tt-branch", "false");
                            // data-tt-branch 标记当前节点是否是分支节点，在树被初始化的时候生效
                            $tr.find("span.indenter").html(""); // 移除展开图标
                            return;
                        }
                        var rows = this.getnereateHtml(result.body['chilPages']);
                        $("#treetable").treetable("loadBranch", node, rows); // 插入子节点
                        $("#treetable").treetable("expandNode", node.id); // 展开子节点
                    }
                } else {
                    alert(result.tip);
                }
            }
        });
    }
});