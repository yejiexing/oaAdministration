/**
 * Created by Administrator on 2017/9/13 0013.
 */
var app = angular.module('sysGroups',[]);
app.controller('sysGroupsCtrl',function($http,$scope) {
    var self = this;
    var parents = window.parent;
    var url = parents.url;
    var state = window.parent.UserId == 0?true:false;
    $scope.index = $scope.read = $scope.update = $scope.save = $scope.delete = $scope.deletes = $scope.enables = $scope.state = state;
    if(!state) {
        $scope.index = parents.authList('groups-index');//查看列表权限
        $scope.read = parents.authList('groups-read');//查看详情权限
        $scope.update = parents.authList('groups-update');//编辑操作
        $scope.save = parents.authList('groups-save');//添加操作
        $scope.delete = parents.authList('groups-delete');//删除操作
        $scope.deletes = parents.authList('groups-deletes');//批量删除操作
        $scope.enables = parents.authList('groups-enables');//批量启用禁用操作
    }
    $("#query").show();
    self.id = '';
    $scope.deleteState = false;
    $scope.editState = false;
    $scope.newState = false;
    $scope.groupsId = '';
    $scope.usersMethod = self.F_Top = '';
    $scope.groupsArr = $scope.copygroupsArr = new Object();
    initTable();
    $scope.doQuery = function(params){
        self.F_Top = params == ''?'':$(".fixed-table-body").scrollTop();
        $('#demo-table').bootstrapTable('refresh');    //刷新表格
        $scope.deleteState = $scope.editState = $scope.newState = false;
    }
    $scope.deleteFun = function(params){//删除
        $("#table_delete").modal("show");
    }
    $scope.editFun = function(params){//编辑
        $scope.usersError = '';
        $scope.groupsId = $scope.groupsArr.id;
        $scope.usersMethod = 'put';
        $http.defaults.headers.common = { token: parents.token() };
        $http({
            method: 'get',
            url: url + '/admin/groups/' + $scope.groupsArr.id
        }).success(function (data) {
            if(data.code == 200) {
                $scope.copygroupsArr = data.data;
                $scope.copygroupsArr.structure_id = String($scope.copygroupsArr.structure_id);
                $scope.copygroupsArr.status = String($scope.copygroupsArr.status);
                $scope.rulesState = false;
                $("#preservaModal").modal("show");
                $("#myModalLabel").html('编辑 用户组管理');
                $scope.queryData(1,$scope.copygroupsArr.rules);
            }
        }).error(function(){
        });
    }
    $scope.deleteConfirm = function(){ //删除弹出框
        $http.defaults.headers.common = { token: parents.token() };
        $http({
            method: 'delete',
            url: url + '/admin/groups/' + $scope.groupsArr.id
        }).success(function (data) {
        $("#table_delete").modal("hide");
        $("#code").html('删除成功');
        $("#table_success").modal("show");
        $scope.doQuery();
        }).error(function(){
        });

    };

    $scope.preservaConfirm = function(){//新增弹出框
        var rulesArr = [];
        var depar = $("input[name='groups-che']:checked");
        depar.each(function(){
            rulesArr.push($(this).val());
        });
        $scope.copygroupsArr.rules = rulesArr.join(',');
        $scope.copygroupsArr.structure = $('#select').find("option:selected").text();
        parents.screen.Delete($scope.copygroupsArr)
        $http.defaults.headers.common = { token: parents.token() };
        $http({
            method : $scope.usersMethod,
            url: url + '/admin/groups/'+$scope.groupsId,
            params : $scope.copygroupsArr
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
    $scope.NewlyAdded = function(){
        $scope.usersError = '';
        $scope.groupsId = '';
        $scope.rulesState = true;
        $scope.usersMethod = 'post';
        $scope.queryData();
        $("#preservaModal").modal("show");
        $("#myModalLabel").html('新增 用户组管理');
        $scope.copygroupsArr = {
            status : '0',
            structure_id : '1'
        };
    };
    $scope.rulesFun = function(v,i){
        $scope.rulesState = false;
    };
    $scope.checkFun = function(){
        var che = $("input[name='all']").is(':checked');
        angular.forEach($scope.rulesList,function(v,i){
            v.check = che;
            if(v.child != undefined){
                v = parents.cherow.Flag(v,che,1);
            }
        })
    };
    $scope.cherowFun = function(v,id){
        var rowflag = !v.check;
        v.check = rowflag;
        var idx = 0;
        angular.forEach($scope.rulesList,function(v,i){
            if(v.id == id){
                idx = i;
            }
        });
        parents.cherow.Flag(v,rowflag,$scope.rulesList[idx]);
    }
    //查询上级id
    $scope.queryData = function(v,val) {
        $http.defaults.headers.common = { token: parents.token() };
        $http({
            method: 'get',
            url: url + '/admin/structures/'
        }).success(function (data) {
            $scope.groupsList = data.data;
            $scope.rulesData(v,val);
        }).error(function (r) {
            alert('服务器异常，请稍候重试')
        })
    };
    $scope.rulesData = function(v1,val) {
        $scope.rulesList = parents.rules.Fun(v1,val);
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
            url:url + 'admin/groups',
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
                    $scope.groupsArr = $scope.copygroupsArr = data.data[$(this).index()];
                    $("#demo-table tbody tr").siblings().removeClass("bg-color").eq($(this).index()).addClass("bg-color");
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
            return "<div style='white-space:pre;text-align: left;'>"+value+"</div>";
        };
        sortData = function(value, row, index) {
            value = value == null?'':value;
            return  '<a href="#" id="sort'+index+'" name="sort" data-num="'+index+'" data-type="text" data-title="排序号">'+value+'</a>';
        };
    }
    //解决表头缩放问题
    $(window).resize(function() {
        $('#demo-table').bootstrapTable('resetView');
    });
});