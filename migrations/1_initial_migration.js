const Migrations = artifacts.require("Migrations");
const TaskToken = artifacts.require("TaskToken");

module.exports = function (deployer) {
  deployer.deploy(Migrations);
  deployer.deploy(TaskToken);
};
