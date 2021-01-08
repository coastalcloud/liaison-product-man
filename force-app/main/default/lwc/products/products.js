import { api, track, LightningElement } from 'lwc';

import getAllProducts from '@salesforce/apex/ProductManager.getAllProducts'
import updateFamily from '@salesforce/apex/ProductManager.updateFamily'
import deleteProduct from '@salesforce/apex/ProductManager.deleteProduct'
import updateProducts from '@salesforce/apex/ProductManager.updateProducts'

import {
    fieldMap,
    sortData,
    filterData,
    getColumns,
} from './util'

export default class Products extends LightningElement {

    @track sortedBy = 'LastModifiedDate'
    @track sortedDirection = 'desc'
    @track viewable_files = []

    groups = []
    columns = getColumns()

    @api
    get families(){
        return this.all_families
    }
    set families(families){
        if(families){
            this.all_families = families
            this.refreshExistingFiles()
        }
    }
    
    async refreshExistingFiles(){

        const records = await getAllProducts()

        const families = [...this.families]

        this.groups = fieldMap( records, families )

        this.debug()
    }

    addSelected(event){
        const { name } = event.target
        console.log(name)
        const datatable = this.template.querySelector(`lightning-datatable.${name}`)
        const selected = datatable.getSelectedRows()
        console.log(selected)
        this.dispatchEvent(new CustomEvent("selected", {
            composed: true,
            detail: {
                name,
                selected,
            }
        }))
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

    async updateFamily( event ) {

        try {

            const {
                type,
                value,
                context,
            } = event.detail

            const result = await updateFamily({ recordId: context, family: value })
            
            console.log(result)
            
            //this.refreshExistingFiles()

            //this.toast(result, 'Success', 'success')
        }
        catch (error) {
            this.error(error.message)
        }
    }
    
    async deleteProduct( recordId ) {

        try {
            
            const result = await deleteProduct({ recordId })

            this.refreshExistingFiles()

            this.toast(result, 'Success', 'success')

        }
        catch (error) {
            this.error(error.message)
        }
    }
    
    async updateProducts( prods ) {

        try {
            
            const result = await updateProducts({ prods })

            this.refreshExistingFiles()

            this.toast(result, 'Success', 'success')
        }
        catch (error) {
            this.error(error.message)
        }
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

    rowAction(event){
        
        const { 
            row,
            action,
        } = event.detail

        console.log({row,action})

        if(action.name === 'add'){
            console.log('add =>')
            console.log(row)
            //window.open(row.download_link, '_target')
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
    
    handleToggleSection(event) {
        
        console.log('select')
        console.log(event.detail.openSections)

        //event.detail.openSections;
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
        console.log('products debug')
        console.log(JSON.parse(JSON.stringify({
            columns: this.columns,
            groups: this.groups,
            families: this.families,
            viewable_files: this.viewable_files,
            existing_files: this.existing_files,
            all_files: this.viewable_files,
        })))
    }
}