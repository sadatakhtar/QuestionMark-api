drop table if exists likes;
drop table if exists comment;
drop table if exists answer;
drop table if exists question;
drop table if exists users;
drop table if exists module;


CREATE TABLE users (
id SERIAL PRIMARY KEY,
name  VARCHAR(200) NOT NULL ,
email VARCHAR(200)NOT NULL,
password VARCHAR(500) NOT NULL
);


CREATE TABLE module (
id SERIAL PRIMARY KEY,
module  VARCHAR(100) NOT NULL 
);

CREATE TABLE question (
id SERIAL PRIMARY KEY,
question_title  TEXT NOT NULL ,
question TEXT NOT NULL,
module_id  INT REFERENCES module(id),
users_id  INT REFERENCES users(id),
question_date DATE NOT NULL,
likes_counter INT DEFAULT 0,
answers INT DEFAULT 0,
views INT DEFAULT 0 ,
rate INT DEFAULT 0 
);

CREATE TABLE answer (
id SERIAL PRIMARY KEY,
question_id INT REFERENCES question(id) ,
answer TEXT NOT NULL,
users_id INT REFERENCES users(id),
answer_date DATE
);

CREATE TABLE comment (
id SERIAL PRIMARY KEY,
comment TEXT NOT NULL,
question_id INT REFERENCES question(id) ,
answer_id INT REFERENCES answer(id) ,
users_id  INT REFERENCES users(id),
comment_date timestamp NOT NULL,
comments_counter INT DEFAULT 0
);


CREATE TABLE likes (
id SERIAL PRIMARY KEY,
question_id INT REFERENCES question(id) ,
users_id  INT REFERENCES users(id),
likes BOOLEAN DEFAULT 'false'
);


INSERT INTO users(name,email,password) VALUES('Akhil','khieth@yahoo.com',' $2b$10$TKUAzbf516ou/yWRqNZFXephWMvj0..uP/3vJUGg2NG3GSMED80xa');
INSERT INTO users(name,email,password) VALUES('Laura','Lora@yahoo.com',' $2b$10$6HBswsNlRkwOOfNOs0pBG.VxDKY8s4pjXbIsZhn2H01D6A7ReLEza');
INSERT INTO users(name,email,password) VALUES('Wahab','Wahab@yahoo.com',' $2b$10$6HBswsNlRkwOOfNOs0pBG.VxDKY8s4pjXbIsZhn2H01D6A7ReLEza');
INSERT INTO users(name,email,password) VALUES('Sadat','sadat@yahoo.com',' $2b$10$hFFPVUlRVXgLwsJ0RU8Tueg/awvz.MPD270QeecW.qCtNvX/aWat2');
INSERT INTO users(name,email,password) VALUES('Davinder','davinder@yahoo.com',' $2b$10$RAWB8u5qVkC2V2mD5Al1jOF9nQfMWIoY7Y1WRSZ53S.N7C0H/Fcpm');
INSERT INTO users(name,email,password) VALUES('Hiba','hiba@yahoo.com',' $2b$10$dmm9x4XcBFPPqz5WqTGIUeu3DqzHEHRCU/MI01Ru0ihwuAvD99UGa');


INSERT INTO module(module) VALUES('Git and Github');
INSERT INTO module(module) VALUES('HTML/CSS');
INSERT INTO module(module) VALUES('JavaScript');
INSERT INTO module(module) VALUES('React');
INSERT INTO module(module) VALUES('Nodejs');
INSERT INTO module(module) VALUES('SQL');
INSERT INTO module(module) VALUES('MongoDB');



INSERT INTO question(question_title,question,module_id,users_id,question_date,answers,views,rate) VALUES('How do I undo the most recent local commits in Git?','I accidentally committed the wrong files to Git, but didn''t push the commit to the server yet.
How can I undo those commits from the local repository?',1,3,'03/11/2020',0,3,1);

INSERT INTO question(question_title,question,module_id,users_id,question_date,answers,views,rate) VALUES('How can I horizontally center a <div> within another <div> using CSS?','<div id="outer">

<div id="inner">Foo foo</div>

</div>',2,5,'12/10/2020',1,4,3);

INSERT INTO answer(question_id,answer,users_id,answer_date) VALUES(2,'You can apply this CSS to the inner <div>:

#inner {
width: 50%;
margin: 0 auto;
}',2,'17/10/2020');


INSERT INTO question(question_title,question,module_id,users_id,question_date,answers,views,rate) VALUES('How can I remove a specific item from an array?','I have an array of numbers and I''m using the .push() method to add elements to it.

Is there a simple way to remove a specific element from an array?

I''m looking for the equivalent of something like:

array.remove(number);

I have to use core JavaScript. Frameworks are not allowed.',3,4,'02/10/2020',1,9,3);


INSERT INTO answer(question_id,answer,users_id,answer_date) VALUES(3,'Find the index of the array element you want to remove using indexOf, and then remove that index with splice.

const array = [2, 5, 9];

console.log(array);

const index = array.indexOf(5);
if (index > -1) {
array.splice(index, 1);
}
// array = [2, 9]

console.log(array);
',5,'02/10/2020');

INSERT INTO question(question_title,question,module_id,users_id,question_date,answers,views,rate) VALUES('What do these three dots in React do?','What does the ... do in React (using JSX) and what is it called?

<Modal {...this.props} title=''Modal heading'' animation={false}>',4,4,'03/10/2020',0,7,2);


INSERT INTO question(question_title,question,module_id,users_id,question_date,answers,views,rate) VALUES(' TypeError: Object(…) is not a function Reactjs','I am trying to import fillCalendar() to my Calendar component but it throws "TypeError: Object(...) is not a function" error.

Here is my Calendar.js

import React, { Component } from ''react'';
import { fillCalendar } from ''../calendar.tools'' class Calendar extends Component {
constructor(props) {
super(props)
this.state = {
datesArray: fillCalendar(7, 2018),
date: new Date(),
monthIsOffset: false,
monthOffset: new Date().getMonth(),
yearOffset: new Date().getFullYear()
}
}
render() {
return (
...
)
}
}

calendar.tool.js where I extract fillCalender from

let fillCalendar = (month, year) => {
let datesArray = []
let monthStart = new Date(year,month,1).getDay()
let yearType = false;
let filledNodes = 0;
// Check for leap year
(year%4 === 0) ?
(year%100 === 0) ?
(year%400) ? yearType = true : yearType = false :
yearType = true :
yearType = false const monthArrays = yearType ? [31,29,31,30,31,30,31,31,30,31,30,31] : [31,28,31,30,31,30,31,31,30,31,30,31]
if (month === 0) { month = 12; }
let leadDayStart = monthArrays[month-1] - monthStart + 1 // Loop out lead date numbers for (let i = 0; i < monthStart; i++) {
datesArray.push({date: leadDayStart, type: "leadDate", id: "leadDate" + i})
leadDayStart++
filledNodes++
} ',3,4,'02/01/2020',1,4,2);



INSERT INTO answer(question_id,answer,users_id,answer_date) VALUES(5,'
Its just looks fine, you just have to export your function that''s it.

use

export let fillCalendar = (month, year) => {

instead of

let fillCalendar = (month, year) => {

Also keep in your mind that this error is mostly caused by import/export issues.  
',1,'03/01/2020');


INSERT INTO question(question_title,question,module_id,users_id,question_date,answers,views,rate) VALUES('Rendering a React component with logical && vs Ternary operator','When making a conditional rendering, the most common ways are using ternary operator or logical && operator while exploiting its short circuit evaluation.
My question is which one is preferred in tems of performance.

const isTrue = /* true or false */

const ConditionalRendering = () => (

<>

{isTrue && <Component />}

{isTrue ? <Component /> : null}

</> );',4,6,'03/01/2020',1,2,2);

INSERT INTO answer(question_id,answer,users_id,answer_date) VALUES(6,' I guess, both cases are the same. As per the React documentation: 

false, null, undefined and true are valid children. They simply don''t render. 

Which means this doesn''t affect the performance. But most developers prefer && to make their code pretty. ',2,'03/01/2020');


INSERT INTO question(question_title,question,module_id,users_id,question_date,answers) VALUES('What is causing undefined in my code?','I''ve recently started learning javascript and I am working on a for loop. But it throws undefined error.

Here is my code

var message;

for (var songs = 0; songs < playlist.length; songs++) {

message += ''\n'' + (songs+1) + ''. '' + playlist[songs] + ''\n'';

}

alert(message);',3,6,'02/01/2020',1);


INSERT INTO answer(question_id,answer,users_id,answer_date) VALUES(7,'You haven''t initialized your message variable with a value, so it is undefined. 

  Set it to an initial value, like so: 

var message = '';',3,'03/01/2020');

INSERT INTO question(question_title,question,module_id,users_id,question_date,answers) VALUES('What do these three dots in React do?','What does the ... do in this React (using JSX) code and what is it called?

<Modal {...this.props} title=''Modal heading'' animation={false}>',4,5,'03/01/2020',0);



INSERT INTO question(question_title,question,module_id,users_id,question_date,answers) VALUES('What is the best way to create a title in HTML?','I want to add a title to my website. Whats the best way to achieve that?',2,3,'01/01/2020',1);
INSERT INTO answer(question_id,answer,users_id,answer_date) VALUES(9,'Use the h1 tag',2,'01/01/2020');


INSERT INTO question(question_title,question,module_id,users_id,question_date,answers) VALUES('Git','what is git',1,3,'01/01/2020',0);
INSERT INTO question(question_title,question,module_id,users_id,question_date,answers) VALUES('HTML','what is HTML',2,3,'01/01/2020',2);
INSERT INTO question(question_title,question,module_id,users_id,question_date,answers) VALUES('Js','what is JavaScript',3,4,'02/01/2020',1);
INSERT INTO question(question_title,question,module_id,users_id,question_date,answers) VALUES('React','what is React',4,4,'03/01/2020',0);
INSERT INTO question(question_title,question,module_id,users_id,question_date,answers) VALUES('Node','what is NodeJs',5,5,'04/01/2020',0);
INSERT INTO question(question_title,question,module_id,users_id,question_date,answers) VALUES('SQL','what is SQL',6,1,'01/05/2020',0);
INSERT INTO question(question_title,question,module_id,users_id,question_date,answers) VALUES('MongoDB','what is MongDB',7,2,'05/01/2020',0);


INSERT INTO answer(question_id,answer,users_id,answer_date) VALUES(2,'HTML stands for Hyper Text Markup Language',2,'01/01/2020');
INSERT INTO answer(question_id,answer,users_id,answer_date) VALUES(2,'HTML is the standard markup language for Web pages',1,'01/01/2020');
INSERT INTO answer(question_id,answer,users_id,answer_date) VALUES(3,'JavaScript, often abbreviated as JS, is a programming language that conforms to the ECMAScript specification. JavaScript is high-level, often just-in-time compiled, and multi-paradigm. ',4,'03/01/2020');

