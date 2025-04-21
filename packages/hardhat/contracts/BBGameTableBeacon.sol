// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/proxy/beacon/UpgradeableBeacon.sol";

/**
 * Beacon 合约，用于指向可升级的实现合约
 */
contract BBGameTableBeacon is UpgradeableBeacon {
    constructor(address implementation, address owner) UpgradeableBeacon(implementation, owner) {}
}
