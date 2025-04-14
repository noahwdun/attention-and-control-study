var jsPsychPluginWheel = (function (jspsych) {
  "use strict";

  const info = {
    name: "plugin-wheel",
    version: "0.0.1",
    parameters: {
      spinSpeed: {
        type: jspsych.ParameterType.INT,
        default: 6,
        description: "Speed of the spinning wheel in degrees per frame",
      },
      cooldownDuration: {
        type: jspsych.ParameterType.INT,
        default: 2000,
        description: "Cooldown duration in milliseconds",
      },
      blinkDuration: {
        type: jspsych.ParameterType.INT,
        default: 200,
        description: "Duration of the red dot blink in milliseconds",
      },
      blinkPauseMin: {
        type: jspsych.ParameterType.INT,
        default: 400,
        description: "Minimum pause duration between blinks in milliseconds",
      },
      blinkPauseMax: {
        type: jspsych.ParameterType.INT,
        default: 2000,
        description: "Maximum pause duration between blinks in milliseconds",
      },
      isDot: {
        type: jspsych.ParameterType.BOOL,
        default: false,
        description: "Whether to show the red dot or not",  
      }
    },
  };

  class WheelPlugin {
    constructor(jsPsych) {
      this.jsPsych = jsPsych;
    }

    trial(display_element, trial) {
      // HTML structure
      display_element.innerHTML = `
        <div id="circle" class="cooldown">
          <div id="target-line"></div>
          <div id="target-line-dot"></div>
          <div id="fixed-line"></div>
          <div id="red-dot"></div>
        </div>
      `;

      // CSS styles
      const style = document.createElement("style");
      style.innerHTML = `
        #circle {
          width: 300px;
          height: 300px;
          border-radius: 50%;
          background-color: gray;
          position: relative;
          margin: 100px auto;
        }
        #circle.cooldown {
          background-color: rgb(186, 186, 186);
        }
        #target-line {
          width: 4px;
          height: 150px;
          background-color: black;
          position: absolute;
          top: 0;
          left: calc(50% - 2px);
          transform-origin: center bottom;
          z-index: 1;
        }
        #target-line-dot {
          width: 4px;
          height: 4px;
          background-color: black;
          border-radius: 50%;
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          z-index: 1;
        }
        #target-line.cooldown {
          background-color: gray;
        }
        #target-line-dot.cooldown {
          background-color: gray;
        }
        #fixed-line {
          width: 2px;
          height: 150px;
          background-color: black;
          position: absolute;
          top: 0;
          left: calc(50% - 1px);
          transform-origin: bottom;
          z-index: 0;
        }
        #fixed-line.cooldown {
          background-color: gray;
        }
        #red-dot {
          width: 20px;
          height: 20px;
          background-color: red;
          border-radius: 50%;
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          z-index: 2;
        }
      `;
      document.head.appendChild(style);

      // JavaScript functionality
      const circle = document.getElementById("circle");
      const targetline = document.getElementById("target-line");
      const fixedLine = document.getElementById("fixed-line");
      const dot = document.getElementById("target-line-dot");
      const redDot = document.getElementById("red-dot");

      let blinkCount = 0;
      let angle = 0;
      let spinning = true;
      let isCooldown = false;
      let spinCount = 0;

      if (!trial.isDot) {
        redDot.style.visibility = "hidden";
      };

      const startSpinSequence = () => {
        if (spinCount < 3) {
          cooldown();
        } else {
          display_element.innerHTML = "";
          this.jsPsych.finishTrial({ blinkCount, angle, spinSpeed: trial.spinSpeed });
        }
      };

      function cooldown() {
        isCooldown = true;
        circle.classList.add("cooldown");
        targetLine.classList.add("cooldown");
        dot.classList.add("cooldown");
        fixedLine.classList.add("cooldown");

        spinning = true;
        setTimeout(() => {
          circle.classList.remove("cooldown");
          targetLine.classList.remove("cooldown");
          dot.classList.remove("cooldown");
          fixedLine.classList.remove("cooldown");
          isCooldown = false;
        }, trial.cooldownDuration);
      }

      document.addEventListener("keydown", (event) => {
        if (event.code === "Space" && !isCooldown) {
          if (spinning) {
            spinning = false;
            setTimeout(() => {
              spinCount++;
              startSpinSequence();
            }, 500); // Pause 500ms before next spin
          }
        }
      });

      function spin() {
        if (spinning) {
          angle = (angle + trial.spinSpeed) % 360;
          line.style.transform = `rotate(${angle}deg)`;
        }
        requestAnimationFrame(spin);
      }

      function blinkRedDot() {
        redDot.style.visibility = "visible";
        blinkCount++;
        setTimeout(() => {
          blinkPauseInterval();
        }, trial.blinkDuration);
      }

      function blinkPauseInterval() {
        redDot.style.visibility = "hidden";
        const pauseDuration =
          Math.random() * (trial.blinkPauseMax - trial.blinkPauseMin) +
          trial.blinkPauseMin;
        setTimeout(blinkRedDot, pauseDuration);
      }

      // Start the trial
      startSpinSequence();
      spin();
      if (trial.isDot) {blinkPauseInterval()}; // Start the blinking process
    }
  }
  WheelPlugin.info = info;

  return WheelPlugin;
})(jsPsychModule);