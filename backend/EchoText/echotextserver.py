from fastapi import FastAPI, HTTPException, File, UploadFile, Form
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from starlette.status import HTTP_201_CREATED
import cv2
import numpy as np
import pytesseract
import pyttsx3

app = FastAPI()
#Allowed URLS
origins = [
    "http://localhost:4200",
    "http://127.0.0.1:9999",
]
#Middle for Routes
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

"""
Response Object To Return
"""
class ImageFile(BaseModel):
    image_file_id: int = Field(..., description="ID of the processed image")
    content_type: str = Field(..., description="MIME type")
    processed_text: str = Field(..., description="OCR text from the image")
    file_name: str = Field(..., description="Original filename")

all_images: list[ImageFile] = []

#Testing Route
@app.get("/")
def index():
    return {"message": "Hello World!"}

@app.post('/api/process-images', response_model=ImageFile, status_code=HTTP_201_CREATED)
async def create_new_image_file(
    file: UploadFile = File(..., description="The image file to process")):
    # Read raw bytes
    contents = await file.read()
    # Preprocess image into OCR ready image
    try:
        img = preprocess_for_ocr(contents)
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    # Extract text from the image
    best_text, avg_conf, best_config = extract_text_from_image(img)
    # Read text out loud
    #play_text(best_text)
    #Store the new record
    new_id = 0
    if len(all_images) > 0:
        new_id = (all_images[-1].image_file_id + 1)
    else:
        new_id = 1
    record = ImageFile(
        image_file_id=new_id,
        file_name=file.filename,
        content_type=file.content_type,
        processed_text=best_text
    )
    all_images.append(record)

    return record

"""
Prototype of Image to Text, Text To Speech Reader
Provides functions to preprocess an image, extract text using Tesseract OCR, and
plays it back using text-to-speech. Supports configurable PSM modes and optional
debugging in the terminal
"""

"""
--Used Resources To Install Tesseract
    Tesseract Github Repo and Docs
    Must Download Tesseract
    https://github.com/tesseract-ocr/tesseract?tab=readme-ov-file
    https://tesseract-ocr.github.io/tessdoc/Installation.html
"""

#Download and Save Tesseract in a similar download structure/path
pytesseract.pytesseract.tesseract_cmd = 'C:\\Program Files\\Tesseract-OCR\\tesseract.exe'

def preprocess_for_ocr(image_bytes, debug=False):
    """
    Read an image file and return a sharpened RGB Image for OCR.
    Steps:
        1. Load image from disk.
        2. Convert image to grayscale and apply canny edge detection.
        3. Denoise, enhance contrast, and perform adaptive thresholding.
        4. Apply morphology and sharpening.
        5. Convert BGR to RGB for Tesseract

    :param image_bytes: image file as raw bytes.
    :param debug: If True, display each intermediate frame.

    :return: A numpy array in RGB color, for OCR.

    :raises: ValueError: If the bytes of the image cannot be read.
    """
    #Convert raw bytes to OpenCV RGB image
    arr = np.frombuffer(image_bytes, np.uint8)
    img = cv2.imdecode(arr, cv2.IMREAD_COLOR)
    if img is None:
        raise ValueError(f"Could not decode image bytes as a valid image")

    # 1. GreyScale the image
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    #Convert to Canny for edge detection
    canny = cv2.Canny(gray, 100, 100)

    # 2. Noise Reduction to reduce speckles/tiny dots
    denoised = cv2. fastNlMeansDenoising(gray, h=1, templateWindowSize=7, searchWindowSize=21)
    # 3. Create Clahe object for contrast enhancement
    clahe = cv2.createCLAHE(clipLimit=3.0, tileGridSize=(8,8))
    enhanced = clahe.apply(denoised)

    # 4. Adaptive Thresholding to create a clear binary image
    thresh = cv2.adaptiveThreshold(
        enhanced, 255,
        cv2.ADAPTIVE_THRESH_GAUSSIAN_C,
        cv2.THRESH_BINARY,
        blockSize=11,
        C=2
    )

    # 5. Morphological operations to refine shapes in binary image
    kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (1,1))
    #Remove small white noise
    opened = cv2.morphologyEx(thresh, cv2.MORPH_OPEN, kernel)
    #Fill tiny black spots inside text
    dilated = cv2.dilate(opened, kernel, iterations=1)

    # 6. Sharpening Edges
    kernel_sharp = np.array([[-1, -1, -1], [-1, 9, -1], [-1, -1, -1]])
    sharpened = cv2.filter2D(dilated, -1, kernel_sharp)

    if debug:
        steps = [
            ("Original", img),
            ("Grayscale", gray),
            ("Denoised", denoised),
            ("Enhanced", enhanced),
            ("Threshold", thresh),
            ("Morphology", dilated),
            ("Sharpened", sharpened)
        ]
        for name, image in steps:
            cv2.imshow(name, image)
        cv2.waitKey(0)
        cv2.destroyAllWindows()
    #Convert BGR image to RGB before returning for Tesseract
    imgRGB = cv2.cvtColor(sharpened, cv2.COLOR_BGR2RGB)
    return imgRGB

def extract_text_from_image(processed_image):
    """
    Extract The most reliable OCR text from the processed_image by testing page segmentation modes (PSM).
    :param processed_image: A pre-processed image ready for OCR.
    :return:
        A tuple that contains the (text, avg_confidence, config):
        text (str)      - The OCR text from the best configuration.
        avg_confidence (float) - Mean confidence score for detected words (0-100).
        config (str)    - The Tesseract --psm flag that produced the best result.
    """
    #Tell Tesseract how to segment the page layout
    configs = [
        '--psm 6', #A single uniform block of text
        '--psm 4', #A single column of text
        '--psm 3', #Fully Automatic page segmentation
        '--psm 8', #Treat the image as a single word
    ]
    #Iterate over each psm config to compare and obtain the best result
    results = []
    for config in configs:
        try:
            text = pytesseract.image_to_string(processed_image, config=config)
            confidence = pytesseract.image_to_data(processed_image, config=config, output_type=pytesseract.Output.DATAFRAME)
            avg_confidence = confidence[confidence['conf'] > 0]['conf'].mean()
            results.append((text, avg_confidence, config))
        except Exception as e:
            print(f"Config {config} failed: {e}")
    if results:
        best_result = max(results, key=lambda x: x[1] if not np.isnan(x[1]) else 0)
        return best_result[0], best_result[1], best_result[2]
    return "", 0, "none"

def play_text(t):
    """
    Read the text OCR'd text with text to speech
    :param t: text that is already processed with OCR
    :return: None
    """
    engine = pyttsx3.init()
    engine.setProperty('rate', 150) #set the rate default is 200
    engine.setProperty('volume', 0.8)
    engine.say(t)
    engine.runAndWait()



