module.exports = ({ config, logger, utils, uploader }) => {
  function list(store) {
    return function(req, res) {
      const params = req.query;
      logger.log(`Requesting all data`, params);
      res.send(store.list(params));
    };
  };

  function create(store) {
    return function(req, res) {
      const params = req.body;

      logger.log(`Creating record`, params);
      const result = store.create(params);

      if (result.success) {
        res.status(201).send(result);
      } else {
        res.status(400).send(result);
      }
    };
  };

  function view(store) {
    return function(req, res) {
      const params = req.query;
      const id = req.params.id;
      logger.log(`Viewing record`, { id, params });

      res.send(store.view(id, params));
    };
  };

  function update(store) {
    return function(req, res) {
      const params = req.body;
      const id = req.params.id;

      logger.log(`Updating record`, { id, params });
      const result = store.update(id, params);

      if (result.success) {
        res.status(200).send(result);
      } else {
        res.status(400).send(result);
      }
    };
  };

  function remove(store) {
    return function(req, res) {
      const params = req.params;
      const id = params.id;
      logger.log(`Removing record`, { id });
      const result = store.remove(id);

      if (result.success) {
        res.status(200).send(result);
      } else {
        res.status(400).send(result);
      }
    };
  };

  function download(store) {
    return function(req, res) {
      const params = req.query;
      logger.log(`Downloading data`, params);
      const data = store.list(params);
      const filename = `${store.modelClass}.json`;
      res.send({
        filename,
        data: JSON.stringify(data),
      });
    };
  };

  function downloadPdf(templateType, store) {
    const pdf = require('./pdf')(templateType, store, logger);
    return pdf.downloadPdf;
  }

  function withFileUpload(fileField, cb) {
    return function(req, res) {
      const fileUpload = uploader.single(fileField);
      fileUpload(req, res, (err) => {
        if (err) {
          const errors = {};
          errors[fileField] = ['invalidFile'];
          res.status(400).send({
            success: false,
            errors
          });
        } else {
          cb(req, res);
        }
      });
    };
  }

  return {
    list,
    create,
    view,
    update,
    remove,
    download,
    downloadPdf,
    withFileUpload,
  };
};
