const express = require ('express');
const app = express ();
path = require ('path');
const cors = require ('cors');
const Pool = require ('pg').Pool;
require ('dotenv').config ();

// we use process.env to contain our environment variables
//(variable to describe the enviroment our app is going to run in)
//because Herohu is responsible for the environment
//Heroku will provide some variables to apply for our app one of them is PORT .

const PORT = process.env.PORT || 3000;

const devConfig = {
  user: process.env.PG_USER,
  password: process.env.PG_PASSWORD,
  host: process.env.PG_HOST,
  port: process.env.PG_PORT,
  database: process.env.PG_DATABASE,
};

const proConfig = {
  connectionString: process.env.DATABASE_URL, //coming from Heroku addons
};

const pool = new Pool (
  process.env.NODE_ENV === 'production' ? proConfig : devConfig
);

//process.env.NODE_ENV  to indicate if our app is in production mode or not which will return production or undefined
if (process.env.NODE_ENV === 'production') {
  //serve static content
  //npm run build
  app.use (express.static (path.join (__dirname, 'client/build')));
}

//console.log (__dirname);
//console.log (path.join (__dirname, 'client/build'));

// middleware
app.use (cors ());
app.use (express.json ()); //allow use to access request.body

//ROUTES
app.get ('/', (req, res) => {
  console.log ('hi');
  res.send ('Homepage here');
});

app.get ('/allquestions', async (req, res) => {
  const allquestions = await pool.query ('select question from question');
  res.json (allquestions.rows);
});

//SIGNUP 
app.post('/register', (req, res) => {

  const {username, email, password } = req.body;
  
  pool.query(`insert into users (name, email, password) values ($1, $2, $3)`, 
  [username, email, password], (error, result)=> {
      console.log(error, result);
      if(error){
          res.status(400).send({error: "Database connection not established!"});
      }

      if(result){
          res.status(200).send({success: true});
      }else{
          res.status(401).send({success: false});
      }
     
  })
});

//LOGIN
app.post('/login', (req, res)=> {

  const {username, password} = req.body;
  
  pool.query(`select * from users where name=$1 and password=$2`, 
  [username, password], (error, result)=> {
      if(error){
          res.status(400).send({error: "Database connection not established!"});
      }

      if(result.rows.length > 0){
          res.json(result.rows);
         // res.status(200).send({success: true});
      }else{
         // res.status(401).send({message: "Wrong username/password combination"});
          res.status(401).json({success: false});
      }
  })
});

//SERVER LISTEN
app.listen (PORT, () => {
  console.log (`Server listening on port ${PORT}`);
});
