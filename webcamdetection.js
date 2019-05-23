let forwardTimes = []
let faceMatcher = null
let currImageIdx = 2,
    currClassIdx = 0
let foundCount = 0
var urlParams = new URLSearchParams(window.location.search);
let dist = {}

let engineer = "";
let approvedDateTime = "";

let approvingEngineer = "";
let approvedDateTime2 = "";

let randPose = "Five"

function updateTimeStats(timeInMs) {
    forwardTimes = [timeInMs].concat(forwardTimes).slice(0, 30)
    const avgTimeInMs = forwardTimes.reduce((total, t) => total + t) / forwardTimes.length
    $('#time').val(`${Math.round(avgTimeInMs)} ms`)
    $('#fps').val(`${faceapi.round(1000 / avgTimeInMs)}`)
}

async function onPlay() {
    const videoEl = $('#inputVideo').get(0)
    const canvas = $('#overlay').get(0)

    if (videoEl.paused || videoEl.ended || !isFaceDetectionModelLoaded())
        return setTimeout(() => onPlay())

    //const options = getFaceDetectorOptions() //this
    const ts = Date.now()


    updateTimeStats(Date.now() - ts)
    //await updateRefImageResults()
    await updateQueryImageResults()

    setTimeout(() => onPlay())
}

async function updateRefImageResults() {
    const videoEl = $('#inputVideo').get(0)
    const canvas = $('#overlay').get(0)

    const fullFaceDescriptions = await faceapi.detectAllFaces(videoEl, getFaceDetectorOptions())
        .withFaceLandmarks()
        .withFaceDescriptors()

    if (!fullFaceDescriptions.length) {
        return
    }
    faceMatcher = new faceapi.FaceMatcher(fullFaceDescriptions)
    faceapi.matchDimensions(canvas, videoEl)

    resizedResults = resizeCanvasAndResults(videoEl, canvas, fullFaceDescriptions)
    const labels = faceMatcher.labeledDescriptors
        .map(ld => ld.label)

    const boxesWithText = resizedResults
        .map(res => res.detection.box)
        .map((box, i) => new faceapi.BoxWithText(box, labels[i]))
    faceapi.drawDetection(canvas, boxesWithText)

}
let foundPersonArr = []
let detectedPersonArr = []

