// const video = document.getElementById("video")

// Promise.all([
//   faceapi.nets.tinyFaceDetector.loadFromUri("/models"),
//   faceapi.nets.faceLandmark68Net.loadFromUri("/models"),
//   faceapi.nets.faceRecognitionNet.loadFromUri("/models"),
//   faceapi.nets.faceExpressionNet.loadFromUri("/models"),
// ]).then(startVideo)

// function startVideo() {
//   navigator.getUserMedia(
//     { video: {} },
//     stream => (video.srcObject = stream),
//     error => console.log(error)
//   )
// }

// video.addEventListener("play", () => {
//   const canvas = faceapi.createCanvasFromMedia(video)
//   document.body.append(canvas)
//   const displaySize = { width: video.width, height: video.height }
//   faceapi.matchDimensions(canvas, displaySize)
//   setInterval(async () => {
//     const detection = await faceapi
//       .detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
//       .withFaceLandmarks()
//       .withFaceExpressions()
//     console.log(detection)
//     const resizeddetection = faceapi.resizeResults(detection, displaySize)
//     canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height)
//     faceapi.draw.drawdetection(canvas, resizeddetection)
//     faceapi.draw.drawFaceLandmarks(canvas, resizeddetection)
//     faceapi.draw.drawFaceExpressions(canvas, resizeddetection)
//   }, 100)
// })

const imageUpload = document.getElementById("imageUpload")

Promise.all([
  faceapi.nets.faceRecognitionNet.loadFromUri("/models"),
  faceapi.nets.faceLandmark68Net.loadFromUri("/models"),
  faceapi.nets.ssdMobilenetv1.loadFromUri("/models"),
]).then(start)

async function start() {
  const container = document.createElement("div")
  container.style.position = "relative"
  document.body.append(container)
  const labledFaceDescriptors = await loadLabledImages()
  const faceMatcher = new faceapi.FaceMatcher(labledFaceDescriptors, 0.6)
  imageUpload.addEventListener("change", async () => {
    const image = await faceapi.bufferToImage(imageUpload.files[0])
    container.append(image)
    const canvas = faceapi.createCanvasFromMedia(image)
    container.append(canvas)
    const displaySize = { width: image.width, height: image.height }
    faceapi.matchDimensions(canvas, displaySize)
    const detection = await faceapi
      .detectAllFaces(image)
      .withFaceLandmarks()
      .withFaceDescriptors()
    document.body.append("Number of faces :", detection.length)
    const resizeddetection = faceapi.resizeResults(detection, displaySize)
    const results = resizeddetection.map(d =>
      faceMatcher.findBestMatch(d.descriptor)
    )
    results.forEach((results, i) => {
      const box = resizeddetection[i].detection.box
      const drawBox = new faceapi.draw.DrawBox(box, {
        label: result.toString(),
      })
      drawBox.draw(canvas)
    })
  })
}

function loadLabledImages() {
  const labels = ["Anindya", "HugDiya"]
  return Promise.all(
    labels.map(async label => {
      const descriptions = []
      for (let i = 1; i <= 2; i++) {
        const img = await faceapi.fetchImage(
          `https://github.com/AnindyaAB/FaceDetector/tree/main/labeled_images/${label}/${i}.jpg`
        )

        const detections = await faceapi
          .detectSingleFace(img)
          .withFaceLandmarks()
          .withFaceDescriptors()
        descriptions.push(detections.descriptor)
      }

      return new faceapi.LabledFaceDescriptors(label, descriptions)
    })
  )
}
