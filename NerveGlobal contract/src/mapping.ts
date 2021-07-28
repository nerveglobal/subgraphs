import { BigInt } from "@graphprotocol/graph-ts"
import { log } from '@graphprotocol/graph-ts'
import {
  RecipientRedeemed,
  TaskAdded,
  TaskJoined,
  TaskProved,
  UserRedeemed,
  Voted,
  BetBailout,
  BetClosed,
  BetCreated,
  BetFinished,
  BetJoined,
  BetProved,
  BetRedeemed,
  DisplayAchievementChanged,
  NameRegistered,
  SocialRegistered,
  UserBlacklisted
} from "../generated/NerveGlobal/NerveGlobal"
import { 
  Task, 
  UserTask,
  Bet,
  UserBet,
  UserFavStat,
  UserDashStat,
  UserAchievement,
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
  userDashStat.userName = "Unknown"
  userDashStat.displayAchievement = "None"
  userDashStat.youtube = "None"
  userDashStat.twitter = "None"
  userDashStat.instagram = "None"
  userDashStat.tiktok = "None"
  userDashStat.twitch = "None"
  userDashStat.tribute = BigInt.fromI32(0)
  userDashStat.profit = BigInt.fromI32(0)
  userDashStat.blacklist = []
  userDashStat.save()
}

function initializeUserAchievement (id: string): void {
  let userAchievement = new UserAchievement(id)
  userAchievement.tasksCreated = BigInt.fromI32(0)
  userAchievement.tasksJoined = BigInt.fromI32(0)
  userAchievement.tasksVoted = BigInt.fromI32(0)
  userAchievement.betsCreated = BigInt.fromI32(0)
  userAchievement.betsJoined = BigInt.fromI32(0)
  userAchievement.betsFinished = BigInt.fromI32(0)
  userAchievement.accountCreation = BigInt.fromI32(0)
  userAchievement.seasonOneRank = BigInt.fromI32(0)
  userAchievement.seasonTwoRank = BigInt.fromI32(0)
  userAchievement.seasonThreeRank = BigInt.fromI32(0)
  userAchievement.save()
  
  let globalStatId = "1"
  let globalStat = GlobalStat.load(globalStatId)
  if(globalStat == null) {
    initializeGlobalStat(globalStatId)
    globalStat = GlobalStat.load(globalStatId)
  }
  globalStat.users = globalStat.users.plus(BigInt.fromI32(1))
  globalStat.save()
}
}

function initializeGlobalStat (id: string): void {
  let globalStat = new GlobalStat(id)
  globalStat.taskProfits = BigInt.fromI32(0)
  globalStat.users = BigInt.fromI32(0)
  globalStat.taskCount = BigInt.fromI32(0)
  globalStat.betProfit = BigInt.fromI32(0)
  globalStat.betCount = BigInt.fromI32(0)
  globalStat.save()
}

/******************************************/
  /*               TaskAdded                */
  /******************************************/

