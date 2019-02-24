const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
var mongoose = require('mongoose');

const usersRouter = require('./routes/users/users');
const quizzRouter = require('./routes/quizz/quizz')

const app = express();
const http = require('http').Server(app)
const io = require('socket.io')(http)

io.on('connection', socket => {
  console.log(`user is connected: ${socket}`)
})

app.set('view engine', 'pug')
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
//Allow cross origin requests
app.use((req, res, next) => {
  console.log(req.method)
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Access-Control-Allow-Origin");
  next();
});


mongoose.connect('mongodb://localhost/kahoot');

app.use('/users', usersRouter);
app.use('/quizz', quizzRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
