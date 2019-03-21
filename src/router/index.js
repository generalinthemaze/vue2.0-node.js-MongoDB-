import Vue from 'vue'
import Router from 'vue-router'
import GoodsList from '@/views/GoodsList'
import Cart from './../views/Cart'
import Address from './../views/Address'
import orderConfirm from './../views/OrderConfirm'
import OrderSuccess from './../views/OrderSuccess'

Vue.use(Router);

export default new Router({
  routes: [
    {
      path:'/',
      name:'GoodsList',
      component:GoodsList
    },
    {
      path:'/cart',
      name:'Cart',
      component:Cart
    },
    {
      path:'/Address',
      name:'Address',
      component:Address
    },
    {
      path:'/orderConfirm',
      name:'orderConfirm',
      component:orderConfirm
    },
    {
      path:'/orderSuccess',
      name:'orderSuccess',
      component:OrderSuccess
    }
  ]
})
