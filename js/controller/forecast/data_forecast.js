/**
 * Created by Administrator on 2017/9/13 0013.
 */
var app = angular.module('dataForecast', []);
app.controller('dataForecastCtrl', function($http, $scope, $q, $timeout) {
    var self = this;
    var parents = window.parent;
    var url = parents.url;
    var state = window.parent.UserId == 0 ? true : false;
    $scope.index = $scope.read = $scope.update = $scope.save = $scope.delete = $scope.deletes = $scope.enables = $scope.state = state;
    if (!state) {
        $scope.index = parents.authList('game_pay-index'); //查看列表权限
        $scope.read = parents.authList('game_pay-read'); //查看详情权限
        $scope.update = parents.authList('game_pay-update'); //编辑操作
        $scope.save = parents.authList('game_pay-save'); //添加操作
        $scope.delete = parents.authList('game_pay-delete'); //删除操作
        $scope.deletes = parents.authList('game_pay-deletes'); //批量删除操作
        $scope.enables = parents.authList('game_pay-enables'); //批量启用禁用操作
    }
    $('#query').show();
    $scope.ispc = parents.IsPC();
    $scope.stateIndex = 0;
    $scope.statenum = 0;
    $scope.forecastArr = $scope.copyforecastArr = new Object();
    $scope.copyforecastArr = {
        second_day_stay: '',
        third_day_stay: '',
        seven_day_stay: '',
        fifteen_day_stay: '',
        thirty_day_stay: '',
        pay_rate: '',
        advise_pay_rate: '',
        ddau_work_day: '',
        ddau_weekend: '',
        arpu_type: '',
        arpu_value_work_day: '',
        arpu_value_weekend: '',
        advise_arpu_type: '',
        advise_arpu_work_day: '',
        advise_arpu_weekend: '',
        advise_share_rate: '',
        balance_division: '',
        start_date: '',
        end_date: '',
        product_name: ''
    };


    $scope.export = function() {
        parents.Exports('data_estimate/export', $scope.copyforecastArr);
    };

    $scope.preservaConfirm = function(v) {
        //新增弹出框
        $scope.usersError = '';
        var statrs =  Date.parse(new Date($scope.copyforecastArr.start_date));
        var ends =  Date.parse(new Date($scope.copyforecastArr.end_date));
        var timeY = (24*60*60*1000)*29;
        if((ends-statrs) > timeY){
            $scope.usersError = '开始时间结束时间不可超过三十天';
            return false;
        }else if(ends-statrs < 0){
            $scope.usersError = '请输入正确的时间';
            return false;
        }
        var channelNum = parents.forEachs($scope.copyforecastArr);
        if (channelNum != 0) {
            $scope.usersError = '请完善必填内容';
            return false;
        }
        parents.screen.Delete($scope.copyforecastArr)
        if(v == 1){
            $http.defaults.headers.common = { token: parents.token() };
            $http({
                method: 'post',
                url: url + 'admin/data_estimate/getHtmlFile',
                params: $scope.copyforecastArr
            }).then(
                function(data) {
                    if (data.data.code == 200) {
                        window.open(parents.url_img + data.data.data);
                    }else{
                        $scope.usersError = data.data.error;
                    }
                },
                function() {
                    alert('服务器异常，请稍候重试');
                }
            );
        }else {
            if ($scope.statenum == 0) {
                initTable();
                $scope.statenum = 1;
            } else {
                $('#demo-table').bootstrapTable('refresh'); //刷新表格
            }
        }
    }

    layDate(
        ['3', '4'], //日期id
        ['date', 'date'], //日期type
        ['start_date', 'end_date'], //存储对象
        ['0', '0'], //存储状态
        'copyforecastArr',
        $scope
    );
    function iosTable() {
        if (/iPhone/i.test(navigator.userAgent)) {
            document.querySelector('.bootstrap-table').style.width =
                window.screen.availWidth - 25 + 'px';
        }
    }
    function initTable() {
        $('#demo-table').show();
        $('#demo-table').bootstrapTable({
            method: 'post',
            dataType: 'json',
            contentType: 'application/x-www-form-urlencoded',
            striped: true, //是否显示行间隔色
            url: url + 'admin/data_estimate',
            height: 270,
            queryParams: queryParams,
            ajaxOptions: {
                headers: {
                    token: parents.token()
                }
            },
            fixedColumns: !$scope.ispc,
            fixedNumber: 2,
            onLoadSuccess: function(data) {
                iosTable();
                //成功的回调
                if (data.total != 0) {
                    var timer = null;
                    var all_tr = $(
                        '#demo-table tbody tr,.fixed-table-body-columns tbody tr'
                    );
                    var table_tr = $('#demo-table tbody tr');
                    var columns_tr = $('.fixed-table-body-columns tbody tr');
                    var tap = function(callback) {
                        var t_idx = $(this).index();
                        if (t_idx === data.rows.length - 1) return;

                        $scope.deleteState = $scope.editState = true;
                        table_tr.removeClass('bg-color');
                        columns_tr.removeClass('bg-color');
                        table_tr.eq(t_idx).addClass('bg-color');
                        columns_tr.eq(t_idx).addClass('bg-color');

                        if (callback) {
                            callback();
                        }
                    };
                    all_tr.on({
                        click: function() {
                            //单击事件
                            $timeout.cancel(timer);
                            timer = $timeout(tap.bind(this), 170);
                        }
                    });
                    $('.multiple').change(function() {
                        if (this.checked) {
                            $scope.checks[this.dataset.index] =
                                data.rows[this.dataset.index].id;
                        } else {
                            $scope.checks.splice(this.dataset.index, 1);
                        }
                    });
                }else{
                    $scope.usersError = data.error;
                }
            }
        });
        numData = function(value, row, index) {
            return index + 1;
        };
        smaller = function(value, row, index) {
            return "<div style='width:70px'>" + value + '</div>';
        };
    }
    $scope.openImg = function() {
        $('.ibox-Mask').hide();
    };
    //解决窗口收缩，表头不变的问题
    $(window).resize(function() {
        $('#demo-table').bootstrapTable('resetView');
    });
    //popoverstate窗口关闭state
    $(document).click(function() {
        $('#popoverstate').hide();
    });
    $scope.statedelete = function() {
        $('#popoverstate').hide();
    };
    $('#popoverstate').click(function(e) {
        e.stopPropagation();
    });
    //popoverstate窗口关闭end
    $scope.stateedit = function(v) {
        var pop_che = $('#pop_che').is(':checked');
        $scope.forecastArr.status = pop_che ? 1 : 0;
        $http.defaults.headers.common = { token: parents.token() };
        $http({
            method: 'put',
            url: url + 'admin/statement/' + $scope.forecastArr.id,
            params: $scope.forecastArr
        })
            .success(function(data) {
                if (data.code == 200) {
                    if (pop_che) {
                        $('.fastatus')
                            .eq($scope.stateIndex)
                            .removeClass('fa-square-o')
                            .addClass('text-success fa-check-square-o');
                    } else {
                        $('.fastatus')
                            .eq($scope.stateIndex)
                            .removeClass('text-success', 'fa-check-square-o')
                            .addClass('fa-square-o');
                    }
                    $('#popoverstate').hide();
                } else {
                    alert(data.error);
                }
            })
            .error(function(r) {
                alert('服务器异常，请稍候重试');
            });
    };

    function queryParams(params) {
        var param = {
            //page: this.pageNumber,
            //limit: this.pageSize,
            second_day_stay: $scope.copyforecastArr.second_day_stay,
            third_day_stay: $scope.copyforecastArr.third_day_stay,
            seven_day_stay: $scope.copyforecastArr.seven_day_stay,
            fifteen_day_stay: $scope.copyforecastArr.fifteen_day_stay,
            thirty_day_stay: $scope.copyforecastArr.thirty_day_stay,
            pay_rate: $scope.copyforecastArr.pay_rate,
            advise_pay_rate: $scope.copyforecastArr.advise_pay_rate,
            ddau_work_day: $scope.copyforecastArr.ddau_work_day,
            ddau_weekend: $scope.copyforecastArr.ddau_weekend,
            arpu_type: $scope.copyforecastArr.arpu_type,
            arpu_value_work_day: $scope.copyforecastArr.arpu_value_work_day,
            arpu_value_weekend: $scope.copyforecastArr.arpu_value_weekend,
            advise_arpu_type: $scope.copyforecastArr.advise_arpu_type,
            advise_arpu_work_day: $scope.copyforecastArr.advise_arpu_work_day,
            advise_arpu_weekend: $scope.copyforecastArr.advise_arpu_weekend,
            advise_share_rate: $scope.copyforecastArr.advise_share_rate,
            balance_division: $scope.copyforecastArr.balance_division,
            start_date: $scope.copyforecastArr.start_date,
            end_date: $scope.copyforecastArr.end_date,
            product_name: $scope.copyforecastArr.product_name
        };
        return param;
    }
});
