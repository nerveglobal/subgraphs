import { BigInt } from "@graphprotocol/graph-ts"
import { log } from '@graphprotocol/graph-ts'
import {
  NameRegistered,
  SocialRegistered,
  LocationRegistered,
  UserBlacklisted
} from "../generated/NerveSocial/NerveSocial"
import {
  UserSocialStat
} from "../generated/schema"

  /******************************************/
  /*             NameRegistered             */
  /******************************************/

export function handleNameRegistered(event: NameRegistered): void {

  let user = event.params.user.toHex()
    
  //  UserSocialStat Entity
  let userSocialStat = UserSocialStat.load(user)
  if(userSocialStat == null) {
    userSocialStat = new UserSocialStat(user)
    log.info('New UserSocialStat entity created: {}', [user])
  }
  userSocialStat.userName = event.params.registeredName.toString()
  userSocialStat.save()                                                            
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
  let registeredLinks = event.params.registeredLinks;
  let socialIDs = event.params.socialIDs;

  log.info('links: {}', registeredLinks);

  //let socialIds: BigInt[] = event.params.socialIds;
  for(var i = 0; i < socialIDs.length; i++)
  { 

    log.info('Social link: {}', [registeredLinks[i]]);
    log.info('Social ID: {}', [socialIDs[i].toString()]);
    if(socialIDs[i].equals(BigInt.fromI32(1)))
      userSocialStat.instagram = registeredLinks[i]
    if(socialIDs[i] == BigInt.fromI32(2))
      userSocialStat.twitter = registeredLinks[i]
    if(socialIDs[i] == BigInt.fromI32(3))
      userSocialStat.tiktok = registeredLinks[i]
    if(socialIDs[i] == BigInt.fromI32(4))
      userSocialStat.twitch = registeredLinks[i]
    if(socialIDs[i] == BigInt.fromI32(5))
      userSocialStat.youtube = registeredLinks[i]
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
  if(userSocialStat == null) {
    userSocialStat = new UserSocialStat(user)
    log.info('New UserSocialStat entity created: {}', [user])
  }
  userSocialStat.blacklist.push(event.params.userToBlacklist)
  userSocialStat.save()                                                         
}
