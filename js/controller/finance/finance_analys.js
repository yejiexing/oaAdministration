/**
 * Created by Administrator on 2017/9/13 0013.
 */
var app = angular.module('Analys', []);
app.controller('AnalysCtrl', function($http, $scope, $q, $timeout) {
    var self = this;
    var parents = window.parent;
    var url = parents.url;
    var state = window.parent.UserId == 0?true:false;
    $scope.index = $scope.read = $scope.update = $scope.save = $scope.delete = $scope.deletes = $scope.enables = $scope.state = $scope.isexport = $scope.updatedata = state;
    if(!state) {
        $scope.index = parents.authList('financeanalys-index');//查看列表权限
        $scope.read = parents.authList('financeanalys-read');//查看详情权限
        $scope.update = parents.authList('financeanalys-update');//编辑操作
        $scope.save = parents.authList('financeanalys-save');//添加操作
        $scope.delete = parents.authList('financeanalys-delete');//删除操作
        $scope.deletes = parents.authList('financeanalys-deletes');//批量删除操作
        $scope.enables = parents.authList('financeanalys-enables');//批量启用禁用操作
        $scope.isexport = parents.authList('financeanalys-export');//导出操作
        $scope.updatedata = parents.authList('finance-updatedata');//留存操作
    }
    $('#query').show();
    self.id = '';
    $scope.ispc = parents.IsPC();
    $scope.Newdate1 = parents.currentDate.MonthTime(3);//前三个月
    $scope.Newdate2 = parents.currentDate.MonthTime(1);//前一个月
    $scope.Newdate3 = parents.currentDate.MonthTime(0);//当前
    self.financeStatus = {
        project : 'all', //项目-搜索
        product : 'detail', //产品-搜索
        channel : 'detail', //结算单位-搜索
        company_name : '', //公司-搜索
        issue_name : '', //发行公司-搜索
        start_date : $scope.Newdate1, //开始时间
        end_date : $scope.Newdate2, //结束时间
        bill_date : $scope.Newdate3, //月份时间
        statement_status : '', //对账单状态
        bill_status : '', //开票状态
        receive_status : '' //收款状态
    };
    $scope.select = {//下拉框选中
        project: '',
        product: '',
        channel: '',
        company_name: '',
        issue_name: '',
        C_status: true
    };
    $scope.status = {//状态筛选
        statement : '',
        bill : '',
        receive : '',
        all : true
    };
    $scope.errorstate = $scope.Newdate = '';
    $scope.stateIndex = 0;

    $scope.billArr = $scope.copybillArr = new Object();
    $scope.checks = [];

    $scope.ChannelList = parents.select('project/getProjectList'); //获取单位list
    var selectList = parents.select('finance_analys/getNameList');
    $scope.closingUnit = selectList.channel; //获取结算单位名称list
    $scope.companyName = selectList.company_name; //获取公司名称list
    $scope.issueName = selectList.issue_name; //获取发行公司名称list

    initTable();//初始化表格
    $scope.doQuery = function(params) {
        $('#demo-table').bootstrapTable('refresh'); //刷新表格
    };
    $scope.search = function(params) {
        //搜索
        var product_name = $scope.select.product;
        if($scope.select.product == '' || $scope.select.product == '-产品明细-'){
            product_name = 'detail';
        }else if($scope.select.product == '-产品汇总-'){
            product_name = 'all';

        }
        var channel_name = $scope.select.channel;
        if($scope.select.channel == '' || $scope.select.channel == '-渠道明细-'){
            channel_name = 'detail';
        }else if($scope.select.channel == '-渠道汇总-'){
            channel_name = 'all';

        }
        self.financeStatus.project = $scope.select.project == ''?'all':$scope.select.project;
        self.financeStatus.product = product_name;
        self.financeStatus.channel = channel_name;
        self.financeStatus.company_name = $scope.select.company_name;
        self.financeStatus.issue_name = $scope.select.issue_name;
        self.financeStatus.start_date = $scope.Newdate1;
        self.financeStatus.end_date = $scope.Newdate2;
        self.financeStatus.bill_date = $scope.Newdate3;
        self.financeStatus.statement_status = $scope.status.statement;
        self.financeStatus.bill_status = $scope.status.bill;
        self.financeStatus.receive_status = $scope.status.receive;
        $('#demo-table').bootstrapTable('refreshOptions',{pageNumber:1}).bootstrapTable('refresh');
    };
    $scope.buttonFun = function(v,num){
        if(v == 'all'){
            $scope.status.statement = '';
            $scope.status.bill = '';
            $scope.status.receive = '';
            $scope.status.all = true;
        }else{
            $scope.status[v] = num;
            $scope.status.all = false;
        }
        $scope.search();
    };
    $scope.export = function(){//导出
        parents.Exports('finance_analys/export',self.financeStatus)
    };

    self.inputTime = null;
    $scope.searchFun = function(v){
        clearTimeout(self.inputTime);
        $(".select_input").removeClass('open');
        $("#"+v).addClass('open');
        $("#"+v+" input").focus();
        $scope.select.C_status = false;
    };
    $(".select_input input").on({
        'blur' : function(){
            var thisId = $(this).attr('data-id');
            self.inputTime = setTimeout(function(){
                $("#"+thisId).removeClass('open');
            },200)
        },
        'focus':function(v){
            $scope.select.C_status = true;
            var thisId = $(this).attr('data-id');
            $("#"+thisId).addClass('open');
            //$scope.$apply()
        },
        'input propertychange' : function(){
            $scope.select.C_status = true;
        }
    });

    $scope.setSelect = function(name,v){
        $scope.select[name] = v;
        if(name == 'project'){
            projectFun(v)
        }
    }

    function projectFun(i) {
        $http.defaults.headers.common = { token: parents.token() };
        $http({
            method: 'get',
            url: url + 'admin/product/getProductByProjectId',
            params: { project_name: i }
        }).success(function(data) {
            if (data.code == 200) {
                $scope.CompanyList = data.data; //获取渠道list
                $scope.select.product = ''; //获取渠道list
            }
        }).error(function(r) {
            alert('服务器异常，请稍候重试');
        });
    };
    $scope.Toupdate = function(path){//表格更新
        parents.$login.state();
        setTimeout(function(){
            self.financeStatus.startDate = $scope.Newdate1;
            self.financeStatus.endDate = $scope.Newdate2;
            $http.defaults.headers.common = { token: parents.token() };
            $http({
                method: 'post',
                url: url + 'admin/finance_analys/' + path,
                params: { start_date: self.financeStatus.startDate, end_date: self.financeStatus.endDate}
            }).success(function(data) {
                if (data.code == 200) {
                    $('#demo-table').bootstrapTable('refresh');
                } else {
                    alert(data.error);
                }
                parents.$login.state();
            }).error(function(r) {
                alert('服务器异常，请稍候重试');
            });
        },200)
    }

    layDate(
        ['1', '2', '3'], //日期id
        ['month', 'month', 'month'], //日期type
        ['Newdate1', 'Newdate2', 'Newdate3'], //存储对象
        ['1', '1', '1'], //存储状态
        '',
        $scope
    );
    function iosTable() {
        if (/iPhone/i.test(navigator.userAgent)) {
            document.querySelector('.bootstrap-table').style.width = (window.screen.availWidth - 25) + 'px';
        }
    }
    function initTable() {
        $('#demo-table').bootstrapTable({
            method: 'get',
            dataType: 'json',
            contentType: 'application/x-www-form-urlencoded',
            cache: false,
            striped: true, //是否显示行间隔色
            sidePagination: 'server', //分页方式：client客户端分页，server服务端分页（*）
            url: url + 'admin/finance_analys',
            height: 670,
            showColumns: false,
            pagination: true,
            showRefresh: false,
            queryParams: queryParams,
            ajaxOptions: {
                headers: {
                    token: parents.token()
                }
            },
            minimumCountColumns: 2,
            pageNumber: 1, //初始化加载第一页，默认第一页
            pageSize: parents.page.Size, //每页的记录行数（*）
            pageList: parents.page.List, //可供选择的每页的行数（*）
            uniqueId: 'id', //每一行的唯一标识，一般为主键列
            showExport: true,
            exportDataType: 'all',
            responseHandler: parents.responseHandlers,
            undefinedText: '',
            fixedColumns: !$scope.ispc,
            fixedNumber: 2,
            onLoadSuccess: function(data) {
                iosTable();
                //成功的回调
                if (data.total != 0) {
                    var all_tr = $('#demo-table tbody tr,.fixed-table-body-columns tbody tr');
                    var table_tr = $('#demo-table tbody tr');
                    var columns_tr = $(".fixed-table-body-columns tbody tr");

                    all_tr.click(function() {
                        var t_idx = $(this).index();

                        $scope.deleteState = $scope.editState = $scope.iconState = true;
                        $scope.billArr = $scope.copybillArr = data.rows[t_idx];
                        table_tr.removeClass('bg-color');
                        columns_tr.removeClass('bg-color');
                        table_tr.eq(t_idx).addClass("bg-color");
                        columns_tr.eq(t_idx).addClass("bg-color");
                    });
                }
            }
        });
        numData = function(value, row, index) {
            if(row.bill_date != ''){
                return index + 1;
            }else{
                return '<div style="width: 30px">汇总</div>';
            }
        };
        smaller = function(value, row, index) {
            return "<div style='width:70px'>" + value + '</div>';
        };
        companyDate = function(value, row, index) {
            return "<div style='width:170px'>" + value + '</div>';
        };
    }
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
        $scope.billArr.status = pop_che ? 1 : 0;
        $http.defaults.headers.common = { token: parents.token() };
        $http({
            method: 'put',
            url: url + 'admin/finance_bill/' + $scope.billArr.id,
            params: $scope.billArr
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
            page: this.pageNumber,//当前页码
            limit: this.pageSize,//每页总数
            project: self.financeStatus.project,//项目名称
            product: self.financeStatus.product,//产品名称
            channel: self.financeStatus.channel,//结算单位名称
            bill_date: self.financeStatus.bill_date,//开票月份
            start_date: self.financeStatus.start_date,//开始时间 默认前三个月
            end_date: self.financeStatus.end_date,//结束时间 默认前一个月
            company_name: self.financeStatus.company_name,//公司名称
            issue_name: self.financeStatus.issue_name,//发行公司名称
            statement_status: self.financeStatus.statement_status,//	对账单状态 0无对账单 1有对账单
            bill_status: self.financeStatus.bill_status,//开票状态 0无开票1有开票
            receive_status: self.financeStatus.receive_status//	收款状态 0未收款 1已收款
        };
        return param;
    }

    $scope.printAll = function() {
        showIbox('deal-list');
        $('<div></div>')
            .append($('#detail').clone())
            .append($('#deal-list').clone())
            .append($('#access-list').clone())
            .print();
    };

    $scope.printContent = function() {
        $('#detail').print();
    };

    $scope.wordExport = function() {
        $('<div></div>')
            .append($('#detail').clone())
            .append($('#deal-list').clone())
            .wordExport();
    };

    $scope.hideModal = function() {
        $('#details').modal('hide');
    };

    function showIbox(iboxId) {
        var ibox = $('#' + iboxId);

        ibox
            .find('a.collapse-link')
            .find('i')
            .removeClass('fa-chevron-down')
            .addClass('fa-chevron-up');

        ibox.find('div.ibox-content').show();
    }
});
