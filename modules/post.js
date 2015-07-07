var mongodb = require('./db'),
    markdown=require('markdown').markdown;


function Post(name, title, post) {
    this.name = name;
    this.title = title;
    this.post = post;
}

module.exports = Post;

//存储一篇文章及其相关信息
Post.prototype.save = function(callback) {
    var date = new Date();
    //存储各种时间格式，方便以后扩展
    var time = {
        date: date,
        year : date.getFullYear(),
        month : date.getFullYear() + "-" + (date.getMonth() + 1),
        day : date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate(),
        minute : date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate() + " " +
            date.getHours() + ":" + (date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes())
    }
    //要存入数据库的文档
    var post = {
        name: this.name,
        time: time,
        title: this.title,
        post: this.post
    };
    //打开数据库
    mongodb.open(function (err, db) {
        if (err) {
            return callback(err);
        }
        //读取 posts 集合
        db.collection('posts', function (err, collection) {
            if (err) {
                mongodb.close();
                return callback(err);
            }
            //将文档插入 posts 集合
            collection.insert(post, {
                safe: true
            }, function (err) {
                mongodb.close();
                if (err) {
                    return callback(err);//失败！返回 err
                }
                callback(null);//返回 err 为 null
            });
        });
    });
};

//读取文章及其相关信息
Post.getAll = function(name, callback) {
    //打开数据库
    //console.log(name);
    mongodb.open(function (err, db) {
        if (err) {
            return callback(err);
        }
        //读取 posts 集合
        db.collection('posts', function(err, collection) {
            if (err) {
                mongodb.close();
                return callback(err);
            }
            var query = {};
            if (name) {
                query.name = name;
            }
            //console.log(query);
            //根据 query 对象查询文章

            collection.find().toArray(function (err, docs) {
                //console.log(docs);
                mongodb.close();
                if (err) {
                    return callback(err);//失败！返回 err
                }
                //解析markdown为html
                docs.forEach(function(doc){
                    doc.post = markdown.toHTML(doc.post);
                });
                callback(null, docs);//成功！以数组形式返回查询的结果
            });
        });
    });
};

Post.getOne = function(user,day,title,callback){
    console.log('进入了单个post查找函数...');
    mongodb.open(function(err,db){
        if(err){
            req.flash("error","blog数据库打开失败！");
            console.log("blog数据库打开失败...");
            res.redirect('/');
        }
        console.log("数据库打开成功...");
        db.collection("posts",function(err,collection){
            if(err){
                mongodb.close();
                return callback(err);
            }
            console.log("进入了collection...");
            var query = {};
            query.title = title;
            //query.time.day = day;
            //query.name.push({"name":"hello"});
            console.log(query);

            collection.find(query).toArray(function(err,docs){
                console.log('进入了mongodb查找函数...');
                mongodb.close();
                if(err){
                    req.flash("error",err);
                    res.flash('/');
                }
                docs[0].post = markdown.toHTML(docs[0].post);
                /*
                console.log(docs[0]);
                console.log(docs[0].title)
                console.log(docs[0].post);
                console.log("查询成功！即将执行回调函数...");
                */
                callback(null,docs[0]);
            });
        });
    });
};

Post.edit=function(name,day,title,callback){
    //打开数据库
    mongodb.open(function(err,db){
        if(err){
            req.flash("error",err);
            return callback(err);
        }
        db.collection("posts",function(err,collection){
            if(err){
                mongodb.close();
                return callback(err);
            }
            collection.findOne({"title":title},function(err,doc){
                mongodb.close();
                if(err){
                    return callback(err);
                }
                callback(null,doc);
            });
        });
    });
};

//更新一篇文章及其相关信息
Post.update = function(name, day, title, post, callback) {
    //打开数据库
    console.log(name);
    console.log(day);
    console.log(title);
    console.log(post);
    mongodb.open(function (err, db) {
        if (err) {
            return callback(err);
        }
        //读取 posts 集合
        db.collection('posts', function (err, collection) {
            if (err) {
                mongodb.close();
                return callback(err);
            }
            //更新文章内容
            collection.update({
                "title": title
            }, {
                $set: {post: post}
            }, function (err) {
                mongodb.close();
                if (err) {
                    return callback(err);
                }
                callback(null);
            });
        });
    });
};

Post.remove = function(user,day,title,post,callback){
    mongodb.open(function(err,db){
        db.collection("posts",function(err,collection){
            collection.remove({"title":title},{w:-1},function(err){
                console.log(title);
                mongodb.close();
                callback(null);
            });
        });
    });
};