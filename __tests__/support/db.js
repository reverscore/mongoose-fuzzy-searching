const mongoose = require('mongoose');

const { Schema } = mongoose;
const { MongoMemoryServer } = require('mongodb-memory-server');

const getDBInstance = async () => MongoMemoryServer.create();

const getURL = (mongod) => {
  return process.env.MONGO_DB ? 'mongodb://localhost:27017/fuzzy-test' : mongod.getUri();
};

const openConnection = async (mongod) => {
  const uri = await getURL(mongod);

  const mongooseOpts = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    autoIndex: true,
  };

  mongoose.Promise = global.Promise;
  return mongoose.connect(uri, mongooseOpts);
};

const closeConnection = async (mongod) => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
  await mongod.stop();
};

const createSchema =
  (name, schemaStructure, options = {}) =>
  (plugin, fields, middlewares) => {
    const testName = name.replace(/ /g, '_').toLowerCase();

    const schema = new Schema(schemaStructure, {
      collection: `fuzzy_searching_test_${testName}`,
      ...options,
    });
    schema.plugin(plugin, {
      fields,
      middlewares,
    });

    return mongoose.model(`Model${testName}`, schema);
  };

const seed = (Model, obj) => {
  const doc = new Model(obj);
  return doc.save();
};

module.exports = {
  getDBInstance,
  openConnection,
  closeConnection,
  createSchema,
  seed,
};
