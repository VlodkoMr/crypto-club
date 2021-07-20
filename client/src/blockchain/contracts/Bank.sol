// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

contract Bank {

    event Deposit(address indexed user, uint amount);
    event Withdraw(address indexed user, uint amount);

    function deposit() public payable {
        require(msg.value > 0, 'Error: empty deposit amount');

        emit Deposit(msg.sender, msg.value);
    }

    function withdraw(uint amount) public {
        msg.sender.transfer(amount);
        emit Withdraw(msg.sender, amount);
    }

}