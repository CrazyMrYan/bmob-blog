import Vue from 'vue'
import Vuex from 'vuex'
import NProgress from 'nprogress'

Vue.use(Vuex)

const state = {
    // localStorage
    locaName: localStorage.getItem('name'),
    // message 数据
    mesState: '',
    mesTitle: '',
    /*
        newID           文章ID
        newDetail       数据状态
        @newShow        组件显示
        @newTitle       文章标题
        @newConent      文章内容
        @newComment     文章评论
        @newTime        文章发表时间
        @newTag         文章分类
        @newGood        文章赞
        @newName        文章发表人
    */
    newID : '',
    newShow : false,
    newTitle: '',
    newConent: '',
    newComment: '',
    newTime: '',
    newTag: '',
    newGood: '',
    newName: '',
    /**
     *  newModID           编辑文章ID
     *  newModTitle        编辑文章标题
     *  newModContent      编辑文章内容
     */
    newModId : '',
    newModShow : false,
    newModTitle : '',
    newModContent : '',
    /**
     * top
     * pushShow        发布文章标题
     */
    pushShow: false,
    // about
    aboutContent: '',
    aboutID: '',
    // login 状态
    err: true,
    loginBJ: false,
    // -- content 首页文章条目 
    getCont: ''
}

const mutations = {
    // app 判断是否有值
    local:(state) => {
        localStorage.getItem('name') ? state.loginBJ = true : state.loginBJ = false
    },
    // content 退出清除localStorage 并刷新
    cleanlocal: (state) => {
        NProgress.start()
        localStorage.removeItem('name')
        location.reload(false)
        NProgress.done()
    },
    login: () => {
        Bmob.initialize('7150849514c91ed37625710a29c91139','243c886d51cc5d468ccef730afe00cba');
    },
    // 重置提示框
    resetMes:function(state){
        state.mesState= ''; state.mesTitle = '';
        if(state.mesState != '' && state.mesTitle != state.mesTitle) state.mesState= ''; state.mesTitle = '';
    },
    // content 首页文章 （查询所有数据）
    getallState : (state,type) => {
        var GameScore = Bmob.Object.extend(type.tabName);
        var query = new Bmob.Query(GameScore);
        type.getlist ? query.limit(6*type.getlist) : ''
        type.className != '全部' ? query.equalTo('newTag',type.className) : ''
        query.descending('createdAt')
        query.find({
            success: results => {
                state.getCont = results
            },
            error: error => {
                console.log("查询失败: " + error.code + " " + error.message);
            }
        });
    },
    // login 登录 (查询单条数据)
    inStats:(state,type) => {
        var GameScore = Bmob.Object.extend('user_name');
        var query = new Bmob.Query(GameScore);
        // 值存在就执行条件
        type.inUser ? query.equalTo('name',type.inUser) : ''
        type.inPassword ? query.equalTo('password',type.inPassword) : ''
        query.find({
            success: function(results) {
                // 登录 判断 用户名存在 和 登录成功
              if(type.inUser != undefined && results.length > 0){
                results[0].attributes.name == type.inUser ? state.err = true : ''

                if(results[0].attributes.password == type.inPassword){
                    NProgress.start()
                    state.loginBJ = true
                    state.mesState = 'suc'
                    localStorage.setItem('name',results[0].attributes.name)
                    state.mesTitle = `${results[0].attributes.name} , 欢迎您!`
                    state.locaName=localStorage.getItem('name')
                    NProgress.done()
                }

              }else{
                  // login 判断是否有 添加密码
                  type.inPassword 
                    ? (state.mesState='err',state.mesTitle = '登录失败') 
                    : state.err = false
              }
            },
            error: function(error) {
                type.inPassword 
                ? (state.mesState='err',state.mesTitle = '登录失败') 
                : state.err = false
            }
          });
    },
    // login 注册 （添加单条数据)
    signUp:(state,type) => {
        if(type.upUser == '' || type.upPass == ''){
           setTimeout(() =>  state.mesState='err',state.mesTitle = '帐号或密码不能为空！');
           return false;
        }
        var Diary = Bmob.Object.extend("user_name");
        var diary = new Diary();
        diary.set("name",type.upUser)
        diary.set("password",type.upPass)
        diary.save(null, {
            success: function(result) {
                console.log(result)
                if(result.id && type.upUser && type.upPass){
                    NProgress.start()
                    state.mesState='suc',state.mesTitle = '注册成功'
                    console.log("创建成功")
                    NProgress.done()
                }else{
                    state.mesState='err',state.mesTitle = '帐号已存在'
                }
            },
            error: function(result, error) {
                state.mesState='err',state.mesTitle = '帐号已存在'
            }
        });
    },
    // login 随便看看
    skip: (state) => {
        state.loginBJ = true
    },
    // login 重置 err状态
    errState:(state) => {
        state.err = true
    },
    getNews: (state,type) => {
        /*
            newID           文章ID
            newDetail       数据状态
            @newShow        组件显示
            @newTitle       文章标题
            @newConent      文章内容
            @newComment     文章评论
            @newTime        文章发表时间
            @newTag         文章分类
            @newGood        文章点攒数
            @newName        文章发表人
        */
            NProgress.start()
            var news = Bmob.Object.extend("news");
            var query = new Bmob.Query(news);
            query.get(type, {
            success: function(result) {
                state.newShow = true
                state.newID = result.id;
                state.newTitle = result.get("title");
                state.newConent = result.get("content");
                // Array.prototype.reverse.call(result.get("comment")) 
                state.newComment = result.get("comment") ? Array.prototype.reverse.call(result.get("comment")) : []
                state.newTime = result.createdAt;
                state.newTag = result.get('newTag');
                state.newGood = result.get('newGood')
                state.newName = result.attributes.newName
                NProgress.done()
            },
            error: function(object, error) {
                state.mesState = 'err',state.mesTitle = '获取失败'
                state.newShow = false,console.log('获取失败')
            }
        });
    },
    // newsDetail 评论
    setComment: (state,type) => {
        if (!type[0]) alert('不能为空');
        if(!state.locaName){
            setTimeout(() => state.mesState = 'err',state.mesTitle="未登录,转至登录页")
            setTimeout(() => location.reload(false),2000);
            return false;
        }
        NProgress.start()
        var Diary = Bmob.Object.extend("news");
        var query = new Bmob.Query(Diary);
        query.get(state.newID, {
            success: function(result) {
                var obj  = {
                    "name": state.locaName,
                    "time": type[1],
                    "content": type[0]
                }
                result.addUnique('comment', obj);
                result.save();
                state.newComment = result.attributes.comment.reverse()
                if(result) state.mesState = 'suc';state.mesTitle = '评论成功'
                NProgress.done()
            },
            error: function(object, error) {
                state.mesState = 'err',state.mesTitle="评论失败";
            }
        });
    },
    //  关闭显示文章组件
    newClose: (state) => {
        state.newShow = false
    },
    /**
     *  newModID           编辑文章ID
     *  newModTitle        编辑文章标题
     *  newModContent      编辑文章内容
     */
    editMod: (state,type) => {
        if (!state.newModId) state.mesState='err';state.mesTitle='错误'
        NProgress.start()
        var Diary = Bmob.Object.extend("news");
        var query = new Bmob.Query(Diary);
        query.get(state.newModId, {
            success: function(result) {
                for(let i in state.getCont){
                    if(state.getCont[i].id == state.newModId){
                        state.getCont[i].attributes.title = type[0]
                        state.getCont[i].attributes.content = type[1]
                    }
                }
                result.set('title', type[0]);
                result.set('content', type[1]);
                result.save();
                state.mesState= 'suc';state.mesTitle = '编辑成功'
                state.newModShow = false
                NProgress.done()
            },
            error: function(object, error) {
                state.mesState='err';state.mesTitle='错误'
            }
        });
    },
    // 文章点赞
    addNewGood: (state) => {
        state.newGood = !state.newGood
        var Diary = Bmob.Object.extend("news");
        var query = new Bmob.Query(Diary);
        query.get(state.newModId, {
            success: function(result) {
                result.set('newGood',false);
                console.log(state.newGood)
                result.save();
            },
            error: function(object, error) {
                state.mesState='err';state.mesTitle='错误'
            }
        });
    },
    newModClose: (state) => {
        state.newModShow = false
    },
    // 修改文章
    newModShow: (state,type) => {
        if(type[3] != state.locaName){
            setTimeout(() => state.mesState = 'err',state.mesTitle = '无权限修改');
            return false;
        }
        state.newModId = type[0]
        state.newModTitle = type[1]
        state.newModContent = type[2]
        state.newModShow = true
    },
    // 清空 文章修改内容
    clearNewMod: (state) => {
        state.newModContent = ' '
    },
    // 删除文章
    removeNew: (state,type) => {
        if(state.mesState != '' && state.mesTitle != state.mesTitle) state.mesState= ''; state.mesTitle = '';
        if(type[1] != state.locaName){
            setTimeout(() => state.mesState = 'err',state.mesTitle = '无权限删除');
            return false;
        }
        NProgress.start()
        var Diary = Bmob.Object.extend("news");
        var query = new Bmob.Query(Diary);
        query.get(type[0], {
          success: function(object) {
            // The object was retrieved successfully.
            object.destroy({
              success: function(deleteObject) {
                for(let i in state.getCont){
                    if(state.getCont[i].id == deleteObject.id){
                        state.getCont.splice(i,1)
                    }
                }
                state.mesState = 'suc',state.mesTitle = '删除成功'
                console.log('删除成功');
                NProgress.done()
              },
              error: function(object, error) {
                state.mesState = 'err',state.mesTitle = '删除失败'
                error ? console.log('删除失败') : '';
              }
            });
          },
          error: function(object, error) {
            state.mesState = 'err',state.mesTitle = '删除失败'
            error ? console.log("query object fail") : '';
          }
        });
    },
    // 获取about
    getAboutCont: (state) => {
        NProgress.start()
        var Diary = Bmob.Object.extend("about");
        var query = new Bmob.Query(Diary);
        // 查询所有数据
        query.find({
        success: function(results) {
            console.log("共查询到 " + results.length + " 条记录");
            // 循环处理查询到的数据
            for (var i = 0; i < results.length; i++) {
                var object = results[i];
                state.aboutID = object.id
                state.aboutContent = object.attributes.aboutContent
                NProgress.done()
            }
        },
        error: function(error) {
            console.log("查询失败: " + error.code + " " + error.message);
        }
        });
    },
    // 修改about
    setAboutCont: (state,type) => {
        var Diary = Bmob.Object.extend("about");
        var query = new Bmob.Query(Diary);
        query.get(state.aboutID, {
            success: function(result) {
                result.set('aboutContent', type);
                result.save();
                state.aboutContent = type
                state.mesState= 'suc';state.mesTitle = '修改成功'
            },
            error: function(object, error) {
                state.mesState='err';state.mesTitle='错误'
            }
        });
    },
    /**
     * top
     * pushShow        发布文章遮罩
     */
    pushNews: (state,type) => {
        if(type[0] == '' && type[1] == ''){
            state.mesState= 'err';
            state.mesTitle = '标题或内容不得为空'; 
            return;
        }
        console.log(type)
        var Diary = Bmob.Object.extend("news");
        var diary = new Diary();
        diary.set("title",type[0]);
        diary.set("content",type[1]);
        diary.set("newTag",type[2]);
        diary.set("newName",state.locaName);
        diary.save(null, {
        success: function(result) {
            if(!result) return
            state.mesState= 'suc';state.mesTitle = '发布成功';
            state.pushShow = false
            state.getCont.unshift(result)
        },
        error: function(result, error) {
            state.mesState= 'err';state.mesTitle = '发布失败';
        }
        });
    },
    addShow:function(state){
        state.pushShow = true
    },
    cloShow:function(state){
        state.pushShow = false
    }
}

