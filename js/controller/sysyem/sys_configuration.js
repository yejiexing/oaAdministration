/**
 * Created by Administrator on 2017/9/13 0013.
 */
var app = angular.module('ConfigUration',[]);
app.controller('ConfigUrationCtrl',function($http,$scope) {
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
    $scope.structuresId = '';
    initTable();
    $scope.update = function(row,id){ //编辑弹出框
        $("#charge").modal("show");
        $("#chargeTitle_che").html("选择审核人");
        $scope.structuresId = id;
        //if(id == 1){
        $scope.copyp_name = row;
        $scope.chargeList =  parents.division(true,$scope.copyp_name.config.split(','));
        //}else{
        //
        //}
    };
    $scope.checkbox = function(row,index){
        if(row.is_all){
            var all_v = index == 1?'自定义':'all';
            row.config = row.select_name = all_v;
        }else{
            row.config = row.select_name = '';
        }
        configAjax();
    }
    $scope.structuresList = function(v){//部门管理数据查询
        $scope.chargeList = parents.division(true,$scope.copyp_name.config.split(','));
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
            $scope.copyp_name.select_name = che_value.join(",");
            $scope.copyp_name.config = che_num.join(",");
            $scope.copyp_name.is_all = false;
            configAjax();
        }
    };
    function configAjax(){
        $.ajax({
            url: url+'admin/system_config/setVerifyConfig',
            beforeSend: function(request) {
                request.setRequestHeader("token", parents.token());
            },
            dataType: 'JSON',
            async: false,//请求是否异步，默认为异步
            type: 'post',
            data:{model_config:$scope.model_config,new_data_config:$scope.new_data_config},
            success: function (data) {
                if(data.code == 200){
                    $("#charge").modal("hide");
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
            url: url + 'admin/system_config/getVerifyConfig'
        }).success(function (data) {
            if(data.code ==200){
                angular.forEach(data.data.model_config,function(v,i){
                    if(v.is_all && eval(v.is_all.toLowerCase())){
                        v.is_all = true;
                    }else{
                        v.is_all = false;
                    }
                })
                $scope.model_config = data.data.model_config;
                angular.forEach(data.data.new_data_config,function(v,i){
                    if(eval(v.is_all.toLowerCase())){
                        v.is_all = true;
                    }else{
                        v.is_all = false;
                    }
                })
                $scope.new_data_config = data.data.new_data_config;
            }
        }).error(function (r) {
            alert('服务器异常，请稍候重试')
        })
    }
    $scope.doQuery = function(name){
        $scope.configObj = {config: "", is_all: false, name: "", select_name: "", type: ""};
        $scope.configName = name;
        $('#audit').modal('show');
    }
    $scope.audit = function(){
        var channelNum = 0;
        $scope.usersError = '';
        angular.forEach($scope.configObj,function(v,i){
            if((i=='name' || i == 'type') && v == ''){
                channelNum++
            }
        })
        if(channelNum != 0){
            $scope.usersError = '请完善必填内容';
            return false;
        }
        $scope[$scope.configName].push($scope.configObj);
        $('#audit').modal('hide');
        $('#code').html('配置成功');
        $('#table_success').modal('show');
    }
});