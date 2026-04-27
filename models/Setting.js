const { Schema, model, models } = require('mongoose');
const mongoose = require('mongoose');

const SettingSchema = new mongoose.Schema({
  name:{type:String,required:true,unique:true},
  value:{type:Object}
},{timestamps:true});

export const Setting = models?.Setting || model('Setting', SettingSchema);
