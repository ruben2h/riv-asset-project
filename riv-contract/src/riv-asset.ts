/*
 * SPDX-License-Identifier: Apache-2.0
 */

import { Object, Property } from 'fabric-contract-api';

@Object()
export class RivAsset {

    @Property()
    public nombrePropietario:string;
    @Property()
    public hectareas: number;
    @Property()
    public comarca: string;
    @Property()
    public numeroCatastro: number;
    @Property()
    public calleDomicilioPropietario: string;
    @Property()
    public localidad: string;
    @Property()
    public codigoPostal: number;
    @Property()
    public provincia: string;
    @Property()
    public anoCampana: number;
    @Property()
    public fechaEntrega: string;
    @Property()
    public tipoUva: string;
    @Property()
    public pesoBruto: number;
    @Property()
    public pestoTara: number;
    @Property()
    public pesoNeto: number;
    @Property()
    public grado: number;
    @Property()
    public calidad: number;
    @Property()
    public bodega: string;
    @Property()
    public estado:string;
    @Property()
    public estadoUva:string;
    @Property()
    public fechaBaja: string;
    @Property()
    public depositoAlmacenaje: string;


}
