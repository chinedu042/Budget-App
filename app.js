// BUDGET CONTROLLER
var budgetController = (function () {
  var Expense = function (id, description, value) {
    this.id = id;
    this.description = description;
    this.value = value;
  };

  var Income = function (id, description, value) {
    this.id = id;
    this.description = description;
    this.value = value;
  };

  const calculateTotals = (type) => {
    var sum = 0;
    data.allItems[type].forEach((cur) => {
      sum += cur.value;
    },)
    data.totals[type] = sum;
  };

  var data = {
    allItems: {
      exp: [],
      inc: [],
    },
    totals: {
      inc: 0,
      exp: 0,
    },
    budget: 0,
    percentage: -1,
  };

  return {
    addItem: function (type, des, val) {
      var newItem, ID;

      // create new id
      if (data.allItems[type].length > 0) {
        ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
      } else {
        ID = 0;
      }

      // create new item base on "inc" or "exp" type
      if (type === "exp") {
        newItem = new Expense(ID, des, val);
      } else if (type === "inc") {
        newItem = new Income(ID, des, val);
      } else {
        ID = 0;
      }

      // push it into our data structure
      data.allItems[type].push(newItem);

      // return the new element
      return newItem;
    },

    calculateBudget: function () {

      // calculate total income and expenses
      calculateTotals('inc');
      calculateTotals('exp');

      // calculate the budget: imcome - expenses
      data.budget = data.totals.inc - data.totals.exp;

      // calculate the percentage of income that we spent
      if (data.totals.inc > 0) {
        data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
      } else {
        data.percentage = -1;
      }

    },

    getBudget: () => {
      return {
        budget: data.budget,
        totalInc: data.totals.inc,
        totalExp: data.totals.exp,
        percentage: data.percentage
      };
    },

    testing: function () {
      console.log(data);
    },
  };
})();

// UI CONTROLLER
var UIController = (function () {

  var DOMStrings = {
    inputType: ".add__type",
    inputDescription: ".add__description",
    inputValue: ".add__value",
    inputBtn: ".add__btn",
    incomeContainer: ".income__list",
    expensesContainer: ".expenses__list",
    budgetLabel: '.budget__value',
    incomeLabel: ".budget__income--value",
    expensesLabel: '.budget__expenses--value',
    percentageLabel: '.budget__expenses--percentage',
    container: '.container',
  };
  return {
    getInput: function () {
      return {
        type: document.querySelector(DOMStrings.inputType).value, // will be either inc or exp
        description: document.querySelector(DOMStrings.inputDescription).value,
        value: parseFloat(document.querySelector(DOMStrings.inputValue).value),
      };
    },

    addListItem: function (obj, type) {
      var html, newHtml, element;

      // create some HTML strings with some placeholder text

      if (type === "inc") {
        element = DOMStrings.incomeContainer;
        html =
          '<div class="item clearfix" id="inc-%id%">\
             <div class="item__description">%description%</div>\
              <div class="right clearfix"> <div class="item__value">%value%</div>\
               <div class="item__delete">\
                <button class="item__delete--btn"><i class="fas fa-multiply"></i></button>\
                 </div>\
                 </div>\
                  </div>';
      } else if (type === "exp") {
        element = DOMStrings.expensesContainer;
        html =
          '<div class="item clearfix" id="exp-%id%">\
             <div class="item__description">%description%</div><div class="right clearfix">\
              <div class="item__value">-%value%</div><div class="item__percentage">21%</div>\
               <div class="item__delete"><button class="item__delete--btn"><i class="fas fa-multiply">\
               </i></button> </div> </div> </div>';
      }

      // replace the placeholder with some actual data
      newHtml = html.replace("%id%", obj.id);
      newHtml = newHtml.replace("%description%", obj.description);
      newHtml = newHtml.replace("%value%", obj.value);

      // insert the HTML into the DOM
      document.querySelector(element).insertAdjacentHTML("beforeend", newHtml);
    },

    // clear input fields after clicking on button
    clearInputFields: () => {
      var fields, fieldsArr;

      fields = document.querySelectorAll(
        DOMStrings.inputDescription + ", " + DOMStrings.inputValue
      );

      fieldsArr = Array.prototype.slice.call(fields);

      fieldsArr.forEach(function (current, index, array) {
        current.value = "";
      });

      fieldsArr[0].focus();
    },

    displayBudget: (obj) => {
      document.querySelector(DOMStrings.budgetLabel).textContent = obj.budget;
      document.querySelector(DOMStrings.incomeLabel).textContent = obj.totalInc;
      document.querySelector(DOMStrings.expensesLabel).textContent = obj.totalExp;

      if (obj.percentage > 0) {
        document.querySelector(DOMStrings.percentageLabel).textContent = obj.percentage + '%';
      } else {
        document.querySelector(DOMStrings.percentageLabel).textContent = '---';
      }
    },

    getDOMStrings: () => {
      return DOMStrings;
    },
  };
})();




// GLOBAL APP CONTROLLER
var controller = (function (budgetCtrl, UICtrl) {

  const setUpEventListeners = () => {
    var DOM = UICtrl.getDOMStrings();

    document
      .querySelector(DOM.inputBtn)
      .addEventListener("click", ctrlAddItemHandler);

    document.addEventListener("keypress", function (event) {
      if (event.keyCode === 13) {
        ctrlAddItemHandler();
      }
    });


    document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItemHandler);

  };

  const updateBudget = () => {

    //1 calculate the budget
    budgetCtrl.calculateBudget();

    //2 return the calculated budget
    var budget = budgetCtrl.getBudget();

    //3 display the budget on the UI
    UICtrl.displayBudget(budget);
  };

  const ctrlAddItemHandler = () => {
    var input, newItem;

    //1 get input data
    input = UICtrl.getInput();

    if (input.description !== "" && !isNaN(input.value) && input.value > 0) {
      //2 add the item to the budget controller
      newItem = budgetCtrl.addItem(input.type, input.description, input.value);

      //3 add the new item to the UI
      UICtrl.addListItem(newItem, input.type);

      //4 clear the fields
      UICtrl.clearInputFields();

      //5 calculate and update budget
      updateBudget();
    }
  };


  const ctrlDeleteItemHandler = (event) => {
    var itemID;
    itemID = (event.target.parentNode.parentNode.parentNode.parentNode.id);     // targets the parent element of the icon being fired
  };

  // BUTTON CONTROLLER
  setUpEventListeners();
  UICtrl.displayBudget(
    {
      budget: 0,
      totalInc: 0,
      totalExp: 0,
      percentage: -1,
    },
  );
  console.log("application has started");
})(budgetController, UIController);
