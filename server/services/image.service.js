const puppeteer = require("puppeteer");
const supabase = require("../config/supabase.config");

const generateProfileImage = async (profileData) => {
    let browser;
    try {
        // Generate HTML for the profile card
        const html = `
<!DOCTYPE html>
<html>
<head>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700&display=swap');
    
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: 'Montserrat', sans-serif;
      background-color: #121212;
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
    }
    
    .profile-card {
      width: 600px;
      height: 800px;
      background: linear-gradient(135deg, #121212 0%, #0a0a0a 100%);
      color: white;
      border-radius: 24px;
      overflow: hidden;
      position: relative;
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4);
    }
    
    .card-background {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: radial-gradient(circle at top right, rgba(29, 185, 84, 0.3) 0%, transparent 60%);
      z-index: 1;
    }
    
    .card-content {
      position: relative;
      z-index: 2;
      padding: 40px;
      height: 100%;
      display: flex;
      flex-direction: column;
    }
    
    .logo {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 30px;
    }
    
    .logo-icon {
      width: 24px;
      height: 24px;
      background-color: #1db954;
      border-radius: 50%;
      position: relative;
    }
    
    .logo-icon::before,
    .logo-icon::after {
      content: '';
      position: absolute;
      background-color: white;
      border-radius: 2px;
    }
    
    .logo-icon::before {
      width: 8px;
      height: 2px;
      top: 11px;
      left: 8px;
    }
    
    .logo-icon::after {
      width: 2px;
      height: 8px;
      top: 8px;
      left: 11px;
    }
    
    .logo-text {
      font-size: 14px;
      font-weight: 600;
      letter-spacing: 1px;
    }
    
    .header {
      text-align: center;
      margin-bottom: 30px;
      position: relative;
    }
    
    .header::after {
      content: '';
      position: absolute;
      bottom: -15px;
      left: 50%;
      transform: translateX(-50%);
      width: 60px;
      height: 3px;
      background-color: #1db954;
      border-radius: 3px;
    }
    
    .username {
      font-size: 36px;
      font-weight: 700;
      margin-bottom: 10px;
      background: linear-gradient(90deg, #ffffff, #1db954);
      -webkit-background-clip: text;
      background-clip: text;
      -webkit-text-fill-color: transparent;
      text-shadow: 0 2px 10px rgba(29, 185, 84, 0.2);
    }
    
    .archetype {
      font-size: 24px;
      font-weight: 600;
      color: #1db954;
      margin-bottom: 5px;
    }
    
    .sections-container {
      flex: 1;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }
    
    .section {
      margin-bottom: 25px;
    }
    
    .section-title {
      font-size: 18px;
      font-weight: 600;
      margin-bottom: 12px;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    
    .section-title::before {
      content: '';
      display: block;
      width: 18px;
      height: 3px;
      background-color: #1db954;
      border-radius: 3px;
    }
    
    .genres {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }
    
    .genre {
      background: rgba(29, 185, 84, 0.15);
      border: 1px solid rgba(29, 185, 84, 0.3);
      padding: 6px 12px;
      border-radius: 20px;
      font-size: 14px;
      font-weight: 500;
      color: #1db954;
      transition: all 0.3s ease;
    }
    
    .genre:hover {
      background: rgba(29, 185, 84, 0.25);
      transform: translateY(-2px);
    }
    
    .artists {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 8px;
    }
    
    .artist {
      font-size: 14px;
      padding: 6px 0;
      position: relative;
      padding-left: 16px;
    }
    
    .artist::before {
      content: '•';
      color: #1db954;
      position: absolute;
      left: 0;
      font-size: 18px;
      line-height: 14px;
    }
    
    .personality {
      font-size: 15px;
      line-height: 1.6;
      color: rgba(255, 255, 255, 0.8);
      padding: 15px;
      background: rgba(255, 255, 255, 0.05);
      border-radius: 12px;
      border-left: 3px solid #1db954;
    }
    
    .emojis {
      font-size: 32px;
      text-align: center;
      margin: 20px 0;
      letter-spacing: 8px;
    }
    
    .footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: auto;
      padding-top: 20px;
      border-top: 1px solid rgba(255, 255, 255, 0.1);
    }
    
    .qr-code {
      width: 60px;
      height: 60px;
      background-color: white;
      border-radius: 8px;
      display: flex;
      justify-content: center;
      align-items: center;
      font-size: 8px;
      color: #121212;
      text-align: center;
    }
    
    .footer-text {
      font-size: 12px;
      color: rgba(255, 255, 255, 0.6);
    }
    
    .sound-waves {
      position: absolute;
      bottom: 20px;
      right: 20px;
      display: flex;
      align-items: flex-end;
      height: 30px;
      gap: 3px;
    }
    
    .wave {
      width: 3px;
      background-color: #1db954;
      border-radius: 3px;
      opacity: 0.7;
    }
    
    .wave:nth-child(1) { height: 15px; }
    .wave:nth-child(2) { height: 20px; }
    .wave:nth-child(3) { height: 30px; }
    .wave:nth-child(4) { height: 25px; }
    .wave:nth-child(5) { height: 15px; }
    
    .circles {
      position: absolute;
      top: 20px;
      right: 20px;
      width: 100px;
      height: 100px;
      z-index: 1;
    }
    
    .circle {
      position: absolute;
      border-radius: 50%;
      border: 1px solid rgba(29, 185, 84, 0.3);
    }
    
    .circle:nth-child(1) {
      width: 100px;
      height: 100px;
      top: 0;
      left: 0;
    }
    
    .circle:nth-child(2) {
      width: 70px;
      height: 70px;
      top: 15px;
      left: 15px;
    }
    
    .circle:nth-child(3) {
      width: 40px;
      height: 40px;
      top: 30px;
      left: 30px;
      background-color: rgba(29, 185, 84, 0.1);
    }
  </style>
</head>
<body>
  <div class="profile-card">
    <div class="card-background"></div>
    <div class="circles">
      <div class="circle"></div>
      <div class="circle"></div>
      <div class="circle"></div>
    </div>
    <div class="card-content">
      <div class="logo">
        <div class="logo-icon"></div>
        <div class="logo-text">SOUNDSOULS</div>
      </div>
      
      <div class="header">
        <div class="username">${profileData.username}</div>
        <div class="archetype">${profileData.archetype}</div>
      </div>
      
      <div class="sections-container">
        <div class="section">
          <div class="section-title">Top Genres</div>
          <div class="genres">
            ${profileData.topGenres
                .map((genre) => `<div class="genre">${genre}</div>`)
                .join("")}
          </div>
        </div>
        
        <div class="section">
          <div class="section-title">Top Artists</div>
          <div class="artists">
            ${profileData.topArtists
                .map((artist) => `<div class="artist">${artist}</div>`)
                .join("")}
          </div>
        </div>
        
        <div class="section">
          <div class="section-title">Music Personality</div>
          <div class="personality">${profileData.personality}</div>
        </div>
        
        <div class="emojis">${profileData.emojis}</div>
      </div>
      
      <div class="footer">
        <div class="qr-code">Scan to view my full profile</div>
        <div class="footer-text">soundsouls.app</div>
        <div class="sound-waves">
          <div class="wave"></div>
          <div class="wave"></div>
          <div class="wave"></div>
          <div class="wave"></div>
          <div class="wave"></div>
        </div>
      </div>
    </div>
  </div>
</body>
</html>
    `;

        // Launch Puppeteer and generate image
        browser = await puppeteer.launch({ headless: "new" });
        const page = await browser.newPage();
        await page.setContent(html);
        await page.setViewport({ width: 600, height: 800 });

        const imageBuffer = await page.screenshot({
            type: "png",
            fullPage: true,
            omitBackground: true,
        });

        // Upload to Supabase Storage
        const fileName = `profiles/${profileData.username}-${Date.now()}.png`;
        const { data, error } = await supabase.storage
            .from("profile-images")
            .upload(fileName, imageBuffer, {
                contentType: "image/png",
                upsert: true,
            });

        if (error) throw error;

        // Get public URL
        const {
            data: { publicUrl },
        } = supabase.storage.from("profile-images").getPublicUrl(fileName);

        return publicUrl;
    } catch (error) {
        console.error("Error generating profile image:", error);
        throw new Error("Failed to generate profile image");
    } finally {
        if (browser) await browser.close();
    }
};

module.exports = { generateProfileImage };
