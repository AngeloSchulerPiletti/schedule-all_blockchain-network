const { assert } = require('chai');

const TaskToken = artifacts.require("TaskToken");

require('chai')
  .use(require('chai-as-promised'))
  .should()

contract("TaskToken", ([owner, investor]) => {
    var taskToken;
    const other_investor = '0x4B2582c96b0A86444dD2dc60a5bdf2eB074e8E7A';

    before(async () => {
        taskToken = await TaskToken.new()
    })

    it("TaskToken Deployed", async () => {
        const name = await taskToken.name();
        assert.equal(name, "TaskToken", "Contract not deployed");
    });
    
    it("Checking Initial Values", async()=>{
        const contractBalance = await taskToken.balanceOf.call(taskToken.address);
        const ownerBalance = await taskToken.balanceOf.call(owner);

        var result = false;
        if(contractBalance == 700000000 && ownerBalance == 300000000){
            result = true;
        }
        assert.equal(result, true, `Balances aren't correct. Gave: ${contractBalance} and ${ownerBalance}`);
    })

    it("Transfering TaskToken From Owner", async () => {
        await taskToken.transfer(investor, 1000000, {from: owner});
        var balanceResult = await taskToken.balanceOf(investor);
        assert.equal(balanceResult.toString(), '1000000', `Investor should has 1.000.000 but actually has ${balanceResult}`);
    });
    
    it("Transfering TaskToken Back To Owner From Investor", async () => {
        await taskToken.transfer(owner, 1000000, {from: investor});
        var balanceResult = await taskToken.balanceOf(investor);
        assert.equal(balanceResult.toString(), '0', `Investor should has 0 but actually has ${balanceResult}`);
    });

    it("TransferFrom Test", async () => {
        await taskToken.approve(investor, 1000, {from: owner});
        await taskToken.transferFrom(owner, investor, 1000, {from: investor});
        var balanceResult = await taskToken.balanceOf(investor);
        assert.equal(balanceResult.toString(), '1000', `Investor should has 1000 but actually has ${balanceResult}`);
    })

    it("Buying From The Contract", async () => {
        await taskToken.buyFromContract(1000, {from: investor, value: 1000*(10**15)});
        var balanceResult = await taskToken.balanceOf(investor);
        assert.equal(balanceResult.toString(), '2000', `Investor should has 2000 but actually has ${balanceResult}`);
    })

    it("Buying From The Contract, Without Permission", async () => {
        await taskToken.changeBuyAvailability({from: owner});
        await taskToken.buyFromContract(100, {from: other_investor, value: 100*(10**15)}).should.be.rejected;
        var balanceResult = await taskToken.balanceOf(other_investor);
        assert.equal(balanceResult.toString(), '0', `Investor should has 0 but actually has ${balanceResult}`);
    })

    it("Buying From The Contract, With Old Price", async () => {
        await taskToken.changeBuyAvailability({from: owner}); //Turn availability back
        await taskToken.changeTokenOfferCotation(BigInt(10**16), {from: owner});
        await taskToken.buyFromContract(100, {from: other_investor, value: 100*(10**15)}).should.be.rejected;
        var balanceResult = await taskToken.balanceOf(other_investor);
        assert.equal(balanceResult.toString(), '0', `Investor should has 0 but actually has ${balanceResult}`);
    });


    it("Task 2 is not in staking yet", async () => {
        // var payout = await taskToken.taskIsInStaking(5);
        var payout = await taskToken.taskIsInStaking(2);
        assert.equal(payout, false, `O payout foi: ${payout}`)
    });
    
    it("Logging User Signed Up, then trying to get the evnts", async () => {
        const name = "angelo";
        var receipt = await taskToken.userSignedUp(name);
        var eventsReceipt = await taskToken.getPastEvents('SignedUpUser')
        assert.equal(eventsReceipt[0].returnValues[1], name, `O payout foi: ${eventsReceipt[0].returnValues}`)
    });

    // it("Ether before", async () => {
    //     var balance = await web3.eth.getBalance(owner);
    //     console.log(`balance before: ${balance}`);
    // });
    // it("See the return from undefined", async () =>{
    //     var resp = await taskToken.addTaskToStaking(2, {from: owner});
    //     console.log(resp.receipt.gasUsed);
    //     assert.equal(typeof resp, "object", `The resp is: ${resp}`);
    // });
    // it("Ether after", async () => {
    //     var balance = await web3.eth.getBalance(owner);
    //     console.log(`balance after: ${balance}`);
    // });

    // it("Task 2 is in staking", async () => {
    //     var payout = await taskToken.taskIsInStaking(2);
    //     assert.equal(payout, true, `O payout foi: ${payout}`)
    // });


    
    // it("Trying to sign up new user", async () =>{
    //     var resp = await taskToken.userSignedUp("leandro");
    //     console.log(resp.receipt.gasUsed);
    //     assert.equal(typeof resp, "object", `The resp is: ${resp}`);
    // });

});

