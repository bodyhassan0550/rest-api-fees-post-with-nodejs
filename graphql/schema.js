const { buildSchema } = require("graphql");

module.exports = buildSchema(`
type Post {
    _id:ID!
    title:String!
    content:String!
    imgurl:String!
    creator:User!
    createdAt:String!
    updatedAt:String!
}
type User {
      _id:ID!
    email:String!
    name:String!
    password:String!
    status:String!
    posts:[Post!]
} 

type AuthData {
    token: String!
    userId: String!
}
type postData {
    posts : [Post!]!
    totlePost : Int!
}
input userInputData{
 email:String!
    name:String!
    password:String!}
input postInputData{
    title:String!
    content:String!
    imgurl:String!}

type RootQuery {
    login(email: String!, password: String!): AuthData!
    posts:postData!
    post(id:ID!):Post!
    deletepost(id:ID!):Post!
    updatepost(id:ID! , postInput:postInputData):  Post!
}
  
type RootMutation {
creatUser(userInput:userInputData):User!
creatPost(postInput:postInputData):Post!
}

schema {
    query:RootQuery
    mutation: RootMutation
}
`);
