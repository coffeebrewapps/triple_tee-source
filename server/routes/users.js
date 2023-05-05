'use strict'

const shared = require('./shared');
const usersStore = require('../stores/users');

exports.list = shared.list(usersStore);
exports.view = shared.view(usersStore);
exports.update = shared.update(usersStore);
exports.remove = shared.remove(usersStore);
