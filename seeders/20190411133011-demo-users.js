'use strict';
const faker = require('faker');

/**
 * Creates an array of n Number of user objects to be inserted into
 * the database.
 * @param numUsers Integer The number of users to generate
 */
const createUsers = (numUsers = 50) => {
  const arr = [];
  for(let i = 0; i < numUsers; i++) {
    const firstName = faker.name.firstName();
    const lastName = faker.name.lastName();
    const email = `${firstName}.${lastName}@gmail.com`;
    arr.push({
      firstName,
      lastName,
      email,
      createdAt: new Date(),
      updatedAt: new Date()
    });
  }

  return arr;
}

module.exports = {
  up: (queryInterface, Sequelize) => {
      return queryInterface.bulkInsert('users', createUsers(), {});
  },

  down: (queryInterface, Sequelize) => {
      return queryInterface.bulkDelete('users', null, {});
  }
};
