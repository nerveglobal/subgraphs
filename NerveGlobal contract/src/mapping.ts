import { BigInt } from "@graphprotocol/graph-ts"
import { log } from '@graphprotocol/graph-ts'
import {
  RecipientRedeemed,
  ChallengeAdded,
  ChallengeJoined,
  ChallengeProved,
  UserRedeemed,
  Voted,
  BetBailout,
  BetClosed,
  BetCreated,
  BetFinished,
  BetJoined,
  BetProved,
  BetRedeemed
} from "../generated/NerveGlobal/NerveGlobal"
import { 
  Challenge, 
  UserChallenge,
  Bet,
  UserBet,
  UserFavStat,
  UserDashStat,
  GlobalStat
} from "../generated/schema"


  /******************************************/
  /*             Initialization             */
  /******************************************/

function initializeUserFavStat (id: string): void {
  let userFavStat = new UserFavStat(id)
  userFavStat.negativeVotes = BigInt.fromI32(0)
  userFavStat.positiveVotes = BigInt.fromI32(0)
  userFavStat.betBalance = BigInt.fromI32(0)
  userFavStat.betsWon = BigInt.fromI32(0)
  userFavStat.betsLost = BigInt.fromI32(0)
  userFavStat.save()
}

function initializeUserDashStat (id: string): void {
  let userDashStat = new UserDashStat(id)
  userDashStat.spent = BigInt.fromI32(0)
  userDashStat.earned = BigInt.fromI32(0)
  userDashStat.save()
}

function initializeGlobalStat (id: string): void {
  let globalStat = new GlobalStat(id)
  globalStat.challengeEarnings = BigInt.fromI32(0)
  globalStat.users = BigInt.fromI32(0)
  globalStat.challengeCount = BigInt.fromI32(0)
  globalStat.betWinnings = BigInt.fromI32(0)
  globalStat.betCount = BigInt.fromI32(0)
  globalStat.save()
}

  /******************************************/
  /*               ChallengeAdded           */
  /******************************************/

export function handleChallengeAdded(event: ChallengeAdded): void {
  
  let challengeID = event.params.challengeID.toHex()
  let initiator = event.params.initiator.toHex()
  
  
  // Challenge Entity
  let challenge = new Challenge(challengeID)
  log.info('New Challenge entity created: {}', [challengeID])
  challenge.initiatorAddress = event.params.initiator
  challenge.recipientAddress = event.params.recipient
  challenge.amount = event.params.amount
  challenge.entranceAmount = event.params.amount
  challenge.description = event.params.description
  challenge.endChallenge = event.params.endChallenge
  challenge.participants = BigInt.fromI32(1)
  challenge.language = event.params.language
  challenge.save()

  
  // UserChallenge Entity
  let userChallenge = new UserChallenge(initiator + "-" + challengeID)
  log.info('New UserChallenge entity created: {} - {}', [initiator, challengeID])
  userChallenge.userAddress = event.params.initiator
  userChallenge.userStake = event.params.amount
  userChallenge.challengeData = event.params.challengeID.toHex()
  userChallenge.save()                                                               


  // GlobalStats Entity
  let globalStatId = "1"
  let globalStat = GlobalStat.load(globalStatId)
  if(globalStat == null) {
    initializeGlobalStat(globalStatId)
    globalStat = GlobalStat.load(globalStatId)
  }
  globalStat.challengeCount = globalStat.challengeCount.plus(BigInt.fromI32(1)) 
  globalStat.save()
}

  /******************************************/
  /*               ChallengeJoined          */
  /******************************************/

