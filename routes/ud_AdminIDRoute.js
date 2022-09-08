const express = require("express");
const router = express.Router();
const IntiriorDesigner = require("../models/ud_AdminIDModel");
const multer = require("multer");
const fs = require("fs");
const { check, validationResult } = require("express-validator");

// Image Uploading................................................................
const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, "./uploads");
    },
    filename: (req, file, cb) => {
      cb(null, file.fieldname + "_" + Date.now() + "_" + file.originalname);
    },
  }),
  limits: {
    fileSize: 10000000, // max file size 20MB
  },
  fileFilter(req, file, cb) {
    if (!file.originalname.match(/\.(png|jpeg|jpg)$/)) {
      return cb(new Error("Only PNG and JPEG Images Allowed."));
    }
    cb(undefined, true); // continue with upload
  },
});

// Get All Intirior Designer Route............................................................
router.get("/allIntiriorDesigner", (req, res) => {
  IntiriorDesigner.find().exec((err, intiriorDesigner) => {
    if (err) {
      res.json({ message: err.message });
    } else {
      res.render("ud_View_Intirior_Designer.ejs", {
        title: "All Intirior Designer",
        intiriorDesigner: intiriorDesigner,
      });
    }
  });
});

router.get("/addIntiriorDesigner", (req, res) => {
  res.render("ud_Add_Intirior_Designer.ejs", {
    title: "Add IntiriorDesigner",
  });
});

// Add Intirior Designer Route..................................................
router.post(
  "/addIntiriorDesigner",
  upload.any(),
  [
    check("Name")
      .matches(/^[a-zA-Z-,]+(\s{0,1}[a-zA-Z-, ])*$/)
      .withMessage("Invalid Name.. Please enter correct name !!"),

    check("Email")
      .matches(
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
      )
      .withMessage("Email is not valid.. Please enter correct email !! !"),

    check("Phone")
      .isMobilePhone()
      .isLength({ min: 10, max: 10 })
      .withMessage(
        "Mobile number is not valid.. Please enter correct mobile number !! !"
      ),
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const alert = errors.array();
      res.render("ud_Add_Intirior_Designer.ejs", {
        alert,
      });
    } else {
      const intiriorDesigner = new IntiriorDesigner({
        Name: req.body.Name,
        Email: req.body.Email,
        Phone: req.body.Phone,
        Qualifications: req.body.Qualifications,
        ProfilePicture:
          req.files[0] && req.files[0].filename ? req.files[0].filename : "",
        FirstProjectPicture:
          req.files[1] && req.files[1].filename ? req.files[1].filename : "",
        FirstProjectDiscrip: req.body.FirstProjectDiscrip,
        SecondProjectPicture:
          req.files[2] && req.files[2].filename ? req.files[2].filename : "",
        SecondProjectDiscrip: req.body.SecondProjectDiscrip,
        ThirdProjectPicture:
          req.files[3] && req.files[3].filename ? req.files[3].filename : "",
        ThirdProjectDiscrip: req.body.ThirdProjectDiscrip,
      });
      intiriorDesigner.save((err) => {
        if (err) {
          res.json({ message: err.message, type: "danger" });
        } else {
          req.session.message = {
            type: "success",
            message: "Intirior Designer Added Successfully",
          };
          res.redirect("/allIntiriorDesigner");
        }
      });
    }
  }
);

// Edit Intirior Designer Router.....................................................
router.get("/editIntiriorDesigner/:id", (req, res) => {
  let id = req.params.id;
  IntiriorDesigner.findById(id, (err, intiriorDesigner) => {
    if (err) {
      res.redirect("/");
    } else {
      if (intiriorDesigner == null) {
        res.redirect("/");
      } else {
        res.render("UD_Edit_Intirior_Designer.ejs", {
          title: "Edit Intirior Designer",
          intiriorDesigner: intiriorDesigner,
        });
      }
    }
  });
});

