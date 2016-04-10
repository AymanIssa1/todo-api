var express = require('express');
var bodyParser = require('body-parser');
var _ = require("underscore");
var db = require('./db.js');

var app = express();
var PORT = process.env.PORT || 3000;
var todos = [];
var todoNextId = 1;



app.use(bodyParser.json());


app.get('/', function(request, response) {
    response.send('Todo API Root');
});


//GET /todos
app.get('/todos', function(request, response) {
    var query = request.query;

    //version 2
    var where = {};

    if (query.hasOwnProperty('completed') && query.completed == 'true') {
        where.completed = true;

    } else if (query.hasOwnProperty('completed') && query.completed == 'false') {
        where.completed = false;
    }


    if (query.hasOwnProperty('q') && query.q.length > 0) {
        where.description.toLowerCase() = {
            $like: '%' + query.q.toLowerCase() + '%'
        };
    }

    db.todo.findAll({
        where: where
    }).then(function(todos) {
        response.json(todos);
    }, function() {
        response.status(500).send();
    });

    //version 1
    // var filteredTodos = todos;

    // if (queryParams.hasOwnProperty('completed') && queryParams.completed === 'true') {
    //     filteredTodos = _.where(filteredTodos, {
    //         completed: true
    //     });
    // } else if (queryParams.hasOwnProperty('completed') && queryParams.completed === 'false') {
    //     filteredTodos = _.where(filteredTodos, {
    //         completed: false
    //     });
    // }

    // if (queryParams.hasOwnProperty('q') && queryParams.q.length > 0) {
    //     filteredTodos = _.filter(filteredTodos, function(todo) {
    //         return todo.description.toLowerCase().indexOf(queryParams.q.toLowerCase()) > -1;
    //     });
    // }

    // response.json(filteredTodos);
});


//GET/todos/id
app.get('/todos/:id', function(request, response) {
    var todoId = parseInt(request.params.id, 10);
    // var matchedTodo = _.findWhere(todos, {
    //     id: todoId
    // });

    //version 1
    // var matchedTodo;

    // todos.forEach(function (todo) {
    //     if (todoId === todo.id) {
    //         matchedTodo = todo;
    //     }
    // });

    // version 2
    // if (matchedTodo) {
    //     response.json(matchedTodo);
    // } else {
    //     response.status(404).send();
    // }

    // response.send('Asking for todo with id of ' + todoId);

    //version 3

    db.todo.findById(todoId).then(function(todo) {
        if (!!todo) {
            response.json(todo.toJSON());
        } else {
            response.status(404).send();
        }
    }, function(e) {
        response.status(500).send();
    });
});


app.post('/todos', function(request, response) {
    //var body = request.body;
    var body = _.pick(request.body, "description", "completed");

    // if (!_.isBoolean(body.completed) || !_.isString(body.description) || body.description.trim().length === 0) {
    //     return response.status(400).send();
    // }

    // body.description = body.description.trim();
    // body.id = todoNextId++;

    // todos.push(body);

    // response.json(body);

    db.todo.create(body).then(function(todo) {
        response.json(todo.toJSON());
    }, function(e) {
        response.status(400);
    });



});

app.delete('/todos/:id', function(request, response) {
    var todoId = parseInt(request.params.id, 10);
    // var matchedTodo = _.findWhere(todos, {
    //     id: todoId
    // });

    // if (!matchedTodo) {
    //     response.status(404).json({
    //         "error": "no todo found with that id"
    //     });
    // } else {
    //     todos = _.without(todos, matchedTodo);
    //     response.json(matchedTodo);
    // }

    // db.todo.findById(todoId).then(function () {
    //     if
    // })

    db.todo.destroy({
        where: {
            id: todoId
        }
    }).then(function(rowsDeleted) {
        if (rowsDeleted === 0) {
            response.status(404).json({
                error: 'No todo with id'
            });
        } else {
            response.status(204).send();
        }
    }, function() {
        response.status(500).send();
    })
});

app.put('/todos/:id', function(request, response) {
    var todoId = parseInt(request.params.id, 10);
    var matchedTodo = _.findWhere(todos, {
        id: todoId
    });

    var body = _.pick(request.body, 'description', 'completed');
    var validAttributes = {};

    if (!matchedTodo) {
        return response.status(404).send();
    }

    if (body.hasOwnProperty('completed') && _.isBoolean(body.completed)) {
        validAttributes.completed = body.completed;
    } else if (body.hasOwnProperty('completed')) {
        return response.status(400).send();
    }

    if (body.hasOwnProperty('description') && _.isString(body.description) && body.description.trim().length > 0) {
        validAttributes.description = body.description;
    } else if (body.hasOwnProperty('description')) {
        return res.status(400).send();
    }

    _.extend(matchedTodo, validAttributes);
    response.json(matchedTodo);
});

db.sequelize.sync().then(function() {
    app.listen(PORT, function() {
        console.log('Express listen on port ' + PORT + '!');
    });
})