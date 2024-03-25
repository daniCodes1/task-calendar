"use strict";

class TaskManager {
  constructor() {
    // DOM elements
    this.addBtn = document.querySelector(".add");
    this.totalDifficulty = document.getElementById("stat-difficulty");
    this.congratsMsg = document.querySelector(".congrats");
    this.handleTask = this.handleTask.bind(this);
    this.addBtn.addEventListener("click", this.handleTask);

    // Properties
    this.totalTasks = 0;
    this.difficulty = 0;
    this.timeLeft = 0;
  }

  handleTask() {
    event.preventDefault();
    if (this.totalTasks >= 12) {
      alert("You are at the maximum number of tasks");
    } else {
      let newTaskName = document.getElementById("tname").value;
      let newTaskDuration = Number(document.getElementById("duration").value);
      let newTaskDifficulty = Number(
        document.getElementById("difficulty").value
      );

      if (
        this.authenticateTaskFields(
          newTaskName,
          newTaskDuration,
          newTaskDifficulty
        )
      ) {
        // Create and append task
        this.addTask(newTaskName, newTaskDuration, newTaskDifficulty);

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

  addTask(newTaskName, newTaskDuration, newTaskDifficulty) {
    let div = document.createElement("div");
    div.setAttribute("class", "box");
    div.setAttribute("draggable", "true");
    div.setAttribute("ondragstart", "drag(event)");
    div.dataset.duration = newTaskDuration;
    div.dataset.difficulty = newTaskDifficulty;

    // Set ID
    const idName = newTaskName.replace(/\s+/g, "");
    div.setAttribute("id", `${idName}`);

    // Set task
    div.innerHTML = `${newTaskName} <h5>[${newTaskDuration} minutes]</h5>`;
    const leftChildren = document.querySelector(".column1").children.length;
    if (leftChildren < 6) {
      document.querySelector(".column1").appendChild(div);
      console.log(`Tasks on left: ${leftChildren}`);
    } else {
      document.querySelector(".column2").appendChild(div);
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
    let header = document.getElementById("countdown");
    header.innerHTML = this.timeLeft;
  }

  updateDifficulty(level, state) {
    console.log(document);
    if (state) {
      this.difficulty += level;
      this.totalTasks++;
    } else {
      this.difficulty -= level;
      this.totalTasks -= 1;
    }

    if (this.totalTasks == 0) {
      // Case: denominator = 0
      this.totalDifficulty.innerHTML = "No tasks";
    } else {
      const avgDifficulty = this.difficulty / this.totalTasks;

      if (avgDifficulty < 4) {
        this.totalDifficulty.innerHTML = "Easy";
      } else if (avgDifficulty <= 7) {
        this.totalDifficulty.innerHTML = "Medium";
      } else {
        this.totalDifficulty.innerHTML = "Difficult";
      }
    }
  }
}

class Quote {
  constructor() {
    document
      .querySelector(".quote")
      .addEventListener("click", this.getQuote.bind(this));
    this.displayQuote = document.querySelector(".user-quote");
  }

  async getQuote() {
    try {
      this.displayQuote.innerHTML = "";
      this.displayQuote.classList.add("spinning");
      // Get the element where you want to show the loading animation
      // const loadingText = document.querySelector(".user-quote");
      // Set the inner text of the element to the spinning animation

      const response = await fetch("https://api.adviceslip.com/advice");
      var data = await response.json();

      this.displayQuote.innerHTML = data.slip.advice;

      this.displayQuote.classList.remove("spinning");
      this.displayQuote.classList.remove("hidden");
    } catch (err) {
      alert(err);
    }
  }
}

// Timer functionality
/* Pomodoro technique:
25 minutes of work broken into 5 minute breaks
every 4 consecutive interals u get a 20 minute break
*/

class Pomodoro {
  constructor() {
    document
      .querySelector(".study-timer")
      .addEventListener("click", this.runPomodoro.bind(this)); // Called by the element triggering the event
    document
      .querySelector(".stop-timer")
      .addEventListener("click", this.stopPomodoro.bind(this));
    this.timerDisplay = document.querySelector(".update-timer");
    this.infoLink = document.querySelector(".pomodoro-link");
    this.currentInterval = document.getElementById("interval-name");
    // only the counting
    this.countdown = document.querySelector(".current");
    this.startTime = 0;
    this.rounds = 0;
    this.intervalID = "";
    this.timeoutID = "";
  }

  runPomodoro() {
    console.log("starting");
    this.rounds++;
    this.infoLink.classList.remove("pomodoro-link");
    this.infoLink.classList.add("hidden");
    this.currentInterval.innerHTML = "Current interval: 25 minutes of work";

    console.log("Reached 25");
    // Set appropriate timer + callback
    if (this.rounds == 4) {
      this.rounds = 0; // set back to 0 intervals of work time
      this.showTimer(25);

      this.timeoutID = setTimeout(this.doTwentyBreak.bind(this), 25 * 60000); // after 25 mins of work, get a 20 minute break
    } else {
      this.showTimer(25);
      this.timeoutID = setTimeout(this.doFiveBreak.bind(this), 25 * 60000); // after 25 mins of work, get a 5 minute break
    }
  }

  // Five minute break, run 25 after
  doFiveBreak() {
    console.log("Reached 5");
    this.currentInterval.innerHTML = "Current interval: 5 minute break";
    this.showTimer(5);
    this.timeoutID = setTimeout(this.runPomodoro.bind(this), 5 * 60000);
  }

  // Twenty minute break, run 25 after
  doTwentyBreak() {
    console.log("Reached 20");
    this.currentInterval.innerHTML = "Current interval: 20 minute break";
    this.showTimer(20);
    this.timeoutID = setTimeout(this.runPomodoro.bind(this), 20 * 60000);
  }

  showTimer(num) {
    // Update start time
    this.startTime = Date.now();

    // Count and show elapsed time
    clearInterval(this.intervalID);
    this.intervalID = setInterval(this.updateElapsedTime.bind(this, num), 1000);
  }

  updateElapsedTime(num) {
    // Get the current time (to subtract from)
    const currentTime = Date.now();

    // Calculate the elapsed time (milliseconds)
    const elapsedTime = currentTime - this.startTime;
    console.log(elapsedTime);
    const remainingTime = num * 60000 - elapsedTime;

    // Convert to minutes and seconds
    const remainingMinutes = Math.floor(remainingTime / (1000 * 60));
    const remainingSeconds = Math.floor((remainingTime % (1000 * 60)) / 1000);

    // Show time
    this.timerDisplay.classList.remove("hidden");

    // Display the elapsed time
    this.countdown.innerHTML = `Time left: ${remainingMinutes} minutes ${remainingSeconds} seconds`;
  }

  stopPomodoro() {
    clearInterval(this.intervalID);
    clearTimeout(this.timeoutID);
    this.rounds = 0;
    this.countdown.innerHTML = "";
    this.timerDisplay.classList.add("hidden");
    this.infoLink.classList.remove("hidden");
    this.infoLink.classList.add("pomodoro-link");
  }
}

// Global functions
function allowDrop(event) {
  event.preventDefault();
}

function drag(event) {
  // Set the data that is being transferred during the drag
  event.dataTransfer.setData("text/plain", event.target.id);
  console.log(event.target.id);
  // Set the text of the dragged element
  event.dataTransfer.setData("text/plain-content", event.target.textContent);
}

function drop(event) {
  event.preventDefault();
  let draggedId = event.dataTransfer.getData("text/plain");

  // Get a reference to the dragged element
  let draggedElement = document.getElementById(draggedId);

  // Check if the dragged element exists
  if (draggedElement) {
    // Update time
    taskManager.updateDuration(
      parseInt(draggedElement.dataset.duration),
      false
    );

    // Update difficulty
    taskManager.updateDifficulty(
      parseInt(draggedElement.dataset.difficulty),
      false
    );

    // Remove the dragged element from the DOM
    const textContent = event.dataTransfer.getData("text/plain-content");
    draggedElement.parentNode.removeChild(draggedElement);

    // Print out the task that was completed and removed
    console.log(`The following task was completed: ${textContent}`);
  }
}

const taskManager = new TaskManager();
const quote = new Quote();
const pomodoro = new Pomodoro();
