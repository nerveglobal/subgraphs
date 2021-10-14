import { BigInt } from "@graphprotocol/graph-ts"
import { log } from '@graphprotocol/graph-ts'
import {
  RecipientRedeemed,
  TaskAdded,
  TaskJoined,
  TaskPromoted,
  TaskProved,
  UserRedeemed,
  Voted,
  BetBailout,
  BetClosed,
  BetCreated,
  BetFinished,
  BetJoined,
  BetPromoted,
  BetProved,
  BetRedeemed
} from "../generated/NerveGlobal/NerveGlobal"
import { 
  Task, 
  UserTask,
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
  globalStat.taskEarnings = BigInt.fromI32(0)
  globalStat.users = BigInt.fromI32(0)
  globalStat.taskCount = BigInt.fromI32(0)
  globalStat.betWinnings = BigInt.fromI32(0)
  globalStat.betCount = BigInt.fromI32(0)
  globalStat.save()
}

  /******************************************/
  /*               TaskAdded                */
  /******************************************/

export function handleTaskAdded(event: TaskAdded): void {
  
  let taskID = event.params.taskID.toHex()
  let initiator = event.params.initiator.toHex()
  let recipient = event.params.recipient.toHex()
  let initiatorDashStat = UserDashStat.load(initiator)
  let recipientDashStat = UserDashStat.load(recipient)
  
  
  // Task Entity
  let task = new Task(taskID)
  log.info('New Task entity created: {}', [taskID])
  task.initiatorAddress = event.params.initiator
  task.recipientAddress = event.params.recipient
  task.amount = event.params.amount
  task.entranceAmount = event.params.amount
  task.description = event.params.description
  task.endTask = event.params.endTask
  task.participants = BigInt.fromI32(1)
  task.language = event.params.language
  task.lat = event.params.lat
  task.lon = event.params.lon
  if(initiatorDashStat != null) {
    task.initiatorName = initiatorDashStat.userName
  }
  if(recipientDashStat != null) {
    task.recipientName = recipientDashStat.userName
  }


  // UserTask Entity
  let userTask = new UserTask(initiator + "-" + taskID)
  log.info('New UserTask entity created: {} - {}', [initiator, taskID])
  userTask.userAddress = event.params.initiator
  userTask.userStake = event.params.amount
  userTask.endTask = event.params.endTask
  userTask.task = taskID
  userTask.save()    
  task.save()  


  // GlobalStats Entity
  let globalStatId = "1"
  let globalStat = GlobalStat.load(globalStatId)
  if(globalStat == null) {
    initializeGlobalStat(globalStatId)
    globalStat = GlobalStat.load(globalStatId)
  }
  globalStat.taskCount = globalStat.taskCount.plus(BigInt.fromI32(1)) 
  globalStat.save()
}

  /******************************************/
  /*               TaskJoined          */
  /******************************************/

export function handleTaskJoined(event: TaskJoined): void {
  
  let taskID = event.params.taskID.toHex()
  let participant = event.params.participant.toHex()
  
  
  // Task Entity
  let task = Task.load(taskID)
  task.participants = task.participants.plus(BigInt.fromI32(1))
  task.amount = task.amount.plus(event.params.amount)

  
  // UserTask Entity
  let userTask = new UserTask(participant + "-" + taskID)
  log.info('New UserTask entity created: {} - {}', [participant, taskID])
  userTask.userAddress = event.params.participant
  userTask.userStake = event.params.amount
  userTask.endTask = task.endTask
  userTask.task = taskID
  userTask.save()  
  task.save()                                                    


  // UserDashStat Entity
  let userDashStat = UserDashStat.load(participant)
  if(userDashStat == null) {
    initializeUserDashStat(participant)
    userDashStat = UserDashStat.load(participant)
    log.info('New UserDashStat entity created: {}', [participant])
  }
  userDashStat.spent = userDashStat.spent.plus(event.params.amount)
  userDashStat.save()                                                                                                                                   
}

  /******************************************/
  /*                 Voted                  */
  /******************************************/

export function handleVoted(event: Voted): void {
  
  let taskID = event.params.taskID.toHex()
  let participant = event.params.participant.toHex()
  
  
  // Task Entity
  let task = Task.load(taskID)
  if (event.params.vote == true) {
    task.positiveVotes = task.positiveVotes.plus(BigInt.fromI32(1))
  } else {
    task.negativeVotes = task.negativeVotes.plus(BigInt.fromI32(1))
  }
  task.finished = event.params.finished
  task.save()

  
  // UserTask Entity
  let userTask = UserTask.load(participant + "-" + taskID)
  userTask.voted = true
  userTask.vote = event.params.vote
  userTask.finished = event.params.finished
  userTask.save()                                                                 
  

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
}

  /******************************************/
  /*              UserRedeemed              */
  /******************************************/

export function handleUserRedeemed(event: UserRedeemed): void {

  let taskID = event.params.taskID.toHex()
  let participant = event.params.participant.toHex()
  
  
  // UserTask Entity
  let userTask = UserTask.load(participant + "-" + taskID)
  userTask.userStake = BigInt.fromI32(0)
  userTask.save()                                                               


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

  let taskID = event.params.taskID.toHex()
  let recipient = event.params.recipient.toHex()

  
  // Task Entity
  let task = Task.load(taskID)
  task.executed = true
  task.save()


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
  globalStat.taskEarnings = globalStat.taskEarnings.plus(event.params.amount) 
  globalStat.save()
}

  /******************************************/
  /*              TaskProved                */
  /******************************************/

export function handleTaskProved(event: TaskProved): void {
   
  let taskID = event.params.taskID.toHex()
  
  
  // Task Entity
  let task = Task.load(taskID)
  task.proofLink = event.params.proofLink
  task.save()
}
  

  /******************************************/
  /*              TaskPromoted              */
  /******************************************/

export function handleTaskPromoted(event: TaskPromoted): void {
   
  let taskID = event.params.taskID.toHex()
  
  
  // Task Entity
  let task = Task.load(taskID)
  task.promotion = event.params.amount
  task.save() 
}

  /******************************************/
  /*               BetCreated               */
  /******************************************/

export function handleBetCreated(event: BetCreated): void {

  let betID = event.params.betID.toHex()
  let initiator = event.params.initiator.toHex()
  let initiatorDashStat = UserDashStat.load(initiator)
  
  // Bet Entity
  let bet = new Bet(betID)
  log.info('New Bet entity created: {}', [betID])
  bet.initiatorAddress = event.params.initiator
  bet.description = event.params.description 
  bet.textYes = event.params.yesText 
  bet.textNo = event.params.noText 
  bet.endBet = event.params.endBet 
  bet.language = event.params.language 
  bet.lat = event.params.lat
  bet.lon = event.params.lon
  if (initiatorDashStat != null) {
    bet.initiatorName = initiatorDashStat.userName
  }
  bet.save() 
  
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
    bet.stakeYes = bet.stakeYes.plus(event.params.amount) 
    bet.participantsYes = bet.participantsYes.plus(BigInt.fromI32(1)) 
  } else {
    bet.stakeNo = bet.stakeNo.plus(event.params.amount) 
    bet.participantsNo = bet.participantsNo.plus(BigInt.fromI32(1))
  }
  bet.save()
 

  // UserBet Entity
  let userBet = new UserBet(participant + "-" + betID)
  log.info('New UserBet entity created: {} - {}', [participant, betID])
  userBet.userAddress = event.params.participant 
  userBet.userStake = event.params.amount
  userBet.joinedA = event.params.joinA
  userBet.endBet = bet.endBet
  userBet.bet = betID
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
  }

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


  // UserBet Entity
  let userBet = UserBet.load(initiator + "-" + betID)
  userBet.finished = true 
  userBet.save()
}

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
  
/******************************************/
/*              BetPromoted              */
/******************************************/

export function handleBetPromoted(event: BetPromoted): void {
   
  let betID = event.params.betID.toHex()
  
  
  // Bet Entity
  let bet = Bet.load(betID)
  bet.promotion = event.params.amount
  bet.save()
}
