"use strict";
export const initVideoSeleciton = async () => {
  /**
   * table
   * fetch available data
   * selection sign buffer
   * map available data to table
   */

  const label_list = await $.getJSON("./assets/label_list.json");
  console.log(label_list);

  const removeChild = (inputClass) => {
    const parent = document.querySelector(inputClass);
    let child = parent.lastElementChild;
    while (child) {
      parent.removeChild(child);
      child = parent.lastElementChild;
    }
  };

  const handleSelectSign = (group, input) => {
    window.recoil["selectSign"] = input;
    let pickerGroup = document.getElementsByClassName(group);

    for (var i = 0; i < pickerGroup.length; i++) {
      pickerGroup[i].classList.remove("active");
    }
    let picker = document.getElementById(input);
    console.log("picker: ", picker);
    picker.classList.add("active");

    const signLanguage = input.split("_")[0];
    const videoSrc = "./assets/video/" + signLanguage + "/" + input + ".mp4";

    const outputVideo = document.getElementById("demo-video");
    outputVideo.src = videoSrc;
  };

  // const createVideoDOM = (sign) => {
  //   // create dom video
  //   const signLanguage = sign.split("_")[0];
  //   const videoSrc = "./assets/video/" + signLanguage + "/" + sign + ".mp4";
  //   const videoDOM = document.createElement("video");
  //   videoDOM.setAttribute("id", sign);
  //   videoDOM.autoplay = true;
  //   videoDOM.muted = true;
  //   videoDOM.loop = true;
  //   videoDOM.playsinline = true;
  //   videoDOM.src = videoSrc;
  //   return videoDOM;
  // };

  // add jsl selection list
  const jsl_table = document.createElement("div");
  jsl_table.classList.add("jsl-sign-table");
  jsl_table.style.display = "none";
  $(".demo-section-sign-wrapper-sign-table-wrapper").append(jsl_table);

  for (const jsl_sign of label_list.JSL_LABELS) {
    console.log(jsl_sign);
    const jsl_button = document.createElement("button");
    jsl_button.classList.add("jsl-sign-button");
    jsl_button.setAttribute("id", jsl_sign);
    jsl_button.innerHTML = jsl_sign;

    // const thisVideoDOM = createVideoDOM(jsl_sign);

    jsl_button.addEventListener("click", () => {
      console.log("click: ", jsl_sign);
      handleSelectSign("jsl-sign-button", jsl_sign);
    });
    $(".jsl-sign-table").append(jsl_button);
  }

  // add hksl selection list
  const hksl_table = document.createElement("div");
  hksl_table.classList.add("hksl-sign-table");
  $(".demo-section-sign-wrapper-sign-table-wrapper").append(hksl_table);
  for (const hksl_sign of label_list.HKSL_LABELS) {
    console.log(hksl_sign);
    const hksl_button = document.createElement("button");
    hksl_button.classList.add("hksl-sign-button");
    hksl_button.setAttribute("id", hksl_sign);
    hksl_button.innerHTML = hksl_sign;

    // const thisVideoDOM = createVideoDOM(hksl_sign);

    hksl_button.addEventListener("click", () => {
      console.log("click: ", hksl_sign);
      handleSelectSign("hksl-sign-button", hksl_sign);
    });
    $(".hksl-sign-table").append(hksl_button);
  }
};
