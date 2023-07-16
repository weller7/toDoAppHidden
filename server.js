const express = require('express')
const app = express()
const MongoClient = require('mongodb').MongoClient
const PORT = 2121
require('dotenv').config()


let db,
    dbConnectionStr = "",
    dbName = 'todo'

MongoClient.connect(dbConnectionStr, { useUnifiedTopology: true })
    .then(client => {
        console.log(`Connected to ${dbName} Database`)
        db = client.db(dbName)
    })
    
app.set('view engine', 'ejs')
app.use(express.static('public'))
app.use(express.urlencoded({ extended: true }))
app.use(express.json())


app.get('/',async (request, response)=>{
    //only add documents that dont have the propery hiden:true
     const todoItems = await db.collection('todos').find({ 'hidden': { $ne:true } }).toArray()
     const itemsLeft = await db.collection('todos').countDocuments({completed: false})
     response.render('index.ejs', { items: todoItems, left: itemsLeft })
    // db.collection('todos').find().toArray()
     // .then(data => {
     //     db.collection('todos').countDocuments({completed: false})
     //     .then(itemsLeft => {
     //         response.render('index.ejs', { items: data, left: itemsLeft })
     //     })
     // })
     // .catch(error => console.error(error))
 })


//only shows the ones that are not completed
// app.get('/',async (request, response)=>{
//     const todoItems = await db.collection('todos').find({ $ne: hidden }).toArray()
//     const itemsLeft = await db.collection('todos').countDocuments({completed: false})
//     response.render('index.ejs', { items: todoItems, left: itemsLeft })
//     // db.collection('todos').find().toArray()
//     // .then(data => {
//     //     db.collection('todos').countDocuments({completed: false})
//     //     .then(itemsLeft => {
//     //         response.render('index.ejs', { items: data, left: itemsLeft })
//     //     })
//     // })
//     // .catch(error => console.error(error))
// })


app.post('/addTodo', (request, response) => {
    db.collection('todos').insertOne({thing: request.body.todoItem, completed: false, hidden: false})
    .then(result => {
        console.log('Todo Added')
        response.redirect('/')
    })
    .catch(error => console.error(error))
})

app.put('/markComplete', (request, response) => {
    db.collection('todos').updateOne({thing: request.body.itemFromJS},{
        $set: {
            completed: true
          }
    },{
        sort: {_id: -1},
        upsert: false
    })
    .then(result => {
        console.log('Marked Complete')
        response.json('Marked Complete')
    })
    .catch(error => console.error(error))

})

app.put('/markUnComplete', (request, response) => {
    db.collection('todos').updateOne({thing: request.body.itemFromJS},{
        $set: {
            completed: false
          }
    },{
        sort: {_id: -1},
        upsert: false
    })
    .then(result => {
        console.log('Marked Complete')
        response.json('Marked Complete')
    })
    .catch(error => console.error(error))

})

//will change the property of hidden in the db and they wont appear to the user
//but they'll stay in the db
app.put('/markHidden', (request, response) => {
    db.collection('todos').updateOne({thing: request.body.itemFromJS},{
        $set: {
            hidden: true
          }
    },{
        sort: {_id: -1},
        upsert: false
    })
    .then(result => {
        console.log('Marked Hidden')
        response.json('Marked Hidden')
    })
    .catch(error => console.error(error))

})

// app.delete('/deleteItem', (request, response) => {
//     db.collection('todos').deleteOne({thing: request.body.itemFromJS})
//     .then(result => {
//         console.log('Todo Deleted')
//         response.json('Todo Deleted')
//     })
//     .catch(error => console.error(error))

// })

app.listen(process.env.PORT || PORT, ()=>{
    console.log(`Server running on port ${PORT}`)
})