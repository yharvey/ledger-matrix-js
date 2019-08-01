/** ******************************************************************************
 *  (c) 2019 ZondaX GmbH
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

import MatrixApp from 'index.js';
import TransportNodeHid from '@ledgerhq/hw-transport-node-hid';
import polycrc from 'polycrc';
import bs58 from 'bs58';
import secp256k1 from 'secp256k1/elliptic';

const createKeccakHash = require('keccak');

// test secrets
// equip will roof matter pink blind book anxiety banner elbow sun young
const testPK = Buffer.from('0391c5822f1e8e096d5834c19f53933d9e1d9c653a52c7b7f27e35a202bb4d7d75', 'hex');
const testSK = Buffer.from('012f29812b57bbb95b21874d2b7a18765298c05054062d233997ab856acd2923', 'hex');

test('get version', async () => {
    const transport = await TransportNodeHid.create(1000);
    transport.setDebugMode(true);

    const app = new MatrixApp(transport);
    const version = await app.getVersion();
    console.log(version);
});

test('get address', async () => {
    const transport = await TransportNodeHid.create(1000);
    transport.setDebugMode(true);

    const app = new MatrixApp(transport);
    const response = await app.getAddress(0, 0, 0);

    expect(response.pubKey)
        .toEqual(
            '04'
            + '91c5822f1e8e096d5834c19f53933d9e1d9c653a52c7b7f27e35a202bb4d7d75'
            + '85f3fdd3d697185b9cd78a5d571281d7d96225042aa4bf26fec7b32d130416e7',
        );

    expect(response.compressedPK)
        .toEqual('0391c5822f1e8e096d5834c19f53933d9e1d9c653a52c7b7f27e35a202bb4d7d75');

    console.log(response);

    expect(response.address)
        .toEqual('MAN.cUTaQZsmCAdpshzWnFiatff8QZHv');
});

test('get HD addresses, check CRC', async () => {
    jest.setTimeout(60000);

    const transport = await TransportNodeHid.create(1000);
    const app = new MatrixApp(transport);

    for (let i = 0; i < 20; i += 1) {
        // eslint-disable-next-line no-await-in-loop
        const response = await app.getAddress(0, 0, i);
        console.log(response.address);

        const crc8 = polycrc.crc(8, 0x07, 0x00, 0x00, false);
        const crcByte = crc8(response.address.slice(0, -1));
        const crcChar = bs58.encode(Buffer.from([crcByte % 58]));

        expect(crcChar)
            .toEqual(response.address.slice(-1));
    }
});

test('show address', async () => {
    jest.setTimeout(60000);

    const transport = await TransportNodeHid.create(1000);
    transport.setDebugMode(true);

    const app = new MatrixApp(transport);
    const response = await app.getAddress(0, 0, 0, true);

    console.log(response);

    expect(response.pubKey)
        .toEqual(
            '0491c5822f1e8e096d5834c19f53933d9e1d9c653a52c7b7f27e35a202bb4d7d7'
            + '585f3fdd3d697185b9cd78a5d571281d7d96225042aa4bf26fec7b32d130416e7',
        );

    expect(response.address)
        .toEqual('MAN.cUTaQZsmCAdpshzWnFiatff8QZHv');
});

test('sign1', async () => {
    jest.setTimeout(60000);

    const transport = await TransportNodeHid.create(1000);
    transport.setDebugMode(true);

    const txBlobStr = ''
        + 'f8cf8710000000000043850430e2340083033450a04d414e2e576b62756a7478683759426e6b475638485a'
        + '767950514b336341507980b8885b7b22456e7472757374416464726573223a224d414e2e36617063465951'
        + '62595a68774c5a7a33626234546a666b67346d794a222c224973456e7472757374476173223a747275652c'
        + '22456e73747275737453657454797065223a302c225374617274486569676874223a323232323232322c22'
        + '456e64486569676874223a323232323232357d5d038080808086016850894a0fc4c30580c0';

    const txBlob = Buffer.from(txBlobStr, 'hex');

    const app = new MatrixApp(transport);
    const response = await app.sign(0, 0, 0, txBlob);

    console.log(response);
});

test('sign2_and_verify', async () => {
    jest.setTimeout(60000);

    const transport = await TransportNodeHid.create(1000);
    transport.setDebugMode(true);

    const txBlobStr = ''
        + 'f8448710000000000020850430e2340083033450a04d414e2e3578597a4248724a6658654a69397951385'
        + '1713868766d313962553480800380808080845d411051c4c38080c0';

    const txBlob = Buffer.from(txBlobStr, 'hex');

    const app = new MatrixApp(transport);
    const responseAddr = await app.getAddress(0, 0, 0);
    const responseSign = await app.sign(0, 0, 0, txBlob);

    console.log(responseAddr);
    console.log(responseSign);

    // Check signature is valid
    const msgHash = createKeccakHash('keccak256').update(txBlob).digest();

    // Check DER signature
    let signature = secp256k1.signatureImport(responseSign.der);
    let signatureOK = secp256k1.verify(msgHash, signature, Buffer.from(responseAddr.pubKey, 'hex'));
    expect(signatureOK).toEqual(true);

    // Check S,R signature
    signature = Buffer.concat([responseSign.s, responseSign.r]);
    signatureOK = secp256k1.verify(msgHash, signature, Buffer.from(responseAddr.pubKey, 'hex'));
    expect(signatureOK).toEqual(true);

    console.log(responseSign.s.toString('hex'));
    console.log(responseSign.r.toString('hex'));
});

test('sign3_and_verify', async () => {
    jest.setTimeout(60000);

    const transport = await TransportNodeHid.create(1000);
    transport.setDebugMode(true);

    const txBlobStr = ''
        + 'f8668710000000000045850430e2340083033450a04d414e2e576b62756a7478683759426e6b475638485'
        + 'a767950514b336341507980a0746dd5858305e95c2ad24ac22658786012963590e683258ab1b0b073a131'
        + 'adad038080808086016850894a0fc4c30480c0';

    const txBlob = Buffer.from(txBlobStr, 'hex');

    const app = new MatrixApp(transport);
    const responseAddr = await app.getAddress(0, 0, 0);
    const responseSign = await app.sign(0, 0, 0, txBlob);

    console.log(responseAddr);
    console.log(responseSign);

    // Check signature is valid
    const msgHash = createKeccakHash('keccak256').update(txBlob).digest();

    // Check DER signature
    let signature = secp256k1.signatureImport(responseSign.der);
    let signatureOK = secp256k1.verify(msgHash, signature, Buffer.from(responseAddr.pubKey, 'hex'));
    expect(signatureOK).toEqual(true);

    // Check S,R signature
    signature = Buffer.concat([responseSign.s, responseSign.r]);
    signatureOK = secp256k1.verify(msgHash, signature, Buffer.from(responseAddr.pubKey, 'hex'));
    expect(signatureOK).toEqual(true);
});

const Transaction = require('matrixjs-tx');
const Man = require('aiman');

test('compare signatures', async () => {
    jest.setTimeout(60000);

    const aiman = new Man(new Man.providers.HttpProvider('https://testnet.matrix.io'));

    const rawTx = {
        nonce: aiman.toHex(4503599627370528),
        gasPrice: '0x0430e23400',
        gasLimit: '0x033450',
        to: 'MAN.5xYzBHrJfXeJi9yQ8Qq8hvm19bU4',
        value: '0x00',
        data: '0x',
        chainId: 3,
        v: '0x3',
        r: '0x',
        s: '0x',
        TxEnterType: '0x',
        IsEntrustTx: '0x',
        CommitTime: 1564545105,
        extra_to: [[0, 0, []]],
    };

    // //////////////////////////////////////////////////////////
    // FIRST TRY SIGNING USING THE ORIGINAL CODE

    const tx = new Transaction(rawTx, true);

    // Sign standard way
    let serializedTx = tx.serialize();
    console.log(serializedTx.toString('hex'));

    tx.sign(testSK);

    // R 6b1fbfd85fccd0c1523706b1d6ce27660e0c5c838c7424d16b4bcc4f9b06ee2e
    // S c293863a7ca585631b32720d5b6aa512bf1d2bf6c6376c9318dc67e2fc4254e1

    serializedTx = tx.serialize();
    const txData = tx.getTxParams(serializedTx);
    console.log(txData);

    // //////////////////////////////////////////////////////////
    // NOW SIGN WITH A LEDGER
    const transport = await TransportNodeHid.create(1000);
    transport.setDebugMode(true);

    let tx2 = new Transaction(rawTx, true);
    let serializedTx2 = tx2.serialize();

    const app = new MatrixApp(transport);
    const responseSign = await app.sign(0, 0, 0, serializedTx2);

    console.log(responseSign);
    expect(responseSign.return_code).toEqual(0x9000);

    // Replace and reserialize
    rawTx.v = '0x' + (parseInt(responseSign.v.toString('hex'), 16) + (rawTx.chainId * 2 + 8)).toString(16);
    rawTx.r = '0x' + responseSign.r.toString('hex');
    rawTx.s = '0x' + responseSign.s.toString('hex');
    tx2 = new Transaction(rawTx, true);
    serializedTx2 = tx2.serialize();

    // //////////////////////////////////////////////////////////
    // NOW COMPARE SIGNED SERIALIZED TXS

    console.log(serializedTx.toString('hex'));
    console.log(serializedTx2.toString('hex'));

    expect(serializedTx.toString('hex')).toEqual(serializedTx2.toString('hex'));
});
