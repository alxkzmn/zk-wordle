// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import "forge-std/Script.sol";
import "../src/ZKWordle.sol";
import "forge-std/console.sol";

contract ZKWordleScript is Script {
    function setUp() public {}

    function run() public {
        vm.startBroadcast();
        ZKWordle zkWordle = new ZKWordle();

        string memory filePath = string(abi.encodePacked("out/deployed.json"));

        _rmFile(filePath);

        _writeToFile(
            "deployedAddress",
            toAsciiString(address(zkWordle)),
            filePath
        );
        vm.stopBroadcast();
    }

    /*
     *Copyright Maple Labs, GNU Affero General Public License v3.0
     *https://github.com/maple-labs/xmpl-simulations/blob/cccf213d574334a3d7e61ffaae9cffca2df3fdc9/tests/XmplSimulation.t.sol
     */
    function _writeToFile(string memory line, string memory filePath) internal {
        string[] memory inputs = new string[](5);
        inputs[0] = "script/write-to-file.sh";
        inputs[1] = "-f";
        inputs[2] = filePath;
        inputs[3] = "-i";
        inputs[4] = line;
        vm.ffi(inputs);
    }

    /*
     *Copyright Maple Labs, GNU Affero General Public License v3.0
     *https://github.com/maple-labs/xmpl-simulations/blob/cccf213d574334a3d7e61ffaae9cffca2df3fdc9/tests/XmplSimulation.t.sol
     */
    function _writeToFile(
        string memory key,
        string memory value,
        string memory filePath
    ) internal {
        string memory line = string(
            abi.encodePacked("{", '"', key, '":', '"0x', value, '"}')
        );
        _writeToFile(line, filePath);
    }

    /*
     *Copyright Maple Labs, GNU Affero General Public License v3.0
     *https://github.com/maple-labs/xmpl-simulations/blob/cccf213d574334a3d7e61ffaae9cffca2df3fdc9/tests/XmplSimulation.t.sol
     */
    function _rmFile(string memory filePath) internal {
        string[] memory inputs = new string[](3);
        inputs[0] = "script/rm-file.sh";
        inputs[1] = "-f";
        inputs[2] = filePath;

        vm.ffi(inputs);
    }

    /*
     *CC BY-SA 4.0
     *https://ethereum.stackexchange.com/a/8447/70118
     */
    function toAsciiString(address x) internal pure returns (string memory) {
        bytes memory s = new bytes(40);
        for (uint256 i = 0; i < 20; i++) {
            bytes1 b = bytes1(uint8(uint256(uint160(x)) / (2**(8 * (19 - i)))));
            bytes1 hi = bytes1(uint8(b) / 16);
            bytes1 lo = bytes1(uint8(b) - 16 * uint8(hi));
            s[2 * i] = char(hi);
            s[2 * i + 1] = char(lo);
        }
        return string(s);
    }

    /*
     *CC BY-SA 4.0
     *https://ethereum.stackexchange.com/a/8447/70118
     */
    function char(bytes1 b) internal pure returns (bytes1 c) {
        if (uint8(b) < 10) return bytes1(uint8(b) + 0x30);
        else return bytes1(uint8(b) + 0x57);
    }
}
