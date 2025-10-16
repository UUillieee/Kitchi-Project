# Kitchi


## Introduction


Kitchi is a mobile application built with **Expo (React Native)** and **Supabase** that helps users reduce food waste and save money by managing their pantry, tracking expiry dates, generating recipes, and creating shopping lists based on what ingredients they have (or don’t have). Kitchi uses the help of OpenAI API for image recognition and Spoonacular API for recipe data.

## Table of Contents

  

- [Features](#features)

- [Installation](#installation)

- [API Usage](#api-usage)

- [Team](#team)

- [Contact](#contact)

  

## Features



- **User Authentication** - Allow users to register, log in and manage their accounts. Users can securely access their profiles and save their favourite recipes.

- **Ingredients Input** - Users can input ingredients either by taking pictures with mobile's camera or manually entering them. The app will recognise them and save them to the pantry.

- **Recipe Generation** - Based on the input ingredients, the app will generate a list of possible recipes. Users can view detail instructions for each recipe.

- **Personalised Recipe Recommendation** - The app provides recipe recommendations every week to the user's previous favourite recipes and dietary preferences.

- **Shopping List Integration** - App will generate a shopping list based on the ingredients needed for selected recipes. The list can be exported or shared for grocery shopping.

- **Community** - Users can share their favourite recipes, rate and review other users’ recipes, and participate in a community forum for cooking tips and advice.

### Installation



1. Set up an iOS device with Expo Go.  

   Scan the QR code to download the app from the App Store, or visit the Expo Go page on the [App Store](https://apps.apple.com/us/app/expo-go/id982107779).  

   <img src="Kitchi-app/assets/images/qr.png" alt="QR Code" width="200" height="200" />

2. Download [Node.js](https://nodejs.org/en/download), this is for npm

3. Install Expo-Cli in the terminal `npm install --global expo-cli`.

```bash

    npm install --global expo-cli

```


4. Download [main branch](https://github.com/UUillieee/Kitchi-Project/archive/refs/heads/main.zip)and unzip the folder.


5. Cd into app folder `cd Kitchi-app`.

```bash

   cd Kitchi-app

```
  

6. Run `npm install --legacy-peer-deps` from terminal in downloaded folder to get all the required packages.

  

```bash

   npm install --legacy-peer-deps

```

  

7. Start the Expo development server.

  

```bash

   npx expo start

```

  

8. Scan the terminal QR code.  

   Running the command above, you will see a QR code in your terminal. Scan this QR code to open the app on your device.

## API Usage



To fully use all of the functions, Image recognition and Recipe Generation. Please contact the repository owner William Bindon for access to the Supabase functions for API requests. This will reuire you to setup your own API keys as there is a cost involved with the Open AI API.

## Team



### Developers

  

- Billie-jean Laing - Product Owner

- Shawn Park - Scrum Master

- William Bindon - Repository Owner

- Tanakorn Tinnakorn 

  

## Contact

  

For access to the backend functionalities ( Image Recognition and Recipe Generation ) please contact William Bindon the repository owner at billwindon@icloud.com.