// Update Intirior Designer route.........................................................
router.post("/updateIntiriorDesigner/:id", upload.any(), (req, res) => {
  let id = req.params.id;
  let new_ProfilePicture = "";
  let new_FirstProjectPicture = "";
  let new_SecondProjectPicture = "";
  let new_ThirdProjectPicture = "";

  // Profile Picture...........
  if (req.files[0]) {
    new_ProfilePicture =
      req.files[0] && req.files[0].filename ? req.files[0].filename : "";
    try {
      fs.unlinkSync(`./uploads/${req.body.old_ProfilePicture}`);
    } catch (err) {
      console.log(err);
    }
  } else {
    new_ProfilePicture = req.body.old_ProfilePicture;
  }

  // First Project Picture
  if (req.files[1]) {
    new_FirstProjectPicture =
      req.files[1] && req.files[1].filename ? req.files[1].filename : "";
    try {
      fs.unlinkSync(`./uploads/${req.body.old_FirstProjectPicture}`);
    } catch (err) {
      console.log(err);
    }
  } else {
    new_FirstProjectPicture = req.body.old_FirstProjectPicture;
  }

  // Second Project Picture
  if (req.files[2]) {
    new_SecondProjectPicture =
      req.files[2] && req.files[2].filename ? req.files[2].filename : "";

    try {
      fs.unlinkSync(`./uploads/${req.body.old_SecondProjectPicture}`);
    } catch (err) {
      console.log(err);
    }
  } else {
    new_SecondProjectPicture = req.body.old_SecondProjectPicture;
  }

  // Third Project Picture
  if (req.files[3]) {
    new_ThirdProjectPicture =
      req.files[3] && req.files[3].filename ? req.files[3].filename : "";

    try {
      fs.unlinkSync(`./uploads/${req.body.old_ThirdProjectPicture}`);
    } catch (err) {
      console.log(err);
    }
  } else {
    new_ThirdProjectPicture = req.body.old_ThirdProjectPicture;
  }

  IntiriorDesigner.findByIdAndUpdate(
    id,
    {
      Name: req.body.Name,
      Email: req.body.Email,
      Phone: req.body.Phone,
      Qualifications: req.body.Qualifications,
      ProfilePicture: new_ProfilePicture,
      FirstProjectPicture: new_FirstProjectPicture,
      FirstProjectDiscrip: req.body.FirstProjectDiscrip,
      SecondProjectPicture: new_SecondProjectPicture,
      SecondProjectDiscrip: req.body.SecondProjectDiscrip,
      ThirdProjectPicture: new_ThirdProjectPicture,
      ThirdProjectDiscrip: req.body.ThirdProjectDiscrip,
    },
    (err, result) => {
      if (err) {
        res.json({ message: err.message, type: "danger" });
      } else {
        req.session.message = {
          type: "success",
          message: "IntiriorDesigner Updated Successfully",
        };
        res.redirect("/allIntiriorDesigner");
      }
    }
  );
});

// Delete Intirior Designer Route.........................................................
router.get("/deleteIntiriorDesigner/:id", (req, res) => {
  let id = req.params.id;
  IntiriorDesigner.findByIdAndRemove(id, (err, result) => {
    if (
      result.ProfilePicture != '' ||
      result.FirstProjectPicture != '' ||
      result.SecondProjectPicture != '' ||
      result.ThirdProjectPicture != ''
    ) {
      try {
        fs.unlinkSync(`./uploads/${result.ProfilePicture}`);
         fs.unlinkSync(`./uploads/${result.FirstProjectPicture}`);
         fs.unlinkSync(`./uploads/${result.SecondProjectPicture}`);
         fs.unlinkSync(`./uploads/${result.ThirdProjectPicture}`);
      } catch (err) {
        console.log(err);
      }
    }


    // if (result.FirstProjectPicture != "") {
    //   try {
    //     fs.unlinkSync(`./uploads/${result.FirstProjectPicture}`);
    //   } catch (err) {
    //     console.log(err);
    //   }
    // }
    // if (result.SecondProjectPicture != "") {
    //   try {
    //     fs.unlinkSync(`./uploads/${result.SecondProjectPicture}`);
    //   } catch (err) {
    //     console.log(err);
    //   }
    // }
    // if (result.ThirdProjectPicture != "") {
    //   try {
    //     fs.unlinkSync(`./uploads/${result.ThirdProjectPicture}`);
    //   } catch (err) {
    //     console.log(err);
    //   }
    // }


    if (err) {
      res.json({ message: err.message });
    } else {
      req.session.message = {
        type: "info",
        message: "IntiriorDesigner Deleted Successfully",
      };
      res.redirect("/allIntiriorDesigner");
    }
  });
});

// Get all_Intirior_Designer_Project.......................
router.get("/allIntiriorDesignerProject/:id", (req, res) => {
  let id = req.params.id;
  IntiriorDesigner.findById(id, (err, intiriorDesigner) => {
    if (err) {
      res.json({ message: err.message });
    } else {
      res.render("ud_all_Intirior_Designer_Project.ejs", {
        title: "Get Specific Projects",
        intiriorDesigner: intiriorDesigner,
      });
    }
  });
});


// Home Page button click event
router.get("/", (req, res) => {
  res.render("AdminHomePage", {
    title: "Admin Home Page",
  });
});

//search function............................................
router.get("/searchIntiriorDesigner", (req, res) => {
  try {
    IntiriorDesigner.find(
      {
        $or: [
          { Name: { $regex: req.query.IntiriorDesignersearch } },
          { Phone: { $regex: req.query.IntiriorDesignersearch } },
        ],
      },
      (err, intiriorDesigner) => {
        if (err) {
          console.log(err);
        } else {
          res.render("ud_View_Intirior_Designer.ejs", {
            title: "All Garden Designers",
            intiriorDesigner: intiriorDesigner,
          });
        }
      }
    );
  } catch (error) {
    console.log(error);
  }
});

module.exports = router;
