/**
 * Created by Administrator on 2017/9/13 0013.
 */
var app = angular.module('ossUpload',[]);
app.controller('ossUploadCtrl',function($http, $scope, $timeout) {
    var self = this;
    var parents = window.parent;
    var url = parents.url;
    $scope.ossText = '';
    $scope.site = true;
    initTable()
    function initTable() {
        $(".web_zhezhao").hide().addClass('webin')
    }
    $scope.checkFile = function(file,e) {
        var fd = new FormData();
        var extName = file.name.slice(file.name.lastIndexOf('.'));
        var extNames = ['.png', '.jpg', '.jpeg', '.apk', '.mp4'];
        $scope.$apply(function() {
            if ($.inArray(extName, extNames) === -1) {
                $scope.usersError = '文件格式错误,仅可上传png，jpg，mp4或apk格式文件';
                $scope.copyserverArr.file_path = '';
                angular.element('#file').val(null);
                //$scope.copyserverArr.statement_file_path = '';
            } else {
                $scope.usersError = '';
                $scope.iconFile = file;
            }
        });
    };


    $scope.iconFun = function() {
        $scope.usersError = $scope.ossText = '';
        $scope.iconFile = null;
        $scope.uploading = false;
        angular.element('#iconFile').val(null);
        $('#icon').modal('show');
    };
    $scope.import = function() {
        var fd = new FormData();
        fd.append('file', $scope.iconFile);
        $http
            .post(url + 'admin/oss/upload', fd, {
                headers: { 'Content-Type': undefined, token: parents.token() },
                transformRequest: angular.identity
            })
            .then(
            function(data) {
                if (data.data.code === 200) {
                    $('#icon').modal('hide');
                    $scope.ossText = data.data.data.url;
                    $('#table_success').modal('show');
                    if($scope.site) {
                        setTimeout(function () {
                            //$(".ossUpload").zclip({
                            //    path: "ZeroClipboard.swf",
                            //    copy: function () {
                            //        return $(this).attr('data-key');
                            //    },
                            //    beforeCopy: function () {/* 按住鼠标时的操作 */
                            //    },
                            //    afterCopy: function () {/* 复制成功后的操作 */
                            //        alert('复制成功')
                            //    }
                            //});
                            $scope.site = false;
                        }, 10)
                    }

                }
                if (data.data.code === 400) {
                    $scope.usersError = data.data.error;
                }
                $scope.uploading = false;
            },
            function(error) {
                $scope.usersError = error.statusText;
                $scope.uploading = false;
            }
        );
        $scope.uploading = true;
    };
    $scope.ossClick = function(){
        //setCopyLink()
        document.getElementById('btnOss').addEventListener('click',function(){
            alert(1)
        })
        $(".copy").click()
        console.log(1)
    }

});