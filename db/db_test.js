/*
测试使用mongoose操作mongodb数据库
1.链接数据库
  引入mongoose
  链接指定数据库（url只有数据库是变化的）
  获取连接对象
  绑定链接完成的监听
2.得到对应特定集合的Modal
  定义schema（描述文档结构）
  定义Modal(与集合对应，可以操作集合)
3. 通过Modal或其实例对集合数据进行CRUD操作
  通过Modal实例的save（）添加数据
  //查询多个：得到的是包含所有匹配文档对象的数组，如果没有匹配的就是[]
  //查询一个：得到是匹配的文档对象，如果没有匹配的就是null
  通过Modal的find（）/findOne查询多个或一个数据
  通过Modal的findByIdAndUpdate（）更新某个数据
  通过Modal的remove（）删除匹配的数据
 */
const md5 = require('blueimp-md5')
const mongoose = require('mongoose')
mongoose.connect('mongodb://localhost:27017/myzhipin_test',{useNewUrlParser: true, useUnifiedTopology: true })
//获取链接对象
const conn = mongoose.connection
conn.on('connected',function () {//链接成功回调
  console.log('数据库链接成功')
})

const userSchema = mongoose.Schema({
  username:{type: String, required: true},
  password:{type: String, required: true},
  type:{type: String, required: true},
  header:{type: String}
})

const UserModal  = mongoose.model('user',userSchema)

function testSave() {
  const userModal = new UserModal({username: 'Bob', password: md5('123'), type: 'laoban'})
  userModal.save(function (err,userDoc) {
    console.log('save', err, userDoc)
  })
}
// testSave()

function  testFind() {
  UserModal.find(function (err, users) {
    console.log(err,users)
  })
}

function testUpdate() {
  UserModal.findByIdAndUpdate({_id:'60efe16633c44a4cbcd3a31f'},function (err,oldUser) {
  console.log('update',err,oldUser)
  })
}

function testDelete() {
  UserModal.remove({_id:'60efe16633c44a4cbcd3a31f'}, function (err, doc) {
    console.log('remove',err, doc)
  })
}

