/**
 * Created by Administrator on 2017/10/19 0019.
 */
var app = angular.module('homePages',[]);
app.controller('homePageCtrl',function($http,$scope,$timeout) {
    var cookie_auth = JSON.parse(sessionStorage.getItem('user'));
    var parents_w = window.parent;
    var homeTime = setInterval(function(){
        if(parents_w != undefined){
            clearInterval(homeTime)
            var state = parents_w.UserId == 0?true:false;
            $scope.rules = {
                verifys:{
                    state : state,
                    url : 'page/examine/examine.html?v='+ parents_w.random,
                    color : '#3BBDDB',
                    icon : 'fa-clock-o',
                    content : '待办/处理'
                },
                menus:{
                    state : state,
                    url : 'page/system/sys_menu.html?v='+ parents_w.random,
                    color : '#EFBB62',
                    icon : 'fa-list',
                    content : '菜单管理'
                },
                business:{
                    state : state,
                    url : 'page/business/operate/ope_business.html?v='+ parents_w.random,
                    color : '#BFC462',
                    icon : 'fa-bookmark-o',
                    content : '商务数据'
                }
            };
            if(!state) {
                Jurisdiction();
            }
            function Jurisdiction(){
                $scope.rules['verifys'].state = parents_w.authList('seeverify-check');//查看审核权限
                $scope.rules['business'].state = parents_w.authList('businessdataentry-business');//查看商务权限
                $scope.rules['menus'].state = parents_w.authList('systemconfiguration-menus');//查看菜单操作
            }
            if (/iPhone/i.test(navigator.userAgent)) {
                $('body').css('width',window.screen.availWidth);
            }
            $scope.messageList = cookie_auth.messageList;
            $(".homelishow, .ibox-content1").show();
            $scope.J_homenav = function(row){
                var dataState = true;
                if (row.url != undefined) {
                    var html_nav = '<a href="javascript:;" class="active J_menuTab" data-id="' + row.url + '">' + row.content + ' <i class="fa fa-times-circle"></i></a>';//生成nav头部
                    var html_body = '<iframe class="J_iframe" name="iframe0" width="100%" height="100%" src="' + row.url + '?v=4.0" frameborder="0" data-id="' + row.url + '" seamless=""></iframe>';//生成body主体
                    var tabsContent = $(".page-tabs-content", parent.document);//获取头部nav
                    var tabsList = $(".page-tabs-content .J_menuTab", parent.document);//获取nav list
                    var contentMain = $("#content-main", parent.document);//获取body主体
                    var MainList = $("#content-main .J_iframe", parent.document);//获取主体body list
                    //判断nav是否存在
                    for (var i = 0; i < tabsList.length; i++) {
                        var tabsTxet = tabsList.eq(i).attr('data-id');
                        if (tabsTxet == row.url) {
                            tabsList.siblings().removeClass('active').eq(i).addClass('active');
                            MainList.hide().eq(i).show();
                            dataState = false;
                            break;
                        }
                    }
                    //nav不存在则生成
                    if (dataState) {
                        if (tabsList.length == 1) {
                            $("#nav1", parent.document).removeClass("active");
                        } else {
                            tabsList.removeClass('active');
                        }
                        MainList.hide();
                        tabsContent.append(html_nav);
                        contentMain.append(html_body);
                    }
                }
            }

            $("#Home_Refresh").click(function () {
                HomeFun();
            });
            function HomeFun(){
                parents_w.home_date = 0;
                //var dateIner = setInterval(function(){
                //    if(parents_w.home_date == 60){
                //        clearInterval(dateIner);
                //        //$applyHome();
                //    }
                //},100)
            }
            function $applyHome(){
                $scope.$apply(function(){
                    var cookie_list = JSON.parse(sessionStorage.getItem('user'));
                    $scope.messageList = cookie_list.messageList;
                    if(cookie_list.messageCount != 0){
                        var Tishi_val = sessionStorage.getItem('TishiNum');
                        if(Tishi_val != 1) {
                            $("#tishidivshow", parent.document).show();
                        }
                        var me_html = '';
                        $.each(cookie_list.messageList,function(i,v){
                            me_html += '<div onclick="window.childSay('+i+')">'+(i+1)+'、['+ v.type+']'+ v.title+'...。<span class="text-success">[点击查看]</span></div>'
                        })
                        $("#tishicontent",parent.document).html(me_html);
                    }
                })
            }
            $scope.ChannelList = parents_w.select('base/getModule');
            $scope.Url_examine = 1;
            setInterval(function () {
                $("#Home_date").html(parents_w.home_date);
                if(parents_w.home_date == 60){
                    $applyHome();
                }
            }, 1000);
            $scope.message = function(index){
                sessionStorage.setItem('TishiNum', 1);
                if($scope.messageList.length == 1){
                    $("#tishidivshow", parent.document).hide();
                }
                childList(index);
            };
            function childList(index){
                $scope.showmenuS = 1;
                $scope.examineArr = $scope.messageList[index];
                $scope.Id = $scope.examineArr.check_id;
                $scope.moduleName = parents_w.getModuleName($scope.examineArr.module,$scope.ChannelList);
                $http.defaults.headers.common = { token: parents_w.token() };
                $http({
                    method: 'get',
                    url: parents_w.makeUrl($scope.examineArr.module, $scope.examineArr.source_id) + '?read=true&message_id='+$scope.examineArr.id
                }).success(function (data) {
                    if(data.code == 200) {
                        $scope.copyexamineArr = data.data;
                        $scope.copyexamineArr1 = angular.copy($scope.copyexamineArr);
                        $scope.copyexamineArr1.demand_level = String($scope.copyexamineArr1.demand_level);
                        $scope.copyexamineArr1.verify_flag = Number($scope.copyexamineArr1.verify_flag);
                        //if(params == 1){
                        $("#deal-table").bootstrapTable({
                            data: $scope.copyexamineArr.dealList,
                            pagination: true
                        });
                        self.dealA_state = true;
                        $("#deal-list .ibox-content").hide();
                        $("#details").modal("show");
                        if($scope.examineArr.module == 210){
                            $scope.Channel_s = parents_w.select('structures/getArtStructure');
                        }
                        //}
                    }else{
                        alert(data.error)
                    }
                }).error(function(){
                });
            }
            $scope.setProject = function() {
                $scope.Channel_s.forEach(function(item) {
                    if (item.id == $scope.copyexamineArr1.exce_user_id) {
                        $scope.copyexamineArr1.exce_username = item.realname;
                    }
                });
            };
            $scope.examine = function(){
                $http.defaults.headers.common = { token: parents_w.token() };
                if($scope.examineArr.module == 210){
                    if($scope.copyexamineArr1.verify_flag != 20 && $scope.copyexamineArr1.verify_flag != 30) {
                        alert('审核状态不能为空');
                        return false;
                    }
                    if($scope.copyexamineArr1.demand_level == undefined || $scope.copyexamineArr1.demand_level == '') {
                        alert('请选择需求优先级');
                        return false;
                    }
                    if($scope.copyexamineArr1.verify_flag == 20 && ($scope.copyexamineArr1.exce_user_id == undefined || $scope.copyexamineArr1.exce_user_id == '')) {
                        alert('请选择美术设计');
                        return false;
                    }
                    $http({
                        method: 'POST',
                        url: url + 'admin/fine_art/verifyDemand',
                        params: {
                            id : $scope.copyexamineArr1.id,
                            demand_level : $scope.copyexamineArr1.demand_level,
                            exce_user_id : $scope.copyexamineArr1.exce_user_id,
                            exce_username : $scope.copyexamineArr1.exce_username,
                            verify_status : $scope.copyexamineArr1.verify_flag
                            //status : $scope.copyexamineArr1.verify_status
                        }
                    }).success(function (data) {
                        successHome(data)
                    }).error(function (r) {
                        alert('服务器异常，请稍候重试')
                    })
                }else{
                    if($scope.examineArr.status == undefined) {
                        alert('审核状态不能为空');
                        return false;
                    }
                    $http({
                        method: 'PUT',
                        url: url + 'admin/check/' + $scope.Id,
                        params: $scope.examineArr
                    }).success(function (data) {
                        successHome(data)
                    }).error(function (r) {
                        alert('服务器异常，请稍候重试')
                    })
                }
            };
            function successHome(data){
                if (data.code == 200) {
                    $("#details").modal("hide");
                    $("#code").html(data.data);
                    $("#table_success").modal("show");
                    HomeFun();
                } else {
                    $scope.usersError = data.error;
                }
            }
            $scope.charges = function(id,name){
                var coptState = false;
                $("#charge_radioModal").modal("show");
                $("#chargeTitle").html("请选择...");
                $scope.copyp_name = angular.copy($scope.copyexamineArr1[id]);
                $scope.copyId = id;
                $scope.copyName = name;
                $scope.structuresList(coptState);
            };
            $scope.structuresList = function(v){//部门管理数据查询
                $scope.chargeList =  parents_w.division(false);
            }
            $scope.delp_name = function(id,name){//负责人清空
                $scope.copyexamineArr1[name] = '';
                $scope.copyexamineArr1[id] = '';
            };
            $scope.chargesKeep = function(){
                var che_value = [];
                var che_num = [];
                var depar = $("input[name='charge']:checked");
                depar.each(function(){
                    che_value.push($(this).attr('data-num'));
                    che_num.push($(this).val());
                });
                if(che_value.join(",") == ''){
                    alert('请选择...');
                }else{
                    $scope.copyexamineArr1[$scope.copyId] = che_num.join(",");
                    $scope.copyexamineArr1[$scope.copyName] = che_value.join(",");
                    $("#charge_radioModal").modal("hide");
                }
            }

            $scope.dealA = function(){
                var deal_cont = $("#deal-list .ibox-content");
                var collapse_link = $("#deal-list .collapse-link i");
                if(self.dealA_state){
                    deal_cont.show();
                    collapse_link.removeClass('fa-chevron-down').addClass('fa-chevron-up');
                    self.dealA_state = false;
                }else{
                    deal_cont.hide();
                    collapse_link.removeClass('fa-chevron-up').addClass('fa-chevron-down');
                    self.dealA_state = true;
                }
            }
            parents_w.childSay = function(v){
                sessionStorage.setItem('TishiNum', 1);
                if($scope.messageList.length == 1){
                    $("#tishidivshow", parent.document).hide();
                }
                childList(v);
                $(".J_menuTabs .active", parent.document).removeClass('active');//获取nav list
                $("#nav1", parent.document).addClass('active');//获取头部nav
                $("#content-main .J_iframe", parent.document).hide();//获取主体body list
                $("#myFrame", parent.document).show();//获取body主体
            }
            initTable('1','admin/home/yesterdayData');
            initTable('2','admin/home/monthData');
            function initTable(num,urls){
                $('#demo-table'+num).bootstrapTable({
                    method:'get',
                    dataType:'json',
                    contentType: "application/x-www-form-urlencoded",
                    cache: false,
                    striped: true,                              //是否显示行间隔色
                    url:parents_w.url + urls,
                    height:300,
                    width:$(window).width(),
                    showColumns:false,
                    pagination:false,
                    showRefresh:false,
                    ajaxOptions : {
                        headers : {
                            "token": parents_w.token()
                        }
                    },
                    uniqueId: "id",                     //每一行的唯一标识，一般为主键列
                    showExport: true,
                    exportDataType: 'all',
                    onLoadSuccess:function(data){ //成功的回调
                    }
                });
                $(window).resize(function() {
                    $('#demo-table'+num).bootstrapTable('resetView');
                });
            }
        }
    },20)

})