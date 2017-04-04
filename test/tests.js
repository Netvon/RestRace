process.env.FACEBOOK_CLIENT_ID = '-'
process.env.FACEBOOK_CLIENT_SECRET = '-'

let chai = require('chai')
let chaiHttp = require('chai-http')
let server = require('../bin/server')
let should = chai.should()
let expect = chai.expect

let token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI1OGRiYmQ5NTY1MjdlODBjOTg2NTFlNDUiLCJpc3MiOiJodHRwOi8vbG9jYWxob3N0OjMwMDAiLCJpYXQiOjE0OTEzMTY0MTQsImV4cCI6MTQ5MTQwMjgxNH0.v9KahwdKjzLBgIOXFu5xqPd5y-mKUu-qzCZGauR1fEc'

chai.use(chaiHttp)

before('Get Fresh Token',  () => {
	chai.request(server)
		.post('/auth/token')
		.send({ username: "netvon", password: 'password'})
		.end((err, res) => {
			token = res.body.token
			done(err)
		})
})

describe('Model Tests', () => {
	describe('User', () => {
		it('It should only allow \'admin\' and \'user\' roles', done => {
			let User = require('../models/user')

			let user = new User()
			user.roles = ['lol', 'hallo']

			let errors = user.validateSync('roles')
			expect(errors).to.not.be.null

			done()
		})

		it('It should hash password after save & have default role', done => {
			let User = require('../models/user')

			let user = new User()
			user.local = { username: (new Date()).toLocaleString(), password: 'hallo' }

			user.save()
				.then(doc => {
					expect(doc.local.password).to.not.equal('hallo')
					expect(doc.roles).to.include('user')

					User.findByIdAndRemove(doc._id).exec()

					done()
				})
				.catch(done)
		})

		it('It should have correct fullname Virtual', done => {
			let User = require('../models/user')

			let user = new User()
			user.firstname = 'Tom'
			user.lastname = 'van Nimwegen'

			expect(user.fullName).to.be.equal('Tom van Nimwegen')
			done()
		})

		it('It should not have facebook by default', done => {
			let User = require('../models/user')

			let user = new User()

			expect(user.hasFacebook).to.be.false
			done()
		})

		it('It should always invalidate login when nothing is passed', async () => {
			let User = require('../models/user')

			let result = await User.validateUsernamePassword(undefined, '')

			expect(result).to.be.false
		})
	})

	describe('Teams', () => {
		it('It Should update a team from an object', async () => {
			let Team = require('../models/team.js')

			let team = await Team.create({ name: "A Brand New Team" })
			team = await team.updateWith({ name: "A Brand New Team, pt. 2" })

			expect(team.name).to.be.equal("A Brand New Team, pt. 2")

			team = await team.updateWith({ endtime: "01-01-2018 12:34" })

			expect(team.name).to.be.equal("A Brand New Team, pt. 2")
			expect(team.endtime).to.not.be.null
		})
	})
})

describe('Errors', () => {
	describe('404', () => {
		it('It should return JSON for /api/*', done => {
			chai.request(server)
				.get('/api/something-not-real')
				.end((err, res) => {
					
					expect(res).to.have.status(404)
					expect(res.body).to.have.property('error')
					expect(res.body).to.have.property('error').with.property('status').which.equals(404)
					expect(res).to.be.json
					done()
				})
		})

		it('It should return HTML for /*', done => {
			chai.request(server)
				.get('/something-not-real')
				.end((err, res) => {
					
					expect(res).to.have.status(404)
					expect(res).to.be.html
					done()
				})
		})
	})
})

describe('Race', () => {

	describe('/GET Races', () => {
		it('It should GET all races', done => {
			chai.request(server)
				.get('/api/races')
				.set('Authorization', `JWT ${token}`)
				.end((err, res) => {
					if(err) {
						done(err)
					} else {
						expect(res.body).to.be.an('array')
						expect(res).to.have.status(200)

						done()
					}					
				})
		})

		it('It should GET one race', done => {
			chai.request(server)
				.get('/api/races/58c02042768dc92a584d1c1b')
				.set('Authorization', `JWT ${token}`)
				.end((err, res) => {
					if(err) {
						done(err)
					} else {
						expect(res.body).to.be.an('object')
						expect(res.body).to.have.property('_id').which.equals('58c02042768dc92a584d1c1b')
						expect(res).to.have.status(200)

						done()
					}					
				})
		})

		it('It should not GET race that doesn\t exist (non-objectid)', done => {
			chai.request(server)
				.get('/api/races/abc')
				.set('Authorization', `JWT ${token}`)
				.end((err, res) => {
					expect(res.body).to.be.an('object')
					expect(res.body.error).to.have.property('message').which.equals('Race with id abc not found')
					expect(res).to.have.status(404)

					done()		
				})
		})

		it('It should not GET race that doesn\t exist', done => {
			chai.request(server)
				.get('/api/races/100000000000000000000001')
				.end((err, res) => {
					expect(res.body).to.be.an('object')
					expect(res.body.error).to.have.property('message').which.equals('Race with id 100000000000000000000001 not found')
					expect(res).to.have.status(404)

					done()		
				})
		})

		it('It should GET one race with only _id', done => {
			chai.request(server)
				.get('/api/races/58c02042768dc92a584d1c1b?fields=_id')
				.set('Authorization', `JWT ${token}`)
				.end((err, res) => {
					if(err) {
						done(err)
					} else {
						expect(res.body).to.be.an('object')
						expect(res.body).to.have.property('_id').which.equals('58c02042768dc92a584d1c1b')
						expect(res).to.have.status(200)

						done()
					}					
				})
		})
		

		it('It should paginate GET all races', done => {
			chai.request(server)
				.get('/api/races?limit=10')
				.set('Authorization', `JWT ${token}`)
				.end((err, res) => {

					expect(res.body).to.not.be.an('array')
					expect(res.body).to.be.an('object')
					expect(res.body).to.have.property('limit').which.equals(10)
					expect(res.body).to.have.property('skip')
					expect(res.body).to.have.property('next')
					expect(res.body).to.have.property('totalPages')
					expect(res.body).to.have.property('currentPage')

					expect(res).to.have.status(200)
					done(err)
				})
		})

		it('It should paginate GET all races and go to the next page', done => {
			chai.request(server)
				.get('/api/races?limit=10&skip=10')
				.set('Authorization', `JWT ${token}`)
				.end((err, res) => {

					expect(res.body).to.not.be.an('array')
					expect(res.body).to.be.an('object')
					expect(res.body).to.have.property('limit').which.equals(10)
					expect(res.body).to.have.property('skip').which.equals(10)
					expect(res.body).to.have.property('prev')
					expect(res.body).to.have.property('totalPages')
					expect(res.body).to.have.property('currentPage')

					expect(res).to.have.status(200)
					done(err)
				})
		})
	})
})

