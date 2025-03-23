const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');


const PROTO_PATH = './todo.proto';
const packageDefinition = protoLoader.loadSync(PROTO_PATH);
const todoProto = grpc.loadPackageDefinition(packageDefinition).todo;

const client = new todoProto.TodoService('localhost:50051', grpc.credentials.createInsecure());


client.AddTask({ id: '1', description: 'Learn gRPC' }, (err, response) => {
  if (err) console.error('Error adding task:', err);
  else console.log(response.message);
});


client.GetTasks({}, (err, response) => {
  if (err) console.error('Error getting tasks:', err);
  else console.log('Tasks:', response.tasks);
});


client.GetGames({}, (err, response) => {
  if (err) console.error('Error getting games:', err);
  else console.log('Games:', response.games);
});


const newProduct1 = { name: 'Laptop', description: 'High-end gaming laptop', price: 1500.99 };
const newProduct2 = { name: 'Smartphone', description: 'Latest model with 5G support', price: 1859.20 };


client.AddProduct(newProduct1, (err, response) => {
  if (err) console.error('Error adding product:', err);
  else {
    console.log(response.message);
  }
});
client.AddProduct(newProduct2, (err, response) => {
  if (err) console.error('Error adding product:', err);
  else {
    console.log(response.message);
  }
});


client.AllProducts({}, (err, response) => {
  console.log('Products:', response.products);
  if (response.products.length > 2) {
    const product1 = response.products[0];
    const product2 = response.products[1];
    const product3 = response.products[2];
    const updatedProduct = { 
      id: product1.id,
      name: product1.name,
      description: product1.description,
      price: 1800.99
    };

    client.UpdateProduct(updatedProduct, (err, response) => {
      if (err) { 
        console.error('Error updating product:', err);
      } else {
        client.AllProducts({}, (err, response) => {console.log('Products after Update:', response.products);})
          
        client.DeleteProduct({ id: product2.id }, (err, response) => {
          if (err) console.error('Error deleting product:', err);
          client.AllProducts({}, (err, response) => {console.log('Products after Delete:', response.products);})
        });
      }
    });

    client.getProduct({ id: product3.id }, (err, response) => {
      if (err) {console.error('Error getting product:', err);
      } else {
        if (response && response.product) {
          console.log('Product details:', response.product);
        } else {
          console.log('Product not found');
        }
      }
    });
  }
});