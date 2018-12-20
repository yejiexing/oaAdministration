/**
 * Created by Administrator on 2017/9/13 0013.
 */
var app = angular.module('myResearch',[]);
app.controller('myResearchCtrl',function($http, $scope, $timeout) {
    var self = this;
    var parents = window.parent;
    var url = parents.url;
    var state = window.parent.UserId == 0?true:false;
    $scope.index = $scope.read = $scope.update = $scope.save = $scope.delete = $scope.deletes = $scope.enables = $scope.state = $scope.isexport = $scope.imports = $scope.demand= $scope.finishs = $scope.updateinvoiceinfo = $scope.updatebudgetamount = $scope.updateconsumedamount = state;
    if(!state) {
        $scope.index = parents.authList('myrdexpense-index');//查看列表权限
        $scope.read = parents.authList('myrdexpense-read');//查看详情权限
        $scope.update = parents.authList('myrdexpense-update');//编辑操作
        $scope.save = parents.authList('myrdexpense-save');//添加操作
        $scope.delete = parents.authList('myrdexpense-delete');//删除操作
        $scope.deletes = parents.authList('myrdexpense-deletes');//批量删除操作
        $scope.enables = parents.authList('myrdexpense-enables');//批量启用禁用操作
        $scope.isexport = parents.authList('myrdexpense-export');//导出操作
        $scope.demand = parents.authList('myrdexpense-verifyapplication');
        $scope.finishs = parents.authList('myrdexpense-finishapplication');
        $scope.updateinvoiceinfo = parents.authList('myrdexpense-updateinvoiceinfo');
        $scope.updatebudgetamount = parents.authList('myrdexpense-updatebudgetamount');
        $scope.updateconsumedamount = parents.authList('myrdexpense-updateconsumedamount');
    }
    $("#query").show();
    $scope.ispc = parents.IsPC();
    $scope.deleteState = $scope.editState = $scope.iconState = $scope.auditState= $scope.finishState = false;
    $scope.Id = '';
    self.Channel_s = '';//地区-搜索
    self.Company_s = '';//地区-搜索
    self.Region_s = '';//地区-搜索
    self.startDate = '';//开始时间
    self.endDate = '';//结束时间
    self.number = '';
    $scope.select = {
        selectChannel: '', //选择项目的名字
        selectCompany: '', //选择产品的名字
        selectRegion: '', //选择渠道的名字
        number: '',
        C_status: true
    };
    $scope.thirdParty = '';
    $scope.Method = $scope.errorstate = $scope.Newdate = '';
    $scope.stateIndex = 0;
    $scope.Newdate1 = self.startDate  = '';
    $scope.Newdate2 = self.endDate = '';
    $scope.applicationArr = $scope.copyapplicationArr = new Object();
    $scope.uploading = false;

    $scope.ChannelList = parents.select('project/getProjectList');//获取单位list
    $scope.RegionList = parents.select('channel/getChannelList');//获取单位list

    initTable();
    $scope.doQuery = function(params){
        $('#demo-table').bootstrapTable('refresh');    //刷新表格
        $scope.ChannelList = parents.select('project/getProjectList');//刷新渠道list
        $scope.CompanyList = '';//刷新单位list
        $scope.RegionList = parents.select('channel/getChannelList');//获取单位list
        $scope.deleteState = $scope.editState = $scope.iconState = $scope.auditState = $scope.finishState = false;
    }
    $scope.search = function(params){ //搜索
        self.Channel_s = $scope.select.selectChannel;
        self.Company_s = $scope.select.selectCompany;
        self.Region_s = $scope.select.selectRegion;
        // self.number = $scope.select.number;
        self.startDate = $scope.Newdate1;
        self.endDate = $scope.Newdate2;
        $('#demo-table').bootstrapTable('refreshOptions',{pageNumber:1}).bootstrapTable('refresh');    //刷新表格
        $scope.deleteState = $scope.editState = $scope.iconState = $scope.auditState = $scope.finishState = false;
    }
    $scope.deleteFun = function(params){//删除
        $("#table_delete").modal("show");
    }
    $scope.editFun = function(params){//编辑
        $scope.usersError = '';
        $scope.Id = $scope.applicationArr.id;
        $scope.Method = 'put';
        $scope.editStatus = params;//编辑的状态 0 单纯编辑 1 查看详情 2 新增数据
        $http.defaults.headers.common = { token: parents.token() };
        $http({
            method: 'get',
            url: url + 'admin/rd_expense/' + $scope.Id
        }).success(function (data) {
            if(data.code == 200) {
                $scope.copyapplicationArr = data.data;
                if(params == 1){
                    $scope.dealList = data.data.dealList;
                    parents.forSome($scope.copyapplicationArr, ['deduction_amount','amount'], Number);
                    $("#deal-list").removeClass('border-bottom');
                    $("#deal-list .ibox-content").hide();
                    $("#details").modal("show");
                }else{
                    $scope.paramsState = 'update';
                    $scope.Channel_s = parents.select('project/getProjectNameAndId');//刷新渠道list
                    $scope.projectFun(1, true);
                    $scope.getProductChannelInfo();
                    parents.forSome($scope.copyapplicationArr, ['product_id', 'project_id','number'], String);
                    parents.forSome($scope.copyapplicationArr, ['deduction_amount','amount'], Number);
                    $("#myModalLabel").html('[编辑]研发费用');
                    if($scope.copyapplicationArr.p_id >0){
                        $scope.paramsState = 'click';
                        $('.modal-body').css('min-height','380px')
                    }
                    if(params == 2){
                        // $timeout(function(){
                        //     $scope.copyapplicationArr.amount = 0;
                        // }) 
                        $('.modal-body').css('min-height','380px')
                        setTimeout(function(){
                            
                            $scope.copyapplicationArr.amount = ''
                            $scope.copyapplicationArr.pay_time = '';
                            $scope.copyapplicationArr.is_deduction = 0;
                            $scope.copyapplicationArr.is_existed_contract = 0;
                            $scope.copyapplicationArr.deduction_amount = '';
                            $scope.copyapplicationArr.invoice = '';
                            $scope.copyapplicationArr.is_invoice = 0;
                            $scope.copyapplicationArr.tax_rate = '';
                            $scope.$apply()
                        },20)                     
                        $scope.paramsState = 'click';
                        $scope.Method = 'POST';
                        $("#myModalLabel").html('[添加]研发费用');
                    }
                    $("#preservaModal").modal("show");                     
                }
            }
        }).error(function(){
        });
    }
    $scope.deleteConfirm = function() {
        //删除弹出框
        $http.defaults.headers.common = { token: parents.token() };
        var checks = $('#demo-table')
            .bootstrapTable('getSelections')
            .map(function(item) {
                return item.id;
            });
        if (checks.length) {
            $http.post(url + 'admin/rd_expense/deletes', {
                ids: checks
            }).then(
                function(data) {
                    $('#table_delete').modal('hide');
                    var code_data = data.data.code == 200?data.data.data:data.data.error;
                    $('#code').html(code_data);
                    $('#table_success').modal('show');
                    $scope.doQuery();
                }
            );
        } else {
            $http
                .delete(url + 'admin/rd_expense/' + $scope.applicationArr.id)
                .then(
                    function(data) {
                        $('#table_delete').modal('hide');
                        var code_data = data.data.code == 200?data.data.data:data.data.error;
                        $('#code').html(code_data);
                        $('#table_success').modal('show');
                        $scope.doQuery();
                    },
                    function() {
                    }
                );
        }
    };
    var oppArr = {
        new:[
            'project_id',
            'product_id',
            'promotion_type',
            'start_time',
            'end_time',
            'budget_amount'
        ],
        click: [
            'number',
            'type',
            'project_id',
            'product_id',
            'company',
            'account',
            'amount',
            'pay_time',
            'is_deduction',
            'deduction_amount',
            'is_existed_contract' 
        ],
        update : [
            'actual_pay_time',
            'invoice_time'
        ],
        Fun : function(obj,v) {
            var i = this[v].length;
            while (i--) {
                if (this[v][i] === obj) {
                    return true;
                }
            }
            return false;
        }
    }

    $scope.preservaConfirm = function(){//新增弹出框
        var channelNum = 0;
        $scope.usersError = '';
        var tmpData = {};
        //当选择编辑子级元素
        if($scope.paramsState == 'click'){
            tmpData.number = $scope.copyapplicationArr.number;
            tmpData.type = $scope.copyapplicationArr.type;
            tmpData.project_id = $scope.copyapplicationArr.project_id;
            tmpData.product_id = $scope.copyapplicationArr.product_id;
            tmpData.company = $scope.copyapplicationArr.company;
            tmpData.account = $scope.copyapplicationArr.account;
            tmpData.amount = $scope.copyapplicationArr.amount;
            tmpData.pay_time = $scope.copyapplicationArr.pay_time;
            tmpData.is_deduction = $scope.copyapplicationArr.is_deduction;
            tmpData.deduction_amount = $scope.copyapplicationArr.deduction_amount;
            tmpData.is_existed_contract	 = $scope.copyapplicationArr.is_existed_contract;
            tmpData.is_invoice = $scope.copyapplicationArr.is_invoice;
            tmpData.tax_rate = $scope.copyapplicationArr.tax_rate;
            tmpData.invoice = $scope.copyapplicationArr.invoice;
            tmpData.p_id = $scope.copyapplicationArr.id;
            //检查是否为空
            angular.forEach($scope.copyapplicationArr,function(v,i){
                if(oppArr.Fun(i,$scope.paramsState) && (v === '' || v == null)){
                    channelNum++
                }
            });
            if(tmpData.is_deduction == '0' && $scope.editStatus != '0'){
                channelNum--;
            }
            if(channelNum != 0){
                $scope.usersError = '请完善必填内容';
                return false;
            }
            if($scope.editStatus == '0') {
               delete tmpData.p_id
            }
        } 
        //当编辑父级元素时
        if($scope.copyapplicationArr.p_id == '0' && $scope.paramsState !== 'click')
        {
            tmpData.type = $scope.copyapplicationArr.type;
            tmpData.project_id = $scope.copyapplicationArr.project_id;
            tmpData.product_id = $scope.copyapplicationArr.product_id;
            tmpData.company = $scope.copyapplicationArr.company;
            tmpData.account = $scope.copyapplicationArr.account;
            tmpData.p_id = '0';
        }
        // if($scope.copyapplicationArr.p_id == '0') {
        //     tmpData.type = $scope.copyapplicationArr.type;
        //     tmpData.project_id = $scope.copyapplicationArr.project_id;
        //     tmpData.product_id = $scope.copyapplicationArr.product_id;
        //     tmpData.company = $scope.copyapplicationArr.company;
        //     tmpData.account = $scope.copyapplicationArr.account;
        //     tmpData.p_id = '0';
        // }
        
        
        $http.defaults.headers.common = { token: parents.token() };
        $http({
            method : $scope.Method,
            url: $scope.editStatus == '0' ?  url + 'admin/rd_expense/'+   $scope.Id :  url + 'admin/rd_expense',
            params : tmpData
        }).success(function(data){
            if(data.code == 200){
                $scope.doQuery();
                $("#preservaModal").modal("hide");
                $("#code").html(data.data);
                $("#table_success").modal("show");
            }else{
                $scope.usersError = data.error;
            }
        }).error(function(r){
            alert('服务器异常，请稍候重试')
        })
    };
    $scope.export = function(){//导出
        var ExpObj = {
            start_time : self.startDate,
            end_time : self.endDate,
            project_name : self.Channel_s,
            product_name : self.Company_s,
            my_data: true
        }
        parents.Exports('rd_expense/export',ExpObj)
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
    $scope.iconFun = function(){
        parents.$login.state();
        $http.defaults.headers.common = { token: parents.token() };
        $http.post(url + 'admin/promotion_application/updateConsumedAmount').then(
            function(data) {
                if(data.data.code == 200){
                    $('#demo-table').bootstrapTable('refresh');    //刷新表格
                    $('#code').html(data.data.data);
                    $('#table_success').modal('show');
                    parents.$login.state();
                }else{
                    alert(data.data.error)
                }
            }
        );
    }

    // 检查导入文件格式
    $scope.checkFile = function(file) {
        var extName = file.name.slice(file.name.lastIndexOf('.'));
        var extNames = ['.xlc', '.xlm', '.xlt', '.xlw', '.xls', '.xlsx'];

        $scope.$apply(function() {
            if ($.inArray(extName, extNames) === -1) {
                $scope.usersError = '文件格式错误';
                $scope.iconFile = '';
            } else {
                $scope.usersError = '';
                $scope.iconFile = file;
            }
        });
    };
    $scope.projectFun = function(v, edit) {
        var identical = v == 1 ? $scope.copyapplicationArr.project_id : $scope.select.selectChannel;
        ProjectId(identical, v, edit);
    };

    $scope.setChannel = function(item) {
        $scope.select.selectChannel = item;
    };

    $scope.setCompany = function(item) {
        $scope.select.selectCompany = item;
    };

    $scope.setRegion = function(item) {
        $scope.select.selectRegion = item;
    };

    $scope.getProductChannelInfo = function() {
        if ($scope.copyapplicationArr.product_id && $scope.copyapplicationArr.channel_id) {
            $http
                .get(url + 'admin/product_channel/getProductChannelInfo', {
                    params: {
                        product_id: $scope.copyapplicationArr.product_id,
                        channel_id: $scope.copyapplicationArr.channel_id
                    }
                })
                .then(function(data) {
                        if (data.data.code === 200) {
                            $scope.productChannel = data.data.data;
                        }

                        if (data.data.code === 400) {
                        }
                    }, function(error) {});
        }
    };

    function ProjectId(identical, v, edit) {
        var params = {},
            subUrl;

        if (v === undefined) {
            subUrl = 'admin/product/getProductByProjectId';
            params.project_name = identical;
        } else {
            subUrl = 'admin/product/getProductRelatedByProjectId';
            params.project_id = identical;
        }
        $http.defaults.headers.common = { token: parents.token() };
        $http({
            method: 'get',
            url: url + subUrl,
            params: params
        })
            .success(function(data) {
                if (data.code == 200) {
                    if (v == 1) {
                        $scope.Region_s = data.data; //获取渠道list

                        if (!edit) {
                            $scope.copyapplicationArr.product_id = '';
                        }
                    } else {
                        $scope.CompanyList = data.data; //获取渠道list
                        $scope.select.selectCompany = '';
                    }
                } else if (data.code == 400) {
                    if (v == 1) {
                        $scope.Region_s = ''; //获取渠道list

                        if (!edit) {
                            $scope.copyapplicationArr.product_id = '';
                        }
                    } else {
                        $scope.CompanyList = ''; //获取渠道list
                        $scope.select.selectCompany = '';
                    }
                }
            })
            .error(function(r) {
                alert('服务器异常，请稍候重试');
            });
    }
    $scope.NewlyAdded = function(){
        $scope.usersError  = $scope.Id = '';
        $scope.paramsState = 'new';
        $scope.Method = 'post';
        $scope.copyapplicationArr = {
            project_id: "",
            product_id: "",
            type:"",
            company: "",
            account: "",
            p_id: 0
        };
        $scope.Channel_s = parents.select('project/getProjectNameAndId');
        $scope.Region_s = '';
        $("#preservaModal").modal("show");
        $("#myModalLabel").html('[新增]研发费用');
    }
    $scope.setProject = function() {
        $scope.Channel_s1.forEach(function(item) {
            if (item.id == $scope.copyapplicationArr.exce_user_id) {
                $scope.copyapplicationArr.finance_user_name = item.name;
            }
        });
    };
    $scope.demand1 = function(params) {
        $scope.Channel_s1 = parents.select('promotion_application/getFinanceUser');
        $scope.Channel_s1.forEach(function(item) {
            if (item.name == '邓晓虹') {
                $scope.copyapplicationArr.finance_user_id = String(item.id);
                $scope.copyapplicationArr.finance_user_name = item.name;
                $scope.copyapplicationArr.verify_description = '';
            }
        });
        $('#audit').modal('show');
    };
    $scope.finish = function(params) {
        $('#audit1').modal('show');
        //}else{
        //    alert('当前需求已完成');
        //}
    };
    $scope.audit1 = function(status) {
        $http.defaults.headers.common = { token: parents.token() };
        $http.post(url + 'admin/promotion_application/finishApplication' ,{id: $scope.copyapplicationArr.id}).then(
            function(data) {
                $('#audit1').modal('hide');
                $('#code').html(data.data.data);
                $('#table_success').modal('show');
                $scope.doQuery();
            }
        );
    };
    $scope.audit = function(status) {
        $scope.copyapplicationArr.verify_status = status;
        $http.defaults.headers.common = { token: parents.token() };

        $http.post(url + 'admin/promotion_application/verifyApplication', {
                id: $scope.copyapplicationArr.id,
                finance_user_id: $scope.copyapplicationArr.finance_user_id,
                finance_user_name: $scope.copyapplicationArr.finance_user_name,
                verify_status: $scope.copyapplicationArr.verify_status,
                verify_description: $scope.copyapplicationArr.verify_description
            })
            .then(
            function(data) {
                if (data.data.code == 200) {
                    $scope.doQuery();
                    $('#audit').modal('hide');
                    $('#code').html(data.data.data);
                    $('#table_success').modal('show');
                } else {
                    $scope.usersError = data.data.error;
                }
            },
            function(r) {
                alert('服务器异常，请稍候重试');
            }
        );
    };
    $scope.collectConfirm = function(){
        if($scope.updateTimeObj.date == ''){
            $scope.updateTimeObj.Error = '请选择时间';
            return false;
        }
        var postObj = {
            id : $scope.updateTimeObj.id,
            data: $scope.updateTimeObj.date,
            type : $scope.updateTimeObj.type
        };
        $http.defaults.headers.common = { token: parents.token() };
        $http.post(url + 'admin/promotion_application/updateInvoiceInfo', postObj).then(
            function(data) {
                if (data.data.code == 200) {
                    $scope.doQuery();
                    $('#collectModal').modal('hide');
                    $('#code').html(data.data.data);
                    $('#table_success').modal('show');
                } else {
                    $scope.updateTimeObj.Error = data.data.error;
                }
            },
            function(r) {
                alert('服务器异常，请稍候重试');
            }
        );
    }
    $scope.TimesConfirm = function(){
        if($scope.AppTimeObj.start_time == '' || $scope.AppTimeObj.end_time == ''){
            $scope.AppTimeObj.Error = '请完善起始时间与结束时间';
            return false;
        }
        var putObj = {
            start_time: $scope.AppTimeObj.start_time,
            end_time : $scope.AppTimeObj.end_time
        }
        $http.defaults.headers.common = { token: parents.token() };
        $http.put(url + 'admin/promotion_application/updateStartEndTime/'+$scope.AppTimeObj.id, putObj).then(
            function(data) {
                if (data.data.code == 200) {
                    $scope.doQuery();
                    $('#TimeModal').modal('hide');
                    $('#code').html(data.data.data);
                    $('#table_success').modal('show');
                } else {
                    $scope.AppTimeObj.Error = data.data.error;
                }
            },
            function(r) {
                alert('服务器异常，请稍候重试');
            }
        );
    }

    layDate(
        ['1', '2', '3', '4', '5'], //日期id
        ['date', 'date', 'date', 'date', 'date'], //日期type
        ['Newdate1', 'Newdate2', 'start_time', 'end_time', 'pay_time'], //存储对象
        ['1', '1', '0', '0', '0'], //存储状态
        'copyapplicationArr',
        $scope
    );
    // layDate(
    //     ['6'], //日期id
    //     ['date'], //日期type
    //     ['date'], //存储对象
    //     ['0'], //存储状态
    //     'updateTimeObj',
    //     $scope
    // );
    // layDate(
    //     ['7','8'], //日期id
    //     ['date','date'], //日期type
    //     ['start_time','end_time'], //存储对象
    //     ['0','0'], //存储状态
    //     'AppTimeObj',
    //     $scope
    // );
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
            cache: false,
            striped: true,                              //是否显示行间隔色
            sidePagination: "server",           //分页方式：client客户端分页，server服务端分页（*）
            url:url + 'admin/rd_expense',
            height: 670,
            showColumns:false,
            pagination:true,
            showRefresh:false,
            queryParams : queryParams,
            ajaxOptions : {
                headers : {
                    "token": parents.token()
                }
            },
            minimumCountColumns:2,
            pageNumber:1,                       //初始化加载第一页，默认第一页
            pageSize: parents.page.Size,                       //每页的记录行数（*）
            pageList: parents.page.List,        //可供选择的每页的行数（*）
            uniqueId: "id",                     //每一行的唯一标识，一般为主键列
            showExport: true,
            exportDataType: 'all',
            responseHandler: parents.responseHandlers,
            fixedColumns: !$scope.ispc,
            fixedNumber: 3,
            onLoadSuccess:function(data){ //成功的回调
                iosTable();
                if (data.total != 0) {
                    var timer = null;
                    var all_tr = $('#demo-table tbody tr,.fixed-table-body-columns tbody tr');
                    var table_tr = $('#demo-table tbody tr');
                    var columns_tr = $(".fixed-table-body-columns tbody tr");
                    var tap = function() {
                        var t_idx = $(this).index();
                        $scope.deleteState = $scope.editState = $scope.iconState = true;
                        if(data.rows[t_idx].verify_status == '审核中'){
                            $scope.auditState = true;
                            $scope.finishState = false;
                        }else if(data.rows[t_idx].verify_status == '审核通过'){
                            $scope.finishState = true;
                            $scope.auditState = false;
                        }else{
                            $scope.auditState = false;
                            $scope.finishState = false;
                        }
                        $scope.applicationArr = $scope.copyapplicationArr = data.rows[t_idx];
                        parents.forSome($scope.copyapplicationArr, [
                            'amount',
                            'deduction_amount'
                        ], Number);
                        table_tr.removeClass('bg-color');
                        columns_tr.removeClass('bg-color');
                        table_tr.eq(t_idx).addClass("bg-color");
                        columns_tr.eq(t_idx).addClass("bg-color");
                    };
                    all_tr.on({
                        'click' : function(){//单击事件
                            $timeout.cancel(timer);
                            timer = $timeout(tap.bind(this), 170);
                        },
                        'dblclick' : function(){//双击事件
                            $timeout.cancel(timer);
                            tap.call(this);
                            $scope.editFun(1);
                        }
                    });
                    var checks = 0; // 选中的个数
                    var checkAll = $('#demo-table input[name="btSelectAll"]'); // 全选
                    var checkbox = $('#demo-table input[name="btSelectItem"]'); // 单选
                    var fixedCheckAll = $(
                        '.fixed-table-header-columns input[name="btSelectAll"]' // 冻结全选
                    );
                    var fixedCheckbox = $(
                        '.fixed-table-body-columns input[name="btSelectItem"]' // 冻结单选
                    );

                    // 全选事件，根据状态设置选中个数和是否禁用删除按钮
                    checkAll.change(function() {
                        checks = this.checked ? checkbox.length : 0;
                        $scope.$apply(function() {
                            $scope.deleteState = checks > 0;
                        });
                    });
                    // 单选事件，根据状态增减选中个数和是否禁用删除按钮
                    checkbox.change(function() {
                        this.checked ? checks++ : checks--;
                        $scope.$apply(function() {
                            $scope.deleteState = checks > 0;
                        });
                    });
                    // 冻结全选事件，根据状态切换冻结单选状态和触发全选事件
                    fixedCheckAll.change(function() {
                        fixedCheckbox.prop('checked', this.checked);
                        checkAll.change();
                    });
                    // 冻结单选事件，触发单选事件
                    fixedCheckbox.change(function() {
                        checkbox.eq(this.dataset.index).click();
                    });
                    $('a[id^="budget"]').editable({
                        disabled: false,             //是否禁用编辑
                        emptytext: "-",          //空值的默认文本
                        url: function (params) {
                            var sNum = $(this).attr("data-num");
                            var sName = $(this).attr("name");
                            $scope.applicationArr[sName] = Number(params.value);
                            var d = new $.Deferred();
                            parents.$login.state();
                            $http.defaults.headers.common = { token: parents.token() };
                            $http({
                                method : "put",
                                url: url + '/admin/promotion_application/updateBudgetAmount/'+$scope.applicationArr.id,
                                params : {
                                    budget_amount: params.value
                                }
                            }).success(function(data){
                                if(data.code == 200){
                                    parents.$login.state();
                                    $('#code').html(data.data);
                                    $('#table_success').modal('show');
                                    $scope.doQuery();
                                }else{
                                    return d.reject(data.error);
                                }
                            }).error(function(r){
                                return d.reject('服务器异常，请稍候重试');
                            })
                        }
                    });

                }
                // if(data.rows.length > 0){
                    
                //     $('#demo-table tbody tr:last')
                //         .children('td:first')
                //         .html('<div style="width:30px">汇总</div>');
                // }
            },
            rowStyle: function (row, index) {
                var style = {};
                if (row.p_id==0) {
                    style={css:{'color':'#a2a2a2'}};
                }else if(row.verify_status==2){
                    style={css:{'color':'red'}};
                }
                return style;
            }
        });
        numData = function(value, row, index) {
            return  index+1;
        };
        timeFun = function(value, row, index) {
            var app_times = row.start_time == ''? '':"<div class='borderW160 timesClick'>"+row.start_time+'--'+row.end_time+"</div>";
            return app_times;
        };
        budgetData = function(value, row, index) {
            return (row.p_id == 0 && $scope.updatebudgetamount) ? '<a href="#" id="budget'+index+'" name="budget_amount" data-num="'+index+'" data-type="text" data-title="总预算">'+value+'</a>' : value;
        };
        timeData = function(value, row, index) {
            if(row.p_id == 0){
                return '<div style="min-width: 100px;">'+value+'&nbsp;&nbsp;<button class="btn btn-white btn-xs closing" type="button" style="color: #0088cc"><i class="fa fa-plus"></i></button></div>'
            }else{
                return value;
            }
        };
        updateTime = function(value, row, index) {
            if(row.p_id != 0 && $scope.updateinvoiceinfo && (row.verify_status == '审核通过' || row.verify_status == '已完成')){
                return '<div class="text-success borderW80 updataTime" data-title="实际打款时间" data-type="10">'+value+'</div>'
            }else{
                return value;
            }
        };
        updateTime2 = function(value, row, index) {
            if(row.p_id != 0 && $scope.updateinvoiceinfo && (row.verify_status == '审核通过' || row.verify_status == '已完成')){
                return '<div class="text-success borderW80 updataTime" data-title="收票时间" data-type="20">'+value+'</div>'
            }else{
                return value;
            }
        };
        promotionData = function(value, row, index) {
            if(row.id == ''){
                return '';
            }else{
                return value == '10' ? '付费推广' : 'CPA买量';
            }
        };
        verifyData = function(value, row, index) {
            var v = '';
            if(value == '审核中'){
                v = '<span class="text-success">'+value+'</span>'
            }else if(value == '审核未通过'){
                v = '<span class="text-danger">'+value+'</span>'
            }else{
                v = value
            }
            return v;
        };
        window.timeFuns = {
            'click .closing': function(event, value, row, index) {
                $scope.applicationArr = $scope.copyapplicationArr = row;
                parents.forSome($scope.copyapplicationArr, ['company','account','product_id','project_id'], String);
                parents.forSome($scope.copyapplicationArr, ['amount','deduction_amount'], Number);
                $scope.editFun(2);
            },
            // 'click .updataTime': function(event, value, row, index) {
            //     var dataTitle = $(this).attr('data-title');
            //     var dataType = $(this).attr('data-type');
            //     $scope.updateTimeObj = {
            //         id : row.id,
            //         title : '[修改]'+dataTitle,
            //         date : value=='点击添加'?'':value,
            //         type : dataType,
            //         Error : ''
            //     }
            //     $('#collectModal').modal('show');
            // },
            // 'click .timesClick': function(event, value, row, index){
            //     $scope.AppTimeObj = {
            //         id : row.id,
            //         start_time : row.start_time,
            //         end_time : row.end_time,
            //         Error : ''
            //     }
            //     $('#TimeModal').modal('show');
            // }
        };
    }
    //解决窗口收缩，表头不变的问题
    $(window).resize(function() {
        $('#demo-table').bootstrapTable('resetView');
    });
    //popoverstate窗口关闭state
    $(document).click(function(){
        $("#popoverstate").hide();
    });
    $scope.statedelete = function(){
        $("#popoverstate").hide();
    }
    $("#popoverstate").click(function(e){
        e.stopPropagation();
    });
    //popoverstate窗口关闭end
    $scope.stateedit = function(v){
        var pop_che = $("#pop_che").is(':checked');
        $scope.applicationArr.status = pop_che ? 1: 0;
        $http.defaults.headers.common = { token: parents.token() };
        $http({
            method : "put",
            url: url + 'admin/operate/' + $scope.applicationArr.id,
            params : $scope.applicationArr
        }).success(function(data){
            if(data.code == 200){
                if(pop_che){
                    $('.fastatus').eq($scope.stateIndex).removeClass('fa-square-o').addClass('text-success fa-check-square-o');
                }else{
                    $('.fastatus').eq($scope.stateIndex).removeClass('text-success','fa-check-square-o').addClass('fa-square-o');
                }
                $("#popoverstate").hide();
            }else{
                alert( data.error);
            }
        }).error(function(r){
            alert('服务器异常，请稍候重试');
        })
    }

    function queryParams(params) {
        var param = {
            page : this.pageNumber,
            limit : this.pageSize,
            start_time : self.startDate,
            end_time : self.endDate,
            project_name : self.Channel_s,
            product_name : self.Company_s,
            my_data: true
            // number : self.number,
            // status :self.Region_s
        }
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