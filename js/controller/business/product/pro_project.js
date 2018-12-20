/**
 * Created by Administrator on 2017/9/13 0013.
 */
var app = angular.module('proProject',[]);
app.controller('proProjectCtrl',function($http, $scope, $timeout) {
    var self = this;
    var parents = window.parent;
    var url = parents.url;
    var state = window.parent.UserId == 0?true:false;
    $scope.index = $scope.read = $scope.update = $scope.save = $scope.delete = $scope.deletes = $scope.enables = $scope.state = $scope.isexport = $scope.imports = state;
    if(!state) {
        $scope.index = parents.authList('project-index');//查看列表权限
        $scope.read = parents.authList('project-read');//查看详情权限
        $scope.update = parents.authList('project-update');//编辑操作
        $scope.save = parents.authList('project-save');//添加操作
        $scope.delete = parents.authList('project-delete');//删除操作
        $scope.deletes = parents.authList('project-deletes');//批量删除操作
        $scope.enables = parents.authList('project-enables');//批量启用禁用操作
        $scope.isexport = parents.authList('project-export');//导出操作
        $scope.imports = parents.authList('project-import');//导入操作
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
        C_status: true //status
    };
    $scope.Method = '';
    $scope.errorstate = '';
    $scope.stateIndex = 0;
    $scope.projectArr = $scope.copyprojectArr = new Object();

    $scope.ChannelList = parents.select('project/getProjectList');//获取渠道list
    $scope.CompanyList = parents.select('project/getProjectTypeList');//获取单位list
    $scope.RegionList = parents.select('content_provider/getContentProviderList');//获取单位list

    initTable();
    $scope.doQuery = function(params){
        $('#demo-table').bootstrapTable('refresh');    //刷新表格
        $scope.ChannelList = parents.select('project/getProjectList');//刷新渠道list
        $scope.CompanyList = parents.select('project/getProjectTypeList');//刷新单位list
        $scope.RegionList = parents.select('content_provider/getContentProviderList');//刷新单位list
        $scope.deleteState = $scope.editState = $scope.iconState = false;
    }
    $scope.search = function(params){ //搜索
        self.Channel_s = $scope.select.selectChannel;
        self.Company_s = $scope.select.selectCompany;
        self.Region_s = $scope.select.selectRegion;
        console.log(1);
        $('#demo-table').bootstrapTable('refreshOptions',{pageNumber:1}).bootstrapTable('refresh');    //刷新表格
        $scope.deleteState = $scope.editState = $scope.iconState = false;
    }
    $scope.deleteFun = function(params){//删除
        $("#table_delete").modal("show");
    }
    $scope.editFun = function(params){//编辑
        $scope.usersError = '';
        $scope.Id = $scope.projectArr.id;
        $scope.Method = 'put';
        $http.defaults.headers.common = { token: parents.token() };
        $http({
            method: 'get',
            url: url + 'admin/project/' + $scope.Id
        }).success(function (data) {
            if(data.code == 200) {
                $scope.copyprojectArr = data.data;
                if(params == 1){
                    $scope.dealList = data.data.dealList;
                    $("#deal-list").removeClass('border-bottom');
                    $("#deal-list .ibox-content").hide();
                    $("#details").modal("show");
                }else{
                    $scope.Company_s = parents.select('content_provider/getProviderNameAndId');//获取项目list
                    parents.forSome($scope.copyprojectArr, ['content_provider_id', 'closing_period'], String);
                    if (/[^1-4]/.test($scope.copyprojectArr.closing_period)) {
                        $scope.copyprojectArr.closing_period = '';
                    }
                    $("#preservaModal").modal("show");
                    $("#myModalLabel").html('[编辑]项目录入');
                }
            }
        }).error(function(){
        });
    }
    $scope.export = function(){//导出
        var ExpObj = {
            project_name : self.Channel_s,
            project_type : self.Company_s,
            content_provider :self.Region_s
        }
        parents.Exports('project/export',ExpObj)
    };
    self.inputTime = null;
    $scope.searchFun = function(v){//下拉框点击事件
        clearTimeout(self.inputTime);
        $(".select_input").removeClass('open');
        $("#"+v).addClass('open');
        $("#"+v+" input").focus();
        $scope.select.C_status = false;
    };
    $(".select_input input").on({//下拉框选中事件
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
    $scope.deleteConfirm = function() {
        //删除弹出框
        $http.defaults.headers.common = { token: parents.token() };
        var checks = $('#demo-table')
            .bootstrapTable('getSelections')
            .map(function(item) {
                return item.id;
            });

        if (checks.length) {
            $http.post(url + 'admin/project/deletes', {
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
                .delete(url + 'admin/project/' + $scope.projectArr.id)
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
        var channelNum = 0;
        angular.forEach($scope.copyprojectArr, function(v, i) {
            if (
                i == 'project_name' ||
                i == 'project_type' ||
                i == 'content_provider_id' ||
                i == 'operate_incharge' ||
                i == 'business_incharge' ||
                i == 'finance_incharge' ||
                i == 'data_view' ||
                i == 'data_add' ||
                i == 'data_examine'
            ) {
                if (v == '') {
                    channelNum++;
                }
            }
        });
        if(channelNum != 0){
            $scope.usersError = '请完善必填内容';
            return false;
        }
        $.ajax({
            url: url + 'admin/project/' + $scope.Id,
            beforeSend: function(request) {
                request.setRequestHeader('token', parents.token());
            },
            data: $scope.copyprojectArr,
            dataType: 'JSON',
            async: false, //请求是否异步，默认为异步
            type: $scope.Method,
            success: function(data) {
                if (data.code == 200) {
                    $scope.doQuery();
                    $('#preservaModal').modal('hide');
                    $('#code').html(data.data);
                    $('#table_success').modal('show');
                } else {
                    $scope.usersError = data.error;
                }
            },
            error: function() {}
        });
    }
    $scope.NewlyAdded = function(){
        $scope.usersError = '';
        $scope.Id = '';
        $scope.Method = 'post';
        $scope.copyprojectArr = {
            project_name: "",
            project_type: "",
            content_provider_id: "",
            operate_incharge: "",
            operate_incharge_id: "",
            business_incharge: "",
            business_incharge_id: "",
            finance_incharge: "",
            finance_incharge_id: "",
            data_view: "",
            data_view_users: "",
            data_add: "",
            data_add_users: "",
            data_examine: "",
            data_examine_id: "",
            closing_period: '',
            bill_date: '',
            invoice_date: '',
            business_announce_ids: "",
            //business_announce_users: "",
            announce_ids: "",
            announce_users: ""
        };
        $scope.Company_s = parents.select('content_provider/getProviderNameAndId');//获取项目list
        $("#preservaModal").modal("show");
        $("#myModalLabel").html('[新增]项目录入');
    }
    $scope.charges = function(v){
        var coptState = false;
        if(v == 4 || v == 5 || v == 7 || v == 8) {
            $("#charge").modal("show");
            $("#chargeTitle_che").html("请选择...");
            coptState = true;
        }else {
            $("#charge_radioModal").modal("show");
            $("#chargeTitle").html("请选择...");
        }
        if(v == 1){
            $scope.copyp_name = angular.copy($scope.copyprojectArr.operate_incharge_id);
        }else if(v == 2) {
            $scope.copyp_name = angular.copy($scope.copyprojectArr.business_incharge_id);
        }else if(v == 3) {
            $scope.copyp_name = angular.copy($scope.copyprojectArr.finance_incharge_id);
        }else if(v == 4) {
            $scope.copyp_name = angular.copy($scope.copyprojectArr.data_view_users);
        }else if(v == 5) {
            $scope.copyp_name = angular.copy($scope.copyprojectArr.data_add_users);
        }else if(v == 6) {
            $scope.copyp_name = angular.copy($scope.copyprojectArr.data_examine_id);
        } else if(v == 7) {
            $scope.copyp_name = angular.copy($scope.copyprojectArr.announce_ids);
        } else if(v == 8) {
            $scope.copyp_name = angular.copy($scope.copyprojectArr.business_announce_ids);
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
    };
    $scope.delp_name = function(v){//负责人清空
        if(v == 1){
            $scope.copyprojectArr.operate_incharge = '';
            $scope.copyprojectArr.operate_incharge_id = '';
        }else if(v == 2) {
            $scope.copyprojectArr.business_incharge = '';
            $scope.copyprojectArr.business_incharge_id = '';
        }else if(v == 3) {
            $scope.copyprojectArr.finance_incharge = '';
            $scope.copyprojectArr.finance_incharge_id = '';
        }else if(v == 4) {
            $scope.copyprojectArr.data_view = '';
            $scope.copyprojectArr.data_view_users = '';
        }else if(v == 5) {
            $scope.copyprojectArr.data_add = '';
            $scope.copyprojectArr.data_add_users = '';
        }else if(v == 6) {
            $scope.copyprojectArr.data_examine = '';
            $scope.copyprojectArr.data_examine_id = '';
        } else if(v == 7) {
            $scope.copyprojectArr.announce_users = '';
            $scope.copyprojectArr.announce_ids = '';
        } else if(v == 8) {
            $scope.copyprojectArr.business_announce_users = '';
            $scope.copyprojectArr.business_announce_ids = '';
        }
    };
    $scope.chargesKeep = function(){
        var che_value = [];
        var che_num = [];
        var depar = $("input[name='charge']:checked");
        depar.each(function(){
            if($scope.copyId == 4 || $scope.copyId == 5) {
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
                $scope.copyprojectArr.operate_incharge = che_value.join(",");
                $scope.copyprojectArr.operate_incharge_id = che_num.join(",");
            }else if($scope.copyId == 2) {
                $scope.copyprojectArr.business_incharge = che_value.join(",");
                $scope.copyprojectArr.business_incharge_id = che_num.join(",");
            }else if($scope.copyId == 3) {
                $scope.copyprojectArr.finance_incharge = che_value.join(",");
                $scope.copyprojectArr.finance_incharge_id = che_num.join(",");
            }else if($scope.copyId == 4) {
                $scope.copyprojectArr.data_view = che_num.join(",");
                $scope.copyprojectArr.data_view_users = che_value;
            }else if($scope.copyId == 5) {
                $scope.copyprojectArr.data_add = che_num.join(",");
                $scope.copyprojectArr.data_add_users = che_value;
            }else if($scope.copyId == 6) {
                $scope.copyprojectArr.data_examine = che_value.join(",");
                $scope.copyprojectArr.data_examine_id = che_num.join(",");
            }else if($scope.copyId == 7) {
                $scope.copyprojectArr.announce_users = che_num.join(",");
                $scope.copyprojectArr.announce_ids  = che_value;
            }else if($scope.copyId == 8) {
                $scope.copyprojectArr.business_announce_users = che_num.join(",");
                $scope.copyprojectArr.business_announce_ids  = che_value;
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

    $scope.setRegion = function(item, modal) {
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
            url:url + 'admin/project',
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
                var timer = null;
                var all_tr = $('#demo-table tbody tr,.fixed-table-body-columns tbody tr');
                var table_tr = $('#demo-table tbody tr');
                var columns_tr = $(".fixed-table-body-columns tbody tr");
                var tap = function() {
                    var t_idx = $(this).index();
                    $scope.deleteState = $scope.editState = $scope.iconState = true;
                    $scope.projectArr = $scope.copyprojectArr = data.rows[t_idx];
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
        $scope.projectArr.status = pop_che ? 1: 0;
        $http.defaults.headers.common = { token: parents.token() };
        $http({
            method : "put",
            url: url + 'admin/project/' + $scope.projectArr.id,
            params : $scope.projectArr
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
            type : self.Company_s,
            content_provider :self.Region_s
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