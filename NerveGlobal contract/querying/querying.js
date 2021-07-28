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

const userTasksQuery = `
  query {
    userTasks {
      id
      userAddress
      userStake
      voted
      vote
      taskData
    }
  }
`

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
      tribute
      profit
      blacklist
    }
  }
`

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

const globalStatsQuery = `
  query {
    globalStats {
      id
      taskProfits
      users
      taskCount
      betProfit
      betCount
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
