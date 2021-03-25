"use strict";

import { initVideoSeleciton } from "./selection.js";
import { setupCamera, captureImage } from "./record.js";

import SignLanguageClassifyModel from "./ML/signClassify.js";
import { drawResult } from "./drawkeypoints.js";

window.recoil = {
  selectSign: "",
};

$(document).ready(() => {
  console.log("getting start ready!");
  initVideoSeleciton();
  setupCamera();

  let isInitModel = false;

  const classifyModel = new SignLanguageClassifyModel();

  const initmodel = async () => {
    const result = await classifyModel.initModel();
    isInitModel = result;
    console.log("init model finish");
  };

  initmodel();

  /**
   * TODO:
   * init video
   * init model
   * set upCamera
   * click record
   * count down to capture screen
   * capture image to stack
   * send image stack to ml
   * ml process
   * set state to result
   * show result [table, drawImage, sort accuracy sign result]
   */

  const removeChild = (inputClass) => {
    return new Promise((resolve) => {
      const parent = document.querySelector(inputClass);
      let child = parent.lastElementChild;
      while (child) {
        console.log("child: ", child);
        parent.removeChild(child);
        child = parent.lastElementChild;
      }
      resolve("finished");
    });
  };

  const IMAGE_STACK = [];
  const PREDICTION_IMAGE_STACK = [];
  const FRAME_KEYPOINTS_TABLE = [];
  const RESULT_POSE_STACK = [];
  const RESULT_FACE_STACK = [];
  const RESULT_LEFTHAND_STACK = [];
  const RESULT_RIGHTHAND_STACK = [];
  const topFiveResultArr = [];

  const checkArrayMatch = (a, b) => {
    const z = a.map((item) => {
      return JSON.stringify(item);
    });
    return z.includes(JSON.stringify(b));
  };

  const startClassify = () => {
    const thres = (IMAGE_STACK.length - 5) / 16;
    const imageTime = [];
    for (let i = 0; i < 16; i++) {
      imageTime.push(Math.round(thres * i));
    }
    console.log("image time stack: ", imageTime);
    for (const time of imageTime) {
      PREDICTION_IMAGE_STACK.push(IMAGE_STACK[time + 3]);
    }
    console.log("prediciton image stack: ", PREDICTION_IMAGE_STACK);
    IMAGE_STACK.length = 0; // clear image stack
    const predictionImage = async () => {
      for (const image_index in PREDICTION_IMAGE_STACK) {
        console.log(image_index);
        const result = await classifyModel.predictImage(
          PREDICTION_IMAGE_STACK[image_index].imageData
        );
        console.log(result);
        const isPose = !checkArrayMatch(result.pose, [0, 0]);
        const isFace = !checkArrayMatch(result.face, [0, 0]);
        const isLeftHand = !checkArrayMatch(result.leftHand, [0, 0]);
        const isRightHand = !checkArrayMatch(result.rightHand, [0, 0]);
        FRAME_KEYPOINTS_TABLE.push({
          frame: image_index,
          pose: isPose,
          face: isFace,
          leftHand: isLeftHand,
          rightHand: isRightHand,
        });
        RESULT_POSE_STACK.push(result.pose);
        RESULT_FACE_STACK.push(result.face);
        RESULT_LEFTHAND_STACK.push(result.leftHand);
        RESULT_RIGHTHAND_STACK.push(result.rightHand);
      }
      console.log("finished predict image: pose, face, hand");
      const resultStack = {
        poseStack: RESULT_POSE_STACK,
        faceStack: RESULT_FACE_STACK,
        leftHandStack: RESULT_LEFTHAND_STACK,
        rightHandStack: RESULT_RIGHTHAND_STACK,
      };
      console.log("result stack: ", resultStack);
      const classifyResult = await classifyModel.predictSign(resultStack);
      const cmp = (a, b) => {
        return b[1] > a[1] ? 1 : -1;
      };
      const sortedArray = classifyResult.resultArray.sort(cmp);
      console.log(sortedArray);

      // get all stack keypoints and image stack send to draw key points
      const canvasWrapperEl = document.getElementById(
        "frame-canvas-wrapper-id"
      );

      for (const i in PREDICTION_IMAGE_STACK) {
        const canvasEl = drawResult({
          imageData: PREDICTION_IMAGE_STACK[i].imageData,
          resultKeypoints: {
            poseStack: RESULT_POSE_STACK[i],
            faceStack: RESULT_FACE_STACK[i],
            leftHandStack: RESULT_LEFTHAND_STACK[i],
            rightHandStack: RESULT_RIGHTHAND_STACK[i],
          },
        });
        if (canvasEl !== null && canvasWrapperEl !== null) {
          canvasEl.classList.add("result-kp-image");
          canvasEl.id = `image-frame-${i}`;
          canvasEl.style.display = "none";
          canvasWrapperEl.appendChild(canvasEl);
          console.log("append child");
        }
      }

      // update to result state
      // update top 5 result
      // remove exits table
      await removeChild("#table-body");
      const parentTable = document.getElementById("table-body");
      console.log("check remove child");
      for (let i = 0; i < 5; i++) {
        topFiveResultArr.push({
          sign: sortedArray[i][0],
          acc: (sortedArray[i][1] * 100).toFixed(2),
        });

        // create top 5 table
        const thisTable = document.createElement("tr");
        thisTable.setAttribute("key", i);
        const rankNode = document.createElement("td");
        rankNode.innerHTML = i;
        const resultNode = document.createElement("td");
        resultNode.innerHTML = sortedArray[i][0];
        const accNode = document.createElement("td");
        accNode.innerHTML = sortedArray[i][1];
        thisTable.appendChild(rankNode);
        thisTable.appendChild(resultNode);
        thisTable.appendChild(accNode);
        console.log("append table child");
        parentTable.appendChild(thisTable);
      }
    };
    predictionImage();
  };

  const handleCapture = () => {
    const time_startCapture = +new Date();
    const captureFrame = () => {
      const imageCaptured = captureImage();
      if (imageCaptured) IMAGE_STACK.push(imageCaptured);
      const time_now = +new Date();
      if (time_now - time_startCapture > 3000) {
        console.log("finish capture image");
        startClassify();
        return;
      } else {
        requestAnimationFrame(captureFrame);
      }
    };
    requestAnimationFrame(captureFrame);
  };

  $("#record-btn-id").on("click", () => {
    // count down 3 sec
    let count = 0;
    const CountDownInterval = setInterval(() => {
      count += 1;
      console.log(count);
      if (count === 3) {
        clearInterval(CountDownInterval);
        handleCapture();
      }
    }, 1000);
  });

  $("#language-hksl-btn").on("click", (e) => {
    const jsl_table = document.querySelector(".jsl-sign-table");
    const hksl_table = document.querySelector(".hksl-sign-table");
    jsl_table.style.display = "none";
    hksl_table.style.display = "unset";

    document.getElementsByClassName("language-btn").forEach((item) => {
      item.classList.remove("active");
    });
    e.target.classList.add("active");
  });
  $("#language-jsl-btn").on("click", (e) => {
    const jsl_table = document.querySelector(".jsl-sign-table");
    const hksl_table = document.querySelector(".hksl-sign-table");
    jsl_table.style.display = "unset";
    hksl_table.style.display = "none";

    document.getElementsByClassName("language-btn").forEach((item) => {
      item.classList.remove("active");
    });
    e.target.classList.add("active");
  });
});
