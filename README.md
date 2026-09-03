# Lunar Vision

Build a professional scientific web application called "LunaMatch".

Project title:

LunaMatch — Multi-Modal Lunar Image Correspondence & Registration

Purpose:

LunaMatch is a prototype for the SIH problem "Multi-modal, Sun angle and scale invariant image correspondence using Chandrayaan-2 optical images."

The application should demonstrate a workflow where a user provides:

1. A source lunar image from Chandrayaan-2 (OHRC / TMC / IIRS)

2. A reference lunar image from another lunar imaging source such as LRO NAC or SELENE

The system should demonstrate automatic image correspondence and registration.

IMPORTANT:

This is a prototype/demo UI. Do not claim that the application is already performing advanced deep-learning-based lunar registration unless a real backend is connected.

Design:

- Professional aerospace/scientific appearance

- Dark space-inspired interface

- Clean modern dashboard

- Avoid excessive animations

- Make it look like a serious ISRO/NASA-style research tool rather than a generic AI dashboard

- Fully responsive

Main navigation:

- Dashboard

- Image Registration

- Results

- About

Dashboard:

Show:

- Project name: LunaMatch

- Subtitle: Multi-Modal Lunar Image Correspondence & Registration

- Short explanation of the problem

- Three challenge cards:

  1. Illumination Variation

  2. Viewpoint Variation

  3. Scale Variation

- Workflow:

  Input Images → Preprocessing → Feature Detection → Correspondence Matching → Geometric Verification → Registration → Evaluation

Image Registration page:

Create two large upload panels side by side.

Left:

"Source Image"

"Chandrayaan-2"

Supported sensors:

OHRC / TMC / IIRS

Right:

"Reference Image"

"Lunar Reference"

Examples:

LRO NAC / SELENE

Allow image upload through drag-and-drop and file selection.

After images are selected:

- Display image previews

- Show filename

- Show image dimensions

- Show sensor/source labels

Add a large button:

"REGISTER IMAGES"

When clicked, show a processing animation with these stages:

1. Loading images

2. Preprocessing

3. Detecting features

4. Finding correspondences

5. Removing outliers

6. Estimating geometric transformation

7. Generating registered image

8. Calculating quality metrics

Then display the Results page.

Results page:

Create four metric cards:

- Inlier Matches

- Inlier Ratio

- Registration RMSE

- Spatial Coverage

Use realistic demo values initially, but clearly label them as:

"Prototype Result"

Example:

247 Inlier Matches

91.4% Inlier Ratio

0.82 px RMSE

87% Spatial Coverage

Create a section:

"Feature Correspondences"

Display the source and reference images side by side with visually represented matching points and correspondence lines.

Create another section:

"Registered Output"

Show:

- Reference Image

- Registered Source Image

- Overlay comparison

Add an opacity slider to demonstrate image overlay.

Create a section:

"Match Distribution"

Show a visualization indicating that correspondence points are distributed across different regions of the image rather than concentrated in one area.

Create a section:

"Registration Pipeline"

Display:

Source Image

↓

Preprocessing

↓

Feature Detection

↓

Feature Matching

↓

RANSAC Outlier Removal

↓

Geometric Transformation

↓

Registered Image

About page:

Explain:

Problem:

Images of the Moon captured using different sensors, viewing geometries, sun angles and spatial resolutions are difficult to match automatically.

Proposed solution:

LunaMatch identifies corresponding physical locations between multi-modal lunar images and geometrically aligns them.

Current prototype:

The prototype demonstrates the complete registration workflow and evaluation interface.

Planned technical implementation:

- Python

- OpenCV

- SIFT / feature-based baseline

- RANSAC

- Homography / appropriate geometric transformation

- FastAPI backend

- React frontend

- NumPy

- PyTorch for future learned correspondence models

Future enhancements:

- Illumination-invariant feature extraction

- Scale-invariant correspondence

- Deep-learning-based multimodal matching

- Sub-pixel correspondence refinement

- Spatially uniform correspondence selection

- Support for OHRC, TMC, IIRS, LRO NAC and SELENE imagery

Important UI requirements:

- Include loading states

- Include error messages for unsupported files

- Include reset button

- Include "Download Results" button

- Use reusable components

- Keep the interface polished and presentation-ready

- Make the application functional on the frontend

- Use realistic demo data when no backend is connected

- Clearly distinguish demo/prototype metrics from actual computed metrics

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/e1af0cb7-ca62-43de-8479-3f316f705647).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
