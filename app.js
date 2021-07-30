"use strict"

const fs = require('fs')
const http = require('http')
const path = require('path')
const url = require('url')
const express = require('express')
const request = require('request')
const bodyParser = require('body-parser')

const app = express()
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended:true}))

const session = require('express-session')
app.use(session({secret:'secret', saveUninitialized:true, resave:true}))
let sess


const ejs = require('ejs')
const router = express.Router()

app.set('view engine', 'ejs')
app.engine('ejs', require('ejs').__express)


router.get('/', function(req, res){

	sess = req.session
	res.render('index', {pagename: 'Home', sess:sess})

})

router.get('/profile', function(req, res){

	sess = req.session
	
	if(typeof(sess) == 'undefined' || sess.loggedin != true){
	
		let errors = ['Not an authenticated user.']
		res.render('index', {pagename: 'Home', errors:errors})
		
	}else{
	
		res.render('profile', {pagename: 'Profile', sess:sess})	
	
	}
	
})

router.get('logout', function(req, res){

	sess = req.session
	sess.destroy(function(err){
		res.redirect('/')
	})

})

router.post('/login', function(req, res){

	let errors = []
	
	if(req.body.email === ''){
		errors.push('Email is required!')
	}
	
	if(req.body.password === ''){
		errors.push('Password is required!')
	}
	
	// Write condition for matching username and password | good show profile bad show index
	const user = {
		email: 'Mike@aol.com',
		password: 'abc123'
	}
	
	if(req.body.email === user.email && req.body.password === user.password){
	
		sess = req.session
		sess.loggedin = true
		sess.email = req.body.email
		sess.password = req.body.password
		console.log(sess)
		res.render('profile', {pagename: 'Profile', sess:sess})
	
	}else if(req.body.email === user.email && req.body.password != user.password){
		
		sess = req.session
		sess.loggedin = false
		errors.push('Password is not valid!')
		res.render('index', {pagename: 'Home', errors:errors})
	
	}else if(req.body.email != user.email && req.body.password === user.password){
		
		sess = req.session
		sess.loggedin = false
		errors.push('Email is not valid!')
		res.render('index', {pagename: 'Home', errors:errors})
	
	}else{
		
		sess = req.session
		sess.loggedin = false
		errors.push('Email and Password are not authorized.')
		res.render('index', {pagename: 'Home', errors:errors})
	
	}
	

})

app.use(express.static('public'))
app.use('/', router)
const server = app.listen('8080')
