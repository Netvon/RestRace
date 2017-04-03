let express = require('express'),
    router	= module.exports = express.Router(),
    User = require('../../models/user'),
    qh = require('../../middlewares/queryHandlers'),
    { NotFoundError, ValidationError } = require('../../models/errors'),
    { isInRole, isJWTAuthenticated } = require('../../middlewares/auth')

router.param('userId', async (req, res, next, userId) => {
    qh.projectable(req, res, () => {})

    req.requestedUserId = userId

    let db = User.findSingleById(userId, req.fields)

    try {
        res.dbUser = await db

        if(res.dbUser == null)
            next(new NotFoundError(`User with id ${raceId} not found`))
        else {
            next()
        }

    } catch (err) {
        if('CastError' === err.name && 'ObjectId' === err.kind)
            next(new NotFoundError(`User with id ${userId} not found`))
        else
            next(err)
    }
})

async function getUsers(req, res, next) {

    if(res.dbUser) {
        res.json(res.dbUser)
    } else {
        try {
            let users = await qh.applyToDb(req, User.findAll(req.fields))
            res.paginate(users, await User.count())        
        } catch (error) {
            next(error)
        }
    }
}

async function addUser(req, res, next) {

    let user = new User({
        firstname: req.body.firstname,
        lastname: req.body.lastname,

        local: {
            username: req.body.username,
            password: req.body.password
        },

        roles: req.body.roles
        
    })

    try {
        let newuser = await user.save()
        res.setHeader('Location', req.originalUrl + '/' + newuser._id)
        res.status(201).json(newuser)        
    } catch (reason) {
        next(reason)
    }
}


function deleteUser(req, res, next) {

    User.findByIdAndRemove(req.params.userId, function(err, response){
        if(err){
            res.json({message: "Error in deleting user id " + req.params.userId});
        } else{
            res.json({message: "User with id " + req.params.userId + " removed."});
        }
    });

}

function updateUser(req, res, next) {

    let update = {}

    if(req.body.username)
        update.local = { username: req.body.username }
    if(req.body.password)
        if(!update.local)
            update.local = { password: req.body.password }
        else
            update.local.password = req.body.password
    if(req.body.roles)
        update.roles = req.body.roles
    if(req.body.firstname)
        update.firstname = req.body.firstname
    if(req.body.lastname)
        update.lastname = req.body.lastname

    User.findByIdAndUpdate(req.params.userId, update)
        .then(({_id, firstname, lastname }) => {
            res.status(201).json({_id, firstname, lastname })
        })
        .catch(reason => {
            next(reason)
        })

}

function searchUsers(req, res) {

    var re = new RegExp('.*'+req.params.searchText+'.*', "i");

    User.find().or([{ 'local.username': { $regex: re }}]).exec(function(err, users) {
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
router.get('/:userId?'/*, isJWTAuthenticated, isInRole('admin')*/, ...qh.all(), getUsers)

router.get('/search/:searchText', searchUsers)

// POST /api/users
router.post('/', addUser)

// DELETE /api/users/:userId
router.delete('/:userId', deleteUser)

// PUT /api/users/:userId
router.put('/:userId', isJWTAuthenticated, isInRole('admin'), updateUser)