/**
 * Created by Administrator on 2017/9/13 0013.
 */
var app = angular.module('build', []);
app.controller('buildCtrl', function($http, $scope, $q, $timeout) {
    var self = this;
    var parents = window.parent;
    var url = parents.url;
    var state = window.parent.UserId == 0 ? true : false;
    $scope.index = $scope.read = $scope.update = $scope.save = $scope.delete = $scope.deletes = $scope.enables = $scope.state = state;
    $('#query').show();
    $scope.ispc = parents.IsPC();
    $scope.errorstate = $scope.Newdate = $scope.buildList = '';
    //$scope.buildList = [
    //    {name: "测试包_测试色.apk", channel: "测试色", number: "测试", path: "uploads/game/测试包_测试色.apk"},
    //{name: "测试包_123.apk", channel: "123", number: "123", path: "uploads/game/测试包_123.apk"},
    //{name: "测试包_成熟点.apk", channel: "成熟点", number: "123", path: "uploads/game/测试包_成熟点.apk"},
    //{name: "测试包_213.apk", channel: "213", number: "213", path: "uploads/game/测试包_213.apk"},
    //{name: "测试包_213.apk", channel: "213", number: "13", path: "uploads/game/测试包_213.apk"}];
    $scope.buildArr = $scope.copybuildArr = new Object();

    initTable();
    $scope.export = function() {
        var ExpArr = [];
        console.log($scope.buildList);
        if($scope.buildList == ''){
            alert('当前分包记录为空，请进行添加新增');
        }else {
            angular.forEach($scope.buildList, function (v, i) {
                console.log(v);
                ExpArr.push(v.path);
            });
        }
        console.log(ExpArr);
        parents.$login.state();
        $http.defaults.headers.common = { token: parents.token() };
        $http({
            method: 'get',
            url: url + 'admin/subcontractor/download',
            params : {files:ExpArr.join(',')}
        }).success(function(data) {
            if(data.code == 200){
                console.log(data);
                window.location.href = parents.url_img + data.data;
                parents.$login.state();
            }else{
                $scope.usersError = data.error;

            }
        })
    };

    $scope.addProduct = function() {
        var channelArr = {
                name : '',
                number : ''
            }
        $scope.copybuildArr.channel.push(channelArr);
    };
    var channelNum = 0;
    function forFun(val){
        angular.forEach(val,function(v,i){
            if(v == ''){
                channelNum++;
            } else if(v.length == undefined){
                forFun(v);
            } else if(i == 'channel'){
                forFun(v);
            }
        })
    }
    $scope.preservaConfirm = function() {
        //新增弹出框
        channelNum = 0;
        $scope.usersError = '';
        console.log($scope.copybuildArr);

        forFun($scope.copybuildArr);
        console.log(channelNum);
        if (channelNum != 0) {
            $scope.usersError = '请完善必填内容';
            return false;
        }
        var formData = new FormData();
        formData.append('userName',$scope.copybuildArr.file.userName);
        formData.append('file',$scope.copybuildArr.file.file);
        parents.screen.Delete($scope.copybuildArr)
        $.ajax({
            url: url+'/admin/subcontractor/build',
            beforeSend: function(request) {
                request.setRequestHeader("token", parents.token());
            },
            dataType: 'JSON',
            async: false,//请求是否异步，默认为异步
            type: 'post',
            data : $scope.copybuildArr,
            success: function (data) {
                console.log(data);
                if(data.code == 200){
                    $scope.buildList = data.data;
                    $('#demo-table').bootstrapTable('load', $scope.buildList);
                    $('#preservaModal').modal('hide');
                    $('#code').html('新增成功');
                    $('#table_success').modal('show');

                }else{
                    $scope.usersError = data.error;

                }
            },
            error : function(err){
                $scope.usersError = err;
            }
        })
    };

    $scope.checkFile = function(file,ele) {
        var fd = new FormData();
        var extName = file.name.slice(file.name.lastIndexOf('.'));
        var extNames = [
            '.apk'
        ];
        $scope.$apply(function() {
            if ($.inArray(extName, extNames) === -1) {
                $scope.usersError = '文件格式错误';
                $scope.copybuildArr.file = '';
            } else {
                fd.append('file', file);
                $http
                    .post(url + 'admin/upload', fd, {
                        headers: {
                            'Content-Type': undefined,
                            token: parents.token()
                        },
                        transformRequest: angular.identity
                    }).then(
                    function(data) {
                        if (data.data.code === 200) {
                            $scope.usersError = '';
                            $scope.copybuildArr.file = data.data.data;
                        } else {
                            $scope.usersError = data.data.error;
                        }
                    },
                    function(error) {
                        $scope.usersError = error;
                    }
                );
            }
        });
    };

    $scope.NewlyAdded = function(callback) {
        //$scope.method = 'post';
        $scope.copybuildArr = {
            filename : '',
            file : '',
            channel : []
        };
        $scope.addProduct();
        $('#myModalLabel').html('[新增]分包');
        $('#preservaModal').modal('show');
    };

    function iosTable() {
        if (/iPhone/i.test(navigator.userAgent)) {
            document.querySelector('.bootstrap-table').style.width =
                window.screen.availWidth - 25 + 'px';
        }
    }
    function initTable() {
        $('#demo-table').bootstrapTable({ striped: true }).bootstrapTable('removeAll');
        numData = function(value, row, index) {
            return index + 1;
        };
        pathFun = function(value, row, index) {
            return '<div class="text-success pathFun" style="cursor: pointer">点击下载</div>';
        };
        //事件绑定
        window.pathEvent = {
            'click .pathFun': function(event, value, row, index) {
                window.location.href = parents.url_img + row.path;
            }
        };
    }
    $scope.openImg = function() {
        $('.ibox-Masks').hide();
    };
    //解决窗口收缩，表头不变的问题
    $(window).resize(function() {
        $('#demo-table').bootstrapTable('resetView');
    });
});
