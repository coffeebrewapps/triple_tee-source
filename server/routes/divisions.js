'use strict'

const express = require('express');
const router = express.Router();

const shared = require('./shared');
const divisionsStore = require('../stores/divisions');

router.get('/download', shared.download(divisionsStore));
router.get('/', shared.list(divisionsStore));
router.get('/:id', shared.view(divisionsStore));
router.post('/', shared.create(divisionsStore));
router.put('/:id', shared.update(divisionsStore));
router.delete('/:id', shared.remove(divisionsStore));

module.exports = {
  router
}
