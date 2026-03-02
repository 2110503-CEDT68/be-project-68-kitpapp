const mongoose = require('mongoose');

const RestaurantSchema = new mongoose.Schema({
    name : {
        type: String,
        require: [true, 'Please add name'],
        unique: true,
        trim: true,
        maxlenght: [50, 'Name cannot be more than 50 charector']
    },
    address: {
        type: String,
        require: [true, 'Please add an address']
    },
    district: {
        type: String,
        require: [true, 'Please add a district']
    },
    province: {
        type: String,
        require: [true, 'Please add a province']
    },
    postalcode: {
        type: String,
        require: [true, 'Please add a postalcode'],
        maxlenght: [5, 'Postalcode cannot be more than 5 digit']
    },
    tel: {
        type: String,
        required:[true,'Please add a telephone number']
    },
    region: {
        type: String,
        require: [true, 'Please add  a region']
    },
    open:{
        type: String,
        require: [true, 'Please add  a open time']
    },
    close:{
        type: String,
        require: [true, 'Please add  a close time']
    }
    
},{
    toJSON: {virtuals:true},
    toObject:{virtuals:true}
});

RestaurantSchema.virtual('appointments',{
    ref: 'Appointment',
    localField: '_id',
    foreignField:'restaurant',
    justOne:false
}); 
module.exports = mongoose.model('Restaurant', RestaurantSchema);