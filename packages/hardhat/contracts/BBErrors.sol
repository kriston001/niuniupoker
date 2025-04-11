// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

// Card related errors
error InvalidCardIndex();
error InvalidCardCount();
error CardAlreadyDealt();
error CardTypeAlreadyCalculated();

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

// Table related errors
error TableNotActive();
error TableNotInactive();
error TableAlreadyLiquidated();
error TableNotFound();
error TableDoesNotExist();

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
error PlatformFeePercentTooHigh();
error InvalidGameHistoryAddress();
error MaxPlayersTooSmall();
error ContractPaused();

// Game progress related errors
error NotAllPlayersReady();
error NotAllCardsDealt();
error NotAllTypesCalculated();
error NotEnoughPlayers();

