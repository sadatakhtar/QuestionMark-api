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
  try {
    const allquestions = await pool.query (
      'select id, module_id, question from question'
    );
    const filter = await pool.query ('select id,module from module');
    const data = {};
    data.allquestions = allquestions.rows;
    data.filter = filter.rows;
    res.json (data);
  } catch (err) {
    console.error (err);
  }
});

app.get ('/answered', async (req, res) => {
  try {
    const answered = await pool.query (
      'select answer.question_id,question.question,question.answered,question.module_id,answer.answer from question inner join answer on question.id = answer.question_id'
    );
    const filter = await pool.query ('select id,module from module');
    const data = {};
    data.answered = answered.rows;
    data.filter = filter.rows;
    res.json (data);
  } catch (err) {
    console.error (err);
  }
});

app.get ('/unanswered', async (req, res) => {
  try {
    const unanswered = await pool.query (
      'select id,question,module_id from question where answered = 0'
    );
    const filter = await pool.query ('select id,module from module');
    const data = {};
    data.unanswered = unanswered.rows;
    data.filter = filter.rows;
    res.json (data);
  } catch (err) {
    console.error (err);
  }
});

app.get ('/selectedquestionpage/:id', async (req, res) => {
  const id = req.params.id;
  const data = {};
  try {
    const selectedquestion = await pool.query (
      `select  question.id, question.question_title, question.question,to_char (question.question_date, 'DD-MM-YYYY') as question_date,question.answered,users.name from question inner join users on users.id = question.users_id where question.id =$1 `,
      [id]
    );
    const selectedquestion_answer = await pool.query (
      `select answer.answer,answer.users_id,to_char(answer.answer_date, 'DD-MM-YYYY') as answer_date from answer inner join users on users.id = answer.users_id where answer.question_id = $1`,
      [id]
    );
    data.question = selectedquestion.rows;
    data.answer = selectedquestion_answer.rows;
    res.json (data);
  } catch (err) {
    console.error (err);
  }
});

//SERVER LISTEN
app.listen (PORT, () => {
  console.log (`Server listening on port ${PORT}`);
});
