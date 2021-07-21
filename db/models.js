/*
    包含n个操作数据库集合数据的Model模块
    1.链接数据库
      引入mongoose
      链接指定数据库
      获取链接对象
      绑定连接完成的监听
    2.定义出对应特定集合的Model并向外暴露
      定义Schema
      定义Model
      向外暴露Model
 */

const mongoose = require('mongoose')
mongoose.connect('mongodb://localhost:27017/myzhipin',{useNewUrlParser: true, useUnifiedTopology: true })
const conn = mongoose.connection
conn.on('connected',function () {
  console.log('db connect success')
})

const userSchema = mongoose.Schema({
  username:{type: String, required: true},  //用户名
  password:{type: String, required: true}, //密码
  type:{type: String, required: true}, //用户类型：dashen/laoben
  header:{type: String}, //头像名称
  post: {type: String}, //职位
  info: {type: String}, //个人或职位简介
  company: {type: String},//公司名称
  salary: {type: String},//工资
})

const UserModel = mongoose.model('user',userSchema)

//module.exports = xxx
//exports.xxx = value
//exports.yyy = value
exports.UserModel = UserModel

//定义chats集合的文档结构
const chatSchema = mongoose.Schema({
  from: {type: String, required: true}, //发送用户的id
  to: {type: String, required: true}, //接收用户的id
  chat_id: {type: String, required: true}, //from 和 to组成的字符串
  content: {type: String, required: true}, //内容
  read: {type: Boolean, default: false}, //标识是否已读
  create_time: {type: Number}, //创建时间
})
//定义能操作chats集合数据的Model
const ChatModel = mongoose.model('chat', chatSchema) //集合为：chats
//向外暴露model
exports.ChatModel = ChatModel
