import { BigInt } from "@graphprotocol/graph-ts"
import { log } from '@graphprotocol/graph-ts'
import {
  LocationRegistered,
  NameRegistered,
  SocialRegistered,
  UserBlacklisted
} from "../generated/NerveSocial/NerveSocial"
import {
  UserDashStat
} from "../generated/schema"


  /******************************************/
  /*             Initialization             */
  /******************************************/

function initializeUserDashStat (id: string): void {
  let userDashStat = new UserDashStat(id)
  userDashStat.userName = "Unknown"
  userDashStat.userLatitude = "None"
  userDashStat.userLongitude = "None"
  userDashStat.youtube = "None"
  userDashStat.twitter = "None"
  userDashStat.instagram = "None"
  userDashStat.tiktok = "None"
  userDashStat.twitch = "None"
  userDashStat.blacklist = []
  userDashStat.save()
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
  /*             LocationRegistered         */
  /******************************************/

export function handleLocationRegistered(event: LocationRegistered): void {

  let user = event.params.user.toHex()
  
  //  UserDashStat Entity
  let userDashStat = UserDashStat.load(user)
  if(userDashStat == null) {
    initializeUserDashStat(user)
    userDashStat = UserDashStat.load(user)
    log.info('New UserDashStat entity created: {}', [user])
  }
  if(event.params.socialID == BigInt.fromI32(1))
    userDashStat.userLatitude = event.params.latitude.toString()
  if(event.params.socialID == BigInt.fromI32(2))
    userDashStat.userLongitude = event.params.longitude.toString()
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