// contract('TokenFarm', ([owner, investor]) => {
//     let daiToken, dappToken, tokenFarm
  
//     before(async () => {
//       // Load Contracts
//       daiToken = await DaiToken.new()
//       dappToken = await DappToken.new()
//       tokenFarm = await TokenFarm.new(dappToken.address, daiToken.address)
  
//       // Transfer all Dapp tokens to farm (1 million)
//       await dappToken.transfer(tokenFarm.address, tokens('1000000'))
  
//       // Send tokens to investor
//       await daiToken.transfer(investor, tokens('100'), { from: owner })
//     })
  
//     describe('Mock DAI deployment', async () => {
//       it('has a name', async () => {
//         const name = await daiToken.name()
//         assert.equal(name, 'Mock DAI Token')
//       })
//     })
  
//     describe('Dapp Token deployment', async () => {
//       it('has a name', async () => {
//         const name = await dappToken.name()
//         assert.equal(name, 'DApp Token')
//       })
//     })
  
//     describe('Token Farm deployment', async () => {
//       it('has a name', async () => {
//         const name = await tokenFarm.name()
//         assert.equal(name, 'Dapp Token Farm')
//       })
  
//       it('contract has tokens', async () => {
//         let balance = await dappToken.balanceOf(tokenFarm.address)
//         assert.equal(balance.toString(), tokens('1000000'))
//       })
//     })
  
//     describe('Farming tokens', async () => {
  
//       it('rewards investors for staking mDai tokens', async () => {
//         let result
  
//         // Check investor balance before staking
//         result = await daiToken.balanceOf(investor)
//         assert.equal(result.toString(), tokens('100'), 'investor Mock DAI wallet balance correct before staking')
  
//         // Stake Mock DAI Tokens
//         await daiToken.approve(tokenFarm.address, tokens('100'), { from: investor })
//         await tokenFarm.stakeTokens(tokens('100'), { from: investor })
  
//         // Check staking result
//         result = await daiToken.balanceOf(investor)
//         assert.equal(result.toString(), tokens('0'), 'investor Mock DAI wallet balance correct after staking')
  
//         result = await daiToken.balanceOf(tokenFarm.address)
//         assert.equal(result.toString(), tokens('100'), 'Token Farm Mock DAI balance correct after staking')
  
//         result = await tokenFarm.stakingBalance(investor)
//         assert.equal(result.toString(), tokens('100'), 'investor staking balance correct after staking')
  
//         result = await tokenFarm.isStaking(investor)
//         assert.equal(result.toString(), 'true', 'investor staking status correct after staking')
  
//         // Issue Tokens
//         await tokenFarm.issueTokens({ from: owner })
  
//         // Check balances after issuance
//         result = await dappToken.balanceOf(investor)
//         assert.equal(result.toString(), tokens('100'), 'investor DApp Token wallet balance correct affter issuance')
  
//         // Ensure that only onwer can issue tokens
//         await tokenFarm.issueTokens({ from: investor }).should.be.rejected;
  
//         // Unstake tokens
//         await tokenFarm.unstakeTokens({ from: investor })
  
//         // Check results after unstaking
//         result = await daiToken.balanceOf(investor)
//         assert.equal(result.toString(), tokens('100'), 'investor Mock DAI wallet balance correct after staking')
  
//         result = await daiToken.balanceOf(tokenFarm.address)
//         assert.equal(result.toString(), tokens('0'), 'Token Farm Mock DAI balance correct after staking')
  
//         result = await tokenFarm.stakingBalance(investor)
//         assert.equal(result.toString(), tokens('0'), 'investor staking balance correct after staking')
  
//         result = await tokenFarm.isStaking(investor)
//         assert.equal(result.toString(), 'false', 'investor staking status correct after staking')
//       })
//     })
  
//   })