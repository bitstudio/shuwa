"use strict";

import { initVideoSeleciton } from "./selection.js";
import { initRecord } from "./record.js";

window.recoil = {
  selectSign: "",
};

$(document).ready(() => {
  console.log("getting start ready!");
  initVideoSeleciton();
  initRecord();
});
