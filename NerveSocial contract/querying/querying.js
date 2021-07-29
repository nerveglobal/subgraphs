import { ApolloClient, InMemoryCache, gql } from '@apollo/client';

const APIURL = "https://api.thegraph.com/subgraphs/name/username/subgraphname";

const userDashStatsQuery = `
  query {
    userDashStats {
      id
      userName
      displayAchievement
      youtube
      twitter
      instagram
      tiktok
      twitch
      blacklist
    }
  }
`

const client = new ApolloClient({
  uri: APIURL,
  cache: new InMemoryCache()
});

client.query({
  query: gql(userDashStatsQuery)
})
.then(data => console.log("Subgraph data: ", data))
.catch(err => { console.log("Error fetching data: ", err) });
