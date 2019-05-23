const video = document.getElementById("inputVideo");
const canvas = document.getElementById("canvas");
const context = canvas.getContext("2d");
const overlay = document.getElementById("overlay");
let updateNote = document.getElementById("updatenote");
let pose = document.getElementById("pose");
let prevPose = null;
let poseCount = 0;
let triggerLimit = 5;
let isVideo = false;
let model = null;
let instr = document.getElementById("instructions");
let pred_x = 0;
let pred_y = 0;
let pred_w = 0;
let pred_h = 0;

canvas.width = 640;
canvas.height = 480;

function startHandGestureTracking() {
    drawFrame();
    setTimeout(function () {
        sendBase64ToServer(canvas.toDataURL());
    }, 1000);
}


function sendBase64ToServer(base64) {
    let httpPost = new XMLHttpRequest();
    let path = "http://127.0.0.1:5000/predict";
    let data = JSON.stringify({
        image: base64
    });
    httpPost.open("POST", path, true);
    httpPost.onreadystatechange = function (err) {
        if (httpPost.responseText != "") {
            if (httpPost.readyState == 4 && httpPost.status == 200 && JSON.parse(httpPost.responseText).success) {
                //console.log(httpPost.responseText);
                
                let json_res = JSON.parse(httpPost.responseText);
                status(json_res.highest + " " + json_res.bounding_box[0] + " " + json_res.bounding_box[1]);
                pred_x = json_res.bounding_box[0][0];
                pred_y = json_res.bounding_box[0][1];
                pred_w = json_res.bounding_box[1];
                pred_h = json_res.bounding_box[2];
                console.log("response received")
                //console.log(json_res);
                if (prevPose == json_res.highest) {
                    poseCount = poseCount + 1;
                    console.log(poseCount)
                    if (poseCount >= triggerLimit) {
                        if (prevPose == "Five") {
                            // If randomly selected pose is fist and pose detected is five
                            if (randPose == "Fist") {
                                //instructions("You have performed the wrong gesture. Please perform the hand gesture \"Fist\"");
                                $("#detectedStatus").text("You have performed the wrong gesture. Please perform the hand gesture " + randPose);
                                poseCount = 0;
                            } else {
                                console.log("redirecting");
								poseCount = 0;
                                showWorksheet();
                            }
                        }

                        if (prevPose == "Fist") {
                            // If randomly selected pose is fist and pose detected is five
                            if (randPose == "Fist") {
                                $("#detectedStatus").text("You have performed the wrong gesture. Please perform the hand gesture " + randPose);
                                poseCount = 0;
                            } else {
                                console.log("redirecting");
								poseCount = 0;
                                showWorksheet();
                            }
                        }
                    }
                } else {
                    poseCount = 0;
                }
                prevPose = json_res.highest;
            } else {
                if (JSON.parse(httpPost.responseText).success != true) {
                    pred_x = 0;
                    pred_y = 0;
                    pred_w = 0;
                    pred_h = 0;
                    status("No gesture detected.");
                }
                //console.log(httpPost.responseText);
                //console.log(err);
            }
        }

    };

    httpPost.send(data);
    setTimeout(function () {
        sendBase64ToServer(canvas.toDataURL());
    }, 100);

}

const status = msg => pose.innerText = msg;

const instructions = msg => instr.innerText = msg;

function drawRect(x, y, w, h) {
    context.beginPath();
    context.strokeStyle = "#0063FF";
    context.lineWidth = 2
    context.strokeRect(x, y, w, h);
}

function drawFrame() {
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    //drawRect(pred_x,pred_y,pred_w,pred_h);
    overlay.getContext("2d").clearRect(0, 0, overlay.width, overlay.height);
    faceapi.drawBox(overlay.getContext("2d"), pred_x, pred_y, pred_w, pred_h);
    setTimeout(drawFrame, 100);
}
