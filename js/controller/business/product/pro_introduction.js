/**
 * Created by Administrator on 2017/9/13 0013.
 */
var app = angular.module('proIntroduction',[]);
app.controller('proIntroductionCtrl',function($http, $scope, $timeout) {
    var self = this;
    var parents = window.parent;
    var url = parents.url;
    var state = window.parent.UserId == 0?true:false;
    $scope.index = $scope.read = $scope.update = $scope.save = $scope.delete = $scope.deletes = $scope.enables = $scope.state = $scope.isexport = $scope.imports = $scope.eval = $scope.selectTester = $scope.finishedTest = $scope.archive = state;
    if(!state) {
        $scope.index = parents.authList('productintroduction-index');//查看列表权限
        $scope.read = parents.authList('productintroduction-read');//查看详情权限
        $scope.update = parents.authList('productintroduction-update');//编辑操作
        $scope.save = parents.authList('productintroduction-save');//添加操作
        $scope.delete = parents.authList('productintroduction-delete');//删除操作
        $scope.deletes = parents.authList('productintroduction-deletes');//批量删除操作
        $scope.enables = parents.authList('productintroduction-enables');//批量启用禁用操作
        $scope.isexport = parents.authList('productintroduction-export');//导出操作
        $scope.imports = parents.authList('productintroduction-import');//导入操作
        $scope.eval = parents.authList('productintroduction-updatestatustoevaluation');//导入操作
        $scope.selectTester = parents.authList('productintroduction-selecttester');//导入操作
        $scope.finishedTest = parents.authList('productintroduction-finishedtest');//导入操作
        $scope.archive = parents.authList('productintroduction-archive');//导入操作
    }
    $("#query").show();
    $scope.deleteState = $scope.editState = $scope.iconState = $scope.evalState = $scope.evaluatingState = $scope.finishedTestState = $scope.archiveState = false;
    $scope.Newdate1 = self.start_date = parents.currentDate.SameMonth();
    $scope.Newdate2 = self.end_date = parents.currentDate.dateTime();
    $scope.alertArr = [];
    self.product_name = '';
    $scope.select = {
        product_name: '', //产品名称
        C_status: true //status
    };
    $scope.Method = $scope.Id = $scope.errorstate = '';;
    $scope.stateIndex = 0;
    $scope.IntroductionArr = $scope.copyIntroductionArr = new Object();

    initTable();
    $scope.doQuery = function(params){
        $('#demo-table').bootstrapTable('refresh');    //刷新表格
        //$scope.deleteState = $scope.editState = $scope.iconState = false;
        $scope.deleteState = $scope.editState = $scope.iconState = $scope.evalState = $scope.evaluatingState = $scope.finishedTestState = $scope.archiveState = false;
    }
    $scope.search = function(params){ //搜索
        self.start_date = $scope.Newdate1;
        self.end_date = $scope.Newdate2;
        self.product_name = $scope.select.product_name;
        $('#demo-table').bootstrapTable('refreshOptions',{pageNumber:1}).bootstrapTable('refresh');    //刷新表格
        $scope.deleteState = $scope.editState = $scope.iconState = false;
    }
    layDate(
        ['1', '2', '3', '4'], //日期id
        ['date', 'date', 'date', 'date'], //日期type
        ['Newdate1', 'Newdate2', 'start_time', 'end_time'], //存储对象
        ['1', '1', '0', '0'], //存储状态
        'copyIntroductionArr',
        $scope
    );
    $scope.deleteFun = function(params){//删除
        $("#table_delete").modal("show");
    }
    $scope.editFun = function(params){//编辑
        $scope.usersError = '';
        $scope.Id = $scope.IntroductionArr.id;
        $scope.Method = 'put';
        $http.defaults.headers.common = { token: parents.token() };
        $http({
            method: 'get',
            url: url + 'admin/product_introduction/' + $scope.Id
        }).success(function (data) {
            if(data.code == 200) {
                $scope.copyIntroductionArr = data.data;
                if(params == 1){
                    $scope.dealList = data.data.dealList;
                    $("#deal-list").removeClass('border-bottom');
                    $("#deal-list .ibox-content").hide();
                    $("#details").modal("show");
                }else{
                    $scope.CP_s = parents.select('content_provider/getProviderNameAndId');//获取cplist
                    $scope.Issue_s = parents.select('issue/getIssueNameAndId');//获取发行主体list
                    console.info($scope.copyIntroductionArr)
                    parents.forSome($scope.copyIntroductionArr, ['is_ip','cp_id','issue_id'], String);
                    $("#pageFile").val('')
                    $("#preservaModal").modal("show");
                    $("#myModalLabel").html('[编辑]产品引入');
                }
            }
        }).error(function(){
        });
    }
    $scope.export = function(){//导出
        var ExpObj = {
            start_date : self.start_date,
            end_date : self.end_date,
            product_name : self.product_name
        }
        parents.Exports('product_introduction/export',ExpObj)
    };

    //测评，选择测评人state
    var $evalsArr = [
        'admin/product_introduction/updateStatusToEvaluation',
        'admin/product_introduction/selectTester',
        'admin/product_introduction/finishedTest',
        'admin/product_introduction/archive'
    ]
    $scope.evaluating = function(id,v){
        $scope.$evals = id;
        if(id == 1){
            $scope.alertArr.operator = $scope.alertArr.operator_id = '';
        }else if(id ==2){
            $scope.alertArr.tester = $scope.alertArr.tester_id = '';
        }else if(id ==3){
            $scope.alertArr.file = '';
            $("#iconFile").val('')
        }else{
            $scope.alertArr.status = $scope.IntroductionArr.status == '评测完成'?'30':'40';
        }
        $scope.usersError = '';
        $("#alertTitle").html(v);
        $("#alertState").modal('show');
    }
    function $evalsFunt($id,$e,dv){
        var $data = {
            id : $id
            },$num = 0;
        if($e == 1){
            $data.operator = $scope.alertArr.operator;
        }else if($e ==2){
            $data.tester_ids = $scope.alertArr.tester;
        }else if($e ==3){
            $data.file = $scope.alertArr.file;
        }else{
            $data.status = $scope.alertArr.status;
        }
        $.each($data,function(i,v){
            if(i!= 'file' && v == ''){
                $num++;
            }
        })
        if($num != 0){
            $scope.usersError = '完善必填内容';
            return false;
        }
        return $num != 0?$data=400:dv($data);
    }
    $scope.alertEdit = function(){
        $scope.Id = $scope.IntroductionArr.id;
        $evalsFunt($scope.Id,$scope.$evals,function(data){
            if(data != 400) {
                $.ajax({
                    url: url + $evalsArr[$scope.$evals - 1],
                    beforeSend: function (request) {
                        request.setRequestHeader('token', parents.token());
                    },
                    data: data,
                    dataType: 'JSON',
                    async: false, //请求是否异步，默认为异步
                    type: $scope.$evals == 3 ? 'POST' : 'PUT',
                    success: function (data) {
                        if (data.code == 200) {
                            $scope.doQuery();
                            $('#alertState').modal('hide');
                            $('#code').html(data.data);
                            $('#table_success').modal('show');
                        } else {
                            $scope.usersError = data.error;
                        }
                    },
                    error: function (err) {
                    }
                });
            }
        })

    };

    $scope.delp_name = function(v,id){//负责人清空
        $scope.alertArr[v] = '';
        $scope.alertArr[id] = '';
    };
    $scope.charges = function(v,id){
        var coptState = false;
        if(v == 2) {
            $("#charge").modal("show");
            $("#chargeTitle_che").html("请选择...");
            coptState = true;
        }else {
            $("#charge_radioModal").modal("show");
            $("#chargeTitle").html("请选择...");
        }
        $scope.copyp_name = angular.copy($scope.alertArr[id]);

        $scope.copyId = id;
        $scope.copyCode = v;
        $scope.structuresList(coptState);
    };
    $scope.structuresList = function(v){//部门管理数据查询
        if(v){
            $scope.chargeList =  parents.division(true,$scope.copyp_name.split(','));
        }else{
            $scope.chargeList =  parents.division(false);
        }
    };
    $scope.chargesKeep = function(){
        var che_value = [];
        var che_num = [];
        var depar = $("input[name='charge']:checked");
        depar.each(function(){
            if($scope.copyCode == 2) {
                che_value.push(Number($(this).attr('data-num')));
            }else{
                che_value.push($(this).attr('data-num'));
            }
            che_num.push($(this).val());
        });
        if(che_value.join(",") == ''){
            alert('请选择...');
        }else{
            $scope.alertArr[$scope.copyId] = che_value.join(",");
            $scope.alertArr[$scope.copyId+'_id'] = che_num.join(",");
            $("#charge").modal("hide");
            $("#charge_radioModal").modal("hide");
        }
    }

    // 检查导入文件格式
    $scope.checkFile = function(file,e) {
        var dataKey = e.attr("data-key");
        var extName = file.name.slice(file.name.lastIndexOf('.'));
        var extNames = dataKey == 'page_url'?['.apk']:['.xlc', '.xlm', '.xlt', '.xlw', '.xls', '.xlsx'];

        $scope.$apply(function() {
            if ($.inArray(extName, extNames) === -1) {
                $scope.usersError = '文件格式错误';
                $scope.iconFile = '';
            } else {
                $scope.usersError = '';
                //$scope.iconFile = file;

                var fd = new FormData();
                fd.append('file', file);
                $http.post(url + 'admin/upload', fd, {
                        headers: { 'Content-Type': undefined, token: parents.token() },
                        transformRequest: angular.identity
                    })
                    .then(
                    function(data) {
                        if (data.data.code === 200) {
                            if(dataKey == 'page_url'){
                                $scope.copyIntroductionArr[dataKey] = parents.url_img +data.data.data;
                                console.log($scope.copyIntroductionArr)
                            }else{
                                $scope.alertArr.file = data.data.data;
                            }
                        }
                        if (data.data.code === 400) {
                            $scope.usersError = data.data.error;
                        }
                    },
                    function(error) {
                        $scope.usersError = error.statusText;
                        $scope.uploading = false;
                    }
                );
            }
        });
    };
    //测评，选择测评人end

    $scope.pageClick = function(){
        $("#pageFile").click();
    }

    //self.inputTime = null;
    //$scope.searchFun = function(v){//下拉框点击事件
    //    clearTimeout(self.inputTime);
    //    $(".select_input").removeClass('open');
    //    $("#"+v).addClass('open');
    //    $("#"+v+" input").focus();
    //    $scope.select.C_status = false;
    //};
    //$(".select_input input").on({//下拉框选中事件
    //    'blur' : function(){
    //        var thisId = $(this).attr('data-id');
    //        self.inputTime = setTimeout(function(){
    //            $("#"+thisId).removeClass('open');
    //        },200)
    //    },
    //    'focus':function(v){
    //        $scope.select.C_status = true;
    //        var thisId = $(this).attr('data-id');
    //        $("#"+thisId).addClass('open');
    //        //$scope.$apply()
    //    },
    //    'input propertychange' : function(){
    //        $scope.select.C_status = true;
    //    }
    //});
    $scope.deleteConfirm = function() {
        //删除弹出框
        $http.defaults.headers.common = { token: parents.token() };
        var checks = $('#demo-table')
            .bootstrapTable('getSelections')
            .map(function(item) {
                return item.id;
            });

        if (checks.length) {
            $http.post(url + 'admin/product_introduction/deletes', {
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
                .delete(url + 'admin/product_introduction/' + $scope.IntroductionArr.id)
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
        angular.forEach($scope.copyIntroductionArr, function(v, i) {
            if (i == 'product_name' || i == 'product_type' || i == 'cp_id' || i == 'issue_id' || i == 'start_time' || i == 'end_time') {
                if (v == '') {
                    channelNum++;
                }
            }
        });
        if(channelNum != 0){
            $scope.usersError = '请完善必填内容';
            return false;
        }
        parents.screen.Delete($scope.copyIntroductionArr)
        $.ajax({
            url: url + 'admin/product_introduction/' + $scope.Id,
            beforeSend: function(request) {
                request.setRequestHeader('token', parents.token());
            },
            data: $scope.copyIntroductionArr,
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
        $scope.copyIntroductionArr = {
            product_name: "",
            product_type: "",
            cp_id: "",
            issue_id: "",
            page_url: "",
            page_password: "",
            test_account: "",
            is_ip: "0",
            start_time: "",
            end_time: ""
        };
        $scope.CP_s = parents.select('content_provider/getProviderNameAndId');//获取cplist
        $scope.Issue_s = parents.select('issue/getIssueNameAndId');//获取发行主体list
        $("#preservaModal").modal("show");
        $("#myModalLabel").html('[新增]产品引入');
    }






    //$scope.setChannel = function(item) {
    //    $scope.select.selectChannel = item;
    //};
    //
    //$scope.setCompany = function(item) {
    //    $scope.select.selectCompany = item;
    //};
    //
    //$scope.setRegion = function(item, modal) {
    //    $scope.select.selectRegion = item;
    //};
    function testerFun(arr){
        var testerStatus = false;
        for(var i = 0;i<arr.length;i++){
            if(arr[i] == window.parent.UserId){
                testerStatus = true;
                break;
            }
        }
        return testerStatus;
    }
    function iosTable() {
        if (/iPhone/i.test(navigator.userAgent)) {
            document.querySelector('.bootstrap-table').style.width = (window.screen.availWidth - 25) + 'px';
        }
    }
    function operatorFun(arr){
        var OperState = false;
        $.each(arr,function(i,v){
            if(v == window.parent.UserId){
                OperState = true;
            }
        });
        return OperState;
    }
    function initTable(){
        $('#demo-table').bootstrapTable({
            method:'get',
            dataType:'json',
            contentType: "application/x-www-form-urlencoded",
            cache: false,
            striped: true,                              //是否显示行间隔色
            sidePagination: "server",           //分页方式：client客户端分页，server服务端分页（*）
            url:url + 'admin/product_introduction',
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
                    $scope.IntroductionArr = $scope.copyIntroductionArr = data.rows[t_idx];
                    $scope.evalState = $scope.evaluatingState = $scope.finishedTestState = $scope.archiveState = false;
                    if(($scope.copyIntroductionArr.operator_name == '') && (window.parent.UserId == 0 || $scope.copyIntroductionArr.create_user_id == window.parent.UserId)){
                        $scope.evalState = true;
                    }else if(($scope.copyIntroductionArr.tester_name == '') && (window.parent.UserId == 0 || operatorFun($scope.copyIntroductionArr.operator.split(',')))){
                        $scope.evaluatingState = true;
                    }else if(($scope.copyIntroductionArr.operator_name != '' && $scope.copyIntroductionArr.tester_name != ''&& $scope.copyIntroductionArr.status == '评测中') && (window.parent.UserId == 0 || testerFun($scope.copyIntroductionArr.tester.split(",")))){
                        $scope.finishedTestState = true;
                    }else if(($scope.copyIntroductionArr.status == '评测完成' ||  $scope.copyIntroductionArr.status == '洽谈') && ($scope.copyIntroductionArr.create_user_id == window.parent.UserId)){
                        $scope.archiveState = true;
                    }
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
                $("#loading").hide()
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
        fileData = function(value, row, index){
            var fileUrl = value == null || value == ''?'无':'<div class="fileClick cursor-pointer text-success">点击下载</div>';
            return fileUrl;
        };
        dateeData = function(value, row, index){
            return "<div style='min-width: 168px'>"+(row.start_time+' ~ '+row.end_time)+'</div>';
        };
        window.fileFun = {
            'click .fileClick' : function(e, value, row, index){
                window.open(parents.url_img+row.file_path)
            }
        }
        window.pageFun = {
            'click .fileClick' : function(e, value, row, index){
                window.open(row.page_url)
            }
        }
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
        $scope.IntroductionArr.status = pop_che ? 1: 0;
        $http.defaults.headers.common = { token: parents.token() };
        $http({
            method : "put",
            url: url + 'admin/product_introduction/' + $scope.IntroductionArr.id,
            params : $scope.IntroductionArr
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
            start_date : self.start_date,
            end_date : self.end_date,
            product_name : self.product_name
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