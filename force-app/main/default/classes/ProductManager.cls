public with sharing class ProductManager {

    @AuraEnabled
    public static List<Product2> getAllProducts(){

        return [
            SELECT Id, Discount__c, Amount__c, Family, Name, LastModifiedDate
            FROM Product2 
            WHERE IsActive = true
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