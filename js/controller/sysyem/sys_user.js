/**
 * Created by Administrator on 2017/9/13 0013.
 */
var app = angular.module('sysUser',[]);
app.controller('sysUserCtrl',function($http,$scope,$timeout) {
    var self = this;
    var parents = window.parent;
    var url = parents.url;
    var state = window.parent.UserId == 0?true:false;
    $scope.index = $scope.read = $scope.update = $scope.save = $scope.delete = $scope.deletes = $scope.enables = $scope.state= $scope.getrulelist = state;
    if(!state) {
        $scope.index = parents.authList('users-index');//查看列表权限
        $scope.read = parents.authList('users-read');//查看详情权限
        $scope.update = parents.authList('users-update');//编辑操作
        $scope.save = parents.authList('users-save');//添加操作
        $scope.delete = parents.authList('users-delete');//删除操作
        $scope.deletes = parents.authList('users-deletes');//批量删除操作
        $scope.enables = parents.authList('users-enables');//批量启用禁用操作
        $scope.getrulelist = parents.authList('users-getrulelist');
    }
    $("#query").show();
    self.id = '';
    self.Username = '';
    self.structure_id = '';
    self.role_id = '';
    $scope.deleteState = $scope.editState = $scope.iconState = false;
    $scope.usersId = $scope.usersMethod = $scope.errorstate = '';
    $scope.search = {
        name : '',
        structure_id : '',
        role_id : ''
    };
    $scope.stateIndex = 0;
    $scope.userArr = $scope.copyuserArr = new Object();
    $scope.roleList = parents.select('groups');
    $scope.structurelList = parents.select('structures');
    initTable();
    $scope.doQuery = function(params){
        $scope.deleteState = $scope.editState = $scope.iconState = false;
        $('#demo-table').bootstrapTable('refreshOptions',{pageNumber:1},'refresh').bootstrapTable('refresh');
    }
    $scope.deleteFun = function(params){//删除
        $("#table_delete").modal("show");
    }
    $scope.searchFun = function(){//用户名搜索
        self.Username = $scope.search.name;
        self.structure_id = $scope.search.structure_id;
        self.role_id = $scope.search.role_id;
        $scope.doQuery();
    }
    $scope.newstrucFun = function(params){//部门管理打开添加
        $("#departmentModal").modal("show");
        $("#struc").html("添加对应部门");
        $scope.copystructure = angular.copy($scope.copyuserArr.structure_id);
        $scope.structuresList(false);
    };
    $scope.structuresList = function(v){//部门管理数据查询
        if(v){
            var p_name = $scope.copyp_name == ''?$scope.copyp_name:$scope.copyp_name.split(',');
            $scope.chargeList =  parents.division(true,p_name);
        }else{
            $scope.departmentList =  parents.division(false);
        }
    }
    $scope.deparFun = function(){//保存部门管理
        var depar = $("input[name='department']:checked");
        if(depar.val() != undefined) {
            $scope.copyuserArr.structure_id = depar.val();
            $scope.copyuserArr.structure = depar.attr('data-num');
            $("#departmentModal").modal("hide");
        }else{
            alert('请选择对应部门');
        }
    };
    $scope.delp_name = function(){//上级主管清空
        $scope.copyuserArr.pid = '';
        $scope.copyuserArr.p_name = '';
    };
    $scope.charges = function(){
        $("#charge").modal("show");
        $("#chargeTitle_che").html("选择上级主管");
        $scope.copyp_name = angular.copy($scope.copyuserArr.pid);
        $scope.structuresList(true);
    };
    $scope.chargesKeep = function(){
        var che_value = [];
        var che_num = [];
        var depar = $("input[name='charge']:checked");
        depar.each(function(){
            che_value.push($(this).val());
            che_num.push($(this).attr('data-num'));
        });
        if(che_value.join(",") == ''){
            alert('请选择上级主管');
        }else{
            $scope.copyuserArr.p_name = che_value.join(",");
            $scope.copyuserArr.pid = che_num.join(",");
            $("#charge").modal("hide");
        }
    }
    $scope.editFun = function(params){//编辑
        $scope.usersError = '';
        $scope.usersId = $scope.userArr.id;
        $scope.usersMethod = 'put';
        $http.defaults.headers.common = { token: parents.token() };
        $http({
            method: 'get',
            url: url + '/admin/users/'+$scope.userArr.id
        }).success(function (data) {
            if(data.code == 200) {
                $scope.copyuserArr = data.data;
                $scope.copyuserArr.sex = String($scope.copyuserArr.sex);
                $scope.copyuserArr.group_id = String($scope.copyuserArr.group_id);
                //$scope.copyuserArr.password = '';
                if(params == 1){
                    console.log($scope.copyuserArr);
                    $scope.dealList = $scope.copyuserArr.dealList;
                    $("#deal-list").removeClass('border-bottom');
                    $("#deal-list .ibox-content").hide();
                    $("#details").modal("show");
                }else {
                    $scope.rulesState = false;
                    if($scope.getrulelist) {
                        if ($scope.copyuserArr.rule_id != '' && $scope.copyuserArr.rule_id != null) {
                            $scope.rulesData(1, $scope.copyuserArr.rule_id);
                        } else {
                            $scope.rulesData();
                        }
                    }
                    $scope.ChannelList = parents.select('groups');//获取单位list
                    $scope.pass = true;
                    isChe($scope.copyuserArr.status)
                    $("#preservaModal").modal("show");
                    $("#myModalLabel").html('编辑[' + $scope.copyuserArr.username + ']用户');
                }
            }
        }).error(function(){

        });
    }
    $scope.deleteConfirm = function(){ //删除弹出框
        $http.defaults.headers.common = { token: parents.token() };
        $http({
            method: 'delete',
            url: url + '/admin/users/'+$scope.userArr.id
        }).success(function (data) {
        $("#table_delete").modal("hide");
        $("#code").html('删除成功');
        $("#table_success").modal("show");
        $scope.doQuery();
        }).error(function(){
        });
    };

    $scope.preservaConfirm = function(){//新增弹出框
        var rulesArr = [];
        if($scope.getrulelist) {
            var depar = $("input[name='groups-che']:checked");
            depar.each(function () {
                rulesArr.push($(this).val());
            });
            $scope.copyuserArr.rule_id = rulesArr.join(',');
        }
        $scope.copyuserArr.status = $("#cheStatus").is(':checked')?1:0;
        parents.screen.Delete($scope.copyuserArr)
        $.ajax({
            url: url + '/admin/users/'+$scope.usersId,
            beforeSend: function(request) {
                request.setRequestHeader('token', parents.token());
            },
            data: $scope.copyuserArr,
            dataType: 'JSON',
            async: false, //请求是否异步，默认为异步
            type: $scope.usersMethod,
            success: function(data) {
                if(data.code == 200){
                    $scope.doQuery();
                    $("#preservaModal").modal("hide");
                    if(data.data == '编辑成功'){
                        $("#code").html(data.data);
                    }else{
                        var succ = '<div style="margin-left: 20px">'+data.data.name+'<br/>'+data.data.username+'<br/> '+data.data.password+'<br/> '+data.data.url+'<br/> </div>';
                        $("#code").html(succ);
                    }
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
        $scope.usersId = '';
        $scope.rulesState = true;
        $scope.usersMethod = 'post';
        $scope.copyuserArr = {
            sex : '0',
            structure : '',
            structure_id : '',
            pid :'',
            p_name : '',
            password : '123456',
            phone : '',
            sort : 0,
            group_id : '',
            openid: '',
            email: '',
            status: '1',
            work_date : parents.currentDate.dateTime()
            //work_date : '2017-09-07'
        };
        isChe($scope.copyuserArr.status)
        $scope.pass = false;
        $scope.rulesData();
        $scope.ChannelList = parents.select('groups');//获取单位list
        $("#preservaModal").modal("show");
        $("#myModalLabel").html('新增用户');
    };
    function isChe(v){
        var CheHtml = ''
        if(v == 1){
            CheHtml = '<input type="checkbox" value="" checked="" id="cheStatus"> <i></i> 启用 <input type="checkbox" value="" disabled=""> <i></i> 管理员'
        }else{
            CheHtml = '<input type="checkbox" value="" id="cheStatus"> <i></i> 启用 <input type="checkbox" value="" disabled=""> <i></i> 管理员'
        }
        $(".i-checks").html(CheHtml).iCheck({checkboxClass:"icheckbox_square-green",radioClass:"iradio_square-green"});
    }
    $scope.rulesFun = function(v,i){
        $scope.rulesState = false;
    };
    //日历初始化
    lay('#date_1').on('click', function(e){ //date_1 是一个按钮
        laydate.render({
            elem: '#date1'
            ,show: true //直接显示
            ,closeStop: '#date_1' //这里代表的意思是：点击 test1 所在元素阻止关闭事件冒泡。如果不设定，则无法弹出控件
            ,done: function(value, date, endDate){ //监听日期选择完毕
                $scope.copyuserArr.work_date = value;
            }
        });
    });
    //多选按钮初始化
    $scope.checkFun = function(){
        var che = $("input[name='all']").is(':checked');
        angular.forEach($scope.rulesList,function(v,i){
            v.check = che;
            if(v.child != undefined){
                v = parents.cherow.Flag(v,che,1);
            }
        })
    };
    $scope.cherowFun = function(v,id){
        var rowflag = !v.check;
        v.check = rowflag;
        angular.forEach($scope.rulesList,function(v,i){
            if(v.id == id){
                idx = i;
            }
        });
        parents.cherow.Flag(v,rowflag,$scope.rulesList[idx]);
    }
    $scope.rulesData = function(v1,val) {
        $scope.rulesList = parents.rules.Fun(v1,val,1);
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
            url:url + 'admin/users',
            height:700,
            width:$(window).width(),
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
            pageList: [5,10, 25, 50, 100],        //可供选择的每页的行数（*）
            uniqueId: "id",                     //每一行的唯一标识，一般为主键列
            showExport: true,
            exportDataType: 'all',
            responseHandler: parents.responseHandlers,
            onLoadSuccess:function(data){ //成功的回调
                iosTable();
                $("#demo-table tbody tr").click(function(){
                    var index = $(this).index()
                    $timeout(function(){
                        $scope.deleteState = $scope.editState = $scope.iconState = true;
                        $scope.userArr = $scope.copyuserArr = data.rows[index];
                        $("#demo-table tbody tr").siblings().removeClass("bg-color").eq(index).addClass("bg-color");
                    }, 170)

                });
                //单击修改文本内容state
                $('a[id^="username"]').editable({
                    disabled: false,             //是否禁用编辑
                    emptytext: "-",          //空值的默认文本
                    url: function (params) {
                        var sNum = $(this).attr("data-num");
                        var sName = $(this).attr("name");
                        $scope.userArr[sName] = params.value;
                        var d = new $.Deferred();
                        $http.defaults.headers.common = { token: parents.token() };
                        $http({
                            method : "put",
                            url: url + '/admin/users/'+$scope.userArr.id,
                            params : $scope.userArr
                        }).success(function(data){
                            if(data.code == 200){
                            }else{
                                return d.reject(data.error);
                            }
                        }).error(function(r){
                            return d.reject('服务器异常，请稍候重试');
                        })
                    }
                });
                //单击修改文本内容end
            }
        });
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
            var a_class = 'fa-square-o';
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
                $scope.userArr = $scope.copyuserArr = index;
                value.stopPropagation();
                $("#pop_input").val('')
                $("#popoverstate").css({
                    'top' : $(this).offset().top - 144,
                    'left' : $(this).offset().left - 37
                }).show();
                $("#demo-table tbody tr").siblings().removeClass("bg-color").eq(i).addClass("bg-color");
                if($scope.userArr.status == 1){
                    $("#pop_che").prop('checked',true);
                }else{
                    $("#pop_che").prop('checked',false)
                }
                //$(this).removeClass('text-success','fa-check-square-o').addClass('fa-square-o');
            }
        };
    }
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
        var pop_input = $("#pop_input").val();
        $scope.userArr.status = pop_che ? 1: 0;
        $scope.userArr.deal_description = pop_input;
        $http.defaults.headers.common = { token: parents.token() };
        $http({
            method : "put",
            url: url + '/admin/users/'+$scope.userArr.id,
            params : $scope.userArr
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
            offset : this.offset, // 页码
            page : this.pageNumber,
            limit : this.pageSize,
            keywords : self.Username,
            role_id : self.role_id,
            structure_id : self.structure_id
        }
        return param;
    }
});