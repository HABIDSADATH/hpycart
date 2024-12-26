const mongoose=require('mongoose');
const { schema } = require('./userSchema');
const {Schema}=mongoose;

const productSchema= new schema({
  productName:{
    type:String,
    required:true
  },
  description:{
    type:String,
    required:true
  },
  brand:{
    type:String,
    required:true
  },
  category:{
    type:Schema.Types.ObjectId, 
    ref:"Category",
    required:true
  },
  regularPrice:{
    type:Number,
    required:true
  },
  salePrice:{
    type:Number,
    required:true
  },
  productOffer:{
    type:Number,
    default:0
  },
  quantity:{
    type:Number,
    default:true
  },
  quantity:{
    type:String,
    required:true
  },
  productImage:{
    type:[String],
    required:true
  },
  isBlock:{
    type:Boolean,
    default:false
  },
  status:{
    type:String,
    enum:["Avilable","out of stock","Discontinued"],
    required:true,
    default:"Avilable"
  }
},{Timestamp:true});

const Product=mongoose.model("Product",productSchema);
module.exports=Product