"use strict";

import { initVideoSeleciton } from "./selection.js";

window.recoil = {
  selectSign: "",
};

$(document).ready(() => {
  console.log("getting start ready!");
  initVideoSeleciton();
});
