/**
 * Created by Administrator on 2017/9/13 0013.
 */
var app = angular.module('sysMenu',[]);
app.controller('sysMenuCtrl',function($http,$scope) {
    var self = this;
    var parents = window.parent;
    var url = parents.url;
    var state = window.parent.UserId == 0?true:false;
    $scope.index = $scope.read = $scope.update = $scope.save = $scope.delete = $scope.deletes = $scope.enables = $scope.state = state;
    if(!state) {
        $scope.index = parents.authList('menus-index');//查看列表权限
        $scope.read = parents.authList('menus-read');//查看详情权限
        $scope.update = parents.authList('menus-update');//编辑操作
        $scope.save = parents.authList('menus-save');//添加操作
        $scope.delete = parents.authList('menus-delete');//删除操作
        $scope.deletes = parents.authList('menus-deletes');//批量删除操作
        $scope.enables = parents.authList('menus-enables');//批量启用禁用操作
    }
    $("#query").show();
    $scope.structuresId = self.F_Top = '';
    $scope.menuArr = $scope.copymenuArr = new Object();
    initTable();
    $scope.doQuery = function(params){
        self.F_Top = params == ''?'':$(".fixed-table-body").scrollTop();
        $('#demo-table').bootstrapTable('refreshOptions',{pageNumber:1}).bootstrapTable('refresh');
        $scope.deleteState = $scope.editState = $scope.newState = false;
    }
    $scope.deleteFun = function(params){//删除
        $("#table_delete").modal("show");
    }
    $scope.newstrucFun = function(params){//部门管理打开添加
        $("#departmentModal").modal("show");
        $("#struc").html("选择权限");
        $scope.copystructure = angular.copy($scope.copymenuArr.rule_id);
        $scope.structuresList(false);
        //$scope.d epartmentList =  division(false);
    };
    $scope.structuresList = function(v){//部门管理数据查询
        $.ajax({
            url: url+'/admin/rules/getList',
            beforeSend: function(request) {
                request.setRequestHeader("token", parents.token());
            },
            dataType: 'JSON',
            async: false,//请求是否异步，默认为异步
            type: 'GET',
            success: function (data) {
                $scope.departmentList =  data.data;
            }
        })
    }
    $scope.deparFun = function(){//保存部门管理
        var depar = $("input[name='department']:checked");
        if(depar.val() != undefined) {
            $scope.copymenuArr.rule_id = depar.val();
            //$scope.copymenuArr.rule_id = depar.attr('data-num');
            $("#departmentModal").modal("hide");
        }else{
            alert('请选择对应部门');
        }
    };
    $scope.newtopFun = function(){//新增顶部
        $scope.usersError = '';
        $scope.structuresId = '';
        $scope.Method = 'post';
        $scope.copymenuArr = {
            pid : 0,
            status : "1"
        };
        $("#preservaModal").modal("show");
        $("#myModalLabel").html('<i class="fa fa-plus"></i>&nbsp;&nbsp;新增 菜单');
    }
    $scope.NewlyAdded = function(){//打开新增
        $scope.usersError = '';
        $scope.structuresId = '';
        $scope.Method = 'post';
        $scope.copymenuArr = {
            pid : $scope.menuArr.id,
            status : 1
        };
        $("#preservaModal").modal("show");
        $("#myModalLabel").html('菜单');
    };
    $scope.editFun = function(params){//编辑
        $scope.usersError = '';
        $scope.structuresId = $scope.menuArr.id;
        $scope.Method = 'put';
        $http.defaults.headers.common = { token: parents.token() };
        $http({
            method: 'get',
            url: url + '/admin/menus/'+$scope.menuArr.id
        }).success(function (data) {
            if(data.code == 200) {
                $scope.copymenuArr = data.data;
                $scope.copymenuArr.pid = $scope.copymenuArr.pid;
                $("#preservaModal").modal("show");
                $("#myModalLabel").html('编辑 权限规则');
            }
        }).error(function(){
        });
    }
    $scope.preservaConfirm = function(){//新增弹出框
        parents.screen.Delete($scope.copymenuArr)
        $http.defaults.headers.common = { token: parents.token() };
        $http({
            method : $scope.Method,
            url: url + '/admin/menus/'+$scope.structuresId,
            params : $scope.copymenuArr
        }).success(function(data){
            if(data.code == 200){
                $scope.doQuery(1);
                $("#preservaModal").modal("hide");
                $("#code").html(data.data);
                $("#table_success").modal("show");
            }else{
                $scope.usersError = data.error;
            }
        }).error(function(r){
            alert('服务器异常，请稍候重试')
        })
    }
    $scope.deleteConfirm = function(){ //删除弹出框
        $http.defaults.headers.common = { token: parents.token() };
        $http({
            method: 'delete',
            url: url + '/admin/menus/'+$scope.menuArr.id
        }).success(function (data) {
            if(data.code == 200) {
                $("#table_delete").modal("hide");
                $("#code").html('删除成功');
                $("#table_success").modal("show");
                $scope.doQuery();
            }
        }).error(function(){
        });

    };
    $scope.menuche = function(){
        if($scope.copymenuArr.status == 1){
            $scope.copymenuArr.status = 0;
        }else{
            $scope.copymenuArr.status = 1;
        }
    }
    function iosTable() {
        if (/iPhone/i.test(navigator.userAgent)) {
            document.querySelector('.bootstrap-table').style.width = (window.screen.availWidth - 25) + 'px';
        }
    }
    function initTable(){
        $('#demo-table').bootstrapTable({
            method:'get',
            dataType:'json',
            contentType: "application/x-www-form-urlencoded",
            height:700,
            cache: false,
            striped: true,                              //是否显示行间隔色
            url:url + 'admin/menus',
            width:$(window).width(),
            showColumns:false,
            pagination:false,
            showRefresh:false,
            ajaxOptions : {
                headers : {
                    "token": parents.token()
                }
            },
            uniqueId: "id",                     //每一行的唯一标识，一般为主键列
            showExport: true,
            exportDataType: 'all',
            onLoadSuccess:function(data){ //成功的回调
                iosTable();
                var table_tr = $("#demo-table tbody tr");
                table_tr.click(function(){
                    $scope.deleteState = $scope.editState = $scope.newState = true;
                    $scope.menuArr = $scope.copymenuArr = data.data[$(this).index()];
                    $('.bg-color').removeClass('bg-color');
                    table_tr.eq($(this).index()).addClass("bg-color");
                })
                $('a[id^="title"],a[id^="url"],a[id^="icon"],a[id^="sort"]').editable({
                   disabled: false,             //是否禁用编辑
                   emptytext: "-",          //空值的默认文本
                   url: function (params) {
                       var sNum = $(this).attr("data-num");
                       var sName = $(this).attr("name");
                       $scope.menuArr[sName] = params.value;
                       $scope.menuArr['title'] = $scope.menuArr['else'];
                       var d = new $.Deferred();
                       $http.defaults.headers.common = { token: parents.token() };
                       $http({
                           method : "put",
                           url: url + '/admin/menus/'+$scope.menuArr.id,
                           params : $scope.menuArr
                       }).success(function(data){
                           if(data.code == 200){
                           }else{
                               return d.reject(data.error);
                           }
                       }).error(function(r){
                           return d.reject('服务器异常，请稍候重试');
                       })
                   }
                });
                if(self.F_Top != ''){
                    $(".fixed-table-body").scrollTop(self.F_Top)
                }
            }
        });
        numData = function(value, row, index) {
            return  index+1;
        };
        titleData = function(value, row, index) {
             return  '<div style="text-align: left">'+value+'</div>';
         };
        urlData = function(value, row, index) {
            if($scope.update) {
                return '<a href="#" id="url' + index + '" name="url" data-num="' + index + '" data-type="text" data-title="URL">' + value + '</a>';
            }else{
                return value;
            }
        };
        iconData = function(value, row, index) {
            if($scope.update) {
                return  '<a href="#" id="icon'+index+'" name="icon" data-num="'+index+'" data-type="text" data-title="图标">'+value+'</a>';
            }else{
                return value;
            }
        };
        sortData = function(value, row, index) {
            if($scope.update) {
                return  '<a href="#" id="sort'+index+'" name="sort" data-num="'+index+'" data-type="text" data-title="排序号">'+value+'</a>';
            }else{
                return value;
            }
        };

        statusData = function(value, row, index) {
            var c_class = 'fa-square-o';
            if(value == 0){
                c_class = 'fa-square-o';
            }else{
                c_class = 'fa-check-square-o text-success';
            }
            return '<i class="fa '+c_class+' fastatus" style="cursor: pointer"></i>'
        };

        window.statusEvents = {
            //弹窗显示
            'click .fastatus': function(value, row, index, i) {
                if($scope.update) {
                    $scope.errorstate = '';
                    $scope.stateIndex = i;
                    $scope.menuArr = $scope.copymenuArr = index;
                    value.stopPropagation();
                    $("#popoverstate").css({
                        'top': $(this).offset().top - 85,
                        'left': $(this).offset().left - 32
                    }).show();
                    $("#demo-table tbody tr").siblings().removeClass("bg-color").eq(i).addClass("bg-color");
                    if ($scope.menuArr.status == 1) {
                        $("#pop_che").prop('checked', true);
                    } else {
                        $("#pop_che").prop('checked', false)
                    }
                }
                //$(this).removeClass('text-success','fa-check-square-o').addClass('fa-square-o');
            }
        };
    }

    //解决窗口收缩，表头不变的问题
    $(window).resize(function() {
        $('#demo-table').bootstrapTable('resetView');
    });

    //popoverstate窗口关闭state
    $(document).click(function(){
        $("#popoverstate").hide();
    });
    $scope.statedelete = function(){
        $("#popoverstate").hide();
    }
    $("#popoverstate").click(function(e){
        e.stopPropagation();
    });
    //popoverstate窗口关闭end
    $scope.stateedit = function(v){
        var pop_che = $("#pop_che").is(':checked');
        $scope.menuArr.status = pop_che ? 1: 0;
        $scope.menuArr['title'] = $scope.menuArr['else'];
        $http.defaults.headers.common = { token: parents.token() };
        $http({
            method : "put",
            url: url + '/admin/menus/'+$scope.menuArr.id,
            params : $scope.menuArr
        }).success(function(data){
            if(data.code == 200){
                if(pop_che){
                    $('.fastatus').eq($scope.stateIndex).removeClass('fa-square-o').addClass('text-success fa-check-square-o');
                }else{
                    $('.fastatus').eq($scope.stateIndex).removeClass('text-success','fa-check-square-o').addClass('fa-square-o');
                }
                $("#popoverstate").hide();
            }else{
                alert( data.error);
            }
        }).error(function(r){
            alert('服务器异常，请稍候重试');
        })
    }
});