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
          body { font-family: 'Arial', sans-serif; margin: 0; padding: 20px; }
          .profile-card { 
            width: 600px; height: 800px; 
            background: linear-gradient(135deg, #1db954 0%, #191414 100%);
            color: white; padding: 30px; border-radius: 20px;
            display: flex; flex-direction: column; box-shadow: 0 10px 30px rgba(0,0,0,0.3);
          }
          .header { text-align: center; margin-bottom: 20px; }
          .username { font-size: 32px; font-weight: bold; margin: 10px 0; }
          .archetype { font-size: 24px; color: #1db954; margin-bottom: 20px; }
          .section { margin-bottom: 20px; }
          .section-title { font-size: 20px; border-bottom: 2px solid #1db954; padding-bottom: 5px; }
          .genres { display: flex; flex-wrap: wrap; gap: 10px; margin-top: 10px; }
          .genre { background: rgba(255,255,255,0.2); padding: 5px 10px; border-radius: 15px; }
          .artists { margin-top: 10px; }
          .artist { margin-bottom: 5px; }
          .personality { margin-top: 10px; font-size: 16px; line-height: 1.5; }
          .emojis { font-size: 40px; text-align: center; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="profile-card">
          <div class="header">
            <div class="username">${profileData.username}</div>
            <div class="archetype">${profileData.archetype}</div>
          </div>
          
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
