/**
 * Created by Administrator on 2017/9/13 0013.
 */
var app = angular.module('proProduct',[]);
app.controller('proProductCtrl',function($http, $scope, $timeout) {
    var self = this;
    var parents = window.parent;
    var url = parents.url;
    var state = window.parent.UserId == 0?true:false;
    $scope.index = $scope.read = $scope.update = $scope.save = $scope.delete = $scope.deletes = $scope.enables = $scope.state = $scope.isexport = $scope.imports = state;
    if(!state) {
        $scope.index = parents.authList('product-index');//查看列表权限
        $scope.read = parents.authList('product-read');//查看详情权限
        $scope.update = parents.authList('product-update');//编辑操作
        $scope.save = parents.authList('product-save');//添加操作
        $scope.delete = parents.authList('product-delete');//删除操作
        $scope.deletes = parents.authList('product-deletes');//批量删除操作
        $scope.enables = parents.authList('product-enables');//批量启用禁用操作
        $scope.isexport = parents.authList('product-export');//导出操作
        $scope.imports = parents.authList('product-import');//导入操作
    }
    $("#query").show();
    $scope.deleteState = false;
    $scope.editState = false;
    $scope.iconState = false;
    $scope.Id = '';
    self.Channel_s = '';//地区-搜索
    self.Company_s = '';//地区-搜索
    $scope.select = {
        selectChannel: '', //选择项目的名字
        selectCompany: '', //选择产品的名字
        C_status: true
    };
    $scope.Method = '';
    $scope.errorstate = '';
    $scope.stateIndex = 0;
    $scope.pruductArr = $scope.copypruductArr = new Object();

    $scope.ChannelList = parents.select('product/getProductList');//获取渠道list
    $scope.CompanyList = parents.select('product/getProjectList');//获取项目list

    initTable();
    $scope.doQuery = function(params){
        $('#demo-table').bootstrapTable('refresh');    //刷新表格
        $scope.ChannelList = parents.select('product/getProductList');//获取渠道list
        $scope.CompanyList = parents.select('product/getProjectList');//获取项目list
        $scope.deleteState = $scope.editState = $scope.iconState = false;
    }
    $scope.search = function(params){ //搜索
        self.Channel_s = $scope.select.selectChannel;
        self.Company_s = $scope.select.selectCompany;
        $('#demo-table').bootstrapTable('refreshOptions',{pageNumber:1}).bootstrapTable('refresh');    //刷新表格
        $scope.deleteState = $scope.editState = $scope.iconState = false;
    }
    $scope.deleteFun = function(params){//删除
        $("#table_delete").modal("show");
    }
    $scope.editFun = function(params){//编辑
        $scope.usersError = '';
        $scope.Id = $scope.pruductArr.id;
        $scope.Method = 'put';
        $http.defaults.headers.common = { token: parents.token() };
        $http({
            method: 'get',
            url: url + 'admin/product/' + $scope.Id
        }).success(function (data) {
            if(data.code == 200) {
                $scope.copypruductArr = data.data;
                if(params == 1){
                    $scope.dealList = data.data.dealList;
                    $("#deal-list").removeClass('border-bottom');
                    $("#deal-list .ibox-content").hide();
                    $("#details").modal("show")
                }else{
                    $scope.Company_s = parents.select('project/getProjectNameAndId');
                    parents.forSome($scope.copypruductArr, ['project_id'], String);
                    $("#preservaModal").modal("show");
                    $("#myModalLabel").html('[编辑]产品录入');
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
            $http.post(url + 'admin/product/deletes', {
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
                .delete(url + 'admin/product/' + $scope.pruductArr.id)
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
        if($scope.copypruductArr['product_name'] == '' || $scope.copypruductArr['project_id'] == '' || $scope.copypruductArr['publish_time'] == '' || $scope.copypruductArr['cp_share_rate'] == '') {
            $scope.usersError = '请完善必填内容';
            return false;
        }
        parents.screen.Delete($scope.copypruductArr)
        $.ajax({
            url: url + 'admin/product/' + $scope.Id,
            beforeSend: function(request) {
                request.setRequestHeader('token', parents.token());
            },
            data: $scope.copypruductArr,
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
    $scope.delp_name = function(v,id){//负责人清空
            //$scope.copypruductArr.announce_users = '';
            //$scope.copypruductArr.announce_ids = '';
            $scope.copypruductArr[v] = '';
            $scope.copypruductArr[id] = '';
    };
    $scope.charges = function(v,id){
        var coptState = false;
        //if(v == 4) {
        $("#charge").modal("show");
        $("#chargeTitle_che").html("请选择...");
        coptState = true;
        //}
        $scope.copyp_name = angular.copy($scope.copypruductArr[id]);
        $scope.copyId = id;
        $scope.copyName= v;
        $scope.structuresList(coptState);
    };
    $scope.structuresList = function(v){//部门管理数据查询
        $scope.chargeList =  parents.division(true,$scope.copyp_name);
    };
    $scope.chargesKeep = function(){
        var che_value = [];
        var che_num = [];
        var depar = $("input[name='charge']:checked");
        depar.each(function(){
            che_value.push(Number($(this).attr('data-num')));
            che_num.push($(this).val());
        });
        if(che_value.join(",") == ''){
            alert('请选择...');
        }else{
            $scope.copypruductArr[$scope.copyName] = che_num.join(",");
            $scope.copypruductArr[$scope.copyId]  = che_value;
            $("#charge").modal("hide");
            $("#charge_radioModal").modal("hide");
        }
    }
    $scope.NewlyAdded = function(){
        $scope.usersError = '';
        $scope.Id = '';
        $scope.Method = 'post';
        $scope.copypruductArr = {
            product_name: "",
            publish_time: "",
            cp_share_rate: "",
            project_id: "",
            business_announce_ids: "",
            business_announce_users: "",
            announce_ids: "",
            announce_users: ""
        };
        $scope.Company_s = parents.select('project/getProjectNameAndId');//获取项目list
        $("#preservaModal").modal("show");
        $("#myModalLabel").html('[新增]产品录入');
    }

    $scope.export = function(){//导出
        var ExpObj = {
            product_name : self.Channel_s,
            project_name : self.Company_s
        }
        parents.Exports('product/export',ExpObj)
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

    $scope.setChannel = function(item) {
        $scope.select.selectChannel = item;
    };

    $scope.setCompany = function(item) {
        $scope.select.selectCompany = item;
    };

    lay('#date_1').on('click', function(e) {
        //date_1 是一个按钮
        laydate.render({
            elem: '#date1',
            show: true, //直接显示
            closeStop: '#date_1', //这里代表的意思是：点击 test1 所在元素阻止关闭事件冒泡。如果不设定，则无法弹出控件
            done: function(value, date, endDate) {
                //监听日期选择完毕
                $scope.copypruductArr.publish_time = value;
            }
        });
    });
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
            url:url + 'admin/product',
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
            onLoadSuccess:function(data){ //成功的回调
                iosTable();
                if (data.total != 0) {
                    var timer = null;
                    var tap = function() {
                        $scope.deleteState = $scope.editState = $scope.iconState = true;
                        $scope.pruductArr = $scope.copypruductArr = data.rows[$(this).index()];
                        $(this)
                            .addClass('bg-color')
                            .siblings()
                            .removeClass('bg-color');
                    };
                    $('#demo-table tbody tr').click(function() {
                        $timeout.cancel(timer);
                        timer = $timeout(tap.bind(this), 170);
                    });
                    $('#demo-table tbody tr').dblclick(
                        function() {
                            $timeout.cancel(timer);
                            tap.call(this);
                            $scope.editFun(1);
                        }
                    );
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
        cp_shareData = function(value, row, index) {
            var c_value = '<div>'+value+'%</div>';
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
        $scope.pruductArr.status = pop_che ? 1: 0;
        $http.defaults.headers.common = { token: parents.token() };
        $http({
            method : "put",
            url: url + 'admin/product/' + $scope.pruductArr.id,
            params : $scope.pruductArr
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
            project_name :self.Company_s
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