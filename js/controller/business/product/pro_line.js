/**
 * Created by Administrator on 2017/9/13 0013.
 */
var app = angular.module('proLine',[]);
app.controller('proLineCtrl',function($http, $scope, $timeout) {
    var self = this;
    var parents = window.parent;
    var url = parents.url;
    var state = window.parent.UserId == 0?true:false;
    $scope.index = $scope.read = $scope.update = $scope.save = $scope.delete = $scope.deletes = $scope.enables = $scope.state = $scope.isexport = $scope.imports = state;
    if(!state) {
        $scope.index = parents.authList('productchannel-index');//查看列表权限
        $scope.read = parents.authList('productchannel-read');//查看详情权限
        $scope.update = parents.authList('productchannel-update');//编辑操作
        $scope.save = parents.authList('productchannel-save');//添加操作
        $scope.delete = parents.authList('productchannel-delete');//删除操作
        $scope.deletes = parents.authList('productchannel-deletes');//批量删除操作
        $scope.enables = parents.authList('productchannel-enables');//批量启用禁用操作
        $scope.isexport = parents.authList('productchannel-export');//导出操作
        $scope.imports = parents.authList('productchannel-importproductchannel');//导入操作
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
        selectChannel: '', //选择项目的名字
        selectCompany: '', //选择产品的名字
        selectRegion: '', //选择渠道的名字
        C_status: true
    };
    $scope.Method = '';
    $scope.errorstate = '';
    $scope.stateIndex = 0;
    $scope.lineArr = $scope.copylineArr = new Object();

    $scope.ChannelList = parents.select('product_channel/getProductList');//获取渠道list
    $scope.CompanyList = parents.select('product_channel/getChannelList');//获取产品list
    $scope.RegionList = parents.select('product_channel/getIssueList');//获取发行主体list

    initTable();
    $scope.doQuery = function(params){
        $('#demo-table').bootstrapTable('refresh');    //刷新表格
        $scope.ChannelList = parents.select('product_channel/getProductList');//获取渠道list
        $scope.CompanyList = parents.select('product_channel/getChannelList');//获取产品list
        $scope.RegionList = parents.select('product_channel/getIssueList');//获取发行主体list
        $scope.deleteState = $scope.editState = $scope.iconState = false;
    }
    $scope.search = function(params){ //搜索
        self.Channel_s = $scope.select.selectChannel;
        self.Company_s = $scope.select.selectCompany;
        self.Region_s = $scope.select.selectRegion;
        $('#demo-table').bootstrapTable('refreshOptions',{pageNumber:1}).bootstrapTable('refresh');    //刷新表格
        $scope.deleteState = $scope.editState = $scope.iconState = false;
    }
    $scope.deleteFun = function(params){//删除
        $("#table_delete").modal("show");
    }
    $scope.editFun = function(params){//编辑
        $scope.usersError = '';
        $scope.Id = $scope.lineArr.id;
        $scope.Method = 'put';
        $http.defaults.headers.common = { token: parents.token() };
        $http({
            method: 'get',
            url: url + 'admin/product_channel/' + $scope.Id
        }).success(function (data) {
            if(data.code == 200) {
                $scope.copylineArr = data.data;
                if(params == 1){
                    $("#deal-table").bootstrapTable({
                        data: $scope.copylineArr.dealList,
                        pagination: true
                    });
                    $("#details").modal("show");
                }else{
                    $scope.copylinesArr = [];
                    $("#preservaModal").modal("show");
                    $("#myModalLabel").html('[编辑]产品上线渠道');
                    $scope.Channel_new = parents.select('product/getProductNameAndId');//获取产品list
                    $scope.Company_new = parents.select('channel/getChannelNameAndId');//获取渠道list
                    $scope.Region_new = parents.select('issue/getIssueNameAndId');//获取发行主体list
                    $scope.shareList = parents.select('base/getIncomeSourceConfig');//获取单位list
                    parents.forSome($scope.copylineArr, ['product_id', 'channel_id', 'issue_id', 'settlement_id', 'is_cps'], String);
                    angular.forEach($scope.shareList,function(v,i){
                        $scope.copylinesArr.push('');
                        angular.forEach($scope.copylineArr.income_source_ids,function(v1,i1){
                            if(v1 == v.id){
                                v.flag = true;
                                $scope.copylinesArr[i] = $scope.copylineArr[v.field];
                            }
                        });
                    });
                }
            }
        }).error(function(){
        });
    };
    $scope.export = function(){//导出
        var ExpObj = {
            product_name : self.Channel_s,
            channel_name : self.Company_s,
            issue_name :self.Region_s
        }
        parents.Exports('product_channel/export',ExpObj)
    };
    $scope.dome = function(){//下载模板
        parents.Exports('product_channel/downloadTemplate','')
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
    // 导入文件
    $scope.import = function() {
        var fd = new FormData();
        fd.append('file', $scope.iconFile);
        $http
            .post(url + 'admin/product_channel/importProductChannel', fd, {
                headers: { 'Content-Type': undefined, token: parents.token() },
                transformRequest: angular.identity
            })
            .then(function(data) {
                    if (data.data.code === 200) {
                        $('#icon').modal('hide');
                        $('#code').html(data.data.data);
                        $('#table_success').modal('show');
                    }
                    if (data.data.code === 400) {
                        $scope.usersError = data.data.error;
                    }
                    $scope.uploading = false;
                }, function(error) {
                    $scope.usersError = error.statusText;
                    $scope.uploading = false;
                });
        $scope.uploading = true;
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

    $scope.iconFun = function() {
        $scope.usersError = '';
        $scope.iconFile = null;
        angular.element('#iconFile').val(null);
        $('#icon').modal('show');
    };

    $scope.deleteConfirm = function() {
        //删除弹出框
        $http.defaults.headers.common = { token: parents.token() };
        var checks = $('#demo-table')
            .bootstrapTable('getSelections')
            .map(function(item) {
                return item.id;
            });

        if (checks.length) {
            $http.post(url + 'admin/product_channel/deletes', {
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
                .delete(url + 'admin/product_channel/' + $scope.lineArr.id)
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

    $scope.preservaConfirm = function(){//新增弹出框
        $scope.copylineArr.income_source = [];
        $.each($scope.shareList,function(i,v){
            if(v.flag){
                $scope.copylineArr[v.field] = $scope.copylinesArr[i];
                $scope.copylineArr.income_source.push(v.name);
                $scope.copylineArr.income_source_ids.push(v.id);
            }
        });
        $.each($scope.Company_new,function(i,v){
            if($scope.copylineArr.settlement_id == v.id){
                $scope.copylineArr.settlement_name = v.name;
            }
        })
        var channelNum = parents.forEachs($scope.copylineArr);
        if(channelNum != 0){
            $scope.usersError = '请完善必填内容';
            return false;
        }
        $.ajax({
            url: url+'admin/product_channel/' + $scope.Id,
            beforeSend: function(request) {
                request.setRequestHeader("token", parents.token());
            },
            data : $scope.copylineArr,
            dataType: 'JSON',
            async: false,//请求是否异步，默认为异步
            type: $scope.Method,
            success: function (data) {
                if(data.code == 200){
                    $scope.doQuery();
                    $("#preservaModal").modal("hide");
                    $("#code").html(data.data);
                    $("#table_success").modal("show");
                }else{
                    $scope.usersError = data.error;
                }
            },
            error: function () {
            }
        });
    }
    $scope.copylinesArr = [];
    $scope.NewlyAdded = function(){
        $scope.usersError = '';
        $scope.Id = '';
        $scope.Method = 'post';
        $scope.copylineArr = {
            product_id: "",
            channel_id: "",
            is_cps: "0",
            //is_period_closing: "1",
            settlement_name: "",
            settlement_id: "",
            income_source: [],
            income_source_ids: [],
            issue_id: ""
        };
        $scope.copylinesArr = [];
        $scope.Channel_new = parents.select('product/getProductNameAndId');//获取产品list
        $scope.Company_new = parents.select('channel/getChannelNameAndId');//获取渠道list
        $scope.Region_new = parents.select('issue/getIssueNameAndId');//获取发行主体list
        $scope.shareList = parents.select('base/getIncomeSourceConfig');//获取单位list
        angular.forEach($scope.shareList,function(v,i){
            v.value = '';
            $scope.copylinesArr.push('')
        });
        $("#preservaModal").modal("show");
        $("#myModalLabel").html('[新增]产品上线渠道');
    }

    $scope.channelChe = function(item) {
        $scope.copylineArr.settlement_id = $scope.copylineArr.channel_id;
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
            url:url + 'admin/product_channel',
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
            fixedNumber: 2,
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
                        $scope.lineArr = $scope.copylineArr = data.rows[t_idx];
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
                }
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
        smaller = function(value, row, index) {
            return "<div>"+value+"</div>";
        };
        share = function(value, row, index) {
            var c_value = '<div>'+value+'%</div>';
            if(value == null){
                c_value = '无'
            }
            return c_value;
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
        $scope.lineArr.status = pop_che ? 1: 0;
        $http.defaults.headers.common = { token: parents.token() };
        $http({
            method : "put",
            url: url + 'admin/product_channel/' + $scope.lineArr.id,
            params : $scope.lineArr
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
            product : self.Channel_s,
            channel : self.Company_s,
            issue :self.Region_s
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