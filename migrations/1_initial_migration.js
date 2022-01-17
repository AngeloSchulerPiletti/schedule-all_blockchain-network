const Migrations = artifacts.require("Migrations");
const TaskToken = artifacts.require("TaskToken");
const ITaskToken = artifacts.require("ITaskToken");
const IERC20 = artifacts.require("IERC20");

module.exports = function (deployer) {
  deployer.deploy(Migrations);
  deployer.deploy(TaskToken);
  deployer.deploy(ITaskToken);
  deployer.deploy(IERC20);
};
