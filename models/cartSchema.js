const mongoose=require('mongoose');
const { schema } = require('./userSchema');
const {Schema}=mongoose;   

const cartSchema=new mongoose.Schema({
  userId:{
    type:Schema.Types.ObjectId,
    ref:"User",
    required:true
  },
  items:[{
    productId:{
    tyoe:Schema.Types.ObjectId,
    ref:"Product",
    required:true
  },
  quantity:{
    type:Number,
    default:1
  },
  price:{
    type:Number,
    required:true
  },
  totalPrice:{
    type:Number,
    required:true
  },
  status:{
    type:String,
    default:'placed'
  },
  cancelletionReason:{
    type:String,
    default:"none"
  }
}]

})

const Cart=mongoose.model("Cart",cartSchema);
module.exports=Cart