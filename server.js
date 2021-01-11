const express = require ('express');
const app = express ();
path = require ('path');
const cors = require ('cors');
const Pool = require ('pg').Pool;
const nodemailer = require ('nodemailer');
const {query} = require ('express');
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

//******************************************                ROUTES              ****************************************************************

app.get ('/', (req, res) => {
  res.send ('Homepage here');
});

// all questions
app.post ('/validEmail', async (req, res) => {
  const {email, password} = req.body;
  const router = express.Router ();
  const emailValidator = require ('deep-email-validator');

  if (!email || !password) {
    return res.status (400).send ({
      message: 'Email or password missing.',
    });
  }
  async function isEmailValid (email) {
    return emailValidator.validate (email);
  }
  const {valid, reason, validators} = await isEmailValid (email);

  if (valid) return res.send ({message: 'OK'});

  return res.status (400).send ({
    message: 'Please provide a valid email address.',
    reason: validators[reason].reason,
  });
});

app.get ('/allquestions', async (req, res) => {
  try {
    const allquestions = await pool.query (
      `select id, module_id,question_title, question,answers,to_char(question_date,'DD-MM-YYYY') as question_date,views,rate from question`
    );
    const count = await pool.query ('select count(question) from question');
    const filter = await pool.query ('select id,module from module');
    const q_answers = await pool.query (
      'select question.question,answer.answer from question inner join answer on question.id = answer.question_id'
    );
    const data = {};
    data.allquestions = allquestions.rows;
    data.count = count.rows[0];
    data.filter = filter.rows;
    data.q_answers = q_answers.rows;

    res.json (data);
  } catch (err) {
    console.error (err.message);
  }
});
//****************************************************************************************************************************************** */

//***********************************************             answered questions              *************************************************

app.get ('/answered', async (req, res) => {
  try {
    const answered = await pool.query (
      `select answer.question_id,question.question, to_char(question.question_date,'DD-MM-YYYY') as question_date, question.answers,question.module_id,answer.answer, to_char(answer.answer_date,'DD-MM-YYYY') as answer_date from question inner join answer on question.id = answer.question_id`
    );
    const filter = await pool.query ('select id,module from module');
    const data = {};
    data.answered = answered.rows;
    data.filter = filter.rows;
    res.json (data);
  } catch (err) {
    console.error (err.message);
  }
});

//****************************************************************************************************************************************** */

//*****************************************             unanswered questions              **************************************************
app.get ('/unanswered', async (req, res) => {
  try {
    const unanswered = await pool.query (
      `select question.id,question.question,question.module_id,to_char(question.question_date, 'DD-MM-YYYY') as question_date ,users.name from question inner join users on users.id = question.users_id where question.answers= 0`
    );
    const filter = await pool.query ('select id,module from module');
    const data = {};
    data.unanswered = unanswered.rows;
    data.filter = filter.rows;
    res.json (data);
  } catch (err) {
    console.error (err.message);
  }
});
//*****************************************               selected question description             *********************************************
app.get ('/selectedquestionpage/:id', async (req, res) => {
  const id = req.params.id;
  const data = {};
  try {
    const selectedquestion = await pool.query (
      `select  question.id, question.question_title,question.module_id, question.question,to_char (question.question_date, 'DD-MM-YYYY') as question_date,question.answers,question.rate,question.views,users.name,users.email from question inner join users on users.id = question.users_id where question.id =$1 `,
      [id]
    );
    const selectedquestion_answer = await pool.query (
      `select answer.answer,answer.users_id,users.name,to_char(answer.answer_date, 'DD-MM-YYYY') as answer_date from answer inner join users on users.id = answer.users_id where answer.question_id = $1`,
      [id]
    );
    data.question = selectedquestion.rows;
    data.answer = selectedquestion_answer.rows;
    res.json (data);
  } catch (err) {
    console.error (err.message);
  }
});
//****************************************************************************************************************************************** */

