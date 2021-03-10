const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(req, res, next) {

    const { username } = req.headers;    
    
    const user = users.find((user) => user.username === username);

    if (!user) {
      return res.status(400).json({ error: 'Usuário já existente'})
    }

    req.user = user;

    return next();
}

app.post('/users', (req, res) => { // [X]
  
  const { name, username } = req.body;

  const verifyExistsUser = users.some((user) =>  user.username === username );

  if (verifyExistsUser) {
    return res.status(400).json({ error: 'Usuário já existente'})
  }

  const user = {
    id: uuidv4(),
    name,
    username,
    todos:[]
  };

  users.push(user);

  return res.status(201).json(user);


});

app.get('/all/users', (_req, res) =>{ // [X]
  return res.status(200).json(users);
});

app.get('/todos', checksExistsUserAccount, (req, res) => { // [X]
  
  const { user } = req;

  return res.status(200).json(user.todos);

});

app.post('/todos', checksExistsUserAccount, (req, res) => { // [X]
  
  const { user } = req;
  const { title, deadline } = req.body;

  const todo = {
    id: uuidv4(),
    title,
    done: false,
    deadline:new Date(deadline),
    created_at: new Date()
  }

  user.todos.push(todo);

  return res.status(201).json(todo);

});

app.put('/todos/:id', checksExistsUserAccount, (req, res) => { // [X]
    
  const { title, deadline } = req.body;
  const { id } = req.params;
  const { user } = req;

  if (user.todos.some((todo) => todo.id === id)) {
        user.todos.forEach(todo => {
          if (todo.id === id) {       
              todo.title = title;
              todo.deadline = deadline;

              return res.status(200).json(todo);
        }
      });
  } else {
    return res.status(404).json({error : 'Tarefa inexistente'});
  }

});

app.patch('/todos/:id/done', checksExistsUserAccount, (req, res) => { // [X]
    const { user } = req;
    const { id } = req.params;

    if (user.todos.some((todo) => todo.id === id)) {
      user.todos.forEach(todo => {
        if (todo.id === id) {       
            todo.done = true;

            return res.status(200).json(todo);
        }
      })
    } else {
      return res.status(404).json({error : 'Tarefa não encontrada'});
    }
});

app.delete('/todos/:id', checksExistsUserAccount, (req, res) => { // [X]

  const { id } = req.params;
  const { user } = req;

  if (!user.todos.some((todo) => todo.id === id)) {
        
      return res.status(404).json({error : 'Tarefa inexistente'});
        
  } else {
      user.todos.splice(id, 1);
      
      return res.status(204).json({message: 'Tarefa excluída'});
  }

});

module.exports = app;