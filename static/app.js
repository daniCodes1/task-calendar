"use strict";

class Deque {
  constructor(size) {
    // Maximum size of queue
    this.size = size;
    this.container = [];
  }

  addFront(element) {
    this.container.unshift(element);
  }

  addBack(element) {
    this.container.push(element);
  }

  popFront() {
    return this.container.shift();
  }

  popBack() {
    return this.container.pop();
  }
}

class TaskManager {
  constructor() {
    // DOM elements
    this.addBtn = document.querySelector(".add");
    this.totalDifficulty = document.getElementById("stat-difficulty");
    this.congratsMsg = document.querySelector(".congrats");
    this.handleTask = this.handleTask.bind(this);
    this.addBtn.addEventListener("click", this.handleTask);
    this.undoBtn = document.querySelector(".undo");
    this.undoBtn.addEventListener("click", this.reAddTask.bind(this));
    this.redoBtn = document.querySelector(".redo");
    this.redoBtn.addEventListener("click", this.redoTask.bind(this));

    // Properties
    this.totalTasks = 0;
    this.difficulty = 0;
    this.timeLeft = 0;
    this.removeTask = false;
    this.goal = 0;
    this.progress = 0;
    this.goalReached = false;
  }

  handleTask() {
    event.preventDefault();

    // Alert user if the total tasks exceed screen capacity
    if (this.totalTasks >= 12) {
      alert("You are at the maximum number of tasks");
    } else {
      let newTaskName = document.getElementById("tname").value;
      let newTaskDuration = Number(document.getElementById("duration").value);
      let newTaskDifficulty = Number(
        document.getElementById("difficulty").value
      );

      // Validate input fields for a new task
      if (
        this.authenticateTaskFields(
          newTaskName,
          newTaskDuration,
          newTaskDifficulty
        )
      ) {
        // Proceed with task creation
        let newTask = this.createTask(
          newTaskName,
          newTaskDuration,
          newTaskDifficulty
        );
        this.addTask(newTask);

        // Manage states
        this.updateDuration(newTaskDuration, true);
        this.updateDifficulty(newTaskDifficulty, true);

        // Set back to empty inputs
        document.getElementById("duration").value = "";
        document.getElementById("difficulty").value = "";
        document.getElementById("tname").value = "";
      }
    }
  }

  createTask(newTaskName, newTaskDuration, newTaskDifficulty) {
    // Set task attributes
    let div = document.createElement("div");
    div.setAttribute("class", "box");
    div.setAttribute("draggable", "true");
    div.setAttribute("ondragstart", "drag(event)");
    div.setAttribute("ondragover", "allowDrop(event)");
    div.dataset.duration = newTaskDuration;
    div.dataset.difficulty = newTaskDifficulty;
    div.dataset.name = newTaskName;
    // div.addEventListener("click", replace); // TODO

    // Set ID
    const idName = newTaskName.replace(/\s+/g, "");
    div.setAttribute("id", `${idName}`);

    // Set user display
    div.innerHTML = `${newTaskName} <h5>[${newTaskDuration} minutes]</h5>`;

    return div;
  }

  // Add task element to either column based on the number of tasks in column1.
  addTask(task) {
    const leftChildren = document.querySelector(".column1").children.length;
    if (leftChildren < 6) {
      document.querySelector(".column1").appendChild(task);
      console.log(`Tasks on left: ${leftChildren}`);
    } else {
      document.querySelector(".column2").appendChild(task);
    }
  }

  authenticateTaskFields(newTaskName, newTaskDuration, newTaskDifficulty) {
    if (newTaskName == "") {
      alert("Please fill in task name.");
    } else if (newTaskName.length > 25) {
      console.log(newTaskName.length);
      alert("Task name must be under 25 characters");
    } else if (newTaskDifficulty == 0 || newTaskDuration == 0) {
      alert("difficulty and duration cannot be 0");
    } else if (!(Number.isInteger(newTaskDuration) && newTaskDuration > 0)) {
      console.log(newTaskDuration);
      alert("The duration should be a positive integer");
    } else if (
      !(
        Number.isInteger(newTaskDifficulty) &&
        newTaskDifficulty > 0 &&
        newTaskDifficulty <= 10
      )
    ) {
      alert(
        "Difficulty should be a a positive integer less than or equal to 10"
      );
    } else {
      return true;
    }
    return false;
  }