describe('Team', () => {

	describe('/GET Teams', () => {
		it('It should GET all teams', done => {
			chai.request(server)
				.get('/api/teams')
				.end((err, res) => {
					if(err) {
						done(err)
					} else {
						expect(res.body).to.be.an('array')
						expect(res).to.have.status(200)

						done()
					}
				})
		})
		

		it('It should paginate GET all teams', done => {
			chai.request(server)
				.get('/api/teams?limit=10')
				.end((err, res) => {
					if(err) {
						done(err)
					} else {

						expect(res.body).to.not.be.an('array')
						expect(res.body).to.be.an('object')
						expect(res.body).to.have.property('limit').which.equals(10)
						expect(res.body).to.have.property('skip').which.equals(0)
						expect(res.body).to.have.property('totalPages')
						expect(res.body).to.have.property('currentPage')

						expect(res).to.have.status(200)
						done()
					}
				})
		})
	})
})

describe('Users', () => {

	describe('/GET Users', () => {
		it('It should GET all users', done => {
			chai.request(server)
				.get('/api/users')
				.end((err, res) => {
					if(err) {
						done(err)
					} else {
						expect(res.body).to.be.an('array')
						expect(res).to.have.status(200)

						done()
					}
				})
		})
		

		it('It should paginate GET all users', done => {
			chai.request(server)
				.get('/api/users?limit=10')
				.end((err, res) => {
					if(err) {
						done(err)
					} else {
						expect(res.body).to.not.be.an('array')
						expect(res.body).to.be.an('object')
						expect(res.body).to.have.property('limit').which.equals(10)
						expect(res.body).to.have.property('skip').which.equals(0)
						expect(res.body).to.have.property('totalPages')
						expect(res.body).to.have.property('currentPage')

						expect(res).to.have.status(200)
						done()
					}
				})
		})
	})
})

describe('Auth', () => {

	describe('/GET Token (auth/token)', () => {
		it('It should GET 422 if no body is present', done => {
			chai.request(server)
				.post('/auth/token')
				.end((err, res) => {
					expect(res).to.have.status(422)
					expect(res.body.error).to.have.property('name').which.equals('AuthentificationError')
					// expect(res.body.error).to.have.property('reason').which.equals('No Password or Username present')
					expect(res.body.error).to.have.property('status').which.equals(422)
					done()
				})
		})

		it('It should GET 422 if user is unkown', done => {
			chai.request(server)
				.post('/auth/token')
				.send({ username: "random89237981", password: "Random"})
				.end((err, res) => {
					expect(res).to.have.status(422)
					expect(res.body.error).to.have.property('name').which.equals('AuthentificationError')
					// expect(res.body.error).to.have.property('reason').which.equals('User not Found')
					expect(res.body.error).to.have.property('status').which.equals(422)
					done()
				})
		})

		it('It should GET 422 if password is wrong', done => {
			chai.request(server)
				.post('/auth/token')
				.send({ username: "netvon", password: 'some other password'})
				.end((err, res) => {
					expect(res).to.have.status(422)
					expect(res.body.error).to.have.property('name').which.equals('AuthentificationError')
					// expect(res.body.error).to.have.property('reason').which.equals('Password did not match')
					expect(res.body.error).to.have.property('status').which.equals(422)
					done()
				})
		})

		it('It should GET token', done => {
			chai.request(server)
				.post('/auth/token')
				.send({ username: "netvon", password: 'password'})
				.end((err, res) => {
					expect(res).to.have.status(200)
					expect(res.body).to.have.property('message').which.equals('ok')
					expect(res.body).to.have.property('token')
					done()
				})
		})
	})

	describe('/GET Me', () => {
		it('It should GET 401 if no Auth Header is present', done => {
			chai.request(server)
				.get('/auth/me')
				.end((err, res) => {
					expect(res).to.have.status(401)
					done()
				})
		})
	})
	
	describe('/GET register', () => {
		it('It should GET html', done => {
			chai.request(server)
				.get('/register')
				.end((err, res) => {
					expect(res).to.be.html
					done()
				})
		})
	})

	describe('/GET login', () => {
		it('It should GET html', done => {
			chai.request(server)
				.get('/login')
				.end((err, res) => {
					expect(res).to.be.html
					done()
				})
		})
	})
})