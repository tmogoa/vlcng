//create object inorder to use the functions
function Queue() {
  this.elements = [];//data being the object on queue
}

//enqueue the data
Queue.prototype.enqueue = function (e) {
   this.elements.push(e);
};

// remove the data from the front of the queue
Queue.prototype.dequeue = function () {
	return this.data.shift();
};

 // check if the queue is empty
Queue.prototype.isEmpty = function () {
    return this.elements.length == 0;
};
// get the element at the front of the queue
//the peek() accesses the element at thefront of the queue
Queue.prototype.peek = function () {
    return !this.isEmpty() ? this.elements[0] : undefined;
};
//gets the length of the function
Queue.prototype.length = function() {
    return this.elements.length;
}