app.post ('/sendmail', async (req, res) => {
  let incomingEmail = req.body.email;
  let ask_question_email;
  let incomingText = req.body.text;

  if (req.body.users_id) {
    let userEmailQuery = await pool.query (
      'select email from users where id =$1',
      [req.body.users_id]
    );
    ask_question_email = userEmailQuery.rows[0].email;
  }

  if (incomingEmail === 'false') {
    incomingEmail = ask_question_email;
  }

  if (req.body.send === true) {
    const transporter = nodemailer.createTransport ({
      service: 'gmail',
      auth: {
        user: 'questionmarkcyf@gmail.com',
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: 'questionmarkcyf@gmail.com',
      to: incomingEmail,
      subject: 'Q&A Notification',
      text: `${incomingText}`,
    };

    transporter.sendMail (mailOptions, (error, info) => {
      if (error) {
        console.log (error);
      } else {
        console.log (`Email Sent: ${info.response}`);
      }
    });
    res.send ('Email sent');
  } else {
    res.send ('Email sending failed!');
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

    const increaseAnswers = await pool.query (
      'UPDATE question SET answers = answers+1 WHERE id = $1',
      [question_id]
    );

    res.json (replyDescription.rows[0]).status (200);
  } catch (err) {
    console.error (err.message);
  }
});

//****************************************************************************************************************************************** */

//*******************************************             endpoint for recieving the views and rate             *******************************

app.get ('/counters', async (req, res) => {
  try {
    const conterData = await pool.query ('select id,views,rate from question');
    res.json (conterData.rows);
  } catch (err) {
    console.error (err.message);
  }
});

//****************************************************************************************************************************************** */

//***************************************               endpoint to update the rates              ********************************************

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
    console.error (err.message);
  }
});

//****************************************************************************************************************************************** */

//****************************************              endpoint to update the views              *********************************************

app.put ('/views', async (req, res) => {
  const id = req.body.id;
  const views = req.body.views;
  try {
    const viewsRes = await pool.query (
      'UPDATE question SET views=$1 WHERE id=$2',
      [views, id]
    );
    res.json (viewsRes.rows);
  } catch (err) {
    console.error (err.message);
  }
});

//****************************************************************************************************************************************** */

//*****************************************             Endpoint for getting user answers             *****************************************

app.get ('/userAnswers/:id', async (req, res) => {
  const id = parseInt (req.params.id);
  try {
    const answers = await pool.query (
      'select answer.id,question.question,answer.answer,answer.question_id,question.module_id from question inner join answer on question.id = answer.question_id where answer.users_id = $1',
      [id]
    );
    res.json (answers.rows);
  } catch (err) {
    console.error (err.message);
  }
});

//****************************************************************************************************************************************** */

//****************************************              Endpoint for getting asked questions by a user            **********************************

app.get ('/userAsked/:id', async (req, res) => {
  const id = parseInt (req.params.id);
  try {
    const userAskedQ = await pool.query (
      'select question.id,question.question, question.answers,answer.answer from question inner join answer on question.users_id = answer.users_id where question.users_id = $1 ',
      [id]
    );
    res.json (userAskedQ.rows);
  } catch (err) {
    console.error (err.message);
  }
});

//test

app.get ('/test', async (req, res) => {
  const answer_question_id = await pool.query (
    'select question_id from answer where id = 1'
  );
  res.json (answer_question_id.rows[0].question_id);
});

//****************************************************************************************************************************************** */

//*******************************************             Endpoint to delete a user's answer by id             ***********************************
app.delete ('/userAnswers/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const answer_question_id = await pool.query (
      'select question_id from answer where id = $1',
      [id]
    );
    const decreaseAnswers = await pool.query (
      'UPDATE question SET answers = answers-1 WHERE id = $1',
      [answer_question_id.rows[0].question_id]
    );
    const deleteAnswer = await pool.query ('delete from answer where id = $1', [
      id,
    ]);

    res.json ('Answer was deleted');
  } catch (err) {
    console.error (err.message);
  }
});
//****************************************************************************************************************************************** */

//*****************************************              Endpoint delete a user's question by id             *********************************

app.delete ('/userAsked/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const deleteAllAnswers = await pool.query (
      'delete from answer where question_id = $1',
      [id]
    );
    const deleteQuestion = await pool.query (
      'delete from question where id = $1',
      [id]
    );
    const deleteAnswers = await pool.query (
      'delete from answer where question_id = $1',
      [id]
    );
    res.json ('Question was deleted');
  } catch (err) {
    console.error (err.message);
  }
});

//****************************************************************************************************************************************** */

//*****************************************             Endoint to edit user's answer             *********************************************

app.put ('/userAnswers/:id', async (req, res) => {
  console.log ('body = ' + req.body + 'params-id = ' + req.params.id);
  try {
    const id = req.params.id;
    const answer = req.body.answer;
    const updateAnswer = await pool.query (
      'update answer set answer = $1 where id = $2',
      [answer, id]
    );
    res.json ('Answer updated');
  } catch (err) {
    console.error (err.message);
  }
});

//****************************************************************************************************************************************** */

//***************************************             Endoint to edit user's question             *********************************************

app.put ('/userAsked/:id', async (req, res) => {
  console.log ('body = ' + req.body.question + 'params-id = ' + req.params.id);
  try {
    const id = req.params.id;
    const question = req.body.question;
    const updateQuestion = await pool.query (
      'update question set question = $1 where id = $2',
      [question, id]
    );
    res.json ('Question updated');
  } catch (err) {
    console.error (err.message);
  }
});

//****************************************************************************************************************************************** */

app.post ('/sendmail', async (req, res) => {
  let incomingEmail = req.body.email;
  let ask_question_email;
  let incomingText = req.body.text;

  if (req.body.users_id) {
    let userEmailQuery = await pool.query (
      'select email from users where id =$1',
      [req.body.users_id]
    );
    ask_question_email = userEmailQuery.rows[0].email;
  }

  if (incomingEmail === 'false') {
    incomingEmail = ask_question_email;
  }

  if (req.body.send === true) {
    const transporter = nodemailer.createTransport ({
      service: 'gmail',
      auth: {
        user: 'questionmarkcyf@gmail.com',
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: 'questionmarkcyf@gmail.com',
      to: incomingEmail,
      subject: 'Testing nodemailer',
      text: `${incomingText}`,
    };

    transporter.sendMail (mailOptions, (error, info) => {
      if (error) {
        console.log (error);
      } else {
        console.log (`Email Sent: ${info.response}`);
      }
    });
    res.send ('Email sent');
  } else {
    res.send ('Email sending failed!');
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
        res.status (400).send ({error: 'Database   not established!'});
      }

      if (result.rows.length > 0) {
        res.send ({
          success: true,
          message: `${username}`,
          user_id: `${result.rows[0].id}`,
        });
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
    'select id,question_title from question where answers >0 and users_id=$1',
    [user_id]
  );
  userObj.answeredQuestions = answeredQuestions.rows;

  const unAnsweredQuestions = await pool.query (
    'select id,question_title from question where answers =0 and users_id=$1',
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

// //verify while registration if an email is valid.
// app.post("/ask-question-notification",async(req,res)=>{
//   const quesObj=req.body;
//   // let transport = nodemailer.createTransport(options[, defaults])
//   let transport = nodemailer.createTransport({
//     service: 'gmail',
//     auth: {
//       user: 'questionmarkcyf@gmail.com', // here use your real email
//       pass: 'DSHCYF123' // put your password correctly (not in this question please)
//     }
//   });
//   const message = {
//     from: 'questionmarkcyf@gmail.com', // Sender address
//     to: 'to@gmail.com',         // List of recipients
//     subject: 'Question Posted', // Subject line
//     text: `

//     Thank you for asking a question at CYF platform, someone will soon respond to your question and you will receive a notification on your email.
//     Question title:   ${quesObj.title}

//     Kind Regards
//     Team QuestionMark
//     CodeYourFuture

//     ` // Plain text body
//   };

//   transport.sendMail(message, function(err, info) {
//     if (err) {
//       console.log(err)
//       res.json("failed")
//     } else {
//       console.log(info);
//       res.json(info);
//     }
//   });

// })

app.post ('/ask-question', async (req, res) => {
  const quesObj = req.body;
  // console.log(quesObj);
  let askQuestionQuery = await pool.query (
    'insert into question(question_title,question,module_id,users_id,question_date,answers) values($1,$2,$3,$4,$5,$6)',
    [
      quesObj.title,
      quesObj.question,
      quesObj.module_id,
      quesObj.users_id,
      quesObj.question_date,
      quesObj.answers,
    ]
  );
  // let userEmailQuery= await pool.query("select email from users where id =$1",[quesObj.users_id])

  // let user_email=userEmailQuery.rows[0].email

  // let transport = nodemailer.createTransport({
  //   service: 'gmail',
  //   auth: {
  //     user: 'questionmarkcyf@gmail.com', // here use your real email
  //     pass: 'DSHCYF123' // put your password correctly (not in this question please)
  //   }
  // });
  // const message = {
  //   from: 'questionmarkcyf@gmail.com', // Sender address
  //   to: `${user_email}`,         // List of recipients
  //   subject: 'Question Posted  Testing', // Subject line
  //   text: `

  //   Thank you for asking a question at CYF platform, someone will soon respond to your question and you will receive a notification on your email.
  //   Question title:   ${quesObj.title}

  //   Kind Regards
  //   Team QuestionMark
  //   ` // Plain text body
  // };

  // transport.sendMail(message, function(err, info) {
  //   if (err) {
  //     console.log(err)
  //   } else {
  //     console.log(info);
  //   }
  // });

  res.json (true);
});

//SERVER LISTEN
app.listen (PORT, () => {
  console.log (`Server Listening on port ${PORT}`);
});
