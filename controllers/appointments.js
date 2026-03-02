const Appointment = require('../models/Appointment');
const Restaurant = require('../models/Restaurant');

exports.getAppointments=async (req,res,next)=>{
    let query;
    //General users can see only their appointments!
    if(req.user.role !== 'admin'){
        query=Appointment.find({user:req.user.id}).populate({
            path: 'restaurant',
            select: 'name province tel'
        });
    }
    else{   //If you are an admin, you can see all!
        if(req.params.restaurantId){
            console.log(req.params.restaurantId);
            query=Appointment.find({restaurant: req.params.restaurantId}).populate({
            path: 'restaurant',
            select: 'name province tel'
        });
        }else{
            query=Appointment.find().populate({
                path: 'restaurant',
                select: 'name province tel'
            });
        }
        
    }
    try {
        const appointments= await query;
        res.status (200).json({
            success:true,
            count: appointments.length,
            data: appointments
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({success:false, message:
        "Cannot find Appointment"});
    }
};
exports.getAppointment=async (req,res,next) =>{
    try{
        const appointment= await Appointment.findById(req.params.id).populate({
            path: 'restaurant',
            select: 'name description tel'
        });

        if(!appointment){
            return res.status(404).json({success:false, message:` No appointment with the id of ${req.params.id}`});
        }
        res.status(200).json({
            success:true,
            data: appointment
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({success:false, message:"Cannot find Appointment"});
    }
};
exports.addAppointment=async (req,res,next)=>{
    try {
        req.body.restaurant=req.params.restaurantId;
        const restaurant= await Restaurant.findById(req.params.restaurantId);
        if(!restaurant){
            return res.status(404).json({success:false,message:`No restaurant with the id of ${req.params.restaurantId}`});
        }
        //add user Id to req.body
        req.body.user=req.user.id;
        //Check for existed appointment
        const existedAppointments=await Appointment.find({user:req.user.id});
        //If the user is not an admin, they can only create 3 appointment.
        if(existedAppointments.length >= 3 && req.user.role !== 'admin'){
            return res.status(400).json({success:false,message:` The user with ID ${req.user.id} has already made 3 appointments`});
        }
        const appointment = await Appointment.create(req.body);
        res.status(200).json({
            success:true,
            data: appointment
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({success:false,message:"Cannot create Appointment"}); 
    }
};

exports.updateAppointment=async (req,res, next)=>{
    try {

        let appointment= await Appointment.findById(req.params.id);
        if(!appointment){
            return res.status(404).json({success:false, message:` No appointment with the id of ${req.params.id}`});
        }
        //Make sure user is the appointment owner
        if(appointment.user.toString()!== req.user.id && req.user.role !== 'admid'){
            return res.status(401).json({success:false,message:`User ${req.user.id} is not authorized to update this appointment`});
        }

        appointment=await Appointment.findByIdAndUpdate(req.params.id, req.body,{
            new:true,
            runValidators:true
        });
        res.status(200).json({
            success:true,
            data: appointment
        });

    }catch(error){
        console.log(error);
        return res.status(500).json({success:false, message: "Cannot update Appointment"});
    }
};

exports.deleteAppointment=async (req,res,next)=>{
    try {
        const appointment= await Appointment.findById(req.params.id);
        if(!appointment){
            return res.status(404).json({success:false, message:`No appointment with theid of ${req.params.id}` }); 
            }

            //Make sure user is the appointment owner
            if(appointment.user.toString()!== req.user.id && req.user.role !== 'admid'){
                return res.status(401).json({success:false,message:`User ${req.user.id} is not authorized to delete this appointment`});
            }

            await appointment.deleteOne();
            res.status(200).json({
                success:true,
                date:{}
            });
    }catch(error){
        console.log(error);
        return res.status(500).json({success:false,message:"Cannot delete Appointment"});
    }
};