export function handleTaskAdded(event: TaskAdded): void {
  
  let taskID = event.params.taskID.toHex()
  let initiator = event.params.initiator.toHex()
  
  
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
  task.hashtag1 = event.params.hashtag1
  task.hashtag2 = event.params.hashtag2
  task.hashtag3 = event.params.hashtag3
  task.language = event.params.language
  task.save()

  
  // UserTask Entity
  let userTask = new UserTask(initiator + "-" + taskID)
  log.info('New UserTask entity created: {} - {}', [initiator, taskID])
  userTask.userAddress = event.params.initiator
  userTask.userStake = event.params.amount
  userTask.taskData = event.params.taskID.toHex()
  userTask.save()


  // UserAchievement Entity
  let userAchievement = UserAchievement.load(initiator)
  if(userAchievement == null) {
    initializeUserAchievement(initiator)
    userAchievement = UserAchievement.load(initiator)
    log.info('New UserAchievements entity created: {}', [initiator])
  }
  userAchievement.tasksCreated = userAchievement.tasksCreated.plus(BigInt.fromI32(1))
  userAchievement.save()                                                                   


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
  /*               TaskJoined               */
  /******************************************/

export function handleTaskJoined(event: TaskJoined): void {
  
  let taskID = event.params.taskID.toHex()
  let participant = event.params.participant.toHex()
  
  
  // Task Entity
  let task = Task.load(taskID)
  task.participants = task.participants.plus(BigInt.fromI32(1))
  task.amount = task.amount.plus(event.params.amount)
  task.save()

  
  // UserTask Entity
  let userTask = new UserTask(participant + "-" + taskID)
  log.info('New UserTask entity created: {} - {}', [participant, taskID])
  userTask.userAddress = event.params.participant
  userTask.userStake = event.params.amount
  userTask.taskData = event.params.taskID.toHex()
  userTask.save()                                                       


  // UserDashStat Entity
  let userDashStat = UserDashStat.load(participant)
  if(userDashStat == null) {
    initializeUserDashStat(participant)
    userDashStat = UserDashStat.load(participant)
    log.info('New UserDashStat entity created: {}', [participant])
  }
  userDashStat.tribute = userDashStat.tribute.plus(event.params.amount)
  userDashStat.save()                                                                                                                                   


  // UserAchievements Entity
  let userAchievement = UserAchievement.load(participant)
  if(userAchievement == null) {
    initializeUserAchievement(participant)
    userAchievement = UserAchievement.load(participant)
    log.info('New UserAchievement entity created: {}', [participant])
  }
  userAchievement.tasksJoined = userAchievement.tasksJoined.plus(BigInt.fromI32(1))
  userAchievement.save()                                                                 
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


  // UserAchievements Entity
  let userAchievement = UserAchievement.load(participant)
  if(userAchievement == null) {
    initializeUserAchievement(participant)
    userAchievement = UserAchievement.load(participant)
    log.info('New UserAchievement entity created: {}', [participant])
  }
  userAchievement.tasksVoted = userAchievement.tasksVoted.plus(BigInt.fromI32(1))
  userAchievement.save()                                                                        
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
  userDashStat.tribute = userDashStat.tribute.minus(event.params.amount)
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
  userDashStat.profit = userDashStat.profit.plus(event.params.amount)
  userDashStat.save()                                                                 


  // GlobalStats Entity
  let globalStatId = "1"
  let globalStat = GlobalStat.load(globalStatId)
  if(globalStat == null) {
    initializeGlobalStat(globalStatId)
    globalStat = GlobalStat.load(globalStatId)
  }
  globalStat.taskProfits = globalStat.taskProfits.plus(event.params.amount) 
  globalStat.save()
}

  /******************************************/
  /*              TaskProved                */
  /******************************************/

export function handleTaskProved(event: TaskProved): void {
   
  let taskId = event.params.taskID.toHex()
  
  
  // Task Entity
  let task = Task.load(taskId)
  task.proofLink = event.params.proofLink
  task.save()
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
  bet.hashtag1 = event.params.hashtag1 
  bet.hashtag2 = event.params.hashtag2 
  bet.hashtag3 = event.params.hashtag3 
  bet.language = event.params.language 
  bet.save()

  
  // UserBet Entity
  let userBet = new UserBet(initiator + "-" + betID)
  log.info('New UserBet entity created: {} - {}', [initiator, betID])
  userBet.userAddress = event.params.initiator 
  userBet.betData = event.params.betID.toHex()
  userBet.userStake = BigInt.fromI32(0)
  userBet.save()


  // UserAchievement Entity                                       
  let userAchievement = UserAchievement.load(initiator)
  if(userAchievement == null) {
    initializeUserAchievement(initiator)
    userAchievement = UserAchievement.load(initiator)
    log.info('New UserAchievement entity created: {}', [initiator])
  }
  userAchievement.betsCreated = userAchievement.betsCreated.plus(BigInt.fromI32(1)) 
  userAchievement.save()


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


  // UserAchievement Entity
  let userAchievement = UserAchievement.load(participant)
  if(userAchievement == null) {
    initializeUserAchievement(participant)
    userAchievement = UserAchievement.load(participant)
    log.info('New UserAchievement entity created: {}', [participant])
  }
  userAchievement.betsJoined = userAchievement.betsJoined.plus(BigInt.fromI32(1))
  userAchievement.save()
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


  // UserAchievement Entity
  let userAchievement = UserAchievement.load(initiator)
  userAchievement.betsFinished = userAchievement.betsFinished.plus(BigInt.fromI32(1)) 
  userAchievement.save()
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
  globalStat.betProfit = globalStat.betProfit.plus(event.params.profit) 
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
  /*             NameRegistered             */
  /******************************************/

export function handleNameRegistered(event: NameRegistered): void {

  let user = event.params.user.toHex()
    
  //  UserDashStat Entity
  let userDashStat = UserDashStat.load(user)
  if(userDashStat == null) {
    initializeUserDashStat(user)
    userDashStat = UserDashStat.load(user)
    log.info('New UserDashStat entity created: {}', [user])
  }
  userDashStat.userName = event.params.registeredName.toString()
  userDashStat.save()                                                            
}

  /******************************************/
  /*            SocialRegistered            */
  /******************************************/

export function handleSocialRegistered(event: SocialRegistered): void {
  
  let user = event.params.user.toHex()
  
  // UserDashStat Entity
  let userDashStat = UserDashStat.load(user)
  if(userDashStat == null) {
    initializeUserDashStat(user)
    userDashStat = UserDashStat.load(user)
    log.info('New UserDashStat entity created: {}', [user])
  }
  if(event.params.socialID == BigInt.fromI32(1))
    userDashStat.instagram = event.params.registeredLink.toString()
  if(event.params.socialID == BigInt.fromI32(2))
    userDashStat.twitter = event.params.registeredLink.toString()
  if(event.params.socialID == BigInt.fromI32(3))
    userDashStat.tiktok = event.params.registeredLink.toString()
  if(event.params.socialID == BigInt.fromI32(4))
    userDashStat.twitch = event.params.registeredLink.toString()
  if(event.params.socialID == BigInt.fromI32(5))
    userDashStat.youtube = event.params.registeredLink.toString()
  userDashStat.save()                                                         
}

  /******************************************/
  /*            UserBlacklisted             */
  /******************************************/

export function handleUserBlacklisted(event: UserBlacklisted): void {

  let user = event.params.user.toHex()
    
  // UserDashStat Entity
  let userDashStat = UserDashStat.load(user)
  if(userDashStat == null) {
    initializeUserDashStat(user)
    userDashStat = UserDashStat.load(user)
    log.info('New UserDashStat entity created: {}', [user])
  }
  userDashStat.blacklist.push(event.params.userToBlacklist)
  userDashStat.save()                                                         
}

  /******************************************/
  /*       DisplayAchievementChanged        */
  /******************************************/

export function handleDisplayAchievementChanged(event: DisplayAchievementChanged): void {

  let user = event.params.user.toHex()
    
  // UserDashStat Entity
  let userDashStat = UserDashStat.load(user)
  if(userDashStat == null) {
    initializeUserDashStat(user)
    userDashStat = UserDashStat.load(user)
    log.info('New UserDashStat entity created: {}', [user])
  }
  userDashStat.displayAchievement = event.params.achievement
  userDashStat.save()                                                         
}