  // If state is true, add the task duration to the total time left; otherwise, subtract the task duration
  // If the total time left becomes 0, show the congratulations message for finishing all tasks
  updateDuration(duration, state) {
    console.log(duration);
    if (state) {
      this.congratsMsg.classList.add("hidden");
      this.timeLeft += duration;
    } else {
      this.timeLeft -= duration;
      if (this.timeLeft == 0) {
        this.congratsMsg.classList.remove("hidden");
      }
    }

    // Update the user display
    let header = document.getElementById("countdown");
    const hrs = Math.floor(this.timeLeft / 60);
    const mins = this.timeLeft % 60;

    // Format time into a string
    let hourText = "";

    // Determine if hour is singular or plural
    if (hrs === 1) {
      hourText = "hour";
    } else if (hrs > 1) {
      hourText = "hours";
    }
    // Determine if minute is singular or plural
    let minuteText = mins === 1 ? "minute" : "minutes";

    // Set header for user display
    header.innerHTML = `${
      hrs > 0 ? `${hrs} ${hourText}, ` : ""
    }${mins} ${minuteText}`;
  }

  // Update total difficulty and number of tasks based on the specified difficulty level and state
  updateDifficulty(level, state) {
    console.log(document);
    if (state) {
      this.difficulty += level;
      this.totalTasks++;
    } else {
      this.difficulty -= level;
      this.totalTasks -= 1;
    }

    // Cannot divide by 0 (denominator is 0)
    if (this.totalTasks == 0) {
      this.totalDifficulty.innerHTML = "No tasks";
    } else {
      const avgDifficulty = this.difficulty / this.totalTasks;

      // Update user display
      if (avgDifficulty < 4) {
        this.totalDifficulty.innerHTML = "Easy";
      } else if (avgDifficulty <= 7) {
        this.totalDifficulty.innerHTML = "Medium";
      } else {
        this.totalDifficulty.innerHTML = "Difficult";
      }
    }
  }

  completeTask(element) {
    // Remove the dragged element from the DOM
    element.parentNode.removeChild(element);

    // Update the queue for potential undo
    this.handleUndoTask(element);

    // Update time
    taskManager.updateDuration(parseInt(element.dataset.duration), false);

    // Update difficulty
    taskManager.updateDifficulty(parseInt(element.dataset.difficulty), false);

    this.progress += parseInt(element.dataset.duration);
    // Update progress and goal status
    this.handleProgress();

    // Show user display of compelted task
    const dropZone = document.querySelector(".drop-zone");
    const removedTask = document.querySelector(".last-removed");
    dropZone.classList.add("hidden");
    removedTask.classList.remove("hidden");
    removedTask.innerHTML = `You completed: ${element.dataset.name} in ${element.dataset.duration} minutes!`;

    setTimeout(() => {
      dropZone.classList.remove("hidden");
      removedTask.classList.add("hidden");
    }, 1500);
  }

  handleProgress() {
    console.log(`total completed duration is ${this.progress}`);
    let goalProgress = document.getElementById("goal-progress");

    if (this.goalReached == true) {
      goalProgress.innerHTML = `You reached your goal of ${this.goal}! Your progress: ${this.progress} minutes.`;
    } else if (this.progress >= this.goal && this.goal != 0) {
      alert("Congrats, you have reached your goal!");
      this.goalReached = true;
      goalProgress.innerHTML = `You reached your goal of ${this.goal}! Your progress: ${this.progress} minutes.`;
    } else if (this.goal != 0) {
      goalProgress.innerHTML = `${Math.round(
        (this.progress / this.goal) * 100
      )} %`;
    }
  }

  // Manages queue for deleted elements if user wants to undo deletion
  handleUndoTask(draggedElement) {
    console.log("This is being called");
    const deletedSize = deletedDeque.size;
    if (deletedDeque.container.length + 1 > deletedSize) {
      deletedDeque.popBack();
    }
    deletedDeque.addFront(draggedElement);
  }

  // Re-adds the last removed task back into the task list
  reAddTask() {
    // Check if there are tasks in queue
    if (deletedDeque.container.length > 0) {
      // Get last removed task and its properties
      const lastElem = deletedDeque.popFront();
      const objName = lastElem.dataset.name;

      const objDuration = Number(lastElem.dataset.duration);
      const objDifficulty = Number(lastElem.dataset.difficulty);

      // Process re-addition of task
      if (this.totalTasks >= 12) {
        alert("You are at the maximum number of tasks");
      }
      this.congratsMsg.classList.add("hidden");
      let newTask = this.createTask(objName, objDuration, objDifficulty);
      this.addTask(newTask);
      this.updateDuration(objDuration, true);
      this.updateDifficulty(objDifficulty, true);

      // Update the goal section
      this.progress -= objDuration;
      if (this.progress < this.goal) {
        this.goalReached = false;
      }
      this.handleProgress();

      // Process for redos:
      this.handleRedoTask(lastElem);
    } else {
      alert("You have no more deleted tasks");
    }
  }

