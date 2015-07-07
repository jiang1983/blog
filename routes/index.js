var crypto = require('crypto');
var User = require('../modules/user'),
    Post = require('../modules/post');

function CheckLogin(req,res,next){
    if(!req.session.user){
        req.flash('error','未登录！请登录');
        res.redirect('/login');
    }
    else
    next();
}

function CheckNotLogin(req,res,next){
    if(req.session.user){
        req.flash('error','已经登录，请退出登录!');
        res.redirect('/');
    }
    else
    next();
};
module.exports = function(app) {
    app.get('/', function (req, res) {

        Post.getAll(null, function (err, posts) {
            if (err) {
                posts = [];
            }
            res.render('index', {
                title: '主页',
                user: req.session.user,
                posts: posts,
                success: req.flash('success').toString(),
                error: req.flash('error').toString()
            });
        });

    });

    app.get('/login',CheckNotLogin);
    app.get('/login',function(req,res){
        res.render('login',{title:"登录",
            user:req.session.user,
            success:req.flash('success').toString(),
            error:req.flash('error').toString()
        });
    });

    app.post('/login',CheckNotLogin);
    app.post('/login',function(req,res){
        //生成密码md5值
        var md5 = crypto.createHash('md5'),
            password = md5.update(req.body.password).digest('hex');

        User.get(req.body.name,function(err,user){
            //检查用户是否存在
            if(!user){
                req.flash('error','用户不存在！');
                console.log('用户不存在！');
                return res.redirect('/login');
            }
            //检查密码是否一致
            if(user.password != password){
                req.flash('error','密码错误!');
                console.log('密码错误!！');
                return res.redirect('/login');
            }
            //匹配成功后，将user存入session
            req.session.user = user;
            req.flash('success',"登录成功！");
            console.log('登录成功!！');
            return res.redirect('/');
        });
    });

    app.get('/logout',CheckLogin);
    app.get('/logout',function(req,res){
            req.session.user=null;
            req.flash('success','登出成功！');
            return res.redirect('/');
        });

    app.get('/post',CheckLogin);
    app.get('/post',function(req,res){
        res.render('post',{
            title:'发表文章',
            user:req.session.user,
            success:req.session.success,
            error:req.session.error
        });
    });

    app.post('post',CheckLogin)//登录完成，进入post页面，需要返回当前账户的文章列表或者其他页面,这里需要写数据库的其他接口，包括查询和删除接口等
    app.post('/post',function(req,res){
        var currentUser = req.session.user;
        var post = new Post(currentUser,req.body.title,req.body.post);
        post.save(function(err){
            if(err) {
                req.flash('error',err);
                return res.redirect('/');
            }
            req.flash('success','发表成功!');
            res.redirect('/');
        });
    });

    app.get('/reg',CheckNotLogin);
    app.get('/reg',function(req,res){
        res.render('register',{title:"注册",
            user:req.session.user,
            success:req.flash('success').toString(),
            error:req.flash('error').toString()
        });
    });

    app.post('/reg',CheckNotLogin);
    app.post('/reg',function(req,res){
        var name = req.body.name,
            pasword = req.body.password,
            password_re = req.body['password-repeat'];
        if(pasword != password_re){
            req.flash('error','两次输入的密码不一致！');
            return res.redirect('/reg');//返回注册页
        }
        //生成md5值
        var md5 = crypto.createHash('md5'),
            password = md5.update(req.body.password).digest('hex');
        var newUsr = new User({
            name:name,
            password:password,
            email:req.body.email
        });
        //检查用户是否已经存在
        User.get(newUsr.name,function(err,user){
           if(err){
               req.flash('error',err);
               return res.redirect('/');
           }
            if(user){
                req.flash('error','用户已存在！');
                return res.redirect('/reg');
            }
            //如果用户不存在则新增用户
            newUsr.save(function(err,user){
                if(err){
                    req.flash('error',err);
                    res.redirect('/reg');
                }
                req.session.user = user;//用户信息存入session
                req.flash('success','注册成功！');
                res.redirect('/');
            });
        });
    });

    app.get('/upload',CheckLogin);
    app.get('/upload',function(req,res){
        res.render('upload',{
            title:'文件上传',
            user:req.session.user,
            success:req.flash('success').toString(),
            error:req.flash('error').toString()
        });
    });

    app.post('/upload',CheckLogin);
    app.post('/upload',function(req,res){
        req.flash('success','文件上传成功！');
        res.redirect('/');
    });

    app.get('/u/:name/:day/:title',function(req,res){
        User.getOne(req.params.name,function(err,user){
            if(!user){
                req.flash("error","用户不存在！");
                res.render('/');
            }
            //console.log(req.params.name);
            //console.log('hello world!');
            Post.getOne(user,req.params.day,req.params.title,function(err,docs){
                if(err){
                    req.flash("error","未找到满足的数据！");
                    res.render('/');
                }
                res.render('article',{
                    "title":req.params.title,
                    "post":docs,
                    user:req.session.user,
                    success:req.flash("success").toString(),
                    error:req.flash("error").toString()
                });
            });
        });
    });

    app.get('/u/:name',function(req,res){
        User.get(req.params.name,function(err,user){
            if(!user){
                req.flash("error","用户不存在！");
                return res.redirect("/");
            }
            //console.log(req.params.name);
            //console.log(user);
        Post.getAll(user,function(err,posts){
            if(err){
                req.flash("error",err);
                res.redirect('/');
            }
            //console.log(posts);
            res.render('user',{
                title:user.name,
                posts:posts,
                user:req.session.user,
                success:req.flash("success").toString(),
                error:req.flash("error").toString()
            })
        });
        });
    });

    app.get('/:name/:day/:title',function(req,res){
        console.log('点击了博客名链接...')
        User.get(req.params.name,function(err,user){
            if(!user){
                req.flash("error","用户不存在！");
                res.render('/');
            }
            console.log(req.params.name);
            console.log(user)
            //console.log('hello world!');
            Post.getOne(user,req.params.day,req.params.title,function(err,docs){
                if(err){
                    req.flash("error","未找到满足的数据！");
                    res.redirect('/');
                }
                //console(user)
                res.render('article',{
                   "title":req.params.title,
                    "post":docs,
                    user:req.session.user,
                    success:req.flash("success").toString(),
                    error:req.flash("error").toString()
                });
            });
        });
    });

    app.get('/edit/:name/:day/:title',CheckLogin);
    app.get('/edit/:name/:day/:title',function(req,res){
        var currentUser = req.session.user;
        Post.edit(currentUser.name,req.params.day,req.params.title,function(err,post){
            if(err){
                req.flash("error",err);
                return res.redirect('back');
            }
            console.log(post);
            res.render('edit',{
                title:"编辑",
                post:post,
                user:req.session.user,
                success:req.flash("success").toString(),
                error:req.flash("error").toString()
            });
        });
    });

    app.post('/edit/:name/:day/:title',CheckLogin);
    app.post('/edit/:name/:day/:title',function(req,res){
        var currentUser = req.session.user;
        Post.update(currentUser.name,req.params.day,req.params.title,req.body.post,function(err){
            var url = encodeURI('/u/' + req.params.name + '/' + req.params.day + '/' + req.params.title);
            //console.log(url);
            if (err) {
                req.flash('error', err);
                return res.redirect(url);//出错！返回文章页
            }
            req.flash('success', '修改成功!');
            res.redirect('/');//成功！返回文章页
        });
    });

    app.get('/remove/:name/:day/:title',CheckLogin);
    app.get('/remove/:name/:day/:title',function(req,res){
        currentUser = req.session.user;
        console.log(req.params.title);
        Post.remove(currentUser.user,req.params.day,req.params.title,req.body.post,function(err){
            console.log(req.params.title);
            var url = encodeURI('/u/' + req.params.name + '/' + req.params.day + '/' + req.params.title);
            //console.log(url);
            if (err) {
                req.flash('error', err);
                return res.redirect(url);//出错！返回文章页
            }
            req.flash('success', '删除成功!');
            res.redirect('/');//成功！返回文章页
        });
    });
};