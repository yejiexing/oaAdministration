/**
 * Created by Administrator on 2017/9/13 0013.
 */
var app = angular.module('comChannel',[]);
app.controller('comChannelCtrl',function($http, $scope, $timeout) {
    var self = this;
    var parents = window.parent;
    var url = parents.url;
    var state = window.parent.UserId == 0?true:false;
    $scope.index = $scope.read = $scope.update = $scope.save = $scope.delete = $scope.deletes = $scope.enables = $scope.state = $scope.isexport = $scope.imports = state;
    if(!state) {
        $scope.index = parents.authList('channel-index');//查看列表权限
        $scope.read = parents.authList('channel-read');//查看详情权限
        $scope.update = parents.authList('channel-update');//编辑操作
        $scope.save = parents.authList('channel-save');//添加操作
        $scope.delete = parents.authList('channel-delete');//删除操作
        $scope.deletes = parents.authList('channel-deletes');//批量删除操作
        $scope.enables = parents.authList('channel-enables');//批量启用禁用操作
        $scope.isexport = parents.authList('channel-export');//导出操作
        $scope.imports = parents.authList('channel-import');//导入操作
    }
    $("#query").show();
    $scope.deleteState = false;
    $scope.editState = false;
    $scope.iconState = false;
    $scope.Id = '';
    self.Channel_s = '';//地区-搜索
    self.Company_s = '';//地区-搜索
    self.Region_s = '';//地区-搜索
    $scope.select = {
        selectChannel: '',//选择渠道的名字
        selectCompany: '',//选择单位的名字
        selectRegion: '',//选择地区的名字
        C_status: true
    }
    $scope.Method = '';
    $scope.errorstate = '';
    $scope.stateIndex = 0;
    $scope.channelArr = $scope.copychannelArr = new Object();

    $scope.ChannelList = parents.select('channel/getChannelList');//获取渠道list
    $scope.CompanyList = parents.select('channel/getCompanyList');//获取单位list

    initTable();
    $scope.doQuery = function(params){
        $('#demo-table').bootstrapTable('refresh');    //刷新表格
        $scope.ChannelList = parents.select('channel/getChannelList');//刷新渠道list
        $scope.CompanyList = parents.select('channel/getCompanyList');//刷新单位list
        $scope.deleteState = $scope.editState = $scope.iconState = false;
    }
    $scope.search = function(params){ //搜索
        self.Channel_s = $scope.select.selectChannel;
        self.Company_s = $scope.select.selectCompany;
        self.Region_s = $scope.select.selectRegion;
        $('#demo-table').bootstrapTable('refreshOptions',{pageNumber:1},'refresh').bootstrapTable('refresh');    //刷新表格
        $scope.deleteState = $scope.editState = $scope.iconState = false;
    }
    $scope.deleteFun = function(params){//删除
        $("#table_delete").modal("show");
    }
    $scope.editFun = function(params){//编辑
        $scope.usersError = '';
        $scope.Id = $scope.channelArr.id;
        $scope.Method = 'put';
        $http.defaults.headers.common = { token: parents.token() };
        $http({
            method: 'get',
            url: url + 'admin/channel/' + $scope.Id
        }).success(function (data) {
            if(data.code == 200) {
                $scope.copychannelArr = data.data;
                //parents.forSome($scope.copychannelArr, ['tax_registration'], Number);
                if(params == 1){
                    $scope.dealList = $scope.copychannelArr.dealList;
                    $("#deal-list").removeClass('border-bottom');
                    $("#deal-list .ibox-content").hide();
                    $("#details").modal("show");
                }else{
                    parents.forSome($scope.copychannelArr, ['channel_area', 'channel_type', 'bill_period', 'invoice_period'], String);
                    $("#preservaModal").modal("show");
                    $("#myModalLabel").html('[编辑]渠道');
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
            $http.post(url + 'admin/channel/deletes', {
                ids: checks
            }).then(
                function(data) {
                    $('#table_delete').modal('hide');
                    $('#code').html(data.data.data);
                    $('#table_success').modal('show');
                    $scope.doQuery();
                }
            );
        } else {
            $http
                .delete(url + 'admin/channel/' + $scope.channelArr.id)
                .then(
                    function(data) {
                        $('#table_delete').modal('hide');
                        $('#code').html(data.data.data);
                        $('#table_success').modal('show');
                        $scope.doQuery();
                    },
                    function() {
                    }
                );
        }
    };
    $scope.export = function(){//导出
        var ExpObj = {
            channel_name : self.Channel_s,
            company_name : self.Company_s,
            channel_area :self.Region_s
        }
        parents.Exports('channel/export',ExpObj)
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

    $scope.preservaConfirm = function(){//新增弹出框
        var channelNum = parents.forEachs($scope.copychannelArr);
        if(channelNum != 0){
            $scope.usersError = '请完善必填内容';
            return false;
        }
        parents.screen.Delete($scope.copychannelArr)
        $.ajax({
            url: url + 'admin/channel/' + $scope.Id,
            beforeSend: function(request) {
                request.setRequestHeader('token', parents.token());
            },
            data: $scope.copychannelArr,
            dataType: 'JSON',
            async: false, //请求是否异步，默认为异步
            type: $scope.Method,
            success: function(data) {
                if(data.code == 200){
                    $scope.doQuery();
                    $("#preservaModal").modal("hide");
                    $("#code").html(data.data);
                    $("#table_success").modal("show");
                }else{
                    $scope.usersError = data.error;
                }
            },
            error: function() {
                alert('服务器异常，请稍候重试')
            }
        });
    }
    $scope.NewlyAdded = function(){
        $scope.usersError = '';
        $scope.Id = '';
        $scope.Method = 'post';
        $scope.copychannelArr = {
            bank_account: "",
            bank_name: "",
            bill_date: "",
            business_incharge: "",
            business_incharge_id: "",
            channel_area: "",
            channel_fee: "",
            channel_name: "",
            channel_type: '',
            company_address: "",
            company_name: "",
            company_phone: "",
            delivery_address: "",
            delivery_phone: "",
            finance_incharge: "",
            finance_incharge_id: "",
            data_view: "",
            data_view_users: "",
            invoice_date: "",
            invoice_tax_point: "",
            invoice_period: "",
            recipients: "",
            tax_registration: "",
            pay_work_day: "",
            bill_period: ""
        };
        $("#preservaModal").modal("show");
        $("#myModalLabel").html('新增[渠道]');
    }
    $scope.charges = function(v){
        var coptState = false;
        if(v == 4) {
            $("#charge").modal("show");
            $("#chargeTitle_che").html("请选择...");
            coptState = true;
        }else {
            $("#charge_radioModal").modal("show");
            $("#chargeTitle").html("请选择...");
        }
        if(v == 1){
            $scope.copyp_name = angular.copy($scope.copychannelArr.finance_incharge_id);
        }else if(v == 4) {
            $scope.copyp_name = angular.copy($scope.copychannelArr.data_view_users);
        }else {
            $scope.copyp_name = angular.copy($scope.copychannelArr.business_incharge_id);
        }
        $scope.copyId = v;
        $scope.structuresList(coptState);
    };

    $scope.structuresList = function(v){//部门管理数据查询
        if(v){
            $scope.chargeList =  parents.division(true,$scope.copyp_name);
        }else{
            $scope.chargeList =  parents.division(false);
        }
    }
    $scope.delp_name = function(v){//负责人清空
        if(v == 1){
            $scope.copychannelArr.finance_incharge = '';
            $scope.copychannelArr.finance_incharge_id = '';
        }else if(v == 4) {
            $scope.copychannelArr.data_view = '';
            $scope.copychannelArr.data_view_users = '';
        }else {
            $scope.copychannelArr.business_incharge_id = '';
            $scope.copychannelArr.business_incharge = '';
        }
    };
    $scope.chargesKeep = function(){
        var che_value = [];
        var che_num = [];
        var depar = $("input[name='charge']:checked");
        depar.each(function(){
            if($scope.copyId == 4) {
                che_value.push(Number($(this).attr('data-num')));
            }else{
                che_value.push($(this).attr('data-num'));
            }
            che_num.push($(this).val());
        });
        if(che_value.join(",") == ''){
            alert('请选择...');
        }else{
            if($scope.copyId == 1){
                $scope.copychannelArr.finance_incharge = che_value.join(",");
                $scope.copychannelArr.finance_incharge_id = che_num.join(",");
            }else if($scope.copyId == 4) {
                $scope.copychannelArr.data_view = che_num.join(",");
                $scope.copychannelArr.data_view_users = che_value;
            }else {
                $scope.copychannelArr.business_incharge_id = che_num.join(",");
                $scope.copychannelArr.business_incharge = che_value.join(",");
            }
            $("#charge").modal("hide");
            $("#charge_radioModal").modal("hide");
        }
    }
    $scope.setChannel = function(item) {
        $scope.select.selectChannel = item;
    };

    $scope.setCompany = function(item) {
        $scope.select.selectCompany = item;
    };
    $scope.channelType = function(type) {
        if (type == 10) {
            return '渠道';
        }
        if (type == 20) {
            return '支付通道';
        }
        if (type == 30) {
            return 'CPS';
        }
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
            cache: false,
            striped: true,                              //是否显示行间隔色
            sidePagination: "server",           //分页方式：client客户端分页，server服务端分页（*）
            url:url + 'admin/channel',
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
            fixedColumns: !parents.IsPC(),
            fixedNumber: 3,
            onLoadSuccess:function(data){ //成功的回调
                iosTable();
                var timer = null;
                var all_tr = $('#demo-table tbody tr,.fixed-table-body-columns tbody tr');
                var table_tr = $('#demo-table tbody tr');
                var columns_tr = $(".fixed-table-body-columns tbody tr");
                var tap = function() {
                    var t_idx = $(this).index();
                    $scope.editState = $scope.iconState = true;
                    $scope.deleteState = !data.rows[t_idx].no_delete;
                    $scope.channelArr = $scope.copychannelArr = data.rows[t_idx];
                    parents.forSome($scope.copychannelArr, ['tax_registration'], Number);
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

                data.rows.forEach(function(item, index) {
                    checkbox.eq(index).prop('disabled', item.no_delete);
                    fixedCheckbox.eq(index).prop('disabled', item.no_delete);
                });
            },
            rowStyle: function (row, index) {
                var style = {};
                if (row.verify_status==0) {
                    style={css:{'color':'#cacaca'}};
                }else if(row.verify_status==2){
                    style={css:{'color':'red'}};
                }
                return style;
            }
        });
        numData = function(value, row, index) {
            return  index+1;
        };
        statusData = function(value, row, index) {
            var c_class = 'fa-square-o';
            if(value == 0){
                c_class = 'fa-square-o';
            }else{
                c_class = 'fa-check-square-o text-success';
            }
            return '<i class="fa '+c_class+' fastatus" style="cursor: pointer"></i>'
        };
        is_adminData = function(value, row, index) {
            if(value != 1){
                a_class = 'fa-square-o';
            }else{
                a_class = 'fa-check-square-o text-success';
            }
            return '<i class="fa '+a_class+'"></i>'
        };
        positionData = function(value, row, index) {
            return  '<a href="#" id="username'+index+'" name="position" data-num="'+index+'" data-type="text" data-title="职位">'+value+'</a>';
        };
        window.statusEvents = {
            //弹窗显示
            'click .fastatus': function(value, row, index, i) {
                $scope.errorstate = '';
                $scope.stateIndex = i;
                $scope.channelArr = $scope.copychannelArr = index;
                value.stopPropagation();
                $("#popoverstate").css({
                    'top' : $(this).offset().top - 85,
                    'left' : $(this).offset().left - 32
                }).show();
                $("#demo-table tbody tr").siblings().removeClass("bg-color").eq(i).addClass("bg-color");
                if($scope.channelArr.status == 1){
                    $("#pop_che").prop('checked',true);
                }else{
                    $("#pop_che").prop('checked',false)
                }
            }
        };
        small = function(value, row, index) {
            return "<div style='width:130px'>"+value+"</div>";
        };
        normal = function(value, row, index) {
            return "<div style='width:170px'>"+value+"</div>";
        };
        large = function(value, row, index) {
            return "<div style='width:230px'>"+value+"</div>";
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
    };
    $("#popoverstate").click(function(e){
        e.stopPropagation();
    });
    //popoverstate窗口关闭end
    $scope.stateedit = function(v){
        var pop_che = $("#pop_che").is(':checked');
        $scope.channelArr.status = pop_che ? 1: 0;
        $http.defaults.headers.common = { token: parents.token() };
        $http({
            method : "put",
            url: url + 'admin/users/' + $scope.channelArr.id,
            params : $scope.channelArr
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
            name : self.Channel_s,
            company : self.Company_s,
            area :self.Region_s
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