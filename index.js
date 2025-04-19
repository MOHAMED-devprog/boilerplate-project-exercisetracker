const express = require('express')
const app = express()
const cors = require('cors')
require('dotenv').config()

app.use(cors())
app.use(express.static('public'))
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

let users = [];
let exercises = [];

app.post("/api/users", function(req, res){
  const username = req.body.username;
  const newUser = {
    username : username,
    _id : Math.floor(Math.random() * 100000000000000).toString()
  }

  users.push(newUser);

  res.json({
    username : username,
    _id : newUser._id
  })
})


app.get("/api/users", function(req, res){
  res.json(users);
})


app.post("/api/users/:_id/exercises", function(req, res){
  const {description, duration, date} = req.body;
  const user = users.find(user => user._id === req.params._id);

  if (!user) return res.json({error : "User Not Found"});

  const exercise = {
    username: user.username,
    description: description,
    duration: parseInt(duration),
    date: date ? new Date(date):new Date(),
    _id: user._id
  }

  exercises.push(exercise);


  res.json({
    ...user,
    description: description,
    duration: duration,
    date: exercise.date.toDateString()
  });
});

app.get("/api/users/:_id/logs", function(req, res){
  const user = users.find(u => u._id === req.params._id);
  if (!user) return res.json({ error: 'User not found' });

  let userLogs = exercises.filter(e => e._id === user._id);

  // Optional query filters
  const { from, to, limit } = req.query;

  if (from) {
    const fromDate = new Date(from);
    userLogs = userLogs.filter(e => e.date >= fromDate);
  }

  if (to) {
    const toDate = new Date(to);
    userLogs = userLogs.filter(e => e.date <= toDate);
  }

  if (limit) {
    userLogs = userLogs.slice(0, parseInt(limit));
  }

  res.json({
    username: user.username,
    _id: user._id,
    count: userLogs.length,
    log: userLogs.map(e => ({
      description: e.description,
      duration: e.duration,
      date: e.date.toDateString()
    }))
  });
})





const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
