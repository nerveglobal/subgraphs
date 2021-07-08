import { ApolloClient, InMemoryCache, gql } from '@apollo/client';

const APIURL = "https://api.thegraph.com/subgraphs/name/username/subgraphname";

const tasksQuery = `
  query {
    tasks(orderBy: amount, orderDirection: desc) {
      id
      initiatorAddress
      recipientAddress
      amount
      entranceAmount
      description
      endTask
      positiveVotes
      negativeVotes
      participants
      accepted
      executed
      finished
      canceled
      hashtag1
      hashtag2
      hashtag3
      language
      proofLink
    }
  }
`

const client = new ApolloClient({
  uri: APIURL,
  cache: new InMemoryCache()
});

client.query({
  query: gql(tasksQuery)
})
.then(data => console.log("Subgraph data: ", data))
.catch(err => { console.log("Error fetching data: ", err) });
