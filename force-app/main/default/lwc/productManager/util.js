

/**
 * return array of pre mapped rows
 * @param {Array} files 
 */
export function fieldMap(records){

    console.log(JSON.parse(JSON.stringify(records)));

    return records.map(record => {

        const object = Object.assign({}, record)

        object.Product2_Name = object.Product2.Name ? object.Product2.Name : ''

        object.Family = object.Product2.Family ? object.Product2.Family : ''
        
        object.detail_link = `/lightning/r/Product2/${object.Product2.Id}/view`

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

    console.log('column options')
    console.log(options)

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
            fieldName: 'Product2_Name',
            type: 'text',
            sortable: true,
            editable: true,
            hideDefaultActions: true,
        },

        'Quantity': {
            label: 'Quantity',
            fieldName: 'Quantity',
            type: 'number',
            sortable: true,
            editable: true,
            hideDefaultActions: true,
        },
        
        'Family': {
            label: 'Family',
            fieldName: 'Family',
            type: 'text',
            sortable: true,
            editable: false,
            hideDefaultActions: true,
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
 * @param {Object} options what to consider during sort; {date_fields}
 * @returns {Array} sorted array
 */
export function sortData(records, fieldName, sortDirection, options = {}) {

    const { date_fields } = options

    if(date_fields.includes(fieldName)) {
        
        if(sortDirection === "desc") {

            return records.sort((A,B) => {

                const a = A[fieldName] ? A[fieldName] : 0
                const b = B[fieldName] ? B[fieldName] : 0

                return new Date(b).getTime() - new Date(a).getTime()
            })
        }
        else if(sortDirection === "asc") {

            return records.sort((A,B) => {

                const a = A[fieldName] ? A[fieldName] : 0
                const b = B[fieldName] ? B[fieldName] : 0

                return new Date(a).getTime() - new Date(b).getTime()
            })
        }
    }

    

    if(sortDirection === "desc") {

        return records.sort((A,B) => {

            const a = A[fieldName] ? A[fieldName] : ''
            const b = B[fieldName] ? B[fieldName] : ''

            return b.toUpperCase() < a.toUpperCase() 
                ? -1
                : b.toUpperCase() > a.toUpperCase() 
                    ? 1
                    : 0 //equal
        });
    }
    else if(sortDirection === "asc") {

        return records.sort((A,B) => {

            const a = A[fieldName] ? A[fieldName] : ''
            const b = B[fieldName] ? B[fieldName] : ''

            return a.toUpperCase() < b.toUpperCase() 
                ? -1
                : a.toUpperCase() > b.toUpperCase() 
                    ? 1
                    : 0 //equal
        });
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