  handleRedoTask(element) {
    const redoSize = redoDeque.size;
    if (redoDeque.container.length + 1 > redoSize) {
      const redoElem = redoDeque.popBack();
    }
    redoDeque.addFront(element);
  }

  redoTask() {
    if (redoDeque.container.length > 0) {
      //   Get reference to the correct element
      const lastElem = redoDeque.popFront();
      const elemName = lastElem.dataset.name;
      const elemID = elemName.replace(/\s+/g, "");
      const elem = document.getElementById(elemID);
      if (elem) {
        this.completeTask(elem);
      }
    } else {
      alert("There are no tasks that you undid");
    }
  }
}

class Quote {
  constructor() {
    // DOM element assignments
    document
      .querySelector(".quote")
      .addEventListener("click", this.getQuote.bind(this));
    this.displayQuote = document.querySelector(".user-quote");
  }

  // Asynchronously fetch a quote from the API
  async getQuote() {
    try {
      // Clear any existing quote
      this.displayQuote.innerHTML = "";

      // Add a spinning animation while waiting for response
      this.displayQuote.classList.add("spinning");

      // Fetch quote from API
      const response = await fetch("https://api.adviceslip.com/advice");
      var data = await response.json();

      // Update the quote
      this.displayQuote.innerHTML = data.slip.advice;

      // Remove spinning animation and show the quote on UI
      this.displayQuote.classList.remove("spinning");
      this.displayQuote.classList.remove("hidden");
    } catch (err) {
      // Alert user with any error from fetch
      alert(err);
    }
  }
}

/*  
Timer functionality
Pomodoro technique:
25 minutes of work broken into 5 minute breaks
Every 4 consecutive interals you get a 20 minute break
*/

class Pomodoro {
  constructor() {
    // Event Listeners
    document
      .querySelector(".study-timer")
      .addEventListener("click", this.runPomodoro.bind(this)); // Called by the element triggering the event
    document
      .querySelector(".stop-timer")
      .addEventListener("click", this.stopPomodoro.bind(this));

    // DOM element
    this.timerDisplay = document.querySelector(".update-timer");
    this.infoLink = document.querySelector(".pomodoro-link");
    this.currentInterval = document.getElementById("interval-name");

    // Progress and countdown initialization
    this.countdown = document.querySelector(".current");
    this.progressBar = document.querySelector(".progress-bar");
    this.progressContainer = document.querySelector(".progress-container");

    // Initialization of the timer state
    this.startTime = 0;
    this.rounds = 0;
    this.intervalID = "";
    this.timeoutID = "";
  }

  runPomodoro() {
    // Update user display and number of rounds
    this.rounds++;
    this.infoLink.classList.remove("pomodoro-link");
    this.infoLink.classList.add("hidden");
    this.currentInterval.innerHTML = "Current interval: 25 minutes of work";

    console.log("Reached 25 minutes work");

    if (this.rounds == 4) {
      // Set back to 0 intervals of work time:
      this.rounds = 0;
      // Set appropriate timer and callback based on the number of rounds completed
      this.showTimer(25);
      this.timeoutID = setTimeout(this.doTwentyBreak.bind(this), 25 * 60000);
    } else {
      this.showTimer(25);
      this.timeoutID = setTimeout(this.doFiveBreak.bind(this), 25 * 60000);
    }
  }

  // Functions to handle the breaks and schedule the next work interval
  doFiveBreak() {
    console.log("Reached 5 minutes break");
    this.currentInterval.innerHTML = "Current interval: 5 minute break";
    this.showTimer(5);
    this.timeoutID = setTimeout(this.runPomodoro.bind(this), 5 * 60000);
  }

  doTwentyBreak() {
    console.log("Reached 20 minutes break");
    this.currentInterval.innerHTML = "Current interval: 20 minute break";
    this.showTimer(20);
    this.timeoutID = setTimeout(this.runPomodoro.bind(this), 20 * 60000);
  }

