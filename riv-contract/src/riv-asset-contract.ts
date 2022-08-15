import { Context, Contract, Info, Returns, Transaction } from 'fabric-contract-api';
import { RivAsset } from './riv-asset';

@Info({title: 'RivAssetContract', description: 'My Smart Contract' })
export class RivAssetContract extends Contract {

    @Transaction(false)
    @Returns('boolean')
    public async rivAssetExists(ctx: Context, rivAssetId: string): Promise<boolean> {
        const data: Uint8Array = await ctx.stub.getState(rivAssetId);
        return (!!data && data.length > 0);
    }

    //Creación del papel registro y almacenamiento en cooperativa
    @Transaction()
    @Returns('RivAsset')
    public async createRivAsset(ctx: Context,
                                rivAssetId: string,
                                nombrePropietario: string,
                                hectareas: number,
                                comarca: string,
                                numeroCatastro: number,
                                calleDomicilioPropietario: string,
                                localidad: string,
                                codigoPostal: number,
                                provincia: string,
                                anoCampana: number,
                                fechaEntrega: string,
                                tipoUva: string,
                                pesoNeto: number,
                                grado: number,
                                calidad: number,
                                bodega: string): Promise<RivAsset> {

        const exists: boolean = await this.rivAssetExists(ctx, rivAssetId);
        if (exists) {
            throw new Error(`El asset ${rivAssetId} ya existe`);
        }
        const rivAsset: RivAsset = new RivAsset();
        rivAsset.nombrePropietario = nombrePropietario;
        rivAsset.hectareas = hectareas;
        rivAsset.comarca = comarca;
        rivAsset.numeroCatastro = numeroCatastro;
        rivAsset.calleDomicilioPropietario = calleDomicilioPropietario;
        rivAsset.localidad = localidad;
        rivAsset.codigoPostal = codigoPostal;
        rivAsset.provincia = provincia;
        rivAsset.anoCampana = anoCampana;
        rivAsset.fechaEntrega = fechaEntrega;
        rivAsset.tipoUva = tipoUva;
        rivAsset.grado = grado;
        rivAsset.calidad = calidad;
        rivAsset.bodega = bodega;
        rivAsset.pesoNeto = pesoNeto;
        rivAsset.estado = "ALMACENADO";
        rivAsset.estadoUva = "MOSTO";

        const buffer: Buffer = Buffer.from(JSON.stringify(rivAsset));
        await ctx.stub.putState(rivAssetId, buffer);
        return rivAsset;
    }

    //Mover el vino a un deposito
    @Transaction()
    public async placeMoveRivAsset(ctx: Context, rivAssetId: string, depositoAlmacenaje: string): Promise<void> {
        const exists: boolean = await this.rivAssetExists(ctx, rivAssetId);
        if (!exists) {
            throw new Error(`El asset ${rivAssetId} no existe`);
        }
        const rivAsset: RivAsset = await this.readRivAsset(ctx,rivAssetId);
        rivAsset.depositoAlmacenaje = depositoAlmacenaje;
        const buffer: Buffer = Buffer.from(JSON.stringify(rivAsset));
        await ctx.stub.putState(rivAssetId, buffer);
    }

    //Fermentación del vino
    @Transaction()
    public async fermentationRivAsset(ctx: Context, rivAssetId: string, pesoFermentacion: number): Promise<void> {
        const exists: boolean = await this.rivAssetExists(ctx, rivAssetId);
        if (!exists) {
            throw new Error(`El asset no existe`);
        }
        const rivAsset: RivAsset = await this.readRivAsset(ctx,rivAssetId);
        if(rivAsset.estadoUva!="MOSTO"){
            throw new Error(`El rivAsset ya se encuentra fermentado`);
        }
        if(rivAsset.pesoNeto<pesoFermentacion){
            throw new Error(`Error en este proceso se pierden kilos no se guardan `);
        }
        if(rivAsset.depositoAlmacenaje==null){
            throw new Error(`Primero debe depositar el mosto del asset en un deposito`);
        }
        rivAsset.estadoUva="VINO";
        rivAsset.depositoAlmacenaje = null;
        rivAsset.pesoNeto = pesoFermentacion;
        const buffer: Buffer = Buffer.from(JSON.stringify(rivAsset));
        await ctx.stub.putState(rivAssetId, buffer);
    }

