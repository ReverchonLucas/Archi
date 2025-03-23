const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const { MongoClient, ObjectId } = require('mongodb');
const axios = require('axios');

const PROTO_PATH = './todo.proto';
const MONGO_URL = 'mongodb://localhost:27017';
const DB_NAME = 'todoDB';

const packageDefinition = protoLoader.loadSync(PROTO_PATH);
const todoProto = grpc.loadPackageDefinition(packageDefinition).todo;

let db, productsCollection;

MongoClient.connect(MONGO_URL)
  .then(client => {
    db = client.db(DB_NAME);
    productsCollection = db.collection('products');
    console.log('✅ Connecté à MongoDB');
  })
  .catch(error => console.error('❌ Erreur de connexion à MongoDB:', error));

const tasks = [];

const addTask = (call, callback) => {
  const task = call.request;
  tasks.push(task);
  callback(null, { message: 'Task added successfully!' });
};

const getTasks = (call, callback) => {
  callback(null, { tasks });
};

const getGames = async (call, callback) => {
  try {
    const response = await axios.get('https://www.freetogame.com/api/games');
    callback(null, { games: response.data.map(game => ({ title: game.title, id: game.id })) });
  } catch (error) {
    callback({ code: grpc.status.INTERNAL, message: error.message });
  }
};

const addProduct = async (call, callback) => {
  try {
    const product = call.request;
    const result = await productsCollection.insertOne({
      ...product,
      _id: new ObjectId()
    });
    
    callback(null, { message: 'Product added successfully!' });
  } catch (error) {
    callback({ code: grpc.status.INTERNAL, message: error.message });
  }
};

const AllProducts = async (call, callback) => {
  try {
    const products = await productsCollection.find().toArray();
    const formattedProducts = products.map(product => ({
      id: product._id.toString(),
      name: product.name,
      description: product.description,
      price: product.price
    }));
    callback(null, { products: formattedProducts });
  } catch (error) {
    callback({ code: grpc.status.INTERNAL, message: error.message });
  }
};

const updateProduct = async (call, callback) => {
  try {
    const { id, ...updateData } = call.request;
    
    if (!ObjectId.isValid(id)) {
      callback({ code: grpc.status.INVALID_ARGUMENT, message: 'Invalid ID format' });
      return;
    }

    const result = await productsCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );

    if (result.matchedCount === 0) {
      callback({ code: grpc.status.NOT_FOUND, message: 'Product not found' });
      return;
    }

    callback(null, { message: 'Product updated successfully!' });
  } catch (error) {
    callback({ code: grpc.status.INTERNAL, message: error.message });
  }
};

const getProduct = async (call, callback) => {
  try {
    const { id } = call.request;

    // Vérifier si l'ID est valide
    if (!ObjectId.isValid(id)) {
      callback({ code: grpc.status.INVALID_ARGUMENT, message: 'Invalid ID format' });
      return;
    }

    // Convertir l'ID en ObjectId
    const product = await productsCollection.findOne({ _id: new ObjectId(id) });

    if (!product) {
      callback({ code: grpc.status.NOT_FOUND, message: 'Product not found' });
      return;
    }

    const formattedProduct = {
      id: product._id.toString(),
      name: product.name,
      description: product.description,
      price: product.price
    };

    callback(null, { product: formattedProduct });
  } catch (error) {
    callback({ code: grpc.status.INTERNAL, message: error.message });
  }
};



const deleteProduct = async (call, callback) => {
  try {
    const { id } = call.request;
    if (!ObjectId.isValid(id)) {
      callback({ code: grpc.status.INVALID_ARGUMENT, message: 'Invalid ID format' });
      return;
    }
    await productsCollection.deleteOne({ _id: new ObjectId(id) });
    callback(null, { message: 'Product deleted successfully!' });
  } catch (error) {
    callback({ code: grpc.status.INTERNAL, message: error.message });
  }
};

const server = new grpc.Server();
server.addService(todoProto.TodoService.service, { 
  addTask, 
  getTasks, 
  getGames,
  addProduct,
  AllProducts,
  updateProduct,
  deleteProduct,
  getProduct
});

server.bindAsync('0.0.0.0:50051', grpc.ServerCredentials.createInsecure(), () => {
  console.log('🚀 Server running on http://0.0.0.0:50051');
});