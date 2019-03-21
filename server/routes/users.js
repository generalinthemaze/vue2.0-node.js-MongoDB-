var express = require('express');
var router = express.Router();
let User = require('./../models/user');
require('./../util/util');

router.post('/login', (req, res, next)=>{
  let param = {
    userName: req.body.userName,
    userPwd: req.body.userPwd
  };
  User.findOne(param, (err, doc)=>{
    if(err){
      res.json({
        status:'1',
        msg: err.message
      });
    }else{
      if(doc){
        res.cookie("userId", doc.userId, {
          path:'/',
          maxAge:1000*60*60
        });
        res.cookie("userName", doc.userName, {
          path:'/',
          maxAge:1000*60*60
        });
        //req.session.user = doc;
        res.json({
          status: '0',
          msg: '',
          result: {
            userName: doc.userName,
          }
        })
      }

    }
  })
});

//登出接口
router.post("/logout", (req, res, next)=>{
  res.cookie("userId","",{
    path:'/',
    maxAge:-1
  });
  res.json({
    status:"0",
    msg:'',
    result:''
  })
});

//判断当前用户是否登陆
router.get('/checkLogin', (req, res, next)=>{
  if(req.cookies.userId){
    res.json({
      status: '0',
      msg:'',
      result:req.cookies.userName || ''
    });
  }else {
    res.json({
      status: '1',
      msg:'未登录',
      result: ''
    })
  }
});

router.get("/getCartCount", (req, res, next)=>{
  if(req.cookies && req.cookies.userId){
    let userId = req.cookies.userId
    User.findOne({userId:userId}, (err, doc)=>{
      if(err){
        res.json({
          status:'1',
          msg: err.message,
          result:''
        });
      }else{
        let cartList = doc.cartList;
        let cartCount = 0;
        cartList.map(item=>{
          cartCount += parseInt(item.productNum);
        });
        res.json({
          status:'0',
          msg:'',
          result: cartCount
        })
      }
    })
  }
})

//获得购物车列表
router.get('/cartList' , (req, res, next) => {
  let userId = req.cookies.userId;
  User.findOne({userId: userId}, (err, doc) =>{
    if(err){
      res.json({
        status:'1',
        msg: err.message,
        result:''
      });
    }else{
      if(doc){
        res.json({
          status:'0',
          msg: '',
          result:doc.cartList
        });
      }
    }
  })
});

//购物车删除数据
router.post('/cartDel', (req, res, next)=> {
  let userId = req.cookies.userId;
  let productId = req.body.productId;
  User.update({userId: userId}, {$pull: {'cartList': {'productId': productId}}}, (err, doc) => {
    if(err){
      res.json({
        status:'1',
        msg: err.message,
        result:''
      })
    }else{
      res.json({
        status:'0',
        msg: '',
        result:'suc'
      })
    }
  })
});

//修改购物车数据
router.post('/cartEdit', (req, res, next)=>{
  let userId = req.cookies.userId;
  let productId = req.body.productId;
  let productNum = req.body.productNum;
  let checked = req.body.checked;
  User.update({"userId":userId, "cartList.productId":productId}, {
    "cartList.$.productNum":productNum,
    "cartList.$.checked": checked
  },(err, doc)=>{
    if(err){
      res.json({
        status:'1',
        msg: err.message,
        result:''
      })
    }else{
      res.json({
        status:'0',
        msg: '',
        result:'suc'
      });
    }
  })
});



router.post("/editCheckAll", (req, res, next)=>{
  let userId = req.cookies.userId,
    checkAll = req.body.checkAll?'1':'0';
  User.findOne({userId:userId}, (err, user)=>{
    if(err){
      res.json({
        status:'1',
        msg: err.message,
        result:''
      })
    }else{
      if(user){
        user.cartList.forEach((item)=>{
          item.checked = checkAll;
        });
        user.save((err1, doc)=>{
          if(err1){
            res.json({
              status:'1',
              msg: err.message,
              result:''
            })
          }else{
            res.json({
              status:'0',
              msg: '',
              result:'suc'
            })
          }
        })
      }
    }
  })
});

//查询用户地址
router.get('/addressList', (req, res, next)=>{
  let userId = req.cookies.userId;
  User.findOne({userId:userId}, (err, doc)=>{
    if(err){
      res.json({
        status:'1',
        msg: err.message,
        result:''
      })
    }else{
      res.json({
        status:'0',
        msg: '',
        result:doc.addressList
      })
    }
  })
});

//设置默认地址
router.post('/setDefault', (req, res, next)=>{
  let userId = req.cookies.userId;
  let addressId = req.body.addressId;
  if(!addressId){
    res.json({
      status:'1003',
      msg: 'addressId is null',
      result:''
    })
  }else{
    User.findOne({userId:userId}, (err, doc)=>{
      if(err){
        res.json({
          status:'1',
          msg: err.message,
          result:''
        })
      }else{
        let addressList = doc.addressList;
        addressList.forEach(item=>{
          if(item.addressId == addressId){
            item.isDefault = true;
          }else{
            item.isDefault = false;
          }
        });
        doc.save((err1, doc1)=>{
          if(err1){
            res.json({
              status:'1',
              msg: err1.message,
              result:''
            })
          }else{
            res.json({
              status:'0',
              msg: '',
              result:''
            })
          }
        });
      }
    })
  }
});

//删除地址
router.post('/delAddress', (req, res, next)=>{
  let userId = req.cookies.userId;
  let addressId = req.body.addressId;
  User.update({
    userId:userId
  },{$pull:{
    'addressList':{
      'addressId':addressId
    }
    }},(err, doc)=>{
    if(err){
      res.json({
        status:'1',
        msg:err.message,
        result:''
      })
    }else{
      res.json({
        status:'0',
        msg: '',
        result:''
      })
    }
  })
});


router.post("/payMent", (req, res, next)=>{
  let userId = req.cookies.userId;
  let orderTotal = req.body.orderTotal;
  let addressId = req.body.addressId;
  User.findOne({userId:userId}, (err, doc)=>{
    if(err){
      res.json({
        status:'1',
        msg:err.message,
        result:''
      })
    }else{
      let address = '',goodList = [];
      //获取当前用户的地址信息
      doc.addressList.forEach(item=>{
        if(item.addressId = addressId){
          address = item;
        }
      });
      //获取用户购物车的购买商品
      doc.cartList.filter(item=>{
        if(item.checked == '1'){
          goodList.push(item);
        }
      });

      let platform = '622'
      let r1 = Math.floor(Math.random()*10);
      let r2 = Math.floor(Math.random()*10);
      let sysDate = new Date().Format('yyyyMMddhhmmss');
      let createDate = new Date().Format('yyyy-MM-dd hh:mm:ss');
      let orderId = platform + r1 + sysDate + r2;

      let order = {
        orderId:orderId,
        orderTotal:orderTotal,
        addressInfo: address,
        goodList: goodList,
        orderStatus:'1',
        createData:createDate
      };
      doc.orderList.push(order);
      doc.save((err1, doc1)=>{
        if(err1){
          res.json({
            status:'1',
            msg:err.message,
            result:''
          })
        }else{
          res.json({
            status:'0',
            msg: '',
            result:{
              orderId:order.orderId,
              orderTotal:order.orderTotal
            }
          })
        }
      });
    }
  })
});

//根据订单ID查询订单信息
router.get("/orderDetail", (req, res, next)=>{
  let userId = req.cookies.userId,orderId = req.query.orderId;
  User.findOne({userId:userId}, (err, userInfo)=>{
    if(err){
      res.json({
        status:'1',
        msg:err.message,
        result:''
      })
    }else{
      let  orderList = userInfo.orderList;
      if(orderList.length > 0){
        let orderTotal = 0;
        orderList.forEach(item => {
          if(item.orderId == orderId){
            orderTotal = item.orderTotal;
          }
        });
        if(orderTotal>0){
          res.json({
            status:'0',
            msg:'',
            result:{
              orderId:orderId,
              orderTotal:orderTotal
            }
          })
        }else{
          res.json({
            status:'12002',
            msg:'无此订单',
            result:''
          })
        }
      }else{
        res.json({
          status:'12001',
          msg:'当前无订单',
          result:''
        })
      }
    }
  })
})

module.exports = router;
