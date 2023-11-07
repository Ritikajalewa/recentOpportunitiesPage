public with sharing class RecentOpportunitiesPage {
    @AuraEnabled(Cacheable=true) 
    public static List<Opportunity> getOpportunity(){
        List<Opportunity> oppList =[SELECT Id,Name,CloseDate,StageName,Amount FROM Opportunity WHERE CreatedDate >= Last_N_Months:3 order by CreatedDate DESC];
        return oppList;
    }
    @AuraEnabled(Cacheable=true) 
    public static Decimal getTotalAmount(List<Opportunity> oppList){
        Decimal totalAmount=0.0;
        for(Opportunity opp: oppList){
            totalAmount+=opp.Amount;
        }
        return totalAmount;
    }
    @AuraEnabled
    public static List<Opportunity> getFilteredOpportunity(String name,Date closeDate, String stageName, Integer amount){
        String newSearchName = '%'+name+'%';
        String newSearchStage = '%'+stageName+'%';
        String query = 'SELECT Id,Name,CloseDate,StageName,Amount FROM Opportunity'
            +  ' WHERE CreatedDate >= Last_N_Months:3'
            +  ' AND Name LIKE :newSearchName'
            +  ' AND stageName LIKE :newSearchStage';
            if(closeDate != null){
                query += ' AND CloseDate = :closeDate';
            }
            if(amount!=null){
                query += ' AND Amount= :amount';
            }
            query +=  ' order by CreatedDate DESC';
            return Database.query(query);
    }
}