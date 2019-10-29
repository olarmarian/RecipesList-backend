const mongoose = require('mongoose');

const RecipesSchema = mongoose.Schema({
    title: {
        type:String,
        required: true
    },
    method: {
        type:String,
        required: true
    },
    ingredients:{
        type:Array,
        required:true
    },
    type:{
        type:String,
        required:true
    },
    date_created:{
        type: Date,
        default: Date.now
    },
    date_updated:{
        type:Date,
        default:Date.now
    }
});

module.exports = mongoose.model('Recipe',RecipesSchema);