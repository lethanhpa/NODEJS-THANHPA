const yup = require("yup");
const express = require("express");
const router = express.Router();
const passport = require("passport");
const ObjectId = require("mongodb").ObjectId;

const {
  validateSchema,
  loginCategorySchema,
} = require("../validation/employee");
const { Category } = require("../models");
const { CONNECTION_STRING } = require("../constants/dbSettings");
const { default: mongoose } = require("mongoose");

mongoose.set("strictQuery", false);
mongoose.connect(CONNECTION_STRING);

// Methods: POST / PATCH / GET / DELETE / PUT

// Get all
router.get("/", async (req, res, next) => {
  /*  res.send(data); */
  try {
    let results = await Category.find();
    res.send(results);
  } catch (err) {
    res.sendStatus(500);
  }
});

//POST TOKEN LOGIN
router.post(
  "/login/:id",
  validateSchema(loginCategorySchema),
  async (req, res, next) => {
    try {
      const { _id } = req.body;
      const category = await Category.findOne({ _id });

      console.log(category);

      if (!category) return res.status(404).send("Not found");

      const token = encodeToken(
        category._id,
        category.name,
        category.description
      );

      res.send({
        token,
        payload: category,
      });
    } catch {
      res.send("error");
    }
  }
);

//GET TOKEN PROFILE
router.get(
  "/profile/:id",
  passport.authenticate("jwt", { session: false }),
  async (req, res, next) => {
    try {
      console.log("");
      const category = await Category.findById(req.user._id);

      if (!category) return res.status(404).send({ message: "Not found" });

      res.status(200).json(category);
    } catch (err) {
      res.sendStatus(500);
    }
  }
);

//POST VALIDATE
router.post("/", async function (req, res, next) {
  // Validate
  const validationSchema = yup.object({
    body: yup.object({
      name: yup.string().required(),
      description: yup.string(),
    }),
  });

  validationSchema
    .validate({ body: req.body }, { abortEarly: false })
    .then(async () => {
      try {
        const data = req.body;
        const newItem = new Category(data);
        let result = await newItem.save();

        return res.send({ ok: true, message: "Created", result });
      } catch (err) {
        return res.status(500).json({ error: err });
      }
    })
    .catch((err) => {
      return res
        .status(400)
        .json({ type: err.name, errors: err.errors, provider: "yup" });
    });
});

//DELETE VALIDATE
router.delete("/:id", function (req, res, next) {
  const validationSchema = yup.object().shape({
    params: yup.object({
      id: yup
        .string()
        .test("Validate ObjectID", "${path} is not valid ObjectID", (value) => {
          return ObjectId.isValid(value);
        }),
    }),
  });

  validationSchema
    .validate({ params: req.params }, { abortEarly: false })
    .then(async () => {
      try {
        const id = req.params.id;

        let found = await Category.findByIdAndDelete(id);

        if (found) {
          return res.send({ ok: true, result: found });
        }

        return res.status(410).send({ ok: false, message: "Object not found" });
      } catch (err) {
        return res.status(500).json({ error: err });
      }
    })
    .catch((err) => {
      return res.status(400).json({
        type: err.name,
        errors: err.errors,
        message: err.message,
        provider: "yup",
      });
    });
});

//PATCH VALIDATE
router.patch("/:id", async function (req, res, next) {
  try {
    const id = req.params.id;
    const patchData = req.body;
    await Category.findByIdAndUpdate(id, patchData);

    res.send({ ok: true, message: "Updated" });
  } catch (error) {
    res.status(500).send({ ok: false, error });
  }
});
module.exports = router;
