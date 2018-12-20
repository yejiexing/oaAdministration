/**
 * Created by Administrator on 2017/9/13 0013.
 */
var app = angular.module('sysRules',[]);
app.controller('sysRulesCtrl',function($http,$scope) {
    var self = this;
    var parents = window.parent;
    var url = parents.url;
    var state = window.parent.UserId == 0?true:false;
    $scope.index = $scope.read = $scope.update = $scope.save = $scope.delete = $scope.deletes = $scope.enables = $scope.state = state;
    if(!state) {
        $scope.index = parents.authList('rules-index');//查看列表权限
        $scope.read = parents.authList('rules-read');//查看详情权限
        $scope.update = parents.authList('rules-update');//编辑操作
        $scope.save = parents.authList('rules-save');//添加操作
        $scope.delete = parents.authList('rules-delete');//删除操作
        $scope.deletes = parents.authList('rules-deletes');//批量删除操作
        $scope.enables = parents.authList('rules-enables');//批量启用禁用操作
    }
    $("#query").show();
    self.id = '';
    $scope.deleteState = false;
    $scope.editState = false;
    $scope.newState = false;
    $scope.structuresId = $scope.usersMethod = self.F_Top = '';
    $scope.rulesArr = $scope.copyrulesArr = new Object();
    initTable();
    $scope.doQuery = function(params){
        self.F_Top = params == ''?'':$(".fixed-table-body").scrollTop();
        $('#demo-table').bootstrapTable('refreshOptions',{pageNumber:1}).bootstrapTable('refresh');
        $scope.deleteState = $scope.editState = $scope.newState = false;
    }
    $scope.deleteFun = function(params){//删除
        $("#table_delete").modal("show");
    }
    $scope.editFun = function(params){//编辑
        $scope.usersError = '';
        $scope.structuresId = $scope.rulesArr.id;
        $scope.usersMethod = 'put';
        $http.defaults.headers.common = { token: parents.token() };
        $http({
            method: 'get',
            url: url + '/admin/rules/'+$scope.rulesArr.id
        }).success(function (data) {
            if(data.code == 200) {
                $scope.copyrulesArr = data.data;
                $scope.copyrulesArr.pid = String($scope.copyrulesArr.pid);
                $scope.copyrulesArr.level = String($scope.copyrulesArr.level);
                $scope.copyrulesArr.status = String($scope.copyrulesArr.status);
                $scope.queryData();
                $("#preservaModal").modal("show");
                $("#myModalLabel").html('编辑 权限规则');
            }
        }).error(function(){
        });
    }
    $scope.deleteConfirm = function(){ //删除弹出框
        $http.defaults.headers.common = { token: parents.token() };
        $http({
            method: 'delete',
            url: url + '/admin/rules/'+$scope.rulesArr.id
        }).success(function (data) {
        $("#table_delete").modal("hide");
        $("#code").html('删除成功');
        $("#table_success").modal("show");
        $scope.doQuery();
        }).error(function(){
        });

    };

    $scope.preservaConfirm = function(){//新增弹出框
        parents.screen.Delete($scope.copyrulesArr)
        $http.defaults.headers.common = { token: parents.token() };
        $http({
            method : $scope.usersMethod,
            url: url + '/admin/rules/'+$scope.structuresId,
            params : $scope.copyrulesArr
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
    $scope.NewlyAdded = function(){//打开新增
        $scope.usersError = '';
        $scope.structuresId = '';
        $scope.usersMethod = 'post';
        $scope.queryData();
        $scope.copyrulesArr = {
            pid : String($scope.rulesArr.id),
            level : "1",
            status : "1"
        };
        $("#preservaModal").modal("show");
        $("#myModalLabel").html('新增 权限规则');
    };
    //查询上级id
    $scope.queryData = function() {
        $http.defaults.headers.common = { token: parents.token() };
        $http({
            method: 'get',
            url: url + '/admin/rules/'
        }).success(function (data) {
            $scope.rulesList = data.data;
        }).error(function (r) {
            alert('服务器异常，请稍候重试')
        })
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
            url:url + 'admin/rules',
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
                    $scope.rulesArr = $scope.copyrulesArr = data.data[$(this).index()];
                    $('.bg-color').removeClass('bg-color');
                    table_tr.eq($(this).index()).addClass("bg-color");
                })
                if(self.F_Top != ''){
                    $(".fixed-table-body").scrollTop(self.F_Top)
                }
            }
        });
        numData = function(value, row, index) {
            return  index+1;
        };
        titleData = function(value, row, index) {
            return "<div style='white-space:pre;text-align: left'>"+value+"</div>";
        };
        window.is_adminEvents = {
            //编辑
            'click .is_admin_span': function(value, row, index, i) {
            }
        };

    }
    //解决表头缩放问题
    $(window).resize(function() {
        $('#demo-table').bootstrapTable('resetView');
    });
});