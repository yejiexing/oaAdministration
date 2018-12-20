/**
 * Created by Administrator on 2017/9/12 0012.
 */
$(function(){
    var allcookies = document.cookie;

    //定义一个函数，用来读取特定的cookie值。
// 调用函数
    var cookie_val = sessionStorage.getItem('user');
    if(cookie_val != null) {
        var UserObj = JSON.parse(cookie_val);
        var menuCont = '';
        window.UserId = UserObj.userInfo.id;
        function menu(name) {
            var menuObj = UserObj.menusList;
            var titleHtml = '';
            var titleIndex = 0;
            $("#user").html(UserObj.userInfo.realname);
            $.each(menuObj, function (i, v) {
                if ($(window).width() < 910) {
                    titleHtml += '<li class="title1" data-title="' + v.title + '">' + v.title + '</li>';
                } else {
                    titleHtml += '<span class="title1" data-title="' + v.title + '"><i class="fa ' + v.icon + '"></i>&nbsp;&nbsp;' + v.title + '</span>';
                }
                if(name == v.title){
                    titleIndex = i;
                }
            });
            titleIndex = name == 0?name:titleIndex;
            if ($(window).width() < 910) {
                $("#adminnav").hide();
                $(".title").hide();
                $(".navbar-header").show();
                $(".navbar").removeClass('navbar-fixed-top').addClass('navbar-fixed-bottom');
                $('#scroller ul').html(titleHtml);
                var num = $('.title1').length;
                $("#scroller").css('width', ($('.title1').width() * num + 30) + 'px')
                $(".navbar-fixed-bottom").css('height', '50px');
            } else {
                $('.navbar-header').hide();
                $("#wrapper1").hide();
                $('.title').html(titleHtml).css('marginLeft', ($(window).width() - $('.title').width()) / 2);
                //$('.title')
            }
            //var myScroll = new iScroll('wrapper');
            //hScroll: true, 左右滑动，默认为true
            //vScroll: true,上下滑动
            //hScrollbar: true, 是否显示y轴滚动条，默认为显示
            //vScrollbar: true,是否显示X轴滚动条，默认为显示
            var myScroll = new IScroll('#wrapper1', {
                eventPassthrough: true,
                scrollX: true,
                scrollY: false,
                preventDefault: false
            });
            //初始化菜单栏 -state
            menuFun(menuObj[titleIndex]);
            var titles = $('.title1');
            titles.eq(titleIndex).addClass('meadio');
            //初始化菜单栏 -end

            //刷新菜单栏 -state
            titles.on('click', function () {
                var titleIdx = $(this).index();
                titles.siblings().removeClass("meadio").eq(titleIdx).addClass("meadio");
                if ($(window).width() < 910) {
                    $("body").removeClass('mini-navbar');
                    $(".navbar-header i").removeClass('fa-sort-up').addClass('fa-sort-desc');
                    navbarstate = true
                }
                menuFun(menuObj[titleIdx]);
            })
        }
        polling(0);
        //刷新菜单栏 -end
        function menuFun(v) {
            menuCont = '';
            if(v.child != undefined) {
                menuCont = menuHtml(v.child);
            }
            $("#side-menu").html(menuCont);
            contabs();
            hplus();
        }
        function menuHtml(val){ //菜单递归
            var menuH = '';
            $.each(val, function (m_i, m_v) {
                if (m_v.child == undefined) {
                    var liUrl = window.parent.getUrlName(m_v.url,'mydata')?'&v=':'?v=';
                    menuH += '<li><a class="J_menuItem" href="' + m_v.url + liUrl + window.parent.random + '"><i class="fa '+m_v.icon+'"></i> <span class="nav-label">' + m_v.title + '</span></a> </li>'
                } else {
                    var menuHUl = '<li> <a href="#"> <i class="fa '+m_v.icon+'"></i> <span class="nav-label">' + m_v.title + '</span> <span class="fa arrow"></span> </a> <ul class="nav nav-second-level">';
                    menuHUl += menuHtml(m_v.child);
                    menuHUl += '</ul></li>';
                    menuH += menuHUl;
                }
            })
            return menuH;
        }
        $('li[data-title="财务结算"]').on('click', function() {
            $('a[href*="finance_analys"]').on('click', function() {
                $('.navbar-header').click();
            });
        });
        navbarstate = false;
        $('.navbar-header').click(function(){
            if(navbarstate){
                $("body").addClass('mini-navbar');
                $(".navbar-header i").removeClass('fa-sort-desc').addClass('fa-sort-up');
                //$(this).css('marginTop','16px');
                navbarstate = false;
            }else{
                $("body").removeClass('mini-navbar');
                $(".navbar-header i").removeClass('fa-sort-up').addClass('fa-sort-desc');
                //$(this).css('marginTop','8px');
                navbarstate = true
            }
        });
        //轮询查询
        function polling(name){
            $.ajax({
                url: url+'admin/users/refresh',
                beforeSend: function(request) {
                    request.setRequestHeader("token", token());
                },
                dataType: 'JSON',
                async: false,//请求是否异步，默认为异步
                type: 'GET',
                success: function (data) {
                    if(data.code == 200){
                        UserObj.menusList = data.data.menusList;
                        cookie_auth = UserObj.authList = data.data.authList;
                        UserObj.messageCount = data.data.messageCount;
                        UserObj.messageList = data.data.messageList;
                        sessionStorage.setItem('user',JSON.stringify(UserObj));
                        menu(name);
                        if(name != 0) {
                            homeTime = setInterval(homepoll, 1000);
                        }else{
                            //if(UserObj.userInfo.id != 0 && UserObj.messageCount != 0){
                            //if(UserObj.messageCount != 0){
                            //    var Tishi_val = sessionStorage.getItem('TishiNum');
                            //    if(Tishi_val != 1){
                            //        $("#tishidivshow").show();
                            //    }
                            //    var me_html = '';
                            //    $.each(UserObj.messageList,function(i,v){
                            //        me_html += '<div onclick="window.childSay('+i+')">'+(i+1)+'、['+ v.type+']'+ v.title+'...。<span class="text-success">[点击查看]</span></div>'
                            //    })
                            //    $("#tishicontent").html(me_html);
                            //}
                        }
                        //return data.data;
                    }else if(data.code == 101) {
                        sessionStorage.removeItem('user');
                        location.href = 'login.html';
                    }else{
                        alert('服务器异常，请联系管理员')
                    }
                },
                error: function () {
                }
            });
        };
        window.home_date = 60;
        function homepoll(){
            if(window.home_date == 0) {
                var daTitle = $(".meadio").attr('data-title');
                polling(daTitle);
                clearInterval(homeTime);
                window.home_date = 60;
            }else{
                window.home_date--;
            }
        }
        var homeTime = setInterval(homepoll,1000);
        window.onresize = function(){
            var daTitle1 = $(".meadio").attr('data-title');
            menu(daTitle1);
        }
    }else{
        location.href = 'login.html'
    }

})