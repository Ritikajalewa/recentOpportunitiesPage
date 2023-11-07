import { LightningElement ,wire,track} from 'lwc';
import getOpportunity from '@salesforce/apex/RecentOpportunitiesPage.getOpportunity';
import getFilteredOpportunity from '@salesforce/apex/RecentOpportunitiesPage.getFilteredOpportunity';
import getTotalAmount from '@salesforce/apex/RecentOpportunitiesPage.getTotalAmount';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { refreshApex } from '@salesforce/apex';

const columns = [ { label: 'Name', fieldName: 'Name', sortable: "true"},
                  { label: 'CloseDate', fieldName: 'CloseDate', sortable: "true"},
                  { label: 'StageName', fieldName: 'StageName'},
                  { label: 'Amount', fieldName: 'Amount', sortable: "true" },];
export default class RecentOpportunitiesPage extends LightningElement {
    @track data;
    @track columns = columns;
    @track sortBy;
    @track sortDirection;
    name='';
    closeDate;
    stageName='';
    amount;
    totalRecords = 0;
    pageSize=10; 
    totalPages=0; 
    pageNumber = 1;   
    @track recordsToDisplay;
    _wiredData;
    totalAmount=0.0;
    clonedata;
 

    @wire(getOpportunity)
    opportunity(result) {
        const { data, error } = result;
        this._wiredData = result;
        if (data) {
            this.data = data;
            this.clonedata=data;
            this.error = undefined;
            this.totalRecords = data.length;           
            this.totalPages = Math.ceil(this.totalRecords / this.pageSize);
            this.data.map(i => {
				this.totalAmount += i.Amount;
			});
            this.paginationHelper(); 
        } else if (error) {
            this.error = error;
            this.data = undefined;
            const event = new ShowToastEvent({
                title: 'Error',
                message:this.error
            });
            this.dispatchEvent(event);
        }
    }
    doSorting(event) {
        this.sortBy = event.detail.fieldName;
        this.sortDirection = event.detail.sortDirection;
        this.sortData(this.sortBy, this.sortDirection);
    }

    sortData(fieldname, direction) {
        let parseData = JSON.parse(JSON.stringify(this.recordsToDisplay));
        let keyValue = (a) => {
            return a[fieldname];
        };
        let isReverse = direction === 'asc' ? 1: -1;
        parseData.sort((x, y) => {
            x = keyValue(x) ? keyValue(x) : ''; 
            y = keyValue(y) ? keyValue(y) : '';
            return isReverse * ((x > y) - (y > x));
        });
        this.recordsToDisplay = parseData;
    }   
    applyFilter(){
        getFilteredOpportunity({name:this.name,closeDate:this.closeDate,stageName:this.stageName,amount:this.amount })
        .then(result => {
            this.data=result;
            this.recordsToDisplay=result;
            this.data.map(i => {
				this.totalAmount += i.Amount;
			});
            this.totalRecords = result.length;           
            this.totalPages = Math.ceil(this.totalRecords / this.pageSize);
            this.paginationHelper();
        })
        .catch(error =>{
            console.log(error);
            const event = new ShowToastEvent({
                title: 'Error',
                message:error
            });
            this.dispatchEvent(event);
        })
    } 

    resetFilter(){
        // refreshApex(this._wiredData)
        getOpportunity()
        .then(result => {
            this.data=result;
            this.recordsToDisplay=result;
            this.totalRecords = result.length;           
            this.totalPages = Math.ceil(this.totalRecords / this.pageSize);
            this.paginationHelper();
        })
        .catch(error =>{
            console.log(error);
            const event = new ShowToastEvent({
                title: 'Error',
                message:error
            });
            this.dispatchEvent(event);
        })
    }

    handleNameChange(event){
        this.name=event.target.value;
    }
    handleDateChange(event){
        this.closeDate=event.target.value;
    }
    handleStageChange(event){
        this.stageName=event.target.value;
    }
    handleAmountChange(event){
        this.amount=event.target.value;
    }
    
    get bDisableFirst() {
        return this.pageNumber == 1;
    }
    get bDisableLast() {
        return this.pageNumber == this.totalPages;
    }
    handleRecordsPerPage(event) {
        this.pageSize = event.target.value;
        this.paginationHelper();
    }
    previousPage() {
        this.pageNumber = this.pageNumber - 1;
        this.paginationHelper();
    }
    nextPage() {
        this.pageNumber = this.pageNumber + 1;
        this.paginationHelper();
    }
    firstPage() {
        this.pageNumber = 1;
        this.paginationHelper();
    }
    lastPage() {
        this.pageNumber = this.totalPages;
        this.paginationHelper();
    }
    paginationHelper() {
        this.recordsToDisplay = [];
        this.totalPages = Math.ceil(this.totalRecords / this.pageSize);
        if (this.pageNumber <= 1) {
            this.pageNumber = 1;
        } else if (this.pageNumber >= this.totalPages) {
            this.pageNumber = this.totalPages;
        }
        for (let i = (this.pageNumber - 1) * this.pageSize; i < this.pageNumber * this.pageSize; i++) {
            if (i === this.totalRecords) {
                break;
            }
            this.recordsToDisplay.push(this.data[i]);
        }
    }
}