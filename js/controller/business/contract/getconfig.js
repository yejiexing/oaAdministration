/**
 * Created by Administrator on 2017/9/13 0013.
 */
var app = angular.module('getConfig',[]);
app.controller('getConfigCtrl',function($http,$scope) {
    var self = this;
    var parents = window.parent;
    var url = parents.url;
    var state = window.parent.UserId == 0?true:false;
    $scope.index = $scope.setconfig = state;
    if(!state) {
        $scope.index = parents.authList('getconfig-index');//查看列表权限
        $scope.setconfig = parents.authList('getconfig-setconfig');//查看详情权限
    }
    $("#query").show();
    $scope.structuresId = '';
    initTable();
    $scope.update = function(row,id){ //编辑弹出框
        $("#charge").modal("show");
        $("#chargeTitle_che").html("选择查看人");
        $scope.structuresId = id;
        $scope.copyp_name = row;
        $scope.structuresList()
    };
    $scope.doQuery = function(name){
        $scope.configObj = {uids: "", u_names: "", title: ""};
        $('#audit').modal('show');
    }
    $scope.audit = function(){
        if($scope.configObj.title == ''){
            $scope.usersError = '请填写合同标题';
            return false;
        }
        $scope.conType = Number($scope.conType)+10;
        $scope.config[$scope.conType] = $scope.configObj;
        configAjax();
    }
    $scope.structuresList = function(v){//部门管理数据查询
        $scope.chargeList =  parents.division(true,$scope.copyp_name.uids.split(','));
    }
    $scope.chargesKeep = function(){
        var che_value = [];
        var che_num = [];
        var depar = $("input[name='charge']:checked");
        depar.each(function(){
            che_value.push($(this).val());
            che_num.push($(this).attr('data-num'));
        });
        if(che_value.join(",") == ''){
            alert('请选择审核人');
        }else{
            $scope.copyp_name.u_names = che_value.join(",");
            $scope.copyp_name.uids = che_num.join(",");
            configAjax();
        }
    };
    function configAjax(){
        $.ajax({
            url: url+'admin/contract/setConfig',
            beforeSend: function(request) {
                request.setRequestHeader("token", parents.token());
            },
            dataType: 'JSON',
            async: false,//请求是否异步，默认为异步
            type: 'PUT',
            data:{config:$scope.config},
            success: function (data) {
                if(data.code == 200){
                    $("#charge").modal("hide");
                    $('#audit').modal('hide');
                    $("#code").html(data.data);
                    $("#table_success").modal("show");
                }
                //$scope.departmentList =  data.data;
            }
        })
    }
    function initTable(){
        $http.defaults.headers.common = { token: parents.token() };
        $http({
            method: 'get',
            url: url + 'admin/contract/getConfig'
        }).success(function (data) {
            if(data.code ==200){
                $scope.config = data.data;
                var configArr = []
                $.each($scope.config,function(v,i){
                    configArr.push(v);
                });
                $scope.conType = configArr[configArr.length-1];
                //$scope.config[110] = {uids: "", u_names: "", title: ""};
            }
        }).error(function (r) {
            alert('服务器异常，请稍候重试')
        })
    }
});