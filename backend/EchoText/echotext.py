import cv2
import enchant
import numpy as np
import pytesseract
import pyttsx3
from textblob import TextBlob
from test import check_for_errors


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

def preprocess_for_ocr(image_path, debug=False):
    """
    Read an image file and return a sharpened RGB Image for OCR.
    Steps:
        1. Load image from disk.
        2. Convert image to grayscale and apply canny edge detection.
        3. Denoise, enhance contrast, and perform adaptive thresholding.
        4. Apply morphology and sharpening.
        5. Convert BGR to RGB for Tesseract

    :param image_path: Path to the input image file.
    :param debug: If True, display each intermediate frame.

    :return: A numpy array in RGB color, for OCR.

    :raises: ValueError: If the image cannot be read from `image_path`.
    """
    #Read image
    img = cv2.imread(image_path)
    if img is None:
        raise ValueError(f"Could not read image: {image_path}")

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

# Get the resulting image after preprocessing
result = preprocess_for_ocr('Images/ColorText.png')

# Get the best text result after extracting text with tesseract
finalText = extract_text_from_image(result)

ocr_text = finalText[0]

#Optional Idea: Use of Textblob for natural language processing
print(ocr_text)
#Optional Idea #2: Use of pyenchant to help with spell checking
"""
#Use of pyenchant library to spell check each word in the text
d = enchant.Dict("en_US")
words = pytesseract.image_to_string(imgRGB).split()
valid = []
for w in words:
    if d.check(w):
        valid.append(w)
    else:
        suggestions = d.suggest(w)
        valid.append(suggestions[0] if suggestions else w)
print("Validated text:", " ".join(valid))
"""

"""
correct_sentences = correct_text.correct()
print("--------Correct Text-------")
print(correct_sentences)
"""



#Function to speak the given text input
def play_text(t):
    engine = pyttsx3.init()
    engine.setProperty('rate', 150) #set the rate default is 200
    engine.setProperty('volume', 0.8)
    engine.say(t)
    engine.runAndWait()

play_text(ocr_text)

