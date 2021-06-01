// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.4.24;

import "../node_modules/@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract StarNotary is ERC721 {
    struct Star {
        string name;
    } 

    constructor() ERC721("Siddhant", "SID") { }

    mapping(uint256 => Star) public tokenIdToStarInfo; // to store the token id of the star
    mapping(uint256 => uint256) public starsForSale; // to store stars which are up for sale

    // # functions- 1. Create star 2. Put up star 3. Buy star
    function createStar(string memory _name, uint256 _tokenId) public {
        Star memory newStar = Star(_name); //create the instance of the Star structure
        tokenIdToStarInfo[_tokenId] = newStar;      // Store the newStar with the token id in the mapping
        _mint(msg.sender, _tokenId);    //Mint the new token
    } 

    function putStarForSale(uint256 _tokenId, uint256 _price) public {
        require(ownerOf(_tokenId) == msg.sender, "You cannot sale the star you dont own!"); // check if the user putting star for sale is the owner of the star
        starsForSale[_tokenId] = _price; // add the star for sale in the mappings with the price
    }

    function _make_payable(address x) internal pure returns (address payable) {
        return payable(address(uint160(x)));
    }

    function buyStar(uint256 _tokenId) public payable {
        require(starsForSale[_tokenId] > 0, "The star must be available for sale!"); // the star to buy must be in starsForSale mapping
        uint256 starPrice = starsForSale[_tokenId]; // get the price of the star for sale
        address starOwner = ownerOf(_tokenId); // get the owner of the star
        require(msg.value >= starPrice, "You need to have sufficient funds!"); // check the bidding price is greater than or equal to the stars for sale price
        _transfer(starOwner, msg.sender, _tokenId);
        address payable starOwnerAddressPayable = _make_payable(starOwner);
        address payable newOwnerAddressPayable = _make_payable(msg.sender);
        starOwnerAddressPayable.transfer(starPrice);
        if(msg.value > starPrice) {
            newOwnerAddressPayable.transfer(msg.value - starPrice);
        }
    }

    function exchangeStars(uint256 _tokenId1, uint256 _tokenId2) public {
        require(msg.sender == ownerOf(_tokenId1) || msg.sender == ownerOf(_tokenId2), "You need to be owner of one star");
        address _ownerOfTokenId1 = ownerOf(_tokenId1);
        address _ownerOfTokenId2 = ownerOf(_tokenId2);
        if(_ownerOfTokenId1 == _ownerOfTokenId2) {
            revert("You own both the stars");
        }
        _transfer(_ownerOfTokenId1, _ownerOfTokenId2, _tokenId1);
        _transfer(_ownerOfTokenId2, _ownerOfTokenId1, _tokenId2);
    }

    function transferStar(address _to, uint256 _tokenId) public {
        require(msg.sender == ownerOf(_tokenId), "You must be the owner of the star" );
        _transfer(msg.sender, _to, _tokenId);
    }

    function lookUpTokenIdToStarInfo(uint256 _tokenId) public view returns (string memory) {
        return tokenIdToStarInfo[_tokenId].name;
    }
}
