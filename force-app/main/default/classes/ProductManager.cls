public with sharing class ProductManager {

    @AuraEnabled
    public static List<OpportunityLineItem> getOppItems(String oppId){

        return [
            SELECT Id, Product2.Id, Product2.Name, Product2.Family, Quantity, ServiceDate, 
                Discount, TotalPrice, LastModifiedDate
            FROM OpportunityLineItem 
            WHERE OpportunityId = :oppId
            LIMIT 9999
        ];
    }
    
    /* 
    ProductManager.addOppItems('006M000000MdpVDIAZ', new List<ProductConfig>{'01t30000002IxK4AAK'});
 */
    public class ProductConfig {
        @AuraEnabled 
        public String Id;
        @AuraEnabled 
        public Integer Quantity;
    }

    @AuraEnabled
    public static List<OpportunityLineItem> addOppItems(String oppId, List<ProductConfig> configs){

        List<String> prodIds = new List<String>();
        for(ProductConfig config : configs){
            prodIds.add(config.Id);
        }

        List<OpportunityLineItem> newOppItems = new List<OpportunityLineItem>();

        List<OpportunityLineItem> oldOppItems = [
            SELECT Id, OpportunityId, Product2Id, Quantity
            FROM OpportunityLineItem
            WHERE OpportunityId = :oppId
            AND Product2Id IN :prodIds
        ];
        
        for(ProductConfig config : configs){
            Boolean found = false;
            for(OpportunityLineItem item : oldOppItems){
                if(config.Id == item.Product2Id){
                    item.Quantity = item.Quantity + config.Quantity;
                    newOppItems.add(item);
                    found = true;
                    continue;
                }
            }
            if(!found){
                newOppItems.add(new OpportunityLineItem(
                    OpportunityId = oppId,
                    Product2Id = config.Id,
                    Quantity = config.Quantity
                ));
            }
        }
        
        upsert newOppItems;

        System.debug(newOppItems);

        return ProductManager.getOppItems(oppId);
    }

    @AuraEnabled
    public static List<Product2> getAllProducts(){

        return [
            SELECT Id, Family, Name, LastModifiedDate
            FROM Product2 
            WHERE IsActive = true
            ORDER BY Family ASC
            LIMIT 9999
        ];
    }

    @AuraEnabled
    public static String updateFamily(String recordId, String family){
        
        List<Product2> ls = new List<Product2>();
        
        for(Product2 version : [
            SELECT Id, Family
            FROM Product2 
            WHERE Id = :recordId
        ]){
            version.Family = family;
            ls.add( version );
        }

        update ls;

        return 'Updated '+ls.size()+' products successfully: '+recordId+' => '+family;
    }

    @AuraEnabled
    public static String deleteProduct( String recordId ){
        
        Product2 doc = [
            SELECT Id, Name
            FROM Product2 
            WHERE Id = :recordId
        ];

        String title = doc.Name;

        delete doc;

        return 'Deleted '+title+' successfully';
    }


    @AuraEnabled
    public static String updateProducts( List<Product2>  prods ){

        update prods;

        return 'Updated '+prods.size()+' successfully';
    }
}