    //Vendida de vino-uva entre bodegas
    @Transaction()
    public async soldRivAsset(ctx: Context, rivAssetId: string, bodega: string): Promise<void> {
        const exists: boolean = await this.rivAssetExists(ctx, rivAssetId);
        if (!exists) {
            throw new Error(`El asset ${rivAssetId} no existe`);
        }
        const rivAsset: RivAsset = await this.readRivAsset(ctx,rivAssetId);
        if (!rivAsset.fechaBaja==null) {
            throw new Error(`El asset ${rivAssetId} no esta disponible para vender, compruebe sus hijos`);
        }
        if(rivAsset.depositoAlmacenaje==null){
            throw new Error(`Primero debe depositar el vino del asset ${rivAssetId} en un deposito`);
        }
        rivAsset.bodega = bodega;
        rivAsset.depositoAlmacenaje= null;
        const buffer: Buffer = Buffer.from(JSON.stringify(rivAsset));
        await ctx.stub.putState(rivAssetId, buffer);
    }

    //Se canjea el vino y pasa a embotellado
    @Transaction()
    public async bottleRivAsset(ctx: Context, rivAssetId: string): Promise<void> {
        const exists: boolean = await this.rivAssetExists(ctx, rivAssetId);
        if (!exists) {
            throw new Error(`El asset ${rivAssetId} no existe`);
        }
        const rivAsset: RivAsset = await this.readRivAsset(ctx,rivAssetId);
        if (rivAsset.depositoAlmacenaje=="") {
            throw new Error(`El asset ${rivAssetId} no esta disponible para embotellar, compruebe el deposito`);
        }
        rivAsset.estado = "EMBOTELLADO";
        const buffer: Buffer = Buffer.from(JSON.stringify(rivAsset));
        await ctx.stub.putState(rivAssetId, buffer);
    }

    //Si se separa cierta cantidad en otro deposito
    @Transaction()
    public async divideRivAsset(ctx: Context, rivAssetId: string, seleccionKilos: number ): Promise<void> {
        const exists: boolean = await this.rivAssetExists(ctx, rivAssetId);
        if (!exists) {
            throw new Error(`El asset ${rivAssetId} no existe`);
        }
        //Recuperamos datos del padre y lo damos de baja de manera lógica
        const rivAsset: RivAsset = await this.readRivAsset(ctx,rivAssetId);
        rivAsset.fechaBaja = new Date().toTimeString();
        if(seleccionKilos>rivAsset.pesoNeto){
            throw new Error(`La división no puede llevarse a cabo en el rivAsset con ${rivAssetId} dado que la cantidad supera la existente`);
        }
        //let lastId = await this.getTheLastRivAssetId(ctx);
        const rivAssetId1 = rivAssetId+"/H1/";
        const rivAssetId2 = rivAssetId+"/H2/";
        const aux = (rivAsset.pesoNeto-seleccionKilos);

        const rivAsset1 = await this.createRivAsset(
            ctx,rivAssetId1, rivAsset.nombrePropietario, rivAsset.hectareas, rivAsset.comarca,
            rivAsset.numeroCatastro, rivAsset.calleDomicilioPropietario, rivAsset.localidad,
            rivAsset.codigoPostal, rivAsset.provincia, rivAsset.anoCampana, rivAsset.fechaEntrega,
            rivAsset.tipoUva, seleccionKilos, rivAsset.grado, rivAsset.calidad, rivAsset.bodega,
        );

        rivAsset1.estadoUva = rivAsset.estadoUva;

        const rivAsset2 = await this.createRivAsset(
            ctx,rivAssetId2, rivAsset.nombrePropietario, rivAsset.hectareas, rivAsset.comarca,
            rivAsset.numeroCatastro, rivAsset.calleDomicilioPropietario, rivAsset.localidad,
            rivAsset.codigoPostal, rivAsset.provincia, rivAsset.anoCampana, rivAsset.fechaEntrega,
            rivAsset.tipoUva, aux, rivAsset.grado, rivAsset.calidad, rivAsset.bodega
        );

        rivAsset2.estadoUva = rivAsset.estadoUva;

        const buffer: Buffer = Buffer.from(JSON.stringify(rivAsset));
        await ctx.stub.putState(rivAssetId, buffer);
        const buffer1: Buffer = Buffer.from(JSON.stringify(rivAsset1));
        await ctx.stub.putState(rivAssetId1, buffer1);
        const buffer2: Buffer = Buffer.from(JSON.stringify(rivAsset2));
        await ctx.stub.putState(rivAssetId2, buffer2);
    }


    //Consulta al libro mayor para obtener cualquier riv-asset
    @Transaction(false)
    @Returns('RivAsset')
    public async readRivAsset(ctx: Context, rivAssetId: string): Promise<RivAsset> {
        const exists: boolean = await this.rivAssetExists(ctx, rivAssetId);
        if (!exists) {
            throw new Error(`El asset ${rivAssetId} no existe`);;
        }
        const data: Uint8Array = await ctx.stub.getState(rivAssetId);
        const rivAsset: RivAsset = JSON.parse(data.toString()) as RivAsset;
        return rivAsset;
    }


}
