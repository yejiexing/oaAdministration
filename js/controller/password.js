/**
 * Created by Administrator on 2017/10/19 0019.
 */
var app = angular.module('password',[]);
app.controller('passwordCtrl',function($http,$scope) {
    $scope.setPassword = {
        new : '',
        news : '',
        old : ''
    }
    $scope.edit = function(){
        var channelNum = forEachs($scope.setPassword);
        if(channelNum != 0){
            $scope.usersError = '请完善必填内容';
            return false;
        }else if($scope.setPassword.new != $scope.setPassword.news){
            $scope.usersError = '确认密码不一致';
            return false;
        }else if($scope.setPassword.news.length < 6){
            $scope.usersError = '新密码需大于六位数字';
            return false;
        }
        $http.defaults.headers.common = { token: token() };
        $http({
            method: 'post',
            url: url + 'admin/users/setPassword',
            params: {
                oldpassword : $scope.setPassword.old,
                newpassword : $scope.setPassword.news
            }
        }).then(
            function(data) {
                if (data.data.code == 200) {
                    $('#code').html(data.data.data);
                    $('#table_success').modal('show');
                    $scope.setPassword = {
                        new : '',
                        news : '',
                        old : ''
                    }
                    $scope.usersError = '';
                } else {
                    $scope.usersError = data.data.error;
                }
            },
            function() {
                alert('服务器异常，请稍候重试');
            }
        );
    }
})