import { ApolloServer } from 'apollo-server'
import { loadTypeSchema } from './utils/schema'
import { merge } from 'lodash'
import config from './config'
import { connect } from './db'
import product from './types/product/product.resolvers'
import coupon from './types/coupon/coupon.resolvers'
import user from './types/user/user.resolvers'

const types = ['product', 'coupon', 'user']

export const start = async () => {
  const rootSchema = `
    type Friend {
      name: String
      surname: String
      bestFriend: Friend
    }

    type Dog {
      name: String
      age: Int!
    }

    input DogInput {
      name: String
      age: Int!
    }

    type Query {
      myFriend: Friend
      myDog: Dog
      hello: String
      dogs: [Dog]
    }

    type Mutation {
      newDog(input: DogInput!): Dog!
    }
    schema {
      query: Query
    }
  `
  const schemaTypes = await Promise.all(types.map(loadTypeSchema))

  const server = new ApolloServer({
    typeDefs: [rootSchema],
    resolvers: {
      Query: {
        myFriend() {
          return {
            name: "Anastasia",
            surname: "Frozen",
            bestFriend: {
              name: "Fatema",
            surname: "Iraskiv",
            bestFriend: {
              name: "Anastasia"
            }
            }
          }
        },
        myDog() {
          return {
            name: "Mat",
            age: 3
          }
        },
        hello() {
          return "Fuck off!!"
        }
      }},
    context({ req }) {
      // use the authenticate function from utils to auth req, its Async!
      return { user: null }
    }
  })

  await connect(config.dbUrl).catch(() => {});
  const { url } = await server.listen({ port: config.port })

  console.log(`GQL server ready at ${url}`)
}
