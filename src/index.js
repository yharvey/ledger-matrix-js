/** ******************************************************************************
 *  (c) 2019 ZondaX GmbH
 *  (c) 2016-2017 Ledger
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 ******************************************************************************* */

const CLA = 0x88;

const INS = {
    GET_VERSION: 0x00,
    GETADDR_SECP256K1: 0x01,
    SIGN_SECP256K1: 0x02,
};

export default class MatrixApp {
    constructor(transport, scrambleKey = 'MAN') {
        if (typeof transport === 'undefined') {
            throw new Error('Transport has not been defined');
        }

        this.transport = transport;
        transport.decorateAppAPIMethods(
            this,
            [
                'getVersion',
                'getAddress',
            ],
            scrambleKey,
        );
    }

    async getVersion() {
        return this.transport.send(CLA, INS.GET_VERSION, 0, 0)
            .then(
                (response) => {
                    const errorCodeData = response.slice(-2);
                    const answer = {
                        test_mode: response[0] !== 0,
                        major: response[1],
                        minor: response[2],
                        patch: response[3],
                        device_locked: response[4] === 1,
                        return_code: errorCodeData[0] * 256 + errorCodeData[1],
                        // TODO: Improve error handle
                        // TODO: Unify error messages
                        error_message: '????',
                    };

                    console.log(answer);
                    return answer;
                },
            );
    }

    static serializeMANBIP44(account, change, addressIndex) {
        const buf = Buffer.alloc(20);
        buf.writeUInt32LE(0x8000002c, 0);
        buf.writeUInt32LE(0x8000013e, 4);
        // eslint-disable-next-line no-bitwise
        buf.writeUInt32LE(0x80000000 + account, 8);
        // eslint-disable-next-line no-bitwise
        buf.writeUInt32LE(change, 12);
        // eslint-disable-next-line no-bitwise
        buf.writeUInt32LE(addressIndex, 16);

        return buf;
    }

    async getAddress(account, change, addressIndex, requireConfirmation = false) {
        const bip44Path = MatrixApp.serializeMANBIP44(account, change, addressIndex);

        let p1 = 0;
        if (requireConfirmation) p1 = 1;

        return this.transport.send(CLA, INS.GETADDR_SECP256K1, p1, 0, bip44Path)
            .then(
                (response) => {
                    const errorCodeData = response.slice(-2);
                    return {
                        pubKey: response.slice(0, 65)
                            .toString('hex'),
                        address: response.slice(65, response.length - 2)
                            .toString('ascii'),
                        return_code: errorCodeData[0] * 256 + errorCodeData[1],
                        // TODO: Improve error handle
                        // TODO: Unify error messages
                        error_message: '????',
                    };
                },
            );
    }
}
