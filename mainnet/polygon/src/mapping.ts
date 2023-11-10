import { BigInt, log } from '@graphprotocol/graph-ts';
import {
	LocationRegistered,
	NameRegistered,
	RecipientRedeemed,
	SocialRegistered,
	TaskAdded,
	TaskJoined,
	TaskProved,
	UserBlacklisted,
	UserRedeemed,
	Voted,
} from '../generated/NerveGlobal/NerveGlobal';
import { GlobalStat, GlobalUser, Task, UserDashStat, UserFavStat, UserSocialStat, UserTask } from '../generated/schema';

/******************************************/
/*               TaskAdded                */
/******************************************/

export function handleTaskAdded(event: TaskAdded): void {
	let taskID = event.params.taskID.toHex();
	let initiator = event.params.initiator.toHex();
	let recipient = event.params.recipient.toHex();
	let initiatorDashStat = UserDashStat.load(initiator);
	let recipientDashStat = UserDashStat.load(recipient);

	// Task Entity
	let task = new Task(taskID);
	log.info('New Task entity created: {}', [taskID]);
	task.initiatorAddress = event.params.initiator;
	task.recipientAddress = event.params.recipient;
	task.amount = event.params.amount;
	task.entranceAmount = event.params.entranceAmount;
	task.description = event.params.description;
	task.endTask = event.params.endTask;
	task.participants = BigInt.fromI32(1);
	task.language = event.params.language;
	task.taskLatitude = event.params.latitude;
	task.taskLongitude = event.params.longitude;
	if (initiatorDashStat != null) {
		task.initiatorName = initiatorDashStat.userName;
	}
	if (recipientDashStat != null) {
		task.recipientName = recipientDashStat.userName;
	}
	task.blockNumber = event.block.number;
	task.chainId = BigInt.fromI32(137);

	// UserTask Entity
	let userTask = new UserTask(initiator + '-' + taskID);
	log.info('New UserTask entity created: {} - {}', [initiator, taskID]);
	userTask.userAddress = event.params.initiator;
	userTask.userStake = event.params.amount;
	userTask.endTask = event.params.endTask;
	userTask.task = taskID;
	userTask.blockNumber = event.block.number;
	userTask.save();
	task.save();

	// GlobalStats Entity
	let globalStatId = '1';
	let globalStat = GlobalStat.load(globalStatId);
	if (globalStat == null) {
		globalStat = new GlobalStat(globalStatId);
		log.info('New GlobalStat entity created: {}', [globalStatId]);
	}
	globalStat.taskCount = globalStat.taskCount.plus(BigInt.fromI32(1));
	globalStat.save();

	// UserDashStat Entity
	let userDashStat = UserDashStat.load(initiator);
	if (userDashStat == null) {
		userDashStat = new UserDashStat(initiator);
		log.info('New UserDashStat entity created: {}', [initiator]);
	}
	userDashStat.spent = userDashStat.spent.plus(event.params.amount);
	userDashStat.userSocialStat = initiator;
	userDashStat.save();

	let otherDashStat = UserDashStat.load(recipient);
	if (otherDashStat == null) {
		otherDashStat = new UserDashStat(recipient);
		log.info('New UserDashStat entity created: {}', [recipient]);
	}
	otherDashStat.lastUpdate = event.block.timestamp;
	otherDashStat.save();

	//  UserSocialStat Entity
	let userSocialStat = UserSocialStat.load(recipient);
	if (userSocialStat == null) {
		userSocialStat = new UserSocialStat(recipient);
		log.info('New UserSocialStat entity created: {}', [recipient]);
	}
	userSocialStat.lastUpdate = event.block.timestamp;
	userSocialStat.save();
}

/******************************************/
/*               TaskJoined          */
/******************************************/

export function handleTaskJoined(event: TaskJoined): void {
	let taskID = event.params.taskID.toHex();
	let participant = event.params.participant.toHex();
	let participantDashStat = UserDashStat.load(participant);

	// Task Entity
	let task = Task.load(taskID);
	if (task === null) {
		task = new Task(taskID);
	}
	task.participants = task.participants.plus(BigInt.fromI32(1));
	task.amount = task.amount.plus(event.params.amount);
	task.blockNumber = event.block.number;

	// UserTask Entity
	let userTask = new UserTask(participant + '-' + taskID);
	log.info('New UserTask entity created: {} - {}', [participant, taskID]);
	userTask.userAddress = event.params.participant;
	if (participantDashStat != null) {
		userTask.userName = participantDashStat.userName;
	}
	userTask.userStake = event.params.amount;
	userTask.endTask = task.endTask;
	userTask.task = taskID;
	userTask.blockNumber = event.block.number;
	userTask.save();
	task.save();

	// UserDashStat Entity
	let userDashStat = UserDashStat.load(participant);
	if (userDashStat == null) {
		userDashStat = new UserDashStat(participant);
		log.info('New UserDashStat entity created: {}', [participant]);
	}
	userDashStat.spent = userDashStat.spent.plus(event.params.amount);
	userDashStat.userSocialStat = participant;
	userDashStat.save();
}

/******************************************/
/*                 Voted                  */
/******************************************/

export function handleVoted(event: Voted): void {
	let taskID = event.params.taskID.toHex();
	let participant = event.params.participant.toHex();

	// Task Entity
	let task = Task.load(taskID);
	if (task === null) {
		task = new Task(taskID);
	}
	if (event.params.vote == true) {
		task.positiveVotes = task.positiveVotes.plus(BigInt.fromI32(1));
	} else {
		task.negativeVotes = task.negativeVotes.plus(BigInt.fromI32(1));
	}
	task.finished = event.params.finished;
	task.blockNumber = event.block.number;
	task.save();

	// UserTask Entity
	let userTask = UserTask.load(participant + '-' + taskID);
	if (userTask === null) {
		userTask = new UserTask(participant + '-' + taskID);
	}
	userTask.voted = true;
	userTask.vote = event.params.vote;
	userTask.finished = event.params.finished;
	userTask.blockNumber = event.block.number;
	userTask.save();

	// UserFavStat Entity
	let userFavStat = UserFavStat.load(participant);
	if (userFavStat == null) {
		userFavStat = new UserFavStat(participant);
		log.info('New UserFavStat entity created: {}', [participant]);
	}
	if (event.params.vote == true) {
		userFavStat.positiveVotes = userFavStat.positiveVotes.plus(BigInt.fromI32(1));
	} else {
		userFavStat.negativeVotes = userFavStat.negativeVotes.plus(BigInt.fromI32(1));
	}
	userFavStat.save();
}

/******************************************/
/*              UserRedeemed              */
/******************************************/

export function handleUserRedeemed(event: UserRedeemed): void {
	let taskID = event.params.taskID.toHex();
	let participant = event.params.participant.toHex();

	// UserTask Entity
	let userTask = UserTask.load(participant + '-' + taskID);
	if (userTask === null) {
		userTask = new UserTask(participant + '-' + taskID);
	}
	userTask.userStake = BigInt.fromI32(0);
	userTask.blockNumber = event.block.number;
	userTask.save();

	// UserDashStat Entity
	let userDashStat = UserDashStat.load(participant);
	if (userDashStat == null) {
		userDashStat = new UserDashStat(participant);
		log.info('New UserDashStat entity created: {}', [participant]);
	}
	userDashStat.spent = userDashStat.spent.minus(event.params.amount);
	userDashStat.save();
}

/******************************************/
/*            RecipientRedeemed           */
/******************************************/

export function handleRecipientRedeemed(event: RecipientRedeemed): void {
	let taskID = event.params.taskID.toHex();
	let recipient = event.params.recipient.toHex();

	// Task Entity
	let task = Task.load(taskID);
	if (task === null) {
		task = new Task(taskID);
	}
	task.executed = true;
	task.blockNumber = event.block.number;
	task.save();

	// UserDashStat Entity
	let userDashStat = UserDashStat.load(recipient);
	if (userDashStat == null) {
		userDashStat = new UserDashStat(recipient);
		log.info('New UserDashStat entity created: {}', [recipient]);
	}
	userDashStat.earned = userDashStat.earned.plus(event.params.amount);
	userDashStat.save();

	// GlobalStats Entity
	let globalStatId = '1';
	let globalStat = GlobalStat.load(globalStatId);
	if (globalStat == null) {
		globalStat = new GlobalStat(globalStatId);
	}
	globalStat.taskEarnings = globalStat.taskEarnings.plus(event.params.amount);
	globalStat.save();
}

/******************************************/
/*              TaskProved                */
/******************************************/

export function handleTaskProved(event: TaskProved): void {
	let taskID = event.params.taskID.toHex();

	// Task Entity
	let task = Task.load(taskID);
	if (task === null) {
		task = new Task(taskID);
	}
	let recipient = task.recipientAddress.toHex();
	task.proofLink = event.params.proofLink;
	task.save();

	// UserDashStat Entity
	let otherDashStat = UserDashStat.load(recipient);
	if (otherDashStat == null) {
		otherDashStat = new UserDashStat(recipient);
		log.info('New UserDashStat entity created in handleTaskProved: {}', [recipient]);
	}
	otherDashStat.lastUpdate = event.block.timestamp;
	otherDashStat.save();

	//  UserSocialStat Entity
	let userSocialStat = UserSocialStat.load(recipient);
	if (userSocialStat == null) {
		userSocialStat = new UserSocialStat(recipient);
		log.info('New UserSocialStat entity created: {}', [recipient]);
	}
	userSocialStat.lastUpdate = event.block.timestamp;
	userSocialStat.save();
}

/******************************************/
/*             NameRegistered             */
/******************************************/

export function handleNameRegistered(event: NameRegistered): void {
	let user = event.params.user.toHex();

	//  UserSocialStat Entity
	let userSocialStat = UserSocialStat.load(user);
	if (userSocialStat == null) {
		userSocialStat = new UserSocialStat(user);
		log.info('New UserSocialStat entity created: {}', [user]);
	}
	userSocialStat.userName = event.params.registeredName.toString();
	userSocialStat.save();

	//  UserDashStat Entity
	let userDashStat = UserDashStat.load(user);
	if (userDashStat == null) {
		userDashStat = new UserDashStat(user);
		log.info('New UserDashStat entity created: {}', [user]);
	}

	// GlobalStats Entity
	if (userDashStat.userName == '') {
		let globalStatId = '1';
		let globalStat = GlobalStat.load(globalStatId);
		if (globalStat == null) {
			globalStat = new GlobalStat(globalStatId);
			log.info('New GlobalStat entity created: {}', [globalStatId]);
		}
		globalStat.userCount = globalStat.userCount.plus(BigInt.fromI32(1));
		userDashStat.userSocialStat = user;
		globalStat.save();

		// GlobalUsers Entity
		let globalUser = new GlobalUser(user);
		globalUser.userAddress = event.params.user;
		globalUser.userName = event.params.registeredName.toString();
		globalUser.globalStat = globalStatId;
		globalUser.save();
	}

	userDashStat.userName = event.params.registeredName.toString();
	userDashStat.save();
}

/******************************************/
/*            SocialRegistered            */
/******************************************/

export function handleSocialRegistered(event: SocialRegistered): void {
	let user = event.params.user.toHex();

	//  UserSocialStat Entity
	let userSocialStat = UserSocialStat.load(user);
	if (userSocialStat == null) {
		userSocialStat = new UserSocialStat(user);
		log.info('New UserSocialStat entity created: {}', [user]);
	}

	let socialLinks = event.params.socialLinks;
	let socialIds = event.params.socialIds;

	for (var i = 0; i < socialIds.length; i++) {
		let socialLink = socialLinks[i];
		if (socialLink != '') {
			switch (BigInt.fromString(socialIds[i].toString()).toI32()) {
				case 1:
					userSocialStat.instagram = socialLink;
					break;
				case 2:
					userSocialStat.twitter = socialLink;
					break;
				case 3:
					userSocialStat.tiktok = socialLink;
					break;
				case 4:
					userSocialStat.twitch = socialLink;
					break;
				case 5:
					userSocialStat.youtube = socialLink;
					break;
				default:
					break;
			}
			log.info('Social link: {}', [socialLink]);
			log.info('Social ID: {}', [socialIds[i].toString()]);
		}
	}
	userSocialStat.save();
}

/******************************************/
/*             LocationRegistered         */
/******************************************/

export function handleLocationRegistered(event: LocationRegistered): void {
	let user = event.params.user.toHex();

	//  UserSocialStat Entity
	let userSocialStat = UserSocialStat.load(user);
	if (userSocialStat == null) {
		userSocialStat = new UserSocialStat(user);
		log.info('New UserSocialStat entity created: {}', [user]);
	}
	userSocialStat.userLatitude = event.params.latitude;
	userSocialStat.userLongitude = event.params.longitude;
	userSocialStat.lastUpdate = event.block.timestamp;
	userSocialStat.save();
}

/******************************************/
/*            UserBlacklisted             */
/******************************************/

export function handleUserBlacklisted(event: UserBlacklisted): void {
	let user = event.params.user.toHex();

	//  UserSocialStat Entity
	let userSocialStat = UserSocialStat.load(user);
	if (userSocialStat == null) {
		userSocialStat = new UserSocialStat(user);
		log.info('New UserSocialStat entity created: {}', [user]);
	}
	let blacklist = userSocialStat.blacklist;
	blacklist.push(event.params.userToBlacklist);
	userSocialStat.blacklist = blacklist;
	userSocialStat.save();
}
