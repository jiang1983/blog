/**
 * Created by Jiangda on 2015/7/8.
 */
var mongodb = require('./db');
function Commit(name,day,title,comment){
    this.name = name;
    this.day = day;
    this.title = title;
    this.comment = comment;
}

module.exports = Commit;
//存储一条评论
Commit.prototype.save = function(callback){
    var name = this.name,
        day = this.day,
        title = this.title,
        comment = this.comment;
    //打开数据库
    console.log("打开数据库。。。");
    mongodb.open(function(err,db){
        if(err){
            return callback(err);
        }
        //读取posts
        db.collection("posts",function(err,collection){
            if(err){
                mongodb.close();
                return callback(err);
            }
            //通过用户名找到posts，并添加一条评论到该文档中
            collection.update({"title":title},{$push:{"comments":comment}},function(err){
                mongodb.close();
                if(err){
                    return callback(err);
                }
                callback(null);
            });
        });
    });
};