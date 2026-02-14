USE CASES:

1) Student logs into desktop app.
2) Student joins exam session.
3) Desktop connects to backend WebSocket.
4) Desktop sends heartbeat every 5 seconds.
5) Desktop detects blacklisted app → sends violation event.
6) Backend stores violation.
7) Instructor dashboard receives real-time alert.
8) Instructor views violation history.
9) Instructor updates blacklist.
10) Desktop receives updated blacklist.