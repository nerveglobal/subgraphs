import { BigInt } from "@graphprotocol/graph-ts"
import { log } from '@graphprotocol/graph-ts'
import {
  NameRegistered,
  SocialRegistered,
  LocationRegistered,
  UserBlacklisted
} from "../generated/NerveSocial/NerveSocial"
import {
  UserSocialStat,
  UserDashStat
} from "../generated/schema"

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
    userDashStat.spent = BigInt.fromI32(0)
    userDashStat.earned = BigInt.fromI32(0)
    userDashStat.lastUpdate = BigInt.fromI32(0)
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
    log.info('Social ID: {}', [socialIds[i].toString()]);
    if(socialIds[i].equals(BigInt.fromI32(1)))
      userSocialStat.instagram = socialLinks[i]
    if(socialIds[i] == BigInt.fromI32(2))
      userSocialStat.twitter = socialLinks[i]
    if(socialIds[i] == BigInt.fromI32(3))
      userSocialStat.tiktok = socialLinks[i]
    if(socialIds[i] == BigInt.fromI32(4))
      userSocialStat.twitch = socialLinks[i]
    if(socialIds[i] == BigInt.fromI32(5))
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
  if(userSocialStat == null) {
    userSocialStat = new UserSocialStat(user)
    log.info('New UserSocialStat entity created: {}', [user])
  }
  userSocialStat.blacklist.push(event.params.userToBlacklist)
  userSocialStat.save()                                                         
}
