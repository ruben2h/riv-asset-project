/*
 * SPDX-License-Identifier: Apache-2.0
 */

import { Context } from 'fabric-contract-api';
import { ChaincodeStub, ClientIdentity } from 'fabric-shim';
import { RivAssetContract } from '.';

import * as chai from 'chai';
import * as chaiAsPromised from 'chai-as-promised';
import * as sinon from 'sinon';
import * as sinonChai from 'sinon-chai';
import * as winston from 'winston';

chai.should();
chai.use(chaiAsPromised);
chai.use(sinonChai);

class TestContext implements Context {
    public stub: sinon.SinonStubbedInstance<ChaincodeStub> = sinon.createStubInstance(ChaincodeStub);
    public clientIdentity: sinon.SinonStubbedInstance<ClientIdentity> = sinon.createStubInstance(ClientIdentity);
    public logging = {
        getLogger: sinon.stub().returns(sinon.createStubInstance(winston.createLogger().constructor)),
        setLevel: sinon.stub(),
     };
}

describe('RivAssetContract', () => {

    let contract: RivAssetContract;
    let ctx: TestContext;

    beforeEach(() => {
        contract = new RivAssetContract();
        ctx = new TestContext();
        ctx.stub.getState.withArgs('1001').resolves(Buffer.from('{"value":"riv asset 1001 value"}'));
        ctx.stub.getState.withArgs('1002').resolves(Buffer.from('{"value":"riv asset 1002 value"}'));
    });

    describe('#rivAssetExists', () => {

        it('should return true for a riv asset', async () => {
            await contract.rivAssetExists(ctx, '1001').should.eventually.be.true;
        });

        it('should return false for a riv asset that does not exist', async () => {
            await contract.rivAssetExists(ctx, '1003').should.eventually.be.false;
        });

    });

    describe('#createRivAsset', () => {

        /*
        it('should create a riv asset', async () => {
            await contract.createRivAsset(ctx, '1003', 'riv asset 1003 value','ASD');
            ctx.stub.putState.should.have.been.calledOnceWithExactly('1003', Buffer.from('{"value":"riv asset 1003 value"}'));
        });

        it('should throw an error for a riv asset that already exists', async () => {
            await contract.createRivAsset(ctx, '1001', 'myvalue','ASD').should.be.rejectedWith(/The riv asset 1001 already exists/);
        });
        */
    });

    describe('#readRivAsset', () => {

        it('should return a riv asset', async () => {
            await contract.readRivAsset(ctx, '1001').should.eventually.deep.equal({ value: 'riv asset 1001 value' });
        });

        it('should throw an error for a riv asset that does not exist', async () => {
            await contract.readRivAsset(ctx, '1003').should.be.rejectedWith(/The riv asset 1003 does not exist/);
        });

    });

    // describe('#updateRivAsset', () => {

    //     it('should update a riv asset', async () => {
    //         await contract.updateRivAsset(ctx, '1001', 'riv asset 1001 new value');
    //         ctx.stub.putState.should.have.been.calledOnceWithExactly('1001', Buffer.from('{"value":"riv asset 1001 new value"}'));
    //     });

    //     it('should throw an error for a riv asset that does not exist', async () => {
    //         await contract.updateRivAsset(ctx, '1003', 'riv asset 1003 new value').should.be.rejectedWith(/The riv asset 1003 does not exist/);
    //     });

    // });

    // describe('#deleteRivAsset', () => {

    //     it('should delete a riv asset', async () => {
    //         await contract.deleteRivAsset(ctx, '1001');
    //         ctx.stub.deleteState.should.have.been.calledOnceWithExactly('1001');
    //     });

    //     it('should throw an error for a riv asset that does not exist', async () => {
    //         await contract.deleteRivAsset(ctx, '1003').should.be.rejectedWith(/The riv asset 1003 does not exist/);
    //     });

    // });

});