  showTimer(num) {
    // Update start time
    this.startTime = Date.now();

    // CLear any existing intervals to prevent multiple timers running simultaneously
    clearInterval(this.intervalID);

    // Updates and displays the elapsed time every second
    this.intervalID = setInterval(this.updateElapsedTime.bind(this, num), 1000);
  }

  updateElapsedTime(num) {
    // Get the current time (to subtract from)
    const currentTime = Date.now();

    // Calculate the elapsed time (milliseconds)
    const elapsedTime = currentTime - this.startTime;
    const remainingTime = num * 60000 - elapsedTime;

    // Convert to minutes and seconds
    const remainingMinutes = Math.floor(remainingTime / (1000 * 60));
    const remainingSeconds = Math.floor((remainingTime % (1000 * 60)) / 1000);

    // Display the elapsed time
    this.countdown.innerHTML = `Time left: ${remainingMinutes} minutes ${remainingSeconds} seconds`;

    // Calculate progress percentage
    const progress = ((num * 60000 - remainingTime) / (num * 60000)) * 100;

    // Update progress bar
    this.progressBar.style.width = `${progress}%`;
    if (Math.ceil(progress) > 100) {
      this.progressBar.innerHTML;
    } else {
      this.progressBar.innerHTML = `${Math.ceil(progress)}%`;
    }
    this.progressContainer.classList.remove("hidden");
    // Show the time left
    this.timerDisplay.classList.remove("hidden");
  }

  // CLear and reset the timer and UI
  stopPomodoro() {
    clearInterval(this.intervalID);
    clearTimeout(this.timeoutID);
    this.rounds = 0;
    this.countdown.innerHTML = "";
    this.timerDisplay.classList.add("hidden");
    this.infoLink.classList.remove("hidden");
    this.infoLink.classList.add("pomodoro-link");
    this.progressBar.style.width = "0%";
    this.progressContainer.classList.add("hidden");
  }
}

// Global functions for drag & drop interactions

const removeTasks = document.querySelector(".remove-tasks");
const dropZone = document.querySelector(".drop-zone");

// Prevent reloading
function allowDrop(event) {
  event.preventDefault();
}

// Detect when element is dragged into the task removal container
removeTasks.addEventListener("dragover", function (event) {
  event.preventDefault();
  enlargeDropZone();
});

// Detect when element is dragged out of the task removal container
removeTasks.addEventListener("dragleave", function (event) {
  event.preventDefault();
  resetDropZone();
});

// Enlarge drop zone when a draggable element is dragged over it
function enlargeDropZone() {
  dropZone.classList.add("enlarged");
}

// Set drop zone back to default size
function resetDropZone() {
  dropZone.classList.remove("enlarged");
}

function drag(event) {
  // Set the data that is being transferred during the drag
  event.dataTransfer.setData("text/plain", event.target.id);
  console.log(event.target.id);
  // Set the text of the dragged element
  event.dataTransfer.setData("text/plain-content", event.target.textContent);
}

// Remove a task by dropping
function drop(event) {
  resetDropZone();
  let draggedId = event.dataTransfer.getData("text/plain");

  // Get a reference to the dragged element
  let draggedElement = document.getElementById(draggedId);

  // Check if the dragged element exists
  if (draggedElement) {
    // Update time
    taskManager.completeTask(draggedElement);
  }
}

// Global functions for popup toggling

// Toggle popup for goal-setting screen
function togglePopup(event) {
  event.preventDefault();
  let popupOverlay = document.getElementById("popupOverlay");
  popupOverlay.style.display =
    popupOverlay.style.display === "block" ? "none" : "block";
}

function togglePopupAndAddGoal(event) {
  event.preventDefault();
  togglePopup(event);

  // Validate goal input
  let newGoal = document.getElementById("gname").value;
  if (!Number.isInteger(Number(newGoal)) || Number(newGoal) <= 0) {
    alert("Goal must be a positive number of minutes");
  } else if (Number(newGoal) <= taskManager.progress) {
    alert("Your goal should be greater than your current progress!");
  } else {
    // Set new goal and update user display
    taskManager.goalReached = false;
    taskManager.goal = Number(newGoal);
    let goalProgress = document.getElementById("goal-progress");
    goalProgress.innerHTML = `${Math.round(
      (taskManager.progress / Number(newGoal)) * 100
    )} %`;
  }
  // Set input field back to empty
  document.getElementById("gname").value = "";
}

const taskManager = new TaskManager();
const quote = new Quote();
const deletedDeque = new Deque(5); // pass in default size
const redoDeque = new Deque(5);
const pomodoro = new Pomodoro();
