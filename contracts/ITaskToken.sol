// SPDX-License-Identifier: MIT
pragma solidity ^0.8.3;

interface ITaskToken{
    event SignedUpUser(address indexed _user, string _username);

    event NewTaskInStaking(uint256 indexed _taskId, address indexed _owner);
    event TaskDeletedFromStaking(uint256 indexed _taskId, address indexed _finisher);
}