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
error PlatformFeePercentMustBePositive();
error PlayerTimeoutMustBePositive();
error TableInactiveTimeoutMustBePositive();
error InvalidGameHistoryAddress();
error MaxPlayersTooSmall();
error ContractPaused();

// Game progress related errors
error NotAllPlayersReady();
error NotAllCardsDealt();
error NotAllTypesCalculated();
error NotEnoughPlayers();

