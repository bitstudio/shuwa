function dataURLtoFile(dataurl, filename) {
  const arr = dataurl.split(","),
    mime = arr[0].match(/:(.*?);/)[1],
    bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);

  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }

  return new File([u8arr], filename, { type: mime });
}

async function uploadImage(url, dataurl, imageName) {
  return new Promise((resolve, reject) => {
    // var fd = new FormData()
    // fd.append()
    const xhr = new XMLHttpRequest();
    xhr.open("PUT", url, true);
    xhr.onreadystatechange = () => {
      if (xhr.readyState === 4) {
        if (xhr.status === 200) {
          resolve(xhr.response);
          console.log("upload complete");
          // $('.bottom-page3-container').show();
        } else {
          reject(xhr.response);
        }
      }
    };

    const imageFile = dataURLtoFile(dataurl, imageName);

    xhr.setRequestHeader("Content-Type", "image/png");
    xhr.send(imageFile);
  });
}

async function getSignedURL(metadata) {
  return new Promise(async (resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open(
      "POST",
      "https://us-central1-bit-ml-research.cloudfunctions.net/sign_language_pipeline/get_signed_url",
      true
    );
    xhr.onreadystatechange = () => {
      if (xhr.readyState === 4) {
        if (xhr.status === 200) {
          resolve(JSON.parse(xhr.response).url);
          console.log("get URL complete");
        } else {
          reject(xhr.response);
        }
      }
    };

    console.log(metadata);

    xhr.setRequestHeader("Content-Type", "application/json");
    const obj = JSON.stringify(metadata);
    xhr.send(obj);
  });
}

export const sendDataToCloud = (
  imageStack,
  signingResult,
  callbackFunction
) => {
  console.log("send data to cloud");
  console.log("finish data to cloud");

  /**
   * Flow: collect image stack array
   * key the right selection sign from user
   * send image stack array to cloud
   * return notation to the user
   */

  let frameCount = 1;
  const folderTime = +Date.now();
  const startSendData = async () => {
    for (const imageSelected of imageStack) {
      const imageUrl = imageSelected.dataUrl;
      const metadata = {
        directory: "ML_demo_test/" + signingResult + "/" + folderTime,
        filename: String(frameCount) + ".png",
        contentType: "image/png",
        action: "write",
        version: "v4",
      };
      frameCount += 1;
      const url = await getSignedURL(metadata);
      uploadImage(url, imageUrl, signingResult);
    }
    // call back
    callbackFunction();
  };
  startSendData();
};
