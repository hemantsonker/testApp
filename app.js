const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const mcache = require('memory-cache');

const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');

const app = express();

const cacheTimeout = 30 ;  // in sec.

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// app.use('/', indexRouter);
// app.use('/users', usersRouter);

let cache = (duration) => {
return (req, res, next) => {
 let key = '__express__' + req.originalUrl || req.url
 console.log(key);
 let cachedBody = mcache.get(key)
 if (cachedBody) {
  console.log("Cached copy");
   res.send(cachedBody)
   console.log("Cached copy" +cachedBody);
   return
 } else {
  console.log("New copy");
   res.sendResponse = res.send
   res.send = (body) => {
     mcache.put(key, body, duration * 1000);
     res.sendResponse(body)
   }
   next()
 }
}
}

app.get('/', cache(cacheTimeout), (req, res) => {
setTimeout(() => {
 res.render('index', { title: 'Express', message: 'Using caching strategy', date: new Date()})
}, 5000) //setTimeout was used to simulate a slow processing request
})

app.get('/user/:id', cache(cacheTimeout), (req, res) => {
setTimeout(() => {
 if (req.params.id == 1) {
   res.json({ id: 1, name: "Amal"})
 } else if (req.params.id == 2) {
   res.json({ id: 2, name: "Kamal"})
 } else if (req.params.id == 3) {
   res.json({ id: 3, name: "Vimal"})
 } else if (req.params.id == 4) {
   res.json({ id: 3, name: "Indrajit"})

 }
}, 3000) //setTimeout was used to simulate a slow processing request
})

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
