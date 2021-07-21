var express = require('express');
var router = express.Router();

const {UserModel, ChatModel} = require('../db/models')
const md5 = require('blueimp-md5')

const filter = {password: 0, __v: 0} //查询时指定过滤的属性
/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});
//注册一个路由：用户注册
/*
path为：/register
请求方式为：POST
接收username和password两个参数
admin是已注册用户
注册成功返回：{code: 0, data:{_id: 'abc',username:'xxx',password:'123'}}
注册失败返回：{code:1,msg:'此用户已存在'}
 */
// router.post('/register',function (req, res) {
//   const {username, password} = req.body
//   if(username === 'admin'){
//     res.send({
//       code:1,
//       msg:'此用户已存在'
//     })
//   }else {
//     res.send({
//       code: 0,
//       data:{
//         _id: 'abc',
//         username,
//         password
//       }
//     })
//   }
// })

//注册的路由
router.post('/register',function (req,res) {
  //获取请求参数数据
  const {username, password, type} = req.body
  //处理：判断用户是否已经存在，如果存在，返回提示错误的信息，如果不存在，保存
  //查询（根据username）
  UserModel.findOne({username}, function (err, user) {
    //如果user有值已存在
    if(user){
      //返回提示信息
      res.send({
        code: 1,
        msg: '用户名已存在'
      })
    }else {
      new UserModel({username, type, password:md5(password)}).save(function (err, user) {
        const data = {username, type, id: user._id}
        res.cookie('userid',user._id, {MaxAge: 1000*60*60*24})
        if(!err){
          res.send({
            code: 0,
            data
          })
        }
      })
    }
  })
})
//登录的路由
router.post('/login', function (req, res) {
  const {username, password}  = req.body
  UserModel.findOne({username, password: md5(password)},filter, function (err,user) {
    if(user){
      res.cookie('userid',user._id,{MaxAge: 1000*60*60*24})
      res.send({
        code:0,
        data:user
      })
    }else {
      res.send({
        code: 1,
        msg: '用户名或密码错误'
      })
    }
  })
})
//更新用户信息
router.post('/update', function (req, res) {
  const userid = req.cookies.userid
  if(!userid){
    return res.send({
      code:1,
      msg: '请先登录'
    })
  }
  const user = req.body
  UserModel.findByIdAndUpdate({_id:userid},user, function (err, oldUser) {
    if(!oldUser){
      res.clearCookie('userid')
      res.send({
        code:1,
        msg:'请先登录'
      })
    }else {
      const {_id, type, username} = oldUser
      let data = Object.assign(user, {_id, type, username})
      res.send({code:0,data})
    }
  })
})
//获取用户信息的路由，根据cookie中的userid获取
router.get('/user',function (req, res) {
  const userid = req.cookies.userid
  if(!userid){
    return res.send({
      code:1,
      msg: '请先登录'
    })
  }
  UserModel.findOne({_id:userid}, filter, function (err, user) {
    res.send({code:0,data: user})
  })
})
//根据类型获取用户列表
router.get('/userlist',function (req, res) {
  const {type} = req.query
  UserModel.find({type}, filter, function (err, users) {
    res.send({code:0,data:users})
  })
})

//获取当前用户所有相关聊天信息
router.get('/msglist',function (req, res) {
  //获取cookie中的userid
  const userid = req.cookies.userid
  //查询得到所有的user文档数组
  UserModel.find(function (err,userDocs) {
    //用对象储存所有的user信息，key为user的_id，val为name和header组成的user对象
    // const users = {} //对象容器
    // userDocs.forEach(doc => {
    //   users[doc._id] = {username: doc.username, header: doc.header}
    // })
    const users = userDocs.reduce((users, user) =>{
      users[user._id] = {username: user.username, header: user.header}
      return users
    },{})
    ChatModel.find({'$or' : [{from: userid}, {to: userid}]}, filter, function (err, chatMsgs) {
      //返回包含所有用户和当前用户相关的所有聊天数据
      res.send({code:0,data: {users, chatMsgs}})
    })
  })
})
/*
修改指定消息为已读
 */
router.post('/readmsg', function (req, res) {
  //得到请求中的from和to
  const from = req.body.from
  const to = req.cookies.userid
  ChatModel.update({from, to, read: false},{read: true},{multi: true},function (err,doc) {
   console.log(doc,'doc')
    res.send({code: 0, data: doc.nModified})//更新的数量
  })
})
module.exports = router;