export function handleChallengeJoined(event: ChallengeJoined): void {
  
  let challengeID = event.params.ID.toHex()
  let participant = event.params.participant.toHex()
  
  
  // Challenge Entity
  let challenge = Challenge.load(challengeID)
  challenge.participants = challenge.participants.plus(BigInt.fromI32(1))
  challenge.amount = challenge.amount.plus(event.params.amount)
  challenge.save()

  
  // UserChallenge Entity
  let userChallenge = new UserChallenge(participant + "-" + challengeID)
  log.info('New UserChallenge entity created: {} - {}', [participant, challengeID])
  userChallenge.userAddress = event.params.participant
  userChallenge.userStake = event.params.amount
  userChallenge.taskData = event.params.challengeID.toHex()
  userChallenge.save()                                                       


  // UserDashStat Entity
  let userDashStat = UserDashStat.load(participant)
  if(userDashStat == null) {
    initializeUserDashStat(participant)
    userDashStat = UserDashStat.load(participant)
    log.info('New UserDashStat entity created: {}', [participant])
  }
  userDashStat.spent = userDashStat.spent.plus(event.params.amount)
  userDashStat.save()                                                                                                                                   


  /******************************************/
  /*                 Voted                  */
  /******************************************/

export function handleVoted(event: Voted): void {
  
  let challengeID = event.params.challengeID.toHex()
  let participant = event.params.participant.toHex()
  
  
  // Challenge Entity
  let challenge = Challenge.load(challengeID)
  if (event.params.vote == true) {
    challenge.positiveVotes = challenge.positiveVotes.plus(BigInt.fromI32(1))
  } else {
    challenge.negativeVotes = challenge.negativeVotes.plus(BigInt.fromI32(1))
  }
  challenge.finished = event.params.finished
  challenge.save()

  
  // UserChallenge Entity
  let userChallenge = UserChallenge.load(participant + "-" + challengeID)
  userChallenge.voted = true
  userChallenge.vote = event.params.vote
  userChallenge.save()                                                                 
  

  // UserFavStat Entity
  let userFavStat = UserFavStat.load(participant)
  if(userFavStat == null) {
    initializeUserFavStat(participant)
    userFavStat = UserFavStat.load(participant)
    log.info('New UserFavStat entity created: {}', [participant])
  }
  if (event.params.vote == true) {
    userFavStat.positiveVotes = userFavStat.positiveVotes.plus(BigInt.fromI32(1))
  } else {
    userFavStat.negativeVotes = userFavStat.negativeVotes.plus(BigInt.fromI32(1))
  }
  userFavStat.save()                                                                                                                                                 


  /******************************************/
  /*              UserRedeemed              */
  /******************************************/

export function handleUserRedeemed(event: UserRedeemed): void {

  let challengeID = event.params.challengeID.toHex()
  let participant = event.params.participant.toHex()
  
  
  // UserChallenge Entity
  let userChallenge = UserChallenge.load(participant + "-" + challengeID)
  userChallenge.userStake = BigInt.fromI32(0)
  userChallenge.save()                                                               


  // UserDashStat Entity
  let userDashStat = UserDashStat.load(participant)
  if(userDashStat == null) {
    initializeUserDashStat(participant)
    userDashStat = UserDashStat.load(participant)
    log.info('New UserDashStat entity created: {}', [participant])
  }
  userDashStat.spent = userDashStat.spent.minus(event.params.amount)
  userDashStat.save()                                                                    
}

  /******************************************/
  /*            RecipientRedeemed           */
  /******************************************/

export function handleRecipientRedeemed(event: RecipientRedeemed): void {

  let challengeID = event.params.challengeID.toHex()
  let recipient = event.params.recipient.toHex()

  
  // Challenge Entity
  let challenge = Challenge.load(challengeID)
  challenge.executed = true
  challenge.save()


  // UserDashStat Entity
  let userDashStat = UserDashStat.load(recipient)
  if(userDashStat == null) {
    initializeUserDashStat(recipient)
    userDashStat = UserDashStat.load(recipient)
    log.info('New UserDashStat entity created: {}', [recipient])
  }
  userDashStat.earned = userDashStat.earned.plus(event.params.amount)
  userDashStat.save()                                                                 


  // GlobalStats Entity
  let globalStatId = "1"
  let globalStat = GlobalStat.load(globalStatId)
  if(globalStat == null) {
    initializeGlobalStat(globalStatId)
    globalStat = GlobalStat.load(globalStatId)
  }
  globalStat.challengeWinnings = globalStat.challengeWinnings.plus(event.params.amount) 
  globalStat.save()
}

  /******************************************/
  /*              TaskProved                */
  /******************************************/

export function handleChallengeProved(event: ChallengeProved): void {
   
  let challengeId = event.params.challengeID.toHex()
  
  
  // Challenge Entity
  let challenge = Challenge.load(challengeId)
  challenge.proofLink = event.params.proofLink
  challenge.save()
}

  /******************************************/
  /*               BetCreated               */
  /******************************************/

export function handleBetCreated(event: BetCreated): void {

  let betID = event.params.betID.toHex()
  let initiator = event.params.initiator.toHex()
  
  
  // Bet Entity
  let bet = new Bet(betID)
  log.info('New Bet entity created: {}', [betID])
  bet.initiatorAddress = event.params.initiator 
  bet.description = event.params.description 
  bet.textA = event.params.yesText 
  bet.textB = event.params.noText 
  bet.endBet = event.params.endBet 
  bet.language = event.params.language 
  bet.save()

  
  // UserBet Entity
  let userBet = new UserBet(initiator + "-" + betID)
  log.info('New UserBet entity created: {} - {}', [initiator, betID])
  userBet.userAddress = event.params.initiator 
  userBet.betData = event.params.betID.toHex()
  userBet.userStake = BigInt.fromI32(0)
  userBet.save()


  // GlobalStats Entity                                                                   
  let globalStatId = "1"
  let globalStat = GlobalStat.load(globalStatId)
  if(globalStat == null) {
    initializeGlobalStat(globalStatId)
    globalStat = GlobalStat.load(globalStatId)
  }
  globalStat.betCount = globalStat.betCount.plus(BigInt.fromI32(1)) 
  globalStat.save()
}

  /******************************************/
  /*               BetJoined                */
  /******************************************/

export function handleBetJoined(event: BetJoined): void {

  let betID = event.params.betID.toHex()
  let participant = event.params.participant.toHex()
  
  
  // Bet Entity
  let bet = Bet.load(betID)
  if (event.params.joinA == true) {
    bet.stakeA = bet.stakeA.plus(event.params.amount) 
    bet.participantsA = bet.participantsA.plus(BigInt.fromI32(1)) 
  } else {
    bet.stakeB = bet.stakeB.plus(event.params.amount) 
    bet.participantsB = bet.participantsB.plus(BigInt.fromI32(1))
  }
  bet.save()

  
  // UserBet Entity
  let userBet = new UserBet(participant + "-" + betID)
  log.info('New UserBet entity created: {} - {}', [participant, betID])
  userBet.userAddress = event.params.participant 
  userBet.userStake = event.params.amount
  userBet.joinedA = event.params.joinA
  userBet.betData = event.params.betID.toHex()
  userBet.save()


// UserFavStat Entity
  let userFavStat = UserFavStat.load(participant)
  if(userFavStat == null) {
    initializeUserFavStat(participant)
    userFavStat = UserFavStat.load(participant)
    log.info('New UserFavStat entity created: {}', [participant])
  }
  userFavStat.betBalance = userFavStat.betBalance.minus(event.params.amount)
  userFavStat.save()


  /******************************************/
  /*               BetClosed                */
  /******************************************/

export function handleBetClosed(event: BetClosed): void {

  // Bet Entity
  let bet = Bet.load(event.params.betID.toHex())
  bet.noMoreBets = true
  bet.save()
}

  /******************************************/
  /*               BetFinished              */
  /******************************************/

export function handleBetFinished(event: BetFinished): void {

  let betID = event.params.betID.toHex()
  let initiator = event.params.initiator.toHex()
  
  
  // Bet Entity
  let bet = Bet.load(betID)
  bet.finished = true 
  bet.failed = event.params.failed                       
  bet.winnerPartyA = event.params.winnerPartyA
  bet.draw = event.params.draw 
  bet.save()


  /******************************************/
  /*               BetRedeemed              */
  /******************************************/

export function handleBetRedeemed(event: BetRedeemed): void {

  let betID = event.params.betID.toHex()
  let participant = event.params.participant.toHex()
  

  // UserBet Entity 1/2
  let userBet = UserBet.load(participant + "-" + betID)
  userBet.redeemed = true


// UserFavStat Entity
  let userFavStat = UserFavStat.load(participant)
  if(userFavStat == null) {
    initializeUserFavStat(participant)
    userFavStat = UserFavStat.load(participant)
    log.info('New UserFacStat entity created: {}', [participant])
  }
  userFavStat.betsWon = userFavStat.betsWon.plus(BigInt.fromI32(1)) 
  userFavStat.betBalance = userFavStat.betBalance.plus(event.params.profit)
  userFavStat.betBalance = userFavStat.betBalance.plus(userBet.userStake)
  userFavStat.save()

  
// UserBet Entity 1/2
  userBet.userStake = BigInt.fromI32(0)
  userBet.save()


  // GlobalStats Entity
  let globalStatId = "1"
  let globalStat = GlobalStat.load(globalStatId)
  if(globalStat == null) {
    initializeGlobalStat(globalStatId)
    globalStat = GlobalStat.load(globalStatId)
  }
  globalStat.betWinnings = globalStat.betWinnings.plus(event.params.profit) 
  globalStat.save()
}

  /******************************************/
  /*               BetBailout               */
  /******************************************/

export function handleBetBailout(event: BetBailout): void {

  let betID = event.params.betID.toHex()
  let participant = event.params.participant.toHex()
  
  
  // UserBet Entity
  let userBet = UserBet.load(participant + "-" + betID)
  userBet.userStake = BigInt.fromI32(0)
  userBet.save()

  // UserFavStat Entity
  let userFavStat = UserFavStat.load(participant)
  if(userFavStat == null) {
    initializeUserFavStat(participant)
    userFavStat = UserFavStat.load(participant)
    log.info('New UserFavStat entity created: {}', [participant])
  }
  userFavStat.betBalance = userFavStat.betBalance.plus(event.params.userStake)
  userFavStat.save()
}

  /******************************************/
  /*               BetProved                */
  /******************************************/
  
export function handleBetProved(event: BetProved): void {

  // Bet Entity
  let bet = Bet.load(event.params.betID.toHex())
  bet.proofLink = event.params.proofLink
  bet.save()
}
