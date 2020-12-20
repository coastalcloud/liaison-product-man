

/**
 * return array of pre mapped rows
 * @param {Array} files 
 */
export function fieldMap(records){

    return records.map(record => {

        const object = Object.assign({}, record)

        object.Family = object.Family ? object.Family : ''
        object.detail_link = `/lightning/r/Product2/${record.Id}/view`

        object.modDate = new Date(object.LastModifiedDate).toLocaleString('en-US', { 
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: 'numeric', 
            minute: 'numeric', 
            hour12: true 
        })
        
        return object
    })
}

/**
 * return columns as requested by options
 * @param {Object} options 
 *   families: Array
 *   fields: String comma separated
 */
export function getColumns(options){

    //console.log('column options')
    //console.log(options)

    const {
        families,
    } = options;

    const fields = [
        ...options.fields, //.replace(/ /g, '').split(','),
        'Actions',
    ]
    
    const columns = fields.reduce((cols, field) => [
        ...cols, 
        columnMap(families)[field]
    ], []);
    
    return columns
}

function columnMap(families){

    return {
    
        'Name': {
            label: 'Name',
            fieldName: 'Name',
            type: 'text',
            sortable: true,
            editable: true,
            hideDefaultActions: true,
        },
        
        'Amount__c': {
            label: 'Amount',
            fieldName: 'Amount__c',
            type: 'currency',
            sortable: true,
            editable: true,
        },

        'Discount__c': {
            label: 'Discount',
            fieldName: 'Discount__c',
            type: 'currency',
            sortable: true,
            editable: true,
        },
        
        'Family': {
            label: 'Family', 
            fieldName: 'Family', 
            type: 'picklist', 
            sortable: true,
            hideDefaultActions: true,
            typeAttributes: {
                placeholder: 'Choose Family', 
                options: families, 
                value: { 
                    fieldName: 'Family'
                }, 
                context: { 
                    fieldName: 'Id' 
                }
            }
        },

        'LastModifiedDate': {
            label: 'Modified',
            fieldName: 'modDate',
            type: 'date',
            sortable: true,
            hideDefaultActions: true,
            typeAttributes:{
                year: "numeric",
                month: "short",
                day: "2-digit",
                hour: "2-digit",
                minute: "2-digit"
            },
        },
        
        'Actions': {
            //label: 'Actions',
            type: 'action',
            typeAttributes: { 
                fieldName: "rowActions",
                rowActions: [
                    {
                        label: 'Details',  //Required. The label that's displayed for the action
                        name: 'detail',   //Required. The name of the action, which identifies the selected action
                        iconName: 'utility:list', //The name of the icon to be displayed to the right of the action item.
                    },
                ], 
                menuAlignment: 'auto',
            } 
        },
    }
}

/**
 * Sort records via given parameters
 * @param {Array} records array of records to sort ([])
 * @param {String} fieldName name of field to sort by (Name)
 * @param {String} sortDirection direction to sort by (asc|desc)
 * @returns {Array} sorted array
 */
export function sortData(records, fieldName, sortDirection) {

    //console.log(fieldName)

    const text_fields = ['Family', 'Name', 'owner']
    const date_fields = ['modDate']

    if(text_fields.includes(fieldName)) {

        if(sortDirection === "desc") {
            return records.sort((a,b) => 
                b[fieldName].toUpperCase() < a[fieldName].toUpperCase() 
                    ? -1
                    : b[fieldName].toUpperCase() > a[fieldName].toUpperCase() 
                        ? 1
                        : 0 //equal
            );
        }
        else if(sortDirection === "asc") {
            return records.sort((a,b) => 
                a[fieldName].toUpperCase() < b[fieldName].toUpperCase() 
                    ? -1
                    : a[fieldName].toUpperCase() > b[fieldName].toUpperCase() 
                        ? 1
                        : 0 //equal
            );
        }
    }
    else if(date_fields.includes(fieldName)) {
        
        if(sortDirection === "desc") {
            return records.sort((a,b) => new Date(b.LastModifiedDate).getTime() - new Date(a.LastModifiedDate).getTime())
        }
        else if(sortDirection === "asc") {
            return records.sort((a,b) => new Date(a.LastModifiedDate).getTime() - new Date(b.LastModifiedDate).getTime())
        }
    }

    return records
}



/**
 * Filter records via given parameters
 * @param {Array} records array of records to filter ([{},{}])
 * @param {Array} props array of properties to filter on [Name,Family]
 * @param {String} value value to filter by
 * @returns {Array} filtered array
 */
export function filterData(records, props, value) {

	return records.filter(record => {
		return props.some(field => {
			return String(record[field]).toLocaleLowerCase().includes(value.toLocaleLowerCase())
		})
	})
}
