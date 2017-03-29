let express = require('express'),
    router	= module.exports = express.Router(),
    User = require('../../models/user'),
    { isInRole, isJWTAuthenticated } = require('../../middlewares/auth')


function getUsers(req, res, next) {
    var query = {};
    if(req.params.userId){
        query._id = req.params.userId;
    }

    var properties = "_id firstname lastname races";

    User.find(query, properties)
        .then(data => {
            if(req.params.id){
                data = data[0];
            }
            return res.json(data);
        })
}

function addUser(req, res, next) {

    let user = new User({
        firstname: req.body.firstname,
        lastname: req.body.lastname,
        
        local: {
            username: req.body.username,
            password: req.body.password
        }
        
    })

    user.save().then(({_id, username, firstname, lastname }) => {
        res.setHeader('Location', req.originalUrl + '/' + _id)
        res.status(201).json({_id, username, firstname, lastname })
    }).catch(reason => {
        next(reason)
    })

}


function deleteUser(req, res) {

    User.findByIdAndRemove(req.params.userId, function(err, response){
        if(err){
            res.json({message: "Error in deleting user id " + req.params.userId});
        } else{
            res.json({message: "User with id " + req.params.userId + " removed."});
        }
    });

}

function updateUser(req, res) {

    User.findByIdAndUpdate(req.params.userId, req.body)
        .then(({_id, firstname, lastname }) => {
            res.status(201).json({_id, firstname, lastname })
        })
        .catch(reason => {
            let error = new Error(reason)
            error.status = 500
            throw error
        })

}

function searchUsers(req, res) {

    var re = new RegExp('.*'+req.params.searchText+'.*', "i");

    User.find().or([{ 'firstname': { $regex: re }}, { 'lastname': { $regex: re }}]).exec(function(err, users) {
        if(err || !users){
            res.json({message: "Error in finding users with text: " + req.params.searchText});
        } else{
            res.setHeader('Location', req.originalUrl + '/' + req.params.searchText)
            // res.status(201).json({_id: users[0]._id, firstname: users[0].firstname, lastname: users[0].lastname })
            res.status(201).json(users);
        }

    });

}


// GET /api/users
// GET /api/users/:userId
router.get('/:userId?', isJWTAuthenticated, isInRole('admin'), getUsers)

router.get('/search/:searchText', (req, res, next) => {
    searchUsers(req,res)
})

// POST /api/users
router.post('/', addUser)

// DELETE /api/users/:userId
router.delete('/:userId', (req, res, next) => {
    deleteUser(req,res)
})

// PATCH /api/users/:userId
router.patch('/:userId', (req, res, next) => {
    updateUser(req,res)
})
