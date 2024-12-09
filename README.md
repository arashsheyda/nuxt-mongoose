![nuxt-mongoose](https://docs.arashsheyda.me/modules/nuxt-mongoose.jpg)

<div align="center">
  <h1>Nuxt Mongoose</h1>

  A Nuxt module for simplifying the use of Mongoose in your project.
</div>


## Installation

```bash
npx nuxi@latest module add nuxt-mongoose
```

## Usage

### Setup

Add `nuxt-mongoose` to the `modules` section of your `nuxt.config.ts` file.

```ts
export default defineNuxtConfig({
  modules: [
    'nuxt-mongoose',
  ],
})
```

### Configuration

You can configure the module by adding a `mongoose` section to your `nuxt.config` file:

```ts
export default defineNuxtConfig({
  mongoose: {
    uri: 'process.env.MONGODB_URI',
    options: {},
    modelsDir: 'models',
  },
})
```

By default, `nuxt-mongoose` will auto-import your schemas from the `models` directory in the `server` directory. You can change this behavior by setting the `modelsDir` option.

---

#### 🛠️ **Quick Setup Without Configuration**

If you prefer to use the default configuration, skip adding the `mongoose` section to your `nuxt.config.ts` file. Simply provide your MongoDB connection URI in a `.env` file like this:

```env
MONGODB_URI="mongodb+srv://username:password@cluster0.mongodb.net/<database-name>?retryWrites=true&w=majority"
```

> 🔹 Replace `username`, `password`, and `<database name>` with your MongoDB credentials and database name.

That's it! The module will automatically use the `MONGODB_URI` and default settings for your connection. No additional configuration is required.

---

*For more details about connection options, check out the [Mongoose documentation](https://mongoosejs.com/docs/connections.html#options).*


## API

### defineMongooseConnection

This function creates a new Mongoose connection. Example usage:

```ts
import { defineMongooseConnection } from '#nuxt/mongoose'

export const connection = defineMongooseConnection('mongodb://127.0.0.1/nuxt-mongoose')
```

### defineMongooseModel

This function creates a new Mongoose model with schema. Example usage:

```ts
import { defineMongooseModel } from '#nuxt/mongoose'

export const User = defineMongooseModel('User', {
  name: {
    type: String,
    required: true,
  },
})
```

**or you could use it like:**

```ts
export const User = defineMongooseModel({
  name: 'User',
  schema: {
    name: {
      type: String,
      required: true,
    },
  },
})
```


#### Connecting to an Existing Collection

If you need to connect to an **existing collection** in the database, you must specify the collection name using the `options` field. Otherwise, Mongoose will create a new collection based on the model name.

```ts
import { defineMongooseModel } from '#nuxt/mongoose'

export const ProductSchema = defineMongooseModel({
  name: 'Product',
  schema: {
    name: { type: String, required: true },
    price: { type: Number, required: true },
    stock: { type: Number, default: 0 },
  },
  options: {
    collection: 'products_collection', // Ensure it uses the correct collection name
  },
})
```

---

#### Important Notes

- Using the `options.collection` field ensures that the model interacts with the specified collection (`products_collection` in the example above).
- Without this option, a new collection will be created using the pluralized version of the model name (e.g., `Products`).


### Configuration

For detailed [configuration](https://docs.arashsheyda.me/nuxt-mongoose/getting-started/configuration) and usage instructions, please refer to our [documentation](https://docs.arashsheyda.me/nuxt-mongoose).


## License

[MIT License](./LICENSE)
