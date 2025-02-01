# ICHack25 - Dev Instructions

## Environment stuff
Make sure you add the ```.env``` file (shared on the Discord group) to the top level of the ```aardvark``` repo. So it should be ```/aardvark/.env```.


## Backend Setup

### 1. Create Virtual Environment
In the root directory, create a Python virtual environment:
```bash
python -m venv venv
```

### 2. Activate Virtual Environment

**Windows:**
```bash
venv\Scripts\activate
```

**macOS/Linux:**
```bash
source venv/bin/activate
```

### 3. Install Dependencies
```bash
pip install -r requirements.txt
```

### 4. Run the Application
Navigate to the directory containing `app.py` and run:
```bash
python app.py
```