const actions = {
    getallState : ({commit},type) => {
        commit('resetMes')
        commit('login')
        commit('getallState',type)
    },
    inStats: ({commit},type) => {
        commit('resetMes')
        commit('login')
        commit('inStats',type)
    },
    signUp: ({commit},type) => {
        commit('resetMes')
        commit('login')
        commit('signUp',type)
    },
    // 获取文章信息
    getNews: ({commit},type) => {
        commit('resetMes')
        commit('login')
        commit('getNews',type)
    },
    setComment: ({commit},type) => {
        commit('resetMes')
        commit('setComment',type)
    },
    newModShow:({commit},type) => {
        commit('resetMes')
        commit('newModShow',type)
    },
    // 文章点赞
    addNewGood: ({commit}) => {
        commit('resetMes')
        commit('login')
        commit('addNewGood')
    },
    // 编辑文章
    editMod: ({commit},type) => {
        commit('resetMes')
        commit('login')
        commit('editMod',type)
    },
    newModShow: ({commit},type) => {
        commit('resetMes')
        commit('newModShow',type)
    },
    // 删除文章
    removeNew: ({commit},type) => {
        commit('resetMes')
        commit('removeNew',type)
    },
    getAboutCont: ({commit}) => {
        commit('resetMes')
        commit('login')
        commit('getAboutCont')
    },
    // 修改about内容
    setAboutCont: ({commit},type,state) => {
        commit('resetMes')
        commit('login')
        commit('setAboutCont',type)
    },
    pushNews: ({commit},type,state) => {
        commit('resetMes')
        commit('login')
        commit('pushNews',type)
    }
}

export default new Vuex.Store({
    state,
    mutations,
    actions
})