# Cyber Sentience Watchtower

A real-time network security monitoring and threat detection system that provides visual insights into network traffic patterns and potential security threats.

## Features

- Real-time network traffic visualization
- Automated threat detection and classification
- Interactive network topology mapping
- Status monitoring for network nodes and connections
- Traffic pattern analysis and anomaly detection

## Technical Stack

- **Frontend**: React.js with D3.js for visualization
- **Backend**: Node.js with Express
- **Database**: Supabase
- **Real-time Updates**: WebSocket and Socket.IO for live data streaming

## Prerequisites

- Node.js (v14 or higher)
- Supabase account and project
- npm or yarn package manager

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/Birxuo/cyber-sentience-watchtower.git
   cd cyber-sentience-watchtower
   ```

2. Install dependencies:
   ```bash
   # Install server dependencies
   cd server
   npm install

   # Install client dependencies
   cd ../
   npm install
   ```

3. Configure environment variables:
   - Create `.env` file in the server directory
   - Add necessary environment variables:
     - `SUPABASE_URL`: Your Supabase project URL
     - `SUPABASE_ANON_KEY`: Your Supabase anonymous key
     - `SUPABASE_SERVICE_ROLE_KEY`: Your Supabase service role key

4. Start the application:
   ```bash
   # Start server (from server directory)
   npm run dev

   # Start client (from root directory)
   npm run dev
   ```

## Usage

1. Access the web interface at `http://localhost:3000`
2. Monitor network topology and traffic patterns
3. View real-time alerts and notifications
4. Analyze network security status and threats

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Author

birxuo

## Acknowledgments

- Thanks to all contributors who have helped shape this project
- Special thanks to the open-source community for the tools and libraries used in this project