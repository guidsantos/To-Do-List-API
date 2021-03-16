const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers

  const user = users.find(user => user.username === username)

  if (!user) {
    return response.status(401).json({ error: "This user dont exists!" })
  }

  request.user = user

  return next()

}

app.post('/users', (request, response) => {
  const { name, username } = request.body

  const usernameExist = users.find(user => user.username === username)

  if (usernameExist) {
    return response.status(400).json({ error: "Invalid Username" })
  }

  const user = {
    id: uuidv4(),
    name,
    username,
    todos: []
  }

  users.push(user)

  return response.status(201).json(user)
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request

  return response.status(201).json(user.todos)
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request
  const { title, deadline } = request.body

  const idNumber = uuidv4()

  const todo = {
    id: idNumber,
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date()
  }

  user.todos.push(todo)

  return response.status(201).json(todo)

});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body
  const { id } = request.params
  const { user } = request

  const todo = user.todos.find(todo => todo.id === id)

  if (!todo) {
    return response.status(404).json({ error: "ID does match!" })
  }

  todo.title = title
  todo.deadline = new Date(deadline)

  const todoInfo = {
    deadline: todo.deadline,
    done: todo.done,
    title: todo.title
  }

  return response.status(201).json(todoInfo)

});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { id } = request.params
  const { user } = request

  const todo = user.todos.find(todo => todo.id === id)

  if (!todo) {
    return response.status(404).json({ error: "ID does match!" })
  }

  todo.done = true

  return response.status(200).json(todo)
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { id } = request.params
  const { user } = request

  const todo = user.todos.find(todo => todo.id === id)

  if (!todo) {
    return response.status(404).json({ error: "ID does match!" })
  }

  user.todos.splice(todo, 1)

  return response.status(204).send()
});

module.exports = app;