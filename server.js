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

const PORT = process.env.PORT || 5000;

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
app.use (express.json ()); //allow use to  access request.body
app.use (express.urlencoded ({extended: true}));
app.use (function (req, res, next) {
  res.header ('Access-Control-Allow-Origin', '*');
  res.header (
    'Access-Control-Allow-Headers',
    'Origin,X-Requested-With,Content-Type,Accept'
  );
  next ();
});

//ROUTES

app.get ('/', (req, res) => {
  res.send ('Homepage here');
});

app.get ('/allquestions', async (req, res) => {
  try {
    const allquestions = await pool.query (
      'select id, module_id,question_title, question,answers,views,rate from question'
    );
    const filter = await pool.query ('select id,module from module');
    const q_answers = await pool.query (
      'select question.question,answer.answer from question inner join answer on question.id = answer.question_id'
    );
    const data = {};
    data.allquestions = allquestions.rows;
    data.filter = filter.rows;
    data.q_answers = q_answers.rows;

    res.json (data);
  } catch (err) {
    console.error (err);
  }
});

// answered questions
app.get ('/answered', async (req, res) => {
  try {
    const answered = await pool.query (
      'select answer.question_id,question.question,question.answers,question.module_id,answer.answer from question inner join answer on question.id = answer.question_id'
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

// unanswered questions
app.get ('/unanswered', async (req, res) => {
  try {
    const unanswered = await pool.query (
      'select id,question,module_id from question where answers= 0'
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
// selected question description
app.get ('/selectedquestionpage/:id', async (req, res) => {
  const id = req.params.id;
  const data = {};
  try {
    const selectedquestion = await pool.query (
      `select  question.id, question.question_title, question.question,to_char (question.question_date, 'DD-MM-YYYY') as question_date,question.answers,users.name from question inner join users on users.id = question.users_id where question.id =$1 `,
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

//Post Reply to question by id

app.post ('/replypage', async (req, res) => {
  console.log (req.body);
  const question_id = req.body.question_id;
  const user_id = req.body.user_id;
  const date = req.body.date;
  const reply = req.body.reply;

  try {
    const replyDescription = await pool.query (
      'INSERT INTO answer(question_id,answer,users_id,answer_date) VALUES($1,$2,$3,$4) RETURNING *',
      [question_id, reply, user_id, date]
    );
    res.json (replyDescription.rows[0]).status (200);
  } catch (err) {
    console.error (err);
  }
});

// endpoint for recieving the views and rate

app.get ('/counters', async (req, res) => {
  try {
    const conterData = await pool.query ('select id,views,rate from question');
    res.json (conterData.rows);
  } catch (err) {
    console.error (err);
  }
});

// endpoint for update the rates

app.put ('/rates', async (req, res) => {
  const id = req.body.id;
  const rate = req.body.rate;
  try {
    const rates = await pool.query ('UPDATE question SET rate=$1 WHERE id=$2', [
      rate,
      id,
    ]);
    res.json (rates.rows);
  } catch (err) {
    console.error (err);
  }
});

// Endpoint for a user answers

app.get ('userAnswers/:id', async (req, res) => {
  const id = req.params.id;
  try {
    const answers = await pool.query (
      'select question.question,answer.answer from question inner join answer on question.id = answer.question_id where answer.users_id = $',
      [id]
    );
    res.json (answers);
  } catch (err) {
    console.error (err);
  }
});

//SIGNUP
app.post ('/register', (req, res) => {
  const {username, email, password, confirm} = req.body;
  let errorArray = [];

  !username ||
    !email ||
    !password ||
    (!confirm && errorArray.push ({message: 'Please enter all fields'}));
  password.length < 5 &&
    errorArray.push ({message: 'Password should be at least 5 characters'});
  password !== confirm && errorArray.push ({message: 'Passwords do not match'});

  if (errorArray.length > 0) {
    res.send ({errorArray});
  } else {
    // let hashedPassword = await bcrypt.hash (password, 10);
    // console.log(hashedPassword);

    pool.query (
      `insert into users (name, email, password) values ($1, $2, $3)`,
      [username, email, password],
      (error, result) => {
        console.log (error, result);

        if (error) {
          res
            .status (400)
            .send ({error: 'Database connection not established!'});
        }

        if (result) {
          res.status (200).send ({
            success: true,
            message: ' Registration successfull. Please login',
          });
        } else {
          res.status (401).send ({success: false});
        }
      }
    );
  }
});

//LOGIN
app.post ('/login', (req, res) => {
  const {username, password} = req.body;

  pool.query (
    `select * from users where name=$1 and password=$2`,
    [username, password],
    (error, result) => {
      if (error) {
        res.status (400).send ({error: 'Database connection not established!'});
      }

      if (result.rows.length > 0) {
        res.send ({success: true, message: `Welcome ${username}`});
      } else {
        // res.status(401).send({message: "Wrong username/password combination"});
        res.status (401).json ({
          success: false,
          message: 'Invalid username/password. Please register or try again',
        });
      }
    }
  );
});

// this End point returns name, answered and unanswered questions for a particular user from their id.
app.get ('/ask-question/:user_id', async (req, res) => {
  let user_id = req.params.user_id;
  let userObj = {};

  const name = await pool.query (' select name from users where id=$1', [
    user_id,
  ]);
  userObj.name = name.rows;

  const answeredQuestions = await pool.query (
    'select question from question where answers >0 and users_id=$1',
    [user_id]
  );
  userObj.answeredQuestions = answeredQuestions.rows;

  const unAnsweredQuestions = await pool.query (
    'select question from question where answers =0 and users_id=$1',
    [user_id]
  );
  userObj.unAnsweredQuestions = unAnsweredQuestions.rows;

  res.json (userObj);
});

app.get ('/modules', async (req, res) => {
  let moduleQuery = await pool.query ('select module from module');
  let modules = moduleQuery.rows;
  if (typeof modules != undefined) res.json (modules);
  else res.send ('Not working');
});

app.post ('/ask-question', async (req, res) => {
  const quesObj = req.body;
  let askQuestionQuery = await pool.query (
    'insert into question(question_title,question,module_id,users_id,question_date,answers) values($1,$2,$3,$4,$5,$6)',
    [
      quesObj.question_title,
      quesObj.question,
      quesObj.module_id,
      quesObj.users_id,
      quesObj.question_date,
      quesObj.answers,
    ]
  );
  res.json ('Values have been inserted');
});

//SERVER LISTEN
app.listen (PORT, () => {
  console.log (`Server Listening on port ${PORT}`);
});
