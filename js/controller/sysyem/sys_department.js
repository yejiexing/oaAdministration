/**
 * Created by Administrator on 2017/9/13 0013.
 */
var app = angular.module('sysStructures',[]);
app.controller('sysStructuresCtrl',function($http,$scope) {
    var self = this;
    var parents = window.parent;
    var url = parents.url;
    var state = window.parent.UserId == 0?true:false;
    $scope.index = $scope.read = $scope.update = $scope.save = $scope.delete = $scope.deletes = $scope.enables = $scope.state = state;
    if(!state) {
        $scope.index = parents.authList('structures-index');//查看列表权限
        $scope.read = parents.authList('structures-read');//查看详情权限
        $scope.update = parents.authList('structures-update');//编辑操作
        $scope.save = parents.authList('structures-save');//添加操作
        $scope.delete = parents.authList('structures-delete');//删除操作
        $scope.deletes = parents.authList('structures-deletes');//批量删除操作
        $scope.enables = parents.authList('structures-enables');//批量启用禁用操作
    }
    $("#query").show();
    self.id = '';
    $scope.deleteState = false;
    $scope.editState = false;
    $scope.newState = false;
    $scope.structuresId = '';
    $scope.usersMethod = '';
    $scope.structuresArr = $scope.copystructuresArr = new Object();
    initTable();
    $scope.doQuery = function(params){
        $('#demo-table').bootstrapTable('refresh');    //刷新表格
        $scope.deleteState = $scope.editState = $scope.newState = false;
    }
    $scope.deleteFun = function(params){//删除
        $("#table_delete").modal("show");
    }
    $scope.editFun = function(params){//编辑
        $scope.usersError = '';
        $scope.structuresId = $scope.structuresArr.id;
        $scope.usersMethod = 'put';
        $http.defaults.headers.common = { token: parents.token() };
        $http({
            method: 'get',
            url: url + '/admin/structures/' + $scope.structuresArr.id
        }).success(function (data) {
            if(data.code == 200) {
                $scope.copystructuresArr = data.data;
                $("#preservaModal").modal("show");
                $("#myModalLabel").html('编辑 组织架构');
            }
        }).error(function(){
        });
    }
    $scope.deleteConfirm = function(){ //删除弹出框
        $http.defaults.headers.common = { token: parents.token() };
        $http({
            method: 'delete',
            url: url + '/admin/structures/' + $scope.structuresArr.id
        }).success(function (data) {
        $("#table_delete").modal("hide");
        $("#code").html('删除成功');
        $("#table_success").modal("show");
        $scope.doQuery();
        }).error(function(){
        });

    };

    $scope.preservaConfirm = function(){//新增弹出框
        parents.screen.Delete($scope.copystructuresArr)
        $http.defaults.headers.common = { token: parents.token() };
        $http({
            method : $scope.usersMethod,
            url: url + '/admin/structures/' + $scope.structuresId,
            params : $scope.copystructuresArr
        }).success(function(data){
            if(data.code == 200){
                $scope.doQuery();
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
    $scope.NewlyAdded = function(){
        $scope.usersError = '';
        $scope.structuresId = '';
        $scope.usersMethod = 'post';
        $scope.copystructuresArr = {
            incharge : '负责人',
            incharge_id : '16',
            sort : 0,
            pid : $scope.structuresArr.id
        };
        $("#preservaModal").modal("show");
        $("#myModalLabel").html('新增 组织架构');
    };
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
            url:url + 'admin/structures',
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
                $("#demo-table tbody tr").click(function(){
                    $scope.deleteState = $scope.editState = $scope.newState = true;
                    if($(this).index() == 0){
                        $scope.deleteState = false;
                    }
                    $scope.structuresArr = $scope.copystructuresArr = data.data[$(this).index()];
                    $("#demo-table tbody tr").siblings().removeClass("bg-color").eq($(this).index()).addClass("bg-color");
                })
                $('a[id^="sort"]').editable({
                    disabled: false,             //是否禁用编辑
                    emptytext: "-",          //空值的默认文本
                    url: function (params) {
                        var sNum = $(this).attr("data-num");
                        var sName = $(this).attr("name");
                        $scope.structuresArr[sName] = parseInt(params.value);
                        var d = new $.Deferred();
                    }
                });
            }
        });
        numData = function(value, row, index) {
            return  index+1;
        };
        titleData = function(value, row, index) {
            return "<div style='white-space:pre;text-align: left'>"+value+"</div>";
        };
        sortData = function(value, row, index) {
            if($scope.update) {
                value = value == null ? '' : value;
                return '<a href="#" id="sort' + index + '" name="sort" data-num="' + index + '" data-type="text" data-title="排序号">' + value + '</a>';
            }else{
                return value;
            }
        };
    }
    //解决表头缩放问题
    $(window).resize(function() {
        $('#demo-table').bootstrapTable('resetView');
    });
});