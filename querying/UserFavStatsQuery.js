import { ApolloClient, InMemoryCache, gql } from '@apollo/client';

const APIURL = "https://api.thegraph.com/subgraphs/name/username/subgraphname";

const userFavStatsQuery = `
  query {
    userFavStats {
      id
      negativeVotes
      positiveVotes
      betBalance
      betsWon
      betsLost
    }
  }
`

const client = new ApolloClient({
  uri: APIURL,
  cache: new InMemoryCache()
});

client.query({
  query: gql(userFavStatsQuery)
})
.then(data => console.log("Subgraph data: ", data))
.catch(err => { console.log("Error fetching data: ", err) });
