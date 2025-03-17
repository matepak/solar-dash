# Solar Activity Dashboard

A modern, React-based web application designed to display real-time data on solar activity, including Kp-index values, solar images, and alerts for auroras and geomagnetic storms.

This dashboard integrates data from NOAA and other space weather APIs to provide users with up-to-date information and customizable notifications.

## Features

- **Real-time Data Display**: View current Kp-index and other solar activity metrics
- **Historical Data Visualization**: Interactive charts for exploring historical solar activity
- **Forecast View**: See predicted solar activity for the coming days
- **Customizable Alerts**: Set up notifications for aurora and geomagnetic storm conditions 
- **User Authentication**: Save your preferences and alert settings
- **Dark/Light Mode**: Choose your preferred viewing experience
- **Responsive Design**: Works on desktop, tablet, and mobile devices
- **Offline Support**: Basic functionality when offline with cached data

## Quick Start

### Prerequisites
- Node.js (version 16 or later)
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/solar-dashboard.git
cd solar-dashboard

# Install dependencies
npm install
# or
yarn install

# Start the development server
npm start
# or
yarn start
```

The application will be available at `http://localhost:3000`.

## Docker Support

```bash
# Build the Docker image
docker build -t solar-dashboard .

# Run the container
docker run -p 3000:80 solar-dashboard
```

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```
REACT_APP_FIREBASE_API_KEY=your_firebase_api_key
REACT_APP_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
REACT_APP_FIREBASE_PROJECT_ID=your_firebase_project_id
REACT_APP_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
REACT_APP_FIREBASE_APP_ID=your_firebase_app_id
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- NOAA Space Weather Prediction Center for their open APIs
- NASA for solar imagery and data
