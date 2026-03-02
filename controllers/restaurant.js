const Restaurant = require('../models/Restaurant.js');
const Reservation = require('../models/Reservation.js');
exports.getRestaurants = async (req, res, next) => {
    const reqQuery={...req.query};

    const removeFields=['select','sort','page','limit'];
    removeFields.forEach(param=>delete reqQuery [param]);

    let queryStr=JSON.stringify(reqQuery);
    queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`);
    let queryObj = JSON.parse(queryStr);
    Object.keys(queryObj).forEach(key => {
        const match = key.match(/^(.+)\[(\$.+)\]$/); 
        if (match) {
            const [full, field, operator] = match;
            if (!queryObj[field]) queryObj[field] = {};
            queryObj[field][operator] = queryObj[key];
            delete queryObj[key];
        }
    });
    //console.log('Final Correct Query:', queryObj);
    let query=Restaurant.find(queryObj).populate('reservations');
    //select
    if (req.query.select) {
        const fields = req.query.select.split(',').join(' ');
        query = query.select(fields);
    }
    //sort
    if (req.query.sort) {
        const sortBy = req.query.sort.split(',').join(' ');
        query = query.sort(sortBy);
    } else {
        query = query.sort('-createdAt');
    }

    //Pagination
    const page=parseInt (req.query.page,10)|| 1;
    const limit=parseInt (req.query.limit,10)||25;
    const startIndex=(page-1)*limit;
    const endIndex=page*limit;
    const total=await Restaurant.countDocuments () ;
    query=query.skip (startIndex).limit(limit);


    try {
        //Executing query
        const restaurant = await query;

        //Pagination result
        const pagination ={};
        if (endIndex<total){
            pagination.next={
                page:page+1,
                limit
            }
        }
        if (startIndex>0) {
            pagination.prev={
                page:page-1,
                limit
            }
        }
        res.status(200).json({
            success: true,
            count: restaurant.length,
            pagination,
            data: restaurant
        });

    } catch (err) {
        res.status(400).json({
            success: false,
            msg : err.message
        });
    }
};


exports.getRestaurant = async (req, res, next) => {
    try {
        const restaurant = await Restaurant.findById(req.params.id);

        if (!restaurant) {
            return res.status(400).json({
                success: false
            });
        }

        res.status(200).json({
            success: true,
            data: restaurant
        });

    } catch (err) {
        res.status(400).json({
            success: false
        });
    }
};


exports.createRestaurant = async (req, res, next) => {
    const restaurant = await Restaurant.create(req.body);

    res.status(201).json({
        success: true,
        data: restaurant
    });
}

exports.updateRestaurant = async (req, res, next) => {
    try {
        const restaurant = await Restaurant.findByIdAndUpdate(
            req.params.id,
            req.body,
            {
                new: true,
                runValidators: true
            }
        );

        if (!restaurant) {
            return res.status(400).json({
                success: false
            });
        }

        res.status(200).json({
            success: true,
            data: restaurant
        });

    } catch (err) {
        res.status(400).json({
            success: false
        });
    }
};


exports.deleteRestaurant = async (req, res, next) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id);

    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: "Restaurant not found"
      });
    }
    await Reservation.deleteMany({ restaurant: req.params.id });
    await Restaurant.deleteOne({ _id: req.params.id });

    res.status(200).json({
      success: true,
      data: {}
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};