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

import Transport from "@ledgerhq/hw-transport";
import { TransportStatusError } from "@ledgerhq/hw-transport";

const CLA = 0x88;

const INS = {
    GET_VERSION: 0x00
};


export default class MatrixAIApp {
    constructor(transport, scrambleKey = "man") {
        if (typeof transport == 'undefined'){
            throw "Transport has not been defined";
        }

        this.transport = transport;
        transport.decorateAppAPIMethods(
            this,
            [],
            scrambleKey
        );
    }

    async getVersion() {
        return this.transport.send(CLA, INS.GET_VERSION, 0, 0).then(
            response => {
                console.log(response);
                let error_code_data = response.slice(-2);
                return {
                    test_mode: response[0] !== 0,
                    major: response[1],
                    minor: response[2],
                    patch: response[3],
                    device_locked : response[4] === 1,
                    return_code: error_code_data[0] *256 + error_code_data[1],
                    // TODO: Improve error handle
                    // TODO: Unify error messages
                    error_message: "????"
                }
            });
    }
}