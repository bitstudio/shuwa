"use-strict";

let cameraState = "idle";
export const initRecord = () => {
  /**
   * init camera
   * init record button
   * handle record
   * update state record finish (3 secs)
   */

  let isCameraSetup = false;
  const videoOutput = document.getElementById("video-camera-id");
  const onLoadedVideo = () => {
    console.log("loadedVideoData");
    if (videoOutput !== null && isCameraSetup) {
      videoOutput.play();
    }
  };
  const setupCamera = async () => {
    const constraints = {
      audio: false,
      video: {
        facingMode: "user", // 'user' or 'environment'
      },
    };
    if (videoOutput !== null) {
      const mediaStream = await navigator.mediaDevices
        .getUserMedia(constraints)
        .catch((err) => {
          console.log(err.name);
          props.action();
          if (err.name === "NotAllowedError") {
            console.log("camera permission deniend");
            return;
          } else {
            console.log("camera undefined");
            return;
          }
        });
      if (mediaStream) {
        videoOutput.srcObject = mediaStream;
        isCameraSetup = true;
        onLoadedVideo();
        console.log(`--- set up camera ---`);
      }
    } else return;
  };
  setupCamera();
};
