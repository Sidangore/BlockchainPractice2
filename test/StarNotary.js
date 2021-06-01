const StarNotary = artifacts.require('../contracts/StarNotary.sol');


let accounts;
var owner;

contract('StarNotary', (accs) => {
    accounts = accs;
    owner = accounts[0];
});
it('can create a star', async() => {
    let tokenId = 1;
    let instance = await StarNotary.deployed();
    await instance.createStar("Siddhant Star", tokenId, { from: accounts[0] });
    assert.equal(await instance.tokenIdToStarInfo.call(tokenId), "Siddhant Star");
});

it('lets user1 put up their star for sale', async() => {
    let user1 = accounts[1];
    let starId = 2;
    let starPrice = web3.utils.toWei(".01", "ether");
    let instance = await StarNotary.deployed();
    await instance.createStar("siddhant star", starId, { from: user1 });
    await instance.putStarForSale(starId, starPrice, { from: user1 });
    assert.equal(await instance.starsForSale.call(starId), starPrice);
});

it('lets user1 gets the funds after the sale', async() => {
    let instance = await StarNotary.deployed();
    let user1 = accounts[1];
    let user2 = accounts[2];
    let starId = 3;
    let starPrice = web3.utils.toWei(".01", "ether");
    let balance = web3.utils.toWei('.05', "ether");
    await instance.createStar("siddhant star", starId, { from: user1 });
    await instance.putStarForSale(starId, starPrice, { from: user1 });
    let balanceOfUserBeforeTx = await web3.eth.getBalance(user1);
    await instance.buyStar(starId, { from: user2, value: balance });
    let balanceOfUserAfterTx = await web3.eth.getBalance(user1);
    let value1 = Number(balanceOfUserBeforeTx) + Number(starPrice);
    let value2 = Number(balanceOfUserAfterTx);
    assert.equal(value1, value2);
});

it('let user2 buy a star, if it is put up for sale', async() => {
    let instance = await StarNotary.deployed();
    let user1 = accounts[0];
    let user2 = accounts[1];
    let starId = 4;
    let starPrice = web3.utils.toWei("0.1", "ether");
    let balance = web3.utils.toWei("0.5", "ether");
    await instance.createStar("siddhant star", starId, { from: user1 });
    await instance.putStarForSale(starId, starPrice, { from: user1 });
    await instance.buyStar(starId, { from: user2, value: balance });
    assert.equal(await instance.ownerOf.call(starId), user2);
});

it('let user2 but the star and decrease its balance in ether', async() => {
    let instance = await StarNotary.deployed();
    let user1 = accounts[1];
    let user2 = accounts[2];
    let starId = 5;
    let starPrice = web3.utils.toWei(".1", "ether");
    let balance = web3.utils.toWei(".5", "ether");
    await instance.createStar("siddhant star", starId, { from: user1 });
    await instance.putStarForSale(starId, starPrice, { from: user1 });
    let balanceOfUser2BeforeTx = await web3.eth.getBalance(user2);
    await instance.buyStar(starId, { from: user2, value: balance, gasPrice: 0 });
    let balanceOfUser2AfterTx = await web3.eth.getBalance(user2);
    let value = Number(balanceOfUser2BeforeTx) - Number(balanceOfUser2AfterTx);
    assert(value == starPrice);
});

it('can add the star name and the symbol properly', async() => {
    let instance = await StarNotary.deployed();
    let user1 = accounts[1];
    let starId = 101;
    await instance.createStar("Siddhant", starId, { from: user1 });
    assert.equal(await instance.name(), "Siddhant");
    assert.equal(await instance.symbol(), "SID");
});

it('two users can exchange the stars', async() => {
    let instance = await StarNotary.deployed();
    let user1 = accounts[1];
    let user2 = accounts[2];
    let starId1 = 102;
    let starId2 = 103;
    await instance.createStar("Siddhant", starId1, { from: user1 });
    await instance.createStar("Angore", starId2, { from: user2 });
    await instance.exchangeStars(starId1, starId2, { from: user2 });
    assert.equal(await instance.ownerOf(starId1), user2);
    assert.equal(await instance.ownerOf(starId2), user1);
});

it('let user transfer star to another address', async() => {
    let instance = await StarNotary.deployed();
    let user1 = accounts[1];
    let user2 = accounts[2];
    let starId = 104;
    await instance.createStar("Siddhant", starId, { from: user1 });
    await instance.transferStar(user2, starId, { from: user1 });
    assert.equal(await instance.ownerOf(starId), user2);
});

it('get the name of the star using id', async() => {
    let instance = await StarNotary.deployed();
    let user1 = accounts[1];
    let starId = 105;
    await instance.createStar("angore rocks", starId, { from: user1 });
    let starName = await instance.lookUpTokenIdToStarInfo(starId);
    assert.equal(starName, "angore rocks");
});