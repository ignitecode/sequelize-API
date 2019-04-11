# Sequelize CRUD API Lesson

<br>

![](https://i.imgur.com/yvEYhnZ.png)

<br>

## Objectives

- Create CRUD API routes and methods for a single resource
- Connect Sequelize to an exisiting Postgres database
- Explain the advantages of using Sequelize vs writing SQL queries from scratch
- Learn to use Postman to test our routes before building a view
- Describe how to create a one to many relationship using Sequelize associations

<br>

## What is Sequelize?

[Sequelize](http://docs.sequelizejs.com/) is a promise-based ORM (Object Relational Mapper) for Node.js v4 and up. It supports the dialects PostgreSQL, MySQL, SQLite and MSSQL and features solid transaction support, relations, read replication and more.

With jQuery, we created jQuery objects that wrapped our DOM nodes with helpful methods and properties. Similarily, Sequelize creates objects that wrap our data in extra methods, properties and Promises. Additionally, since Sequelize is written in Javascript, we'll use Object Oriented Programming to create our SQL queries.

For example, to find all the instances of a user in a database:

```js
// SQL query 
SELECT * FROM users;

// Sequelize query
User.findAll()
```

Sequelize is super helpful when dealing with asynchronicity and associations (joins) between tables.

<br>

## Sequelize CLI

The Sequelize CLI (command line interface) makes it easy to add Sequelize to an existing app. 

- [Sequelize CLI GitHub](https://github.com/sequelize/cli)
- [Sequelize CLI Docs](http://docs.sequelizejs.com/manual/tutorial/migrations.html)


To install globally, run this Terminal command from any directory:

`npm install -g sequelize-cli`


#### Sequelize Init in an App

To use the Sequelize CLI we run `sequelize init` in the root directory of our app. This command will create the following files and folders:

![](https://i.imgur.com/5gyMcQv.png)

We'll be walking through these in more detail.

<br>

## Let's Build A New App for this lesson!

1. `express sequelize-express-lesson-app --ejs --git`
2. `cd` and `npm install`
- `npm install --save sequelize pg pg-hstore`
	- [`pg`](https://www.npmjs.com/package/pg) is the PostgreSQL client for Node.js. 
	- [`pg-hstore`](https://www.npmjs.com/package/pg-hstore) is a node package for serializing and deserializing JSON data to hstore format. It allows us to save non-relational data (objects) in a relational database.
- `createdb sequelize-express-lesson-app-development`
	- This is the Postgres database we'll create for this lesson
	- Make sure you run this from the command line *NOT* from inside `psql`  
	- How can we confirm that the database was created?
- `sequelize init`
	- This will create the files and folders listed above^^
- In our `package.json`, update the npm start script to `nodemon ./bin/www` 

<br>

## Configure database details

One of the files + folders that the Sequelize CLI created for us is `config/config.json`. Typically, we'd have 3 seperate databases for each environment (test, development, production). Why not use the same database for each?

Let's update the file to this:

```js
{
  "development": {
    "database": "sequelize-express-lesson-app-development",
    "host": "127.0.0.1",
    "dialect": "postgres"
  }
}
```

What did we change?

- _Optional_: We're only using a development database today so we removed the other environments.
- We deleted `username` and `password` fields because we don't need them today.
- We make sure the `database` value is the one we created.
- We change the dialect to `postgres` since that's the type of database we're using.

<br>

## Create a `User` model

Sequelize CLI created a `models/index.js` file for us. There is a lot of plumbing in here! Mainly, this file...

- Imports the Sequelize module once and shares it between all models we create
- Helps to set up associations between models
- DRYs up our code. Importing this one file will give us access to all models.

Let's use the Sequelize CLI `model:generate` command to create a User model with `firstName`, `lastName`, and `email` String attributes:


`sequelize model:generate --name user --attributes firstName:string,lastName:string,email:string`

- **IMPORTANT**: Make sure that there are **NO** spaces after the commas.

![](https://i.imgur.com/AMN35p4.png)

Two files were created for us the first is the `models/user.js` model file

<br>

#### `models/user.js`

Here is what the CLI generated for us:

```js
// models/user.js

'use strict';
module.exports = (sequelize, DataTypes) => {
  var User = sequelize.define('user', {
    firstName: DataTypes.STRING,
    lastName: DataTypes.STRING,
    email: DataTypes.STRING
  }, {});
  User.associate = function(models) {
    // associations can be defined here
  };
  return User;
};
```

This file describes what attributes and methods each instance of a User should have in our database. How are attributes stored in our database?

<br>

#### `migrations/<TIMESTAMP>-create-user.js`

Migrations are how we manage the state of our database. Notice that each file is prefaced with a timestamp. You'll learn more about migrations tomorrow. Here's the file:

```js
'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('users', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      firstName: {
        type: Sequelize.STRING
      },
      lastName: {
        type: Sequelize.STRING
      },
      email: {
        type: Sequelize.STRING
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('users');
  }
};
```

This file tells the database to create a `users` table. It also defines each column's name and Sequelize datatype.

<br>


#### Run the Migrations

So far we've created a migration file, but our database has not recieved the instructions. We need to run our migrations folder to tell the database what we want it to look like. _You'll go over this more in depth tomorrow._ Let's run this command from the root directory of your app: 

`sequelize db:migrate` 

This will run our `create-user` migration file.

![](https://i.imgur.com/bakIvjv.png)

Just to confirm, let's go into the `psql` shell and confirm that a `users` table has been created.

1. `psql` - You can run this command from any directory to enter the Postgres shell
2. `\l` - See the list of databases
3. `\c sequelize-express-lesson-db-development` - Connect to our database	
4. `\dt` - This will show the database tables

<br>

## CFU

1. What files did `model:generate` create for us?
2. How will our app use the model file?
3. What are migrations used for?
4. What are the 4 folders that the Sequelize CLI created for us?
5. What do the `up` and `down` methods in our migration file do?
6. TRUE or FALSE: Generating a migration file automatically alters the schema of the database?

<br>

## Create database seeds for User

The last folder that Seqelize created for us is a seeders folder. This is where we can add seeds for our database. Why might seeds be useful?

Let's have the Sequelize CLI scaffold a timestamped file for `User` seeds in the seeders folder:

`sequelize seed:generate --name demo-users`

This created an empty seeders file. Fill it in like so:

```js
'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {  
      return queryInterface.bulkInsert('users', [
        {
          firstName: 'Marc',
          lastName: 'Wright',
          email: 'marc@ga.co',
          createdAt: Sequelize.literal('NOW()'),
          updatedAt: Sequelize.literal('NOW()')
        },
        {
          firstName: 'Diesel',
          lastName: 'Wright',
          email: 'diesel@bark.co',
          createdAt: Sequelize.literal('NOW()'),
          updatedAt: Sequelize.literal('NOW()')
        }
      ], {});

  },

  down: (queryInterface, Sequelize) => {
      return queryInterface.bulkDelete('users', null, {});
  }
};
```

<br>

#### What's going on here!?

- When we run this seeders file, the `up` method will run. If we ever want to undo or rollback these seeds, the `down` method will run.
- `queryInterface.bulkInsert` is an efficent Sequelize method to dump an array of objects into our database all at once.
- We're also adding some `createdAt` and `updatedAt` fields since those are required.

<br>

##### Seed your Database Table

Run `sequelize db:seed:all` to seed your `users` table.

##### Confirm in `psql`

Run `SELECT * FROM users;`

![](https://i.imgur.com/QzarwDy.png)

<br>

## Add Sequelize queries inside our routes

[Sequelize Queries](http://docs.sequelizejs.com/manual/tutorial/querying.html)

We'll use the exisiting `routes/users` controller that the Express Generator gave us to build out our Sequelize routes.

<br>

### Require the User model in the users controller

First things first, we need to let our controller know about the `User` model. We'll `require` the Sequelize `models/index.js` file. This file essentally `exports` an object that contains a property for each model.

```js
// At the top of the users controller

var User = require('../models').user
```

<br>

### INDEX Route

We'll build an index route like we always have, but inside, we'll grab all the users from the database using `User.findAll()`. We'll chain a `.then()` to this method since it'll return a promise with the data.

```js
router.get('/', (req, res, next) => {
  User.findAll()
  .then(users => res.json(users))
  .catch(err => res.json(err))
});
```

Now, fire up your server with `npm run start` and navigate to `localhost:3000/users`

![](https://i.imgur.com/F6r1ais.png)

**Bonus:** What if we want to limit the specific fields returned? We can pass in an object with specific fields we want to include or exclude. [Sequelize Queries](http://docs.sequelizejs.com/manual/tutorial/querying.html)

What other fields might we want to exclude?

```js
...
  User.findAll({
    attributes: { exclude: ['createdAt', 'updatedAt'] }  
  }) 
```

![](https://i.imgur.com/l5jUwX8.png)


<br>

### SHOW Route

There are several ways to query an instance of a user. For example, we could use a `where` statement to search users by `firstName`, `email`, etc. We can also use the `.findById` method to search by a unique `id` in the database.

```js
router.get('/:id', (req, res) => {
  User.findById(req.params.id)
    .then(user => res.json(user))
    .catch(err => res.json(err))
})
```

![](https://i.imgur.com/768STTW.png)

<br>

### POST Route

What are the two steps/routes involved to `create` a new instance of something? We have enough to worry about without adding a form/view/new route just to test our ability to create a new user. There must be an easier way?!

We're gonna use a tool called [Postman](https://www.getpostman.com/) that gives us the ability to test a variety of HTTP requests other than basic `GET`. Go to the [Postman](https://www.getpostman.com/) link and click on "Download the App".

It may ask you to sign up, but don't worry, it's free!

![](https://i.imgur.com/3VabckX.png)

<br>

#### Build the basic POST route

In our users controller, go ahead and build a basic post route that will `res.json` the `req.body`

```js
router.post('/', (req, res) => {
  res.json(req.body)
})
```

<br>


#### Test the route with Postman

Open Postman and create a POST request like so.

![](https://i.imgur.com/fKYXri8.png)

**Very Important**

- Make sure that you select the HTTP verb `POST` from the dropdown menu.
- Make sure you're sending the `POST` request to `localhost:3000/users`
- Make sure that you select `x-www-form-urlencoded`. This mimics how data is formatted when submitted from a form in the browser.
- Make sure you've correctly spelled your field names.

If you see a `json` object returned then your route is working! However, why was an `id` field not returned?

<br>

#### Use Sequelize to create a new user

Now let's use Sequelize to our `POST` route to actually create a new user instance in our database.

```js
router.post('/', (req, res) => {
  User.create(req.body)
  .then(user => res.json(user))
  .catch(err => res.json(err))
})
```

<br>

Go ahead and SEND your Postman `POST` request again. You should see the SQL query in your server logs. Check out that Sequelize magic!

![](https://i.imgur.com/LZYwApS.png)

<br>

And you should see a response of the new user in Postman with an `id` and timestamps.

![](https://i.imgur.com/wM820s9.png)


<br>

## YOU DO

With your knowledge of REST-ful routing, add `PUT` and `DELETE` routes by using the [Sequelize documentation](http://docs.sequelizejs.com/manual/tutorial/querying.html)

<br>

### PUT Route

```js
router.put('/:id', (req, res) => {
  User.findById(req.params.id)
  .then(userToUpdate => {
    return userToUpdate.updateAttributes(req.body)
  })
  .then(updatedUser => {
    res.json(updatedUser)
  })
  .catch(err => {
    res.json(err)
  })
})
```

<br>

![](https://i.imgur.com/UTWuqrs.png)

<br>

Or, if we wanted to update specific fields/columns.

```js
router.put('/:id', (req, res) => {
  User.findById(req.params.id)
  .then(userToUpdate => {
    return userToUpdate.updateAttributes({
      firstName: req.body.firstName
    })
  })
  .then(updatedUser => {
    res.json(updatedUser)
  })
  .catch(err => {
    res.json(err)
  })
})
```

<br>

### DELETE Route

```js
router.delete('/:id', (req, res) => {
  User.destroy({ 
    where: { id: req.params.id } 
  })
  .then(() => {
    res.json({message: "User Deleted!"})
  })
})
```

<br>


![](https://i.imgur.com/eVd3Ws4.png)

<br>

## Conclusion

Congrats! You just created a REST-ful API using Sequelize. You'll add views this afternoon.

There are many more ORMs and ODMs out there (Bookshelf/Javascript/SQL, Active Record/Ruby/SQL, Mongoose/Javascript/No-SQL).


<br><br>

## If there's time - Associations

Finished code can be found here (also refactored into async/await): https://git.generalassemb.ly/coda3-curriculum/sequelize-cli-intro/tree/async-await

### Create a Pet model

`sequelize model:generate --name pet --attributes name:string,userId:integer`

```js
// models/pet.js

'use strict';
module.exports = (sequelize, DataTypes) => {
  var pet = sequelize.define('pet', {
    name: DataTypes.STRING,
    userId: DataTypes.INTEGER
  }, {});
  pet.associate = function(models) {
    pet.belongsTo(models.user, {foreignKey: 'userId'})
  };
  return pet;
};
```

`sequelize db:migrate`

<br>

### Set-up the associations

Create some Pet seeders

`sequelize seed:generate --name demo-pets`

```js
'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {

      return queryInterface.bulkInsert('pets', [
        {
          name: "Diesel",
          userId: 1,
          createdAt: Sequelize.literal('NOW()'),
          updatedAt: Sequelize.literal('NOW()')
        },
        {
          name: "Charlie",
          userId: 2,
          createdAt: Sequelize.literal('NOW()'),
          updatedAt: Sequelize.literal('NOW()')
        }
      ], {});

  },

  down: (queryInterface, Sequelize) => {

      return queryInterface.bulkDelete('pets', null, {});

  }
};
```

### Reset our database

We've been adding and deleting data all morning. Let's reset our database so that our seeders match up.

- `dropdb sequelize-express-lesson-app-development`
- `createdb sequelize-express-lesson-app-development`
- `sequelize db:migrate`
- `sequelize db:seed:all`

Confirm that your seeds were planted in `psql` after conecting to your database: `SELECT * FROM pets;`


#### Set up the associations

Let's create a 1:M association where a User has many Pets and a Pet belongs to a User

```js
// models/user.js

...

user.associate = function(models) {
    user.hasMany(models.pet, {foreignKey: 'userId'})
  };
  
  
// models/pet.js

  pet.associate = function(models) {
    pet.belongsTo(models.user, {foreignKey: 'userId'})
  };
```

#### Import the Pet Model

```js
// At the top of the users controller

var User = require('../models').user
var Pet = require('../models').pet
```

#### User show with Pets

```js
router.get('/:id', (req, res) => {
  User.findById(req.params.id, {
    include: [ Pet ]
  })
  .then(userPets => {
    res.json(userPets)
  })
})
```

#### Getter Methods

```js
.then(user => {
  console.log(user)
  return user.getPets()
})
```

#### Create a new Pet associated with a User

```js
router.post('/:id/new-pet', (req, res) => {
  let newPet = Pet.build(req.body)
  newPet.userId = req.params.id
  newPet.save()
    .then(savedNewPet => {
      res.json(savedNewPet)
    })
})
```
