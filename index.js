const mongoose = require("mongoose");
const Song = require("./models/song.model");

mongoose.connect("mongodb://127.0.0.1:27017/beathub_test")
.then(() => console.log(" MongoDB Connected"))
.catch(err => console.log(err));

async function testSongs() {

  try {

    // VALID SONG
    const goodSong = new Song({
      title: "Shape of You",
      artist: "Ed Sheeran",
      genre: "Pop",
      duration: 240
    });

    await goodSong.save();
    console.log(" Hit Single Saved!");

  } catch (err) {
    console.log(err);
  }


  try {

    // INVALID SONG
    const badSong = new Song({
      artist: "AB",
      genre: "Techno-Banjo",
      duration: -20
    });

    await badSong.save();

  } catch (error) {

    if (error.name === "ValidationError") {

      console.log(" VALIDATION FAILED");

      for (let field in error.errors) {
        console.log(error.errors[field].message);
      }

    } else {
      console.log(error);
    }

  }

}

testSongs();