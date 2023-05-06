'use strict'

const express = require('express');
const router = express.Router();

const shared = require('./shared');
const usersStore = require('../stores/users');

router.get('/download', shared.download(usersStore));
router.get('/', shared.list(usersStore));
router.get('/:id', shared.view(usersStore));
router.post('/', shared.create(usersStore));
router.put('/:id', shared.update(usersStore));
router.delete('/:id', shared.remove(usersStore));

module.exports = {
  router
}
