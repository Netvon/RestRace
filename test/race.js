process.env.FACEBOOK_CLIENT_ID = '1954358709511840'
process.env.FACEBOOK_CLIENT_SECRET = '6d987d5829ec9620655894d2c86f1f32'

let mongoose = require('mongoose')
let Race = require('../models/race')

let chai = require('chai')
let chaiHttp = require('chai-http')
let server = require('../bin/server')
let should = chai.should()

chai.use(chaiHttp)

describe('Race', () => {
	describe('/GET Races', () => {
		it('It should GET all races', done => {
			chai.request(server)
				.get('/api/races')
				.end((err, res) => {
					if(err)
						done(err)

					res.should.have.status(200)
					res.body.should.be.a('array')
					done()
				})
		})
	})
})