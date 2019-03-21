var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var Goods = require('../models/goods');

//连接MongoDB数据库
mongoose.connect('mongodb://127.0.0.1:27017/demo', {useNewUrlParser:true}, (err)=>{
  if(err){
    console.log("Connection Error: " + err);
  }else{
    console.log("MongoDB connected success.")
  }
});


router.get("/list", (req, res, next)=>{
  let page = parseInt(req.query.page);
  let pageSize = parseInt(req.query.pageSize);
  let priceLevel = req.query.priceLevel;
  let sort = req.query.sort;
  let skip = (page-1)*pageSize;
  let params = {};
  let priceGt=0,priceLt=5000;
  if(priceLevel != 'all'){
    switch (priceLevel) {
      case '0': priceGt = 0; priceLt=100;break;
      case '1': priceGt = 100; priceLt=500;break;
      case '2': priceGt = 500; priceLt=1000;break;
      case '3': priceGt = 1000; priceLt=5000;break;
    }
    params ={
      salePrice: {
        $gt :priceGt,
        $lte: priceLt
      }
    };
  }

  let goodsModel = Goods.find(params).skip(skip).limit(pageSize);
  goodsModel.sort({'salePrice': sort});
  goodsModel.exec((err, doc)=>{
    if(err){
      res.json({
        status:'1',
        msg:err.message
      });
    }else{
      res.json({
        status:'0',
        msg:'',
        result:{
          count:doc.length,
          list: doc
        }
      })
    }
  })
});

router.post("/addCart", (req, res, next)=>{
  let userId = '100000077';
  let productId = req.body.productId;
  let User = require('../models/user');
  User.findOne({userId:userId}, (err, userDoc)=>{
    if(err){
      res.json({
        status: "1",
        msg: err.message
      })
    }else {
      console.log("userDoc: " + userDoc);
      if(userDoc){
        let goodsItem = '';
        userDoc.cartList.forEach(item => {
          if(item.productId == productId){
            goodsItem =item;
            item.productNum++;
          }
        });
        if(goodsItem){
          userDoc.save((err2, doc2)=>{
            if(err2){
              res.json({
                status: '1',
                msg: err2.message
              })
            }else{
              res.json({
                status: '0',
                msg:'',
                result: 'suc'
              })
            }
          })
        }else{
          Goods.findOne({productId:productId}, (err1, doc)=>{
            if(err1){
              res.json({
                status: '1',
                msg: err1.message
              })
            }else{
              if(doc){
                doc.productNum = 1;
                doc.checked = '1';
                userDoc.cartList.push(doc);
                userDoc.save((err2, doc2)=>{
                  if(err2){
                    res.json({
                      status: '1',
                      msg: err2.message
                    })
                  }else{
                    res.json({
                      status: '0',
                      msg:'',
                      result: 'suc'
                    })
                  }
                })
              }
            }
          })
        }


      }
    }
  })
});

module.exports = router;