async function updateQueryImageResults() {

    if (!faceMatcher) {
        return
    }
    const videoEl = $('#inputVideo').get(0)
    const canvas = $('#overlay').get(0)

    const results = await faceapi.detectAllFaces(videoEl, getFaceDetectorOptions())
        .withFaceLandmarks()
        .withFaceDescriptors()

    //const input = await faceapi.fetchImage(getFaceImageUri(classes[currClassIdx], currImageIdx))

    //const descriptorr = await faceapi.computeFaceDescriptor(videoEl)

    resizedResults = resizeCanvasAndResults(videoEl, canvas, results)


    const boxesWithText = resizedResults.map(({
            detection,
            descriptor
        }) =>

        new faceapi.BoxWithText(
            detection.box,
            // match each face descriptor to the reference descriptor
            // with lowest euclidean distance and display the result as text
            faceMatcher.findBestMatch(descriptor).toString()

        )
    )

    faceapi.drawDetection(canvas, boxesWithText)

    //console.log(boxesWithText[0])
    if (typeof boxesWithText[0] !== "undefined") {
        const strArr = boxesWithText[0]._text.split(' ')
        if ((strArr[0] != "unknown")) {
            //for detecting multiple faces
            if (!foundPersonArr.includes(strArr[0])) { //if person just detected
                if (!detectedPersonArr.includes(strArr[0])) { //if not included in detected list
                    foundCount = 0 //reset counter to 0
                    detectedPersonArr.push(strArr[0]) //add into detected persons arr
                    console.log("newly detected: " + strArr[0])
                } else {
                    foundCount = foundCount + 1 //start counting up
                    console.log("count: " + foundCount)

                    if ((foundCount >= 10) && (detectedPersonArr.includes(strArr[0]))) {
                        foundPersonArr.push(strArr[0]) //add into list of found persons
                        $("#detectedStatus").text("Person Detected: " + strArr[0]);
                        updateListOfDetected(strArr[0])
                        // If 2 people are detected
                        if (strArr.length > 0) {
							
                            faceMatcher = null;
                            canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
                            finalFace = strArr[0];
							$("#title").text("Gesture Detection");
							
							if(engineer == ""){
								engineer = strArr[0];
								var current_datetime = new Date();
								
								let formattedDate = current_datetime.getDate() + "-" + (current_datetime.getMonth() + 1) + "-" + current_datetime.getFullYear() + " " + current_datetime.getHours() + ":" + current_datetime.getMinutes() + ":" + current_datetime.getSeconds()
								
								approvedDateTime = formattedDate;
								
								document.getElementById("row1_result1").innerHTML = "Approved By: " + engineer + "<br /> Date: " + approvedDateTime + " <br /> ";
								
							}else{
								approvingEngineer = strArr[0];
								var current_datetime = new Date();
								
								let formattedDate = current_datetime.getDate() + "-" + (current_datetime.getMonth() + 1) + "-" + current_datetime.getFullYear() + " " + current_datetime.getHours() + ":" + current_datetime.getMinutes() + ":" + current_datetime.getSeconds()
								
								approvedDateTime2 = formattedDate;
								
								document.getElementById("row1_result2").innerHTML = "Approved By: " + approvingEngineer + "<br /> Date: " + approvedDateTime2 + " <br /> ";
							}
							
                            $("#detectedStatus").text("Hi " + strArr[0] + ", please perform the following hand gesture. " + randPose);
                            showPage(hand_gesture_page);
                            startHandGestureTracking();
							
							
							
                        }

                    }
                }
            } else {
                $("#detectedStatus").text("Person Detected: " + strArr[0]);

            }
            //console.log(detectedPersonArr)
            //console.log(foundPersonArr)


            /* //for detecting 1 face
             if(foundCount == 30)
             {
             var input1;
             var input2;
             var input3;
             if(urlParams.has('input1')){
             input1 = urlParams.get('input1');
             input2 = urlParams.get('input2');
             input3 = urlParams.get('input3');
             }
             console.log(window.location.href)
             window.location.href = "/hand_gesture_recognition?input1=" + input1 + "&input2=" + input2 + "&input3=" + input3 + "&engin=" + strArr[0]
             }
             
             if(urlParams.has('engin')){
             input1 = urlParams.get('input1');
             input2 = urlParams.get('input2');
             input3 = urlParams.get('input3');
             window.location.href = "/hand_gesture_recognition?engin=" + urlParams.get('engin') + "&approv_engin=" + strArr[0] + "&input1=" + input1 + "&input2=" + input2 +
             "&input3=" + input3 
             }*/
        }

      
            console.log(strArr[0])
            foundCount = foundCount + 1
            //alert("detected: " + strArr[0])
            //videoEl.pause()
            $("#detectedStatus").text("Person Detected: " + strArr[0]);

            //console.log("current: " + foundCount)

            // If a person has been detected a certain number of times7
            /*if (foundCount == 10) {
                faceMatcher = null;
                canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
                finalFace = strArr[0];
				
				
                $("#detectedStatus").text("Hi " + strArr[0] + ", please perform the following hand gesture.");
                showPage(hand_gesture_page);
                startHandGestureTracking();
            }*/
        }
    
}

let count = 0
async function updateListOfDetected(str) {

    if (dist != null) {
        if (str in dist) {
            dist[str] = 1
            document.getElementById("item-" + str).style.color = "green";
        } else {
            count++
            dist["unknown"] = count
        }
    }

}


async function prepareList() {
    var list = getClassNames()

    var htmlList = "<ul>";

    for (var item in list) {
        var listItem = list[item]
        dist[listItem] = 0;

        htmlList += "<div id='item-" + listItem + "'> " + listItem + "</div>";
    }

    htmlList += "</ul>";


    document.getElementById("listOfNames").innerHTML = htmlList;
    return dist;
}

async function run() {
    // load face detection model
    await changeFaceDetector(selectedFaceDetector)
    changeInputSize(128)

    await faceapi.loadFaceLandmarkModel('/')
    await faceapi.loadFaceRecognitionModel('/')

    faceMatcher = await createBbtFaceMatcher(1)
    prepareList()
    const stream = await navigator.mediaDevices.getUserMedia({
        video: {}
    })

    const videoEl = $('#inputVideo').get(0)
    videoEl.srcObject = stream
}

$(document).ready(function () {
    renderNavBar('#navbar', 'webcam_face_detection')
    initFaceDetectionControls()
    run()
})
