import { ApolloClient, InMemoryCache, gql } from '@apollo/client';

const APIURL = "https://api.thegraph.com/subgraphs/name/username/subgraphname";

const userAchievementsQuery = `
  query {
    userAchievements {
      id
      tasksCreated
      tasksJoined
      tasksVoted
      betsCreated
      betsJoined
      betsFinished
      accountCreation
      seasonOneRank
      seasonTwoRank
      seasonThreeRank
    }
  }
`

const client = new ApolloClient({
  uri: APIURL,
  cache: new InMemoryCache()
});

client.query({
  query: gql(tasksQuery, userTasksQuery, betsQuery, userBetsQuery, userFavStatsQuery, userDashStatsQuery, userAchievementsQuery, globalStatsQuery)
})
.then(data => console.log("Subgraph data: ", data))
.catch(err => { console.log("Error fetching data: ", err) });
