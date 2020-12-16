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
answered INT DEFAULT 0 NOT NULL
);

CREATE TABLE answer (
id SERIAL PRIMARY KEY,
question_id INT REFERENCES question(id) ,
answer TEXT NOT NULL,
users_id INT REFERENCES users(id),
answer_date DATE
);


INSERT INTO users(name,email,password) VALUES('Akhil','khieth@yahoo.com',' $2b$10$TKUAzbf516ou/yWRqNZFXephWMvj0..uP/3vJUGg2NG3GSMED80xa');
INSERT INTO users(name,email,password) VALUES('Laura','Lora@yahoo.com',' $2b$10$6HBswsNlRkwOOfNOs0pBG.VxDKY8s4pjXbIsZhn2H01D6A7ReLEza');
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


INSERT INTO question(question_title,question,module_id,users_id,question_date,answered) VALUES('Git','what is git',1,3,'01/01/2020',0);
INSERT INTO question(question_title,question,module_id,users_id,question_date,answered) VALUES('HTML','what is HTML',2,3,'01/01/2020',2);
INSERT INTO question(question_title,question,module_id,users_id,question_date,answered) VALUES('Js','what is JavaScript',3,4,'02/01/2020',1);
INSERT INTO question(question_title,question,module_id,users_id,question_date,answered) VALUES('React','what is React',4,4,'03/01/2020',0);
INSERT INTO question(question_title,question,module_id,users_id,question_date,answered) VALUES('Node','what is NodeJs',5,5,'04/01/2020',0);
INSERT INTO question(question_title,question,module_id,users_id,question_date,answered) VALUES('SQL','what is SQL',6,1,'01/05/2020',0);
INSERT INTO question(question_title,question,module_id,users_id,question_date,answered) VALUES('MongoDB','what is MongDB',7,2,'05/01/2020',0);


INSERT INTO answer(question_id,answer,users_id,answer_date) VALUES(2,'HTML stands for Hyper Text Markup Language',2,'01/01/2020');
INSERT INTO answer(question_id,answer,users_id,answer_date) VALUES(2,'HTML is the standard markup language for Web pages',1,'01/01/2020');
INSERT INTO answer(question_id,answer,users_id,answer_date) VALUES(3,'JavaScript, often abbreviated as JS, is a programming language that conforms to the ECMAScript specification. JavaScript is high-level, often just-in-time compiled, and multi-paradigm. ',4,'03/01/2020');
























