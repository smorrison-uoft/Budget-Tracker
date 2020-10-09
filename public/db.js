const indexedDB =
  window.indexedDB ||
  window.mozIndexedDB ||
  window.webkitIndexedDB ||
  window.msIndexedDB ||
  window.shimIndexedDB;

let db;

const request = indexedDB.open("budget", 1);

request.onupgradeneeded = function(event) {
  
  db = event.target.result;
        
  
  db.createObjectStore("pending", { autoIncrement: true });

};

request.onsuccess = ({ target }) => {
  db = target.result;

  if (navigator.onLine) {
    checkDatabase();
  }

};

request.onerror = function(event) {
 
  console.log("error: ", event.target.errorCode);
};

function saveRecord(record) {

  const transaction = db.transaction(["pending"], "readwrite");
  
  const budgetListStore = transaction.objectStore("pending");
 
  budgetListStore.add(record);
}

//function clearIndexDBdata() {
//     var DBOpenRequest = window.indexedDB.open("budget", 1);

//     DBOpenRequest.onsuccess = function(event) {
        
        
//         db = DBOpenRequest.result;
            
//         clearData();
//     };

//     function clearData() {
//         console.log('clear store')
      
//         var transaction = db.transaction(["pending"], "readwrite");

      
//         var objectStore = transaction.objectStore("pending");

       
//         var objectStoreRequest = objectStore.clear();

//         objectStoreRequest.onsuccess = function(event) {
            
//             console.log('indexDB cleared');
//             location.reload();
//         };
//     };
    
// }

function checkDatabase() {
 
  const transaction = db.transaction(["pending"], "readwrite");
  
  const budgetListStore = transaction.objectStore("pending");
 
  const getAll = budgetListStore.getAll();

    getAll.onsuccess = function() {

        if (getAll.result.length > 0) {
        
            fetch("/api/transaction/bulk", {
                method: "POST",
                body: JSON.stringify(getAll.result),
                headers: {
                Accept: "application/json, text/plain, */*",
                "Content-Type": "application/json"
                }
            })
            .then(response => response.json())
            .then(() => {
                // if successful, open a transaction on your pending db
                const transaction = db.transaction(["pending"], "readwrite");
                // access your pending object store
                const budgetListStore = transaction.objectStore("pending");
                // clear all items in your store
                budgetListStore.clear();
            })
            .catch(err => {
                               
                transactions = getAll.result;
                console.log("indexDB transactions: ", transactions);
                populateTotal();
                populateTable();
                populateChart();
            });
        }
    }
}


window.addEventListener("online", checkDatabase);