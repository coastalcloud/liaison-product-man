import { api, LightningElement, wire, track } from 'lwc';

import { ShowToastEvent } from 'lightning/platformShowToastEvent';

import { 
    getObjectInfo,
    getPicklistValues, 
} from 'lightning/uiObjectInfoApi'

import {
    fieldMap,
    sortData,
    filterData,
    getColumns,
} from './util'

import Product2 from '@salesforce/schema/Product2'
import fieldApiName from '@salesforce/schema/Product2.Family'

import getOppItems from '@salesforce/apex/ProductManager.getOppItems'
import addOppItems from '@salesforce/apex/ProductManager.getOppItems'

export default class ProductManager extends LightningElement {

    all_files = []

    @api header
    @api iconName
    @api fields
    @api recordId
    @api showDebug

    _fields = ['Name', 'Family', 'LastModifiedDate']

    @track files = []
    @track sortedBy = 'LastModifiedDate'
    @track sortedDirection = 'desc'
    @track viewable_files = []
    
    @wire(getObjectInfo, { objectApiName: Product2 })
    object;

    @wire(getPicklistValues, { recordTypeId: '$recordTypeId', fieldApiName  })
    wiredPicklist({error, data}){
        if(data){
            this.picklist = data
            this.refreshExistingFiles()
        }
        else if(error){
            this.error(error.message)
        }
    }

    get existing_files(){
        return this.all_files
    }
    set existing_files(files){
        this.viewable_files = files
        this.all_files = files
    }

    get filterFamilies(){ 
        return [{label: '(No Filter)', value: undefined, key: 'noFilterZero'}, ...this.families]
    }

    get families(){

        return this.picklist === undefined
            ? []
            : this.picklist.values.map((v,i) => ({ label: v.label, value: v.value, key: `_k${i}` }))
    }

    get recordTypeId (){
        return this.object.data ? this.object.data.defaultRecordTypeId : undefined
    }

    get columns(){
        return getColumns({
            fields: this._fields,
            families: this.families,
        })
    }

    get mappedFields(){ return this._fields.map(f => {
        if(f === 'LastModifiedDate'){
            return 'modDate'
        }
        else {
            return f
        }
    })}

    async refreshExistingFiles(data){

        const json =  data ? data : await getOppItems({ oppId: this.recordId })
    
        this.existing_files = fieldMap( json )
        
        //this.debug()
    }

    async selected(event){
        
        const {
            name,
            selected,
        } = event.detail

        console.log(JSON.parse(JSON.stringify({name,selected})))

        const configs = selected.map(x => ({Id: x.Id, Quantity: x.Quantity}))

        const oppItems = await addOppItems({
            oppId: this.recordId,
            configs,
        })

        console.log(JSON.parse(JSON.stringify({oppItems})))

        this.refreshExistingFiles(oppItems)

        this.toast(`Added ${selected.length} from ${name}`, 'Success', 'success')

    }
    managerChanged(event){
        
        const { 
            row,
            action,
        } = event.detail

        //console.log({row,action,})

        if(action.name === 'download'){
            window.open(row.download_link, '_target')
        }
        if(action.name === 'detail'){
            window.open(row.detail_link, '_target')
        }
        if(action.name === 'delete'){
            this.deleteDocument( row.Id )
        }
        
        //console.log(JSON.parse(JSON.stringify({
        //    existing_files: this.existing_files,
        //    eventdetail: event.detail,
        //})))
    }

    handleSave(event){
        
        try {
                
            const prods = event.detail.draftValues

            this.updateProducts(prods)
        }
        catch (error) {
            this.error(error.message)
        }
    }

    updateColumnSorting(event) {
        
        this.sortedBy = event.detail.fieldName;
        this.sortedDirection = event.detail.sortDirection;

        const text_fields = ['Family', 'Name', 'owner']
        const date_fields = ['modDate']

        const options = {
            text_fields,
            date_fields,
        }

        this.viewable_files = sortData(
            this.viewable_files, 
            this.sortedBy, 
            this.sortedDirection,
            options,
        );
    }


    filterData(event) {

        const {
            name,
            value
        } = event.target;

        if(name === 'Family') { this._currentFam = value }
        if(name === 'Any') { this._currentAny = value }

        if(!value && name === 'Any' && this._currentFam){

            this._currentAny = undefined;
            this.viewable_files = filterData(this.existing_files, ['Family'], this._currentFam);
        }
        else if(!value && name === 'Family' && this._currentAny){

            this._currentFam = undefined;
            this.viewable_files = filterData(this.existing_files, this.mappedFields, this._currentAny);
        }
        else if(name === 'Any' && this._currentFam){

            const possibles = filterData(this.existing_files, ['Family'], this._currentFam);
            this.viewable_files = filterData(possibles, this.mappedFields, this._currentAny);
        }
        else if(!value){

            this.viewable_files = this.existing_files;
        }
        else {

            const fields = name === 'Any' ?  this.mappedFields : [name];
            
            this.viewable_files = filterData(this.existing_files, fields, value);
        }
    }

    createLineItems(event) {
        // todo
        this.toast('In development')
    }

    toast( message = '', title = 'Info', variant = 'info') {
        
        const event = new ShowToastEvent({
            title,
            message,
            variant,
        })

        this.dispatchEvent(event)
    }
    error(message){
        this.toast(message, 'Error', 'error')
    }

    debug(){
        
        console.log(JSON.parse(JSON.stringify({
            picklist: this.picklist,
            families: this.families,
            viewable_files: this.viewable_files,
            existing_files: this.existing_files,
            all_files: this.viewable_files,
        })))
    }
}