
const express = require('express');
const cors = require('cors');
const mysql = require('mysql');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Initialize Express app
const app = express();
app.use(cors());

// Set up body-parser middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));






const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'dhanish@12345007',
    database: 'hack' 
});

connection.connect((err) =>{
    if(err){
        console.log("Dhanish",err);
    }else{
        console.log('Connection Success')
    }
})
connection.query('update userdata set market_value = skill1+skill2+skill3+(marks/10)');

app.get('/users',(req,res) =>{
    connection.query('SELECT * from userData',(err,result) =>{
        res.send({status:'ok',statusText:'My Application',userData:result});
    })
});

app.get('/users/:id',(req,res) =>{
    console.log(req);
    const {id} = req.params;
connection.query('update userdata set market_value = skill1+skill2+skill3+(marks/10)');
    connection.query('select * from userdata where id=?',[id],(err,result) =>{
        if(err){
            throw err
        }else{
            res.send(result[0]);
        }
    })
})

app.post('/users/login',(req,res)=>{
    const { email, pwd } = req.body;

    console.log(req.body);

  // Check if user exists in database
  connection.query('SELECT * FROM userdata WHERE email = ?', [email], (err, results) => {
    if (err) {
      res.status(500).send('Error logging in');
    } else if (results.length === 0) {
      res.status(401).send('Invalid email or pwd');
    } else {
      const user = JSON.parse(JSON.stringify(results))[0];

      console.log(user);

      // Compare pwds
      bcrypt.compare(pwd, user.pwd, (err, isMatch) => {
        // if (err) throw err;
        console.log(err);

        if (isMatch) {
          // Generate JWT token
          const token = jwt.sign({ id: user.id, email: user.email }, 'Batman', { expiresIn: '1h' });
          delete user.pwd;
          res.status(200).json({ user,token });
        } else {
          res.status(401).send('Invalid email or pwd');
        }
      });
    }

    
})
});

app.put('/users/iq-marks',(req,res) =>{
    const {marks,id} = req.body;

    connection.query('UPDATE userdata set marks=? where  id=?',[marks,id],(err,result) =>{if(err) {throw err }else{
        res.send(result);
    }})
});

app.put('/users/skill',(req,res) =>{
    const {marks,id,tag} = req.body;
    let dataset = 'skill3';
    if(tag === 'html'){
        dataset = 'skill1'
    }else if(tag === 'css'){
        dataset='skill2'
    }

    connection.query(`UPDATE userdata set ${dataset}=? where  id=?`,[marks,id],(err,result) =>{if(err) {throw err }else{
        res.send(result);
    }})
})

app.post("/users/signup",(req,res)=>{
    const { email, pwd,
        LastName,
        FirstName ,
        marks, 
        mobile, 
        market_value,
        interest, 
     } = req.body;

     console.log(req.body);
    
  // Hash password
  bcrypt.hash(pwd, 3, (err, hashedPassword) => {
    if (err) throw err;

    // Insert user into database
    const query = 'INSERT INTO UserData (email, pwd,LastName,FirstName ,marks, mobile, market_value,interest) VALUES (?,?,?,?,?,?,?,?)';
    connection.query(query, [email,
        hashedPassword,
        LastName,
        FirstName ,
        marks, 
        mobile, 
        market_value,
        interest, hashedPassword], (err, result) => {
      if (err) {
        console.log(err);
        res.status(500).send('Error registering user');
      } else {
        console.log(result);
        res.status(201).send('User registered successfully');
      }
    });
  });
})

app.post("/customer/signup",(req,res)=>{
    const { 
        name ,
        product ,
        budget ,
        daysToComplete ,
        email,
        pwd
     } = req.body;

     console.log(req.body);
    
  // Hash password
  bcrypt.hash(pwd, 3, (err, hashedPassword) => {
    if (err) throw err;

    // Insert user into database
    const query = 'INSERT INTO customerData (name ,product ,budget ,daysToComplete ,pwd,email) VALUES (?,?,?,?,?,?)';
    connection.query(query, [name ,
        product ,
        budget ,
        daysToComplete ,
        hashedPassword,email], (err, result) => {
      if (err) {
        console.log(err);
        res.status(500).send('Error registering Customer');
      } else {
        console.log(result);
        res.status(201).send('Customer registered successfully');
      }
    });
  });
});


app.post('/customer/login',(req,res)=>{
    const { email, pwd } = req.body;

    console.log(req.body);

  // Check if user exists in database
  connection.query('SELECT * FROM customerData WHERE email = ?', [email], (err, results) => {
    if (err) {
      res.status(500).send('Error logging in');
    } else if (results.length === 0) {
      res.status(401).send('Invalid email or pwd');
    } else {
      const user = JSON.parse(JSON.stringify(results))[0];

      console.log(user);

      // Compare pwds
      bcrypt.compare(pwd, user.pwd, (err, isMatch) => {
        // if (err) throw err;
        console.log(err);

        if (isMatch) {
          // Generate JWT token
          const token = jwt.sign({ id: user.id, email: user.email }, 'Batman', { expiresIn: '1h' });
          delete user.pwd;
          res.status(200).json({ user,token });
        } else {
          res.status(401).send('Invalid email or pwd');
        }
      });
    }

    
})
});

app.get('/project/allocation/:market_value',(req,res) =>{
    const {market_value} = req.params;
    console.log(market_value);
    let maxVal = 60000;
    let per = 100 - parseInt(market_value);
    let debt = (maxVal *per)/100;
    let sal = maxVal - debt;
    connection.query('select * from customerData',(err,result) => {
        if(err){
            throw err;
        }else{
            let custReport = JSON.parse(JSON.stringify(result));
            console.log(custReport);

            
    let minQuote = custReport && custReport.filter(vals =>{
        return (vals.budget * 20)/100 <= sal
    });
    console.log('hackblr',minQuote);

    res.send({status:'ok',projects:minQuote});
        }
    })

})

app.listen(1997,()=>{
    console.log('Server is Running')
})