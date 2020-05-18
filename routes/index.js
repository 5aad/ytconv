var express = require("express");
var router = express.Router();
const readline = require("readline");
const path = require("path");
const fs = require("fs");
const ytdl = require("ytdl-core");
const ffmpeg = require("fluent-ffmpeg");
const https = require("https");

/* GET home page. */
router.get("/", function (req, res, next) {
  res.render("index", { title: "Express" });
});

router.post("/", async (req, res) => {
  const { ytlink, options } = req.body;
  const lang = "en";

  if (options === "mp4") {
    try {
      let title = "video";
      await ytdl.getBasicInfo(ytlink, (err, info) => {
        if (err) throw err;
        title = info.player_response.videoDetails.title;
        const tracks =
          info.player_response.captions.playerCaptionsTracklistRenderer
            .captionTracks;
        if (tracks && tracks.length) {
          console.log(
            "Found captions for",
            tracks.map((t) => t.name.simpleText).join(", ")
          );
          const track = tracks.find((t) => t.languageCode === lang);
          if (track) {
            console.log("Retrieving captions:", track.name.simpleText);
            console.log("URL", track.baseUrl);
            const output = `${info.title}.${track.languageCode}.xml`;
            console.log("Saving to", output);
            https.get(track.baseUrl, (res) => {
              res.pipe(res, fs.createWriteStream(output), (err) => {
                if (err) console.error("Pipeline failed.", err);
                else console.log("Pipeline succeeded.");
              });
            });
          } else {
            console.log("Could not find captions for", lang);
          }
        } else {
          console.log("No captions found for this video");
        }
      });

      res.header("Content-Disposition", `attachment; filename="${title}.mp4"`);

      ytdl(ytlink, {
        quality: "134",
        filter: (format) => format.container === "mp4",
      }).pipe(res);
    } catch (error) {
      console.error(error);
    }
  } else if (options === "mp3") {
    try {
      let title = "audio";
      await ytdl.getBasicInfo(ytlink, (err, info) => {
        if (err) throw err;
        title = info.player_response.videoDetails.title;
        const tracks =
          info.player_response.captions.playerCaptionsTracklistRenderer
            .captionTracks;
        if (tracks && tracks.length) {
          console.log(
            "Found captions for",
            tracks.map((t) => t.name.simpleText).join(", ")
          );
          const track = tracks.find((t) => t.languageCode === lang);
          if (track) {
            console.log("Retrieving captions:", track.name.simpleText);
            console.log("URL", track.baseUrl);
            const output = `${info.title}.${track.languageCode}.xml`;
            console.log("Saving to", output);
            const file = fs.createWriteStream(output);
            https.get(track.baseUrl, (res) => {
              res.pipe(file);
            });
          } else {
            console.log("Could not find captions for", lang);
          }
        } else {
          console.log("No captions found for this video");
        }
      });

      res.header("Content-Disposition", `attachment; filename="${title}.mp3"`);

      ytdl(ytlink, {
        quality: "highestaudio",
        filter: "audioonly",
      }).pipe(res);
    } catch (error) {
      console.error(error);
    }
  }
});

module.exports = router;
