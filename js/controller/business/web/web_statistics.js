/**
 * Created by Administrator on 2017/9/13 0013.
 */
var app = angular.module('webStatistics',[]);
app.controller('webStatisticsCtrl',function($http, $scope, $timeout) {
    var self = this;
    var parents = window.parent;
    var url = parents.url;
    $scope.site = 'pailedi';
    $scope.getSiteList = parents.select('web_statistics/getSiteList');

    layDate(
        ['1', '2', '3', '4', '5', '6'], //日期id
        ['date', 'date', 'date', 'date', 'date', 'date'], //日期type
        ['start_date_flow', 'end_date_flow','start_date_source', 'end_date_source', 'start_date_visit', 'end_date_visit'], //存储对象
        ['1', '1','1', '1','1', '1'], //存储状态
        '',
        $scope
    );
    initTable()
    function initTable() {
        $http.defaults.headers.common = { token: parents.token() };
        $http({
            method: 'get',
            url: url + 'admin/web_statistics/index',
            params: {
                site : $scope.site
            }
        }).success(function(data) {
            if(data.code == 200){
                $scope.flowData = data.data.flow_data;
                $scope.sourceData = data.data.source_data;
                $scope.visitData = data.data.visit_data;
                $scope.start_date_flow = $scope.end_date_flow = $scope.start_date_source = $scope.end_date_source = $scope.start_date_visit = $scope.end_date_visit = parents.currentDate.dateTime();
                $(".web_zhezhao").hide().addClass('webin')
            }
        }).error(function(r) {
            alert('服务器异常，请联系管理员');
        });
    }
    $scope.getSite = function(){
        $(".web_zhezhao").show();
        initTable();
    }
    $scope.search = function(v){
        var TiemData = {site : $scope.site};
        TiemData['start_date_'+ v] = $scope['start_date_'+ v];
        TiemData['end_date_'+ v] = $scope['end_date_'+ v];
        var channelNum = parents.forEachs(TiemData);
        if(channelNum != 0){
            alert('请选择正确的起止时间');
            return false;
        }
        $(".web_zhezhao").show();
        $http.defaults.headers.common = { token: parents.token() };
        $http({
            method: 'get',
            url: url + 'admin/web_statistics/' + v,
            params: TiemData
        }).success(function(data) {
            if(data.code == 200){
                $scope[v + 'Data'] = data.data;
                $(".web_zhezhao").hide()
            }else{
                alert(data.error);
            }
        }).error(function(r) {
            alert('服务器异常，请稍候重试');
        });
    }

});