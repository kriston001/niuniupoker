// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "./BBVersion.sol";

// 使用集中版本管理
function getErrorsVersion() pure returns (string memory) {
    return BBVersion.VERSION;
}

// Card related errors
error InvalidCardIndex();
error InvalidCardCount();
error CardAlreadyDealt();
error CardTypeAlreadyCalculated();
error CardLimitExceeded();
error FailedToGenerateUniqueCard();

// Room Card related errors
error NoRoomCardOwned();
error RoomCardNotApproved();
error InvalidRoomCardContract();
error RoomCardConsumptionFailed();
error InvalidRoomCardParams();

// Player related errors
error InvalidPlayerAddress();
error PlayerNotFound();
error PlayerAlreadyExists();
error NotYourTurn();
error PlayerNotInReadyState();
error PlayerNotInPlayingState();
error PlayerNotInFoldedState();
error PlayerNotInShowingState();
error PlayerNotInSettledState();
error InvalidPlayerState();
error MaxPlayersReached();
error ActionTimeOut();

// Game state related errors
error InvalidRound();
error GameNotInWaitingState();
error GameNotInPlayingState();
error GameNotInEndedState();
error GameNotInDealingState();
error GameNotInCalculatingState();
error GameNotInSettlingState();
error GameAlreadyStarted();
error GameNotNextStep();
error GameNotEnded();
error GameNotTimeToReset();

// Table related errors
error TableNotActive();
error TableNotInactive();
error TableAlreadyLiquidated();
error TableNotFound();
error TableDoesNotExist();
error PlayerAlreadyJoined();
error TableNotInBetting();

// Role related errors
error NotBanker();
error OnlyMainContractCanCall();
error OnlyTableContractCanRemoveItself();
error OnlyGameTableCanCall();
error InvalidGameTable();

// Financial related errors
error InsufficientFunds();
error TransferFailed();
error InvalidBetAmount();
error NoFeesToWithdraw();
error NoPlatformFeesToWithdraw();
error BetAmountTooSmall();

// Configuration related errors
error InvalidMaxPlayers();
error InvalidPlayerTimeout();
error InvalidTableInactiveTimeout();
error MinBetMustBePositive();
error HouseFeePercentTooHigh();
error BankerFeePercentMustBePositive();
error PlayerTimeoutMustBePositive();
error TableInactiveTimeoutMustBePositive();
error InvalidGameHistoryAddress();
error MaxPlayersTooSmall();
error ContractPaused();
error InvalidBankerFeePercent();
error InvalidLiquidatorFeePercent();
error BankerCannotLiquidate();

// Game progress related errors
error NotAllPlayersReady();
error NotAllCardsDealt();
error NotAllTypesCalculated();
error NotEnoughPlayers();

// reward pool related errors
error InvalidGameMainAddress();
error InvalidRewardAmount();
error InvalidWinProbability();
error RewardPoolNotActive();
error NotPoolOwner();
error RewardPoolInUse();
error NotTableBanker();
error NoRewardPoolForTable();
error InvalidRewardPoolAddress();
error InvalidRoomLevelAddress();

// nft related errors
error RoomLevelLimitExceeded();
error RoomLevelRequired();

error InvalidAddress();
error InvalidGameTableFactoryAddress();

// Randomness related errors
error SessionNotFound();
error CommitDeadlineExpired();
error RevealPhaseNotStarted();
error RevealDeadlineExpired();
error SessionNotRevealing();
error NotAParticipant();
error AlreadyCommitted();
error NotCommitted();
error AlreadyRevealed();
error InvalidReveal();
error InvalidParticipants();
error InvalidRandomnessManagerAddress();

