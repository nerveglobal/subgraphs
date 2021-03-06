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
  NameRegistered,
  SocialRegistered,
  LocationRegistered,
  UserBlacklisted
} from "../generated/NerveGlobal/NerveGlobal"
import { 
  Task, 
  UserTask,
  Bet,
  UserBet,
  UserFavStat,
  UserDashStat,
  GlobalStat,
  UserSocialStat
} from "../generated/schema"


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
  task.blockNumber = event.block.number


  // UserTask Entity
  let userTask = new UserTask(initiator + "-" + taskID)
  log.info('New UserTask entity created: {} - {}', [initiator, taskID])
  userTask.userAddress = event.params.initiator
  userTask.userStake = event.params.amount
  userTask.endTask = event.params.endTask
  userTask.task = taskID
  userTask.blockNumber = event.block.number
  userTask.save()    
  task.save()  


  // GlobalStats Entity
  let globalStatId = "1"
  let globalStat = GlobalStat.load(globalStatId)
  if(globalStat == null) {
    globalStat = new GlobalStat(globalStatId)
    log.info('New GlobalStat entity created: {}', [globalStatId])
  }
  globalStat.taskCount = globalStat.taskCount.plus(BigInt.fromI32(1)) 
  globalStat.save()

  
  // UserDashStat Entity
  let userDashStat = UserDashStat.load(initiator)
  if(userDashStat == null) {
    userDashStat = new UserDashStat(initiator)
    log.info('New UserDashStat entity created: {}', [initiator])
  }
  userDashStat.spent = userDashStat.spent.plus(event.params.amount)
  userDashStat.save()   
}

  /******************************************/
  /*               TaskJoined          */
  /******************************************/

export function handleTaskJoined(event: TaskJoined): void {
  
  let taskID = event.params.taskID.toHex()
  let participant = event.params.participant.toHex()
  
  
  // Task Entity
  let task = Task.load(taskID)
  if (task === null) {
    task = new Task(taskID);
  }
  task.participants = task.participants.plus(BigInt.fromI32(1))
  task.amount = task.amount.plus(event.params.amount)
  task.blockNumber = event.block.number

  
  // UserTask Entity
  let userTask = new UserTask(participant + "-" + taskID)
  log.info('New UserTask entity created: {} - {}', [participant, taskID])
  userTask.userAddress = event.params.participant
  userTask.userStake = event.params.amount
  userTask.endTask = task.endTask
  userTask.task = taskID
  userTask.blockNumber = event.block.number
  userTask.save()  
  task.save()                                                    


  // UserDashStat Entity
  let userDashStat = UserDashStat.load(participant)
  if(userDashStat == null) {
    userDashStat = new UserDashStat(participant)
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
  if (task === null) {
    task = new Task(taskID);
  }
  if (event.params.vote == true) {
    task.positiveVotes = task.positiveVotes.plus(BigInt.fromI32(1))
  } else {
    task.negativeVotes = task.negativeVotes.plus(BigInt.fromI32(1))
  }
  task.finished = event.params.finished
  task.blockNumber = event.block.number
  task.save()

  
  // UserTask Entity
  let userTask = UserTask.load(participant + "-" + taskID)
  if (userTask === null) {
    userTask = new UserTask(participant + "-" + taskID);
  }
  userTask.voted = true
  userTask.vote = event.params.vote
  userTask.finished = event.params.finished
  userTask.blockNumber = event.block.number
  userTask.save()                                                                 
  

  // UserFavStat Entity
  let userFavStat = UserFavStat.load(participant)
  if(userFavStat == null) {
    userFavStat = new UserFavStat(participant)
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
  if (userTask === null) {
    userTask = new UserTask(participant + "-" + taskID);
  }
  userTask.userStake = BigInt.fromI32(0)
  userTask.blockNumber = event.block.number
  userTask.save()                                                               


  // UserDashStat Entity
  let userDashStat = UserDashStat.load(participant)
  if(userDashStat == null) {
    userDashStat = new UserDashStat(participant)
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
  if (task === null) {
    task = new Task(taskID);
  }
  task.executed = true
  task.blockNumber = event.block.number
  task.save()


  // UserDashStat Entity
  let userDashStat = UserDashStat.load(recipient)
  if(userDashStat == null) {
    userDashStat = new UserDashStat(recipient)
    log.info('New UserDashStat entity created: {}', [recipient])
  }
  userDashStat.earned = userDashStat.earned.plus(event.params.amount)
  userDashStat.save()                                                                 


  // GlobalStats Entity
  let globalStatId = "1"
  let globalStat = GlobalStat.load(globalStatId)
  if(globalStat == null) {
    globalStat = new GlobalStat(globalStatId)
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
  if (task === null) {
    task = new Task(taskID);
  }
  task.proofLink = event.params.proofLink
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
  bet.blockNumber = event.block.number
  bet.save() 
  
  // GlobalStats Entity                                                                   
  let globalStatId = "1"
  let globalStat = GlobalStat.load(globalStatId)
  if(globalStat == null) {
    globalStat = new GlobalStat(globalStatId)
    log.info('New GlobalStat entity created: {}', [globalStatId])
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
  if (bet === null) {
    bet = new Bet(betID);
  }
  if (event.params.joinYes == true) {
    bet.stakeYes = bet.stakeYes.plus(event.params.amount) 
    bet.participantsYes = bet.participantsYes.plus(BigInt.fromI32(1)) 
  } else {
    bet.stakeNo = bet.stakeNo.plus(event.params.amount) 
    bet.participantsNo = bet.participantsNo.plus(BigInt.fromI32(1))
  }
  bet.stakeTotal = bet.stakeTotal.plus(event.params.amount)
  bet.blockNumber = event.block.number
  bet.save()
 

  // UserBet Entity
  let userBet = new UserBet(participant + "-" + betID)
  if (userBet === null) {
    userBet = new UserBet(participant + "-" + betID);
  }
  log.info('New UserBet entity created: {} - {}', [participant, betID])
  userBet.userAddress = event.params.participant 
  userBet.userStake = event.params.amount
  userBet.joinYes = event.params.joinYes
  userBet.bet = betID
  userBet.blockNumber = event.block.number
  userBet.save()


// UserFavStat Entity
  let userFavStat = UserFavStat.load(participant)
  if(userFavStat == null) {
    userFavStat = new UserFavStat(participant)
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
  if (bet === null) {
    bet = new Bet(event.params.betID.toHex());
  }
  bet.noMoreBets = true
  bet.blockNumber = event.block.number
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
  if (bet === null) {
    bet = new Bet(betID);
  }
  bet.finished = true 
  bet.failed = event.params.failed                       
  bet.winnerPartyYes = event.params.winnerPartyYes
  bet.draw = event.params.draw 
  bet.blockNumber = event.block.number
  bet.save()
}

  /******************************************/
  /*               BetRedeemed              */
  /******************************************/

export function handleBetRedeemed(event: BetRedeemed): void {

  let betID = event.params.betID.toHex()
  let participant = event.params.participant.toHex()
  

  // UserBet Entity 1/2
  let userBet = UserBet.load(participant + "-" + betID)
  if (userBet === null) {
    userBet = new UserBet(participant + "-" + betID);
  }
  userBet.redeemed = true

// UserFavStat Entity
  let userFavStat = UserFavStat.load(participant)
  if (userFavStat === null) {
    userFavStat = new UserFavStat(participant);
  }
  if(userFavStat == null) {
    userFavStat = new UserFavStat(participant)
    log.info('New UserFacStat entity created: {}', [participant])
  }
  userFavStat.betsWon = userFavStat.betsWon.plus(BigInt.fromI32(1)) 
  userFavStat.betBalance = userFavStat.betBalance.plus(event.params.profit)
  userFavStat.betBalance = userFavStat.betBalance.plus(userBet.userStake)
  userFavStat.save()

  
// UserBet Entity 1/2
  userBet.userStake = BigInt.fromI32(0)
  userBet.blockNumber = event.block.number
  userBet.save()


  // GlobalStats Entity
  let globalStatId = "1"
  let globalStat = GlobalStat.load(globalStatId)
  if(globalStat == null) {
    globalStat = new GlobalStat(globalStatId)
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
  if (userBet === null) {
    userBet = new UserBet(participant + "-" + betID);
  }
  userBet.userStake = BigInt.fromI32(0)
  userBet.blockNumber = event.block.number
  userBet.save()

  // UserFavStat Entity
  let userFavStat = UserFavStat.load(participant)
  if(userFavStat == null) {
    userFavStat = new UserFavStat(participant)
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
  if (bet === null) {
    bet = new Bet(event.params.betID.toHex());
  }
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
      userDashStat = new UserDashStat(user)
      log.info('New UserDashStat entity created: {}', [user])
    }
  
    // GlobalStats Entity 
    if(userDashStat.userName == "") {                                                                  
      let globalStatId = "1"
      let globalStat = GlobalStat.load(globalStatId)
      if(globalStat == null) {
        globalStat = new GlobalStat(globalStatId)
        log.info('New GlobalStat entity created: {}', [globalStatId])
      }
      globalStat.users = globalStat.users.plus(BigInt.fromI32(1)) 
      globalStat.save()
    }
  
    userDashStat.userName = event.params.registeredName.toString()
    userDashStat.save()     
  }
  
    
    /******************************************/
    /*            SocialRegistered            */
    /******************************************/
  
  export function handleSocialRegistered(event: SocialRegistered): void {
    
    let user = event.params.user.toHex()
    
    //  UserSocialStat Entity
    let userSocialStat = UserSocialStat.load(user)
    if(userSocialStat == null) {
      userSocialStat = new UserSocialStat(user)
      log.info('New UserSocialStat entity created: {}', [user])
    } 
  
    //let socialLinks: string[] = event.params.socialLinks;
    let socialLinks = event.params.socialLinks;
    let socialIds = event.params.socialIds;
  
    log.info('links: {}', socialLinks);
  
    //let socialIds: BigInt[] = event.params.socialIds;
    for(var i = 0; i < socialIds.length; i++)
    { 
  
      log.info('Social link: {}', [socialLinks[i]]);
      log.info('Social ID: {}', [socialIds[i]]);
      if(socialIds[i] == "1")
        userSocialStat.instagram = socialLinks[i]
      if(socialIds[i] == "2")
        userSocialStat.twitter = socialLinks[i]
      if(socialIds[i] == "3")
        userSocialStat.tiktok = socialLinks[i]
      if(socialIds[i] == "4")
        userSocialStat.twitch = socialLinks[i]
      if(socialIds[i] == "5")
        userSocialStat.youtube = socialLinks[i]
    }
    userSocialStat.save()                                                         
  }
  
  /******************************************/
  /*             LocationRegistered         */
  /******************************************/
  
  export function handleLocationRegistered(event: LocationRegistered): void {
  
    let user = event.params.user.toHex()
    
    //  UserSocialStat Entity
    let userSocialStat = UserSocialStat.load(user)
    if(userSocialStat == null) {
      userSocialStat = new UserSocialStat(user)
      log.info('New UserSocialStat entity created: {}', [user])
    }
    if(event.params.latitude == BigInt.fromI32(1))
    userSocialStat.userLatitude = event.params.latitude.toString()
    if(event.params.longitude == BigInt.fromI32(2))
    userSocialStat.userLongitude = event.params.longitude.toString()
    userSocialStat.save()                                                            
  }
  
  
    /******************************************/
    /*            UserBlacklisted             */
    /******************************************/
  
  export function handleUserBlacklisted(event: UserBlacklisted): void {
  
    let user = event.params.user.toHex()
      
    //  UserSocialStat Entity
    let userSocialStat = UserSocialStat.load(user)
    if (userSocialStat === null) {
      userSocialStat = new UserSocialStat(user);
    }
    if(userSocialStat == null) {
      userSocialStat = new UserSocialStat(user)
      log.info('New UserSocialStat entity created: {}', [user])
    }
    userSocialStat.blacklist.push(event.params.userToBlacklist)
    userSocialStat.save()                                                         
  }