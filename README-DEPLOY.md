# Deployment Guide for Grades Tracker

This guide covers how to deploy Grades Tracker to Railway and set up the required environment variables.

## Prerequisites

1. [Railway](https://railway.app) account
2. [Appwrite](https://appwrite.io) account with a project set up
3. GitHub repository with the Grades Tracker code

## Setting up Appwrite

1. Create an Appwrite account at [appwrite.io](https://appwrite.io)
2. Create a new project
3. Note the Project ID from the project settings
4. Create a database with the following collections:
   - Users collection
   - Subjects collection
   - Grades collection
   - Pomodoro collection
5. Note the Database ID and Collection IDs

## Environment Variables

The following environment variables are required for the application to work properly:
