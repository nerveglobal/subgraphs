import { ApolloClient, InMemoryCache, gql } from '@apollo/client';

const APIURL = "https://api.thegraph.com/subgraphs/name/username/subgraphname";

const betsQuery = `
  query {
    bets(orderBy: stakeA & stakeB, orderDirection: desc) {
      id
      initiatorAddress
      description
      participantsA
      participantsB
      stakeA
      stakeB
      textA
      textB
      endBet
      noMoreBets
      finished
      winnerPartyA
      draw
      failed
      hashtag1
      hashtag2
      hashtag3
      language
      proofLink
    }
  }
`

const userBetsQuery = `
  query {
    userBets {
      id
      userAddress
      userStake
      redeemed
      joinedA
      betData
    }
  }
`

const client = new ApolloClient({
  uri: APIURL,
  cache: new InMemoryCache()
});

client.query({
  query: gql(betsQuery, userBetsQuery)
})
.then(data => console.log("Subgraph data: ", data))
.catch(err => { console.log("Error fetching data: ", err) });
