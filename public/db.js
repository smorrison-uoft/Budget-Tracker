const indexedDB =
  window.indexedDB ||
  window.mozIndexedDB ||
  window.webkitIndexedDB ||
  window.msIndexedDB ||
  window.shimIndexedDB;

let db;
// create a new db request for a "budget" database.
const request = window.indexedDB.open("budget", 1);

request.onupgradeneeded = function(event) {
  // create object store called "pending" and set autoIncrement to true
  db = event.target.result;
        
  // Creates an object store with a listID keypath that can be used to query on.
  db.createObjectStore("pending", { autoIncrement: true });

};

request.onsuccess = function(event) {
  db = event.target.result;

  if (navigator.onLine) {
    checkDatabase();
  }

};

request.onerror = function(event) {
  // log error here
  console.log("error: ", event.target.errorCode);
};

function saveRecord(record) {
  // create a transaction on the pending db with readwrite access
  const transaction = db.transaction(["pending"], "readwrite");
  // access your pending object store
  const budgetListStore = transaction.objectStore("pending");
  // add record to your store with add method.
  budgetListStore.add(record);
}

function clearIndexDBdata() {
    var DBOpenRequest = window.indexedDB.open("budget", 1);

    DBOpenRequest.onsuccess = function(event) {
        
        // store the result of opening the database in the db variable.
        // This is used a lot below
        db = DBOpenRequest.result;
            
        // Clear all the data form the object store
        clearData();
    };

    function clearData() {
        console.log('clear store')
        // open a read/write db transaction, ready for clearing the data
        var transaction = db.transaction(["pending"], "readwrite");

        // create an object store on the transaction
        var objectStore = transaction.objectStore("pending");

        // Make a request to clear all the data out of the object store
        var objectStoreRequest = objectStore.clear();

        objectStoreRequest.onsuccess = function(event) {
            // report the success of our request
            console.log('indexDB cleared');
            location.reload();
        };
    };
    
}

function checkDatabase() {
  // open a transaction on your pending db
  const transaction = db.transaction(["pending"], "readwrite");
  // access your pending object store
  const budgetListStore = transaction.objectStore("pending");
  // get all records from store and set to a variable
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
                // fetch failed, so save in indexed db                
                transactions = getAll.result;
                console.log("indexDB transactions: ", transactions);
                populateTotal();
                populateTable();
                populateChart();
            });
        }
    }
}

// listen for app coming back online
window.addEventListener("online", checkDatabase);