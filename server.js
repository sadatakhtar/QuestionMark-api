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

// this End point returns name, answered and unanswered questions for a particular user from their id.
app.get('/ask-question/:user_id',async(req,res)=>{
  let user_id=req.params.user_id;
  let userObj={};

  const name=await pool.query(' select name from users where id=$1',[user_id])
  userObj.name=name.rows;

  const answeredQuestions= await pool.query('select question from question where answered =1 and users_id=$1',[user_id])
  userObj.answeredQuestions=answeredQuestions.rows;

  const unAnsweredQuestions= await pool.query('select question from question where answered =0 and users_id=$1',[user_id])
  userObj.unAnsweredQuestions=unAnsweredQuestions.rows;

  res.json(userObj);
});


app.get("/modules", async (req,res) =>{
  let moduleQuery = await pool.query("select module from module")
  let modules=moduleQuery.rows;
  if(typeof modules!=undefined)
    res.json(modules)
  else
    res.send("Not working")  
});


//SERVER LISTEN
app.listen (PORT, () => {
  console.log (`Server listening on port ${PORT}`);
});
