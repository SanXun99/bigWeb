new Vue({
    el: '#app',
    data() {
        return {
            msg:'123',
            token:localStorage.getItem('token'),
            title:'看点咨询精选',
            login_form:{},
            username:'',
            activeName: 'first',
            articles:[],
            categories:[],
            // 监听查询时的文章参数
            params:{
                page:0,
                pageSize:10,
                categoryId:'',
                keywords:'',
                beginTime:'',
                endTime:'',
            },
            picture_visible:false,
            imgUrl:'',
            articles_visible:false,
            article_form:{},
            formLabelWidth:'120px',
            dialogVisible:false,
            dialogImageUrl:'',
        }
    },
    // 页面加载的时候
    created() {
        let token = localStorage.getItem('token');
        if (token) {
            // 查询用户信息
            this.findMsg(token);
            // 查询所有文章
            this.loadArticle();
            // 查询所有栏目
            this.loadCategory();
        }
    },
    // 监听：可以实现分页搜索等功能
    watch:{
        params:{
            handler:function(){
                this.loadArticle();
            },
            deep:true
        }
    },
    methods:{
        handlePictureCardPreview(file){
            this.dialogImageUrl = file.url;
            this.dialogVisible = true;
        },
        deleteArticle(){},
        // 11. 删除文章
        deleteArticle(row){
            this.$confirm('此操作将永久删除该条数据, 是否继续?', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
              }).then(() => {
                $.ajax({
                    url: 'http:/47.106.211.48:8099/manager/article/deleteArticleById',
                    method: 'get',
                    data: {id:row.id},
                    success: (res) => {
                        if(res.status == 200){
                            this.$message({
                                showClose: true,
                                message: '删除成功',
                                type: 'success'
                              });
                        }else{
                            this.$message({
                                showClose: true,
                                message: '删除失败',
                                type: 'error'
                            });
                        }
                        // 刷新数据
                        this.loadArticle();
                    }
                })
              }).catch(() => {
                this.$message({
                  type: 'info',
                  message: '已取消删除'
                });          
              });
        },
        // 10. 修改文章
        updateArticle(row){
            //显示模态框
            this.articles_visible = true;
            //通过id查询出文章信息
            $.ajax({
                url: 'http://47.106.211.48:8099/manager/article/findArticleById',
                method: 'get',
                data: {id:row.id},
                success: (res) => {
                    this.article_form  = res.data;
                    this.article_form.categoryId = res.data.category.id;
                }
            })
        },
        // 9. 发布文章
        submitArticle(){
            //关闭模态框
            this.articles_visible = false;
            $.ajax({
                url: 'http://47.106.211.48:8099/manager/article/saveOrUpdateArticle',
                method: 'post',
                data: this.article_form,
                success: (res) => {
                    if(res.status == 200){
                        this.$message({
                            showClose: true,
                            message: '发布成功',
                            type: 'success'
                          });
                    }else{
                        this.$message({
                            showClose: true,
                            message: '发布失败',
                            type: 'error'
                        });
                    }
                    // 刷新数据
                    this.loadArticle();
                }
            })
        },
        // 9. 加载所有栏目
        loadCategory(){
            $.ajax({
                url: 'http://47.106.211.48:8099/manager/category/findAllCategory',
                method: 'get',
                data: {},
                success: (res) => {
                    this.categories = res.data;
                }
            })
        },
        // 8. 图片上传
        successHandler(res){
            this.article_form.source = 'http://134.175.100.63:8686/group1/' + res.data.id;
            console.log(this.article_form);
        },
        // 7. 发布文章
        showArticleVisible(){
            // 清空表单
            this.article_form = {};
            this.articles_visible = true;
        },
        // 6. 审核文章
        checkArticle(item){
            // 根据当前文章的状态，封装参数
            if(item.status == 1){
                var obj = {
                    id:item.id,
                    status:'审核通过'
                }
            } else{
                var obj = {
                    id:item.id,
                    status:'审核不通过'
                }
            }
            // 调用接口
            $.ajax({
                url: 'http://47.106.211.48:8099/manager/article/checkArticle',
                method: 'get',
                data: obj,
                success: (res) => {
                    const h = this.$createElement;
                    if(res.status == 500){
                        this.$notify({
                        title: '警告',
                        message: h('i', { style: 'color: teal'}, res.message)
                        });
                    } else {
                        this.$notify({
                            title: '成功',
                            message: h('i', { style: 'color: teal'}, res.message)
                            });
                    }
                    // 刷新数据
                    this.loadArticle()
                }
            })
        },
        // 5. 分页
        changePage(page){
            this.params.page = page-1;
        },
        // 4. 查看大图
        showBigPicture(row, column, cell, event){
            if(column.label == '文章封面'){
                // 显示模态框
                this.picture_visible = true;
                // 将当前点击的图片地址放到模态框中
                this.imgUrl = row.source;
            }
        },
        // 3. 时间处理
        dateFormat(row, column){
            // 看不懂可以先分别打印row和column
            return moment(row[column.property]).format('YYYY-MM-DD hh:mm:ss')
        },
        // 2. 查询文章
        loadArticle(){
            $.ajax({
                url: 'http://47.106.211.48:8099/manager/article/findArticle',
                method: 'get',
                // 监听查询参数params
                data: this.params,
                success: (res) => {
                    if(res.data.list.length == 0){
                        this.params.page -= 1;
                        this.loadArticle();
                    }
                    this.articles = res.data;
                    // 为了使用开关组件，需要将查询出来的数据进行转换
                    res.data.list.map((item)=>{
                        if(item.status == '审核通过'){
                            return item.status = 1;
                        } else if(item.status == '未通过') {
                            return item.status = 0;
                        }
                    })
                }
            })
        },
        // 1. 登录
        loginHandler(){
            $.ajax({
                url: 'http://47.106.211.48:8099/manager/user/login',
                method: 'post',
                data: JSON.stringify(this.login_form),
                contentType: 'application/json',
                success: (res) => {
                    // 将token设置到浏览器
                    localStorage.setItem('token', res.data.token)
                    // 将token赋值给data中的token
                    this.token = res.data.token
                    // 调用根据token获取用户信息的方法
                    this.findMsg(res.data.token);
                    // 查询文章
                    this.loadArticle();
                }
            })
        },
        // 根据token查询用户信息
        findMsg(token) {
            $.ajax({
                url: 'http://47.106.211.48:8099/manager/user/info',
                method: 'get',
                data: { token },
                success: (res) => {
                    this.username = res.data.username
                }
            })
        },
    }
})