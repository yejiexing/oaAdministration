/**
 * Created by Administrator on 2017/9/13 0013.
 */
var app = angular.module('comIssue',[]);
app.controller('comIssueCtrl',function($http, $scope, $timeout) {
    var self = this;
    var parents = window.parent;
    var url = parents.url;
    var state = window.parent.UserId == 0?true:false;
    $scope.index = $scope.read = $scope.update = $scope.save = $scope.delete = $scope.deletes = $scope.enables = $scope.state = $scope.isexport = $scope.imports = state;
    if(!state) {
        $scope.index = parents.authList('issue-index');//查看列表权限
        $scope.read = parents.authList('issue-read');//查看详情权限
        $scope.update = parents.authList('issue-update');//编辑操作
        $scope.save = parents.authList('issue-save');//添加操作
        $scope.delete = parents.authList('issue-delete');//删除操作
        $scope.deletes = parents.authList('issue-deletes');//批量删除操作
        $scope.enables = parents.authList('issue-enables');//批量启用禁用操作
        $scope.isexport = parents.authList('issue-export');//导出操作
        $scope.imports = parents.authList('issue-import');//导入操作
    }
    $("#query").show();
    $scope.deleteState = false;
    $scope.editState = false;
    $scope.iconState = false;
    $scope.Id = '';
    self.Channel_s = '';//选择发行主体-搜索
    $scope.select = {
        selectChannel : '', //选择发行主体
        C_status: true
    }
    $scope.Method = '';
    $scope.errorstate = '';
    $scope.stateIndex = 0;
    $scope.issueArr = $scope.copyissueArr = new Object();
    $scope.checks = [];

    $scope.ChannelList = parents.select('issue/getIssueList');//获取渠道list

    initTable();
    $scope.doQuery = function(params){
        $('#demo-table').bootstrapTable('refresh');    //刷新表格
        $scope.ChannelList = parents.select('issue/getIssueList');//刷新渠道list
        $scope.deleteState = $scope.editState = $scope.iconState = false;
    }
    $scope.search = function(params){ //搜索
        self.Channel_s = $scope.select.selectChannel;
        $('#demo-table').bootstrapTable('refreshOptions',{pageNumber:1}).bootstrapTable('refresh');    //刷新表格
        $scope.deleteState = $scope.editState = $scope.iconState = false;
    }
    $scope.deleteFun = function(params){//删除
        $("#table_delete").modal("show");
    }
    $scope.editFun = function(params){//编辑
        $scope.usersError = '';
        $scope.Id = $scope.issueArr.id;
        $scope.Method = 'put';
        $http.defaults.headers.common = { token: parents.token() };
        $http({
            method: 'get',
            url: url + 'admin/issue/' + $scope.Id
        }).success(function (data) {
            if(data.code == 200) {
                $scope.copyissueArr = data.data;
                if(params == 1){
                    $scope.dealList = $scope.copyissueArr.dealList;
                    $("#deal-list").removeClass('border-bottom');
                    $("#deal-list .ibox-content").hide();
                    $("#details").modal("show");
                }else if(params == 2){
                    angular.element('#contFile').val(null);
                    $("#contTitle").html('上传文件');
                    $('#contAlert').modal('show');
                }else{
                    $('input[type="file"]').val(null);
                    $("#preservaModal").modal("show");
                    $("#myModalLabel").html('[编辑]发行公司录入');
                }
            }
        }).error(function(){
        });
    }
    $scope.export = function(){//导出
        var ExpObj = {
            issue_name : self.Channel_s
        }
        parents.Exports('issue/export',ExpObj)
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

    $scope.deleteConfirm = function() {
        //删除弹出框
        $http.defaults.headers.common = { token: parents.token() };
        var checks = $('#demo-table')
            .bootstrapTable('getSelections')
            .map(function(item) {
                return item.id;
            });

        if (checks.length) {
            $http.post(url + 'admin/issue/deletes', {
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
                .delete(url + 'admin/issue/' + $scope.issueArr.id)
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

    $scope.preservaConfirm = function(v){//新增弹出框
        var channelNum = parents.forEachs($scope.copyissueArr);
        if(channelNum != 0){
            $scope.usersError = '请完善必填内容';
            return false;
        }
        parents.screen.Delete($scope.copyissueArr)
        $http.defaults.headers.common = { token: parents.token() };
        $http({
            method : $scope.Method,
            url: url + 'admin/issue/' + $scope.Id,
            params : $scope.copyissueArr
        }).success(function(data){
            if(data.code == 200){
                $scope.doQuery();
                if(v == 1) {
                    $("#contAlert").modal("hide");
                }else {
                    $("#preservaModal").modal("hide");
                }
                $("#code").html(data.data);
                $("#table_success").modal("show");
            }else{
                $scope.usersError = data.error;
            }
        }).error(function(r){
            alert('服务器异常，请稍候重试')
        })
    }
    $scope.checkFile = function(file,e) {
        var fd = new FormData();
        var extName = (file.name.slice(file.name.lastIndexOf('.'))).toLowerCase();
        var extNames = ['.jpg','.jpeg', '.png', '.pdf', '.doc', '.docx'];
        $scope.$apply(function() {
            if ($.inArray(extName, extNames) === -1) {
                $scope.usersError = '请输入正确格式的文件';
                $scope.copyissueArr.license = '';
                $('input[type="file"]').val('');
            } else {
                $('#contAlertBtn').attr('disabled',true)
                $scope.usersError = '';
                fd.append('file', file);
                $http
                    .post(url + 'admin/upload', fd, {
                        headers: {
                            'Content-Type': undefined,
                            token: parents.token()
                        },
                        transformRequest: angular.identity
                    })
                    .then(
                    function (data) {
                        if (data.data.code === 200) {
                            $('#contAlertBtn').attr('disabled',false)
                            //$scope.copyissueArr.statement_file_name = file.name;
                            $scope.copyissueArr.license = data.data.data;
                        } else {
                            $scope.copyissueArr.license = '';
                            $('input[type="file"]').val();
                            $scope.usersError = data.data.error;
                        }
                    },
                    function (error) {
                        $scope.usersError = error;
                    }
                );
            }
        });
    };
    $scope.NewlyAdded = function(){
        $scope.usersError = '';
        $scope.Id = '';
        $scope.Method = 'post';
        $scope.copyissueArr = {
            issue_name: "",
            company_name: "",
            company_address: "",
            company_phone: "",
            delivery_address: "",
            recipients: "",
            delivery_phone: "",
            bank_name: "",
            bank_account: "",
            tax_registration: "",
            finance_incharge: "",
            license: "",
            finance_incharge_id: ""
        };
        $('input[type="file"]').val(null);
        $("#preservaModal").modal("show");
        $("#myModalLabel").html('[新增]发行公司录入');
    }
    $scope.charges = function(v){
        $("#charge").modal("show");
        $("#chargeTitle").html("请选择...");
        $scope.copyp_name = v == 1?angular.copy($scope.copyissueArr.finance_incharge_id):angular.copy($scope.copyissueArr.business_incharge_id);
        $scope.copyId = v;
        $scope.structuresList(true);
    };

    $scope.structuresList = function(v){//部门管理数据查询
        if(v){
            $scope.chargeList =  parents.division(false,$scope.copyp_name);
        }
    }
    $scope.delp_name = function(v){//负责人清空
        if(v == 1){
            $scope.copyissueArr.finance_incharge = '';
            $scope.copyissueArr.finance_incharge_id = '';
        }else {
            $scope.copyissueArr.business_incharge_id = '';
            $scope.copyissueArr.business_incharge = '';
        }
    };
    $scope.chargesKeep = function(){
        var depar = $("input[name='charge']:checked");
        if(depar.val() != undefined) {
            $scope.copyissueArr.finance_incharge = depar.attr('data-num');
            $scope.copyissueArr.finance_incharge_id = depar.val();
            $("#charge").modal("hide");
        }else{
            alert('请选择负责人');
        }
    }

    $scope.setChannel = function(item) {
        $scope.select.selectChannel = item;
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
            url:url + 'admin/issue',
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
                    $scope.deleteState = $scope.editState = $scope.iconState = true;
                    $scope.issueArr = $scope.copyissueArr = data.rows[t_idx];
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
        small = function(value, row, index) {
            return "<div style='width:130px'>"+value+"</div>";
        };
        normal = function(value, row, index) {
            return "<div style='width:170px'>"+value+"</div>";
        };
        large = function(value, row, index) {
            return "<div style='width:230px'>"+value+"</div>";
        };
        fileData = function(value, row, index) {
            return  value=='点击添加' ? '<div class="pathclick text-danger text-cursor">点击添加</div>':'<div class="fileclick text-success" style="cursor: pointer;">点击查看</div>'
        };
        window.fileEvents = {
            //弹窗显示
            'click .fileclick': function(e, value, row, index) {
                window.open(parents.url_img + value)
                //window.location.href = parents.url_img + value;
            },
            'click .pathclick': function(e, value, row, index) {
                $timeout(function(){$('#contAlertBtn').attr('disabled',true);$scope.editFun(2);},180)
            }
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
        $scope.issueArr.status = pop_che ? 1: 0;
        $http.defaults.headers.common = { token: parents.token() };
        $http({
            method : "put",
            url: url + 'admin/users/' + $scope.issueArr.id,
            params : $scope.issueArr
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
            name : self.Channel_s
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