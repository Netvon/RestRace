let express = require('express'),
    router	= module.exports = express.Router(),
    User = require('../../models/user'),
    qh = require('../../middlewares/queryHandlers'),
    { NotFoundError, ValidationError, BadRequestError } = require('../../models/errors'),
    { isInRole, isJWTAuthenticated } = require('../../middlewares/auth')

router.param('userId', async (req, res, next, userId) => {
    qh.projectable(req, res, () => {})

    req.requestedUserId = userId

    let db = User.findSingleById(userId, req.fields)

    try {
        res.dbUser = await db

        if(res.dbUser == null)
            next(new NotFoundError(`User with id ${userId} not found`))
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
            let users = await qh.applyToDb(req, req.applyFilters(User.findAll(req.fields)))
            res.paginate(users, await req.applyFilters(User).count())        
        } catch (error) {
            next(error)
        }
    }
}

async function addUser(req, res, next) {
    if(!req.body.username || req.body.username === '')
        return next(BadRequestError({ username: 'Username must be specified' }))

    if(!req.body.password || req.body.password === '')
        return next(BadRequestError({ password: 'Password must be specified' }))

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

    res.dbUser.updateWith(req.body)
        .then(({_id, firstname, lastname }) => {
            res.status(200).json({_id, firstname, lastname })
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
            res.status(200).json(users);
        }

    });

}

async function getOwnedRacesForCurrentUser(req, res, next) {
    let Race = require('../../models/race')

    try{
        let dbCall = Race.findByCreator(req.user._id, req.fields)
        let count = await Race.findByCreator(req.user._id, req.fields).count()
        let races = await qh.applyToDb(req, dbCall)

        res.paginate(races, count)
    } catch(error) {
        next(error)
    }
}

async function getJoinedRacesForCurrentUser(req, res, next) {
    let Race = require('../../models/race')
    let Team = require('../../models/team')

    try {
        let teamIds = await Team.find({ users: req.user._id }, '_id', { lean:  true })
        let races = await qh.applyToDb(req, Race.findByTeamIds(teamIds, req.fields))
        let count = await Race.findByTeamIds(teamIds, req.fields).count()

        res.paginate(races, count)

    } catch (error) {
        next(error)
    }
    

    // try{
    //     let dbCall = Race.find({ owner: req.user._id })
    //     let races = await qh.applyToDb(req, dbCall)
    //     res.paginate(races, await dbCall.count())
    // } catch(error) {
    //     next(error)
    // }
}


// GET /api/users
// GET /api/users/:userId
router.get('/:userId?'/*, isJWTAuthenticated, isInRole('admin')*/, ...qh.all(), getUsers)

router.get('/me/races/owner', isJWTAuthenticated, ...qh.all(), getOwnedRacesForCurrentUser)
router.get('/me/races/joined', isJWTAuthenticated, ...qh.all(), getJoinedRacesForCurrentUser)

router.get('/search/:searchText', searchUsers)

// POST /api/users
router.post('/', addUser)

// DELETE /api/users/:userId
router.delete('/:userId', deleteUser)

// PUT /api/users/:userId
router.put('/:userId', isJWTAuthenticated, isInRole('admin'), updateUser)