const express = require("express");
const router = express.Router();
const yup = require("yup");
const passport = require("passport");

const { Customer } = require("../models/index");
const ObjectId = require("mongodb").ObjectId;
const { CONNECTION_STRING } = require("../constants/dbSettings");
const { default: mongoose } = require("mongoose");

const encodeToken = require("../helpers/customersHelper");

mongoose.set("strictQuery", false);
mongoose.connect(CONNECTION_STRING);

const {
  validateSchema,
  loginCustomerSchema,
} = require("../validation/employee");

//POST TOKEN LOGIN
router.post(
  "/login",
  validateSchema(loginCustomerSchema),
  async (req, res, next) => {
    try {
      const { email } = req.body;
      const customer = await Customer.findOne({ email });

      console.log(customer);

      if (!customer) return res.status(404).send("Not found");

      const token = encodeToken(
        customer._id,
        customer.firstName,
        customer.lastName,
        customer.email
      );
      res.send({
        token,
        payload: customer,
      });
    } catch {
      res.send("error");
    }
  }
);

//GET TOKEN PROFILE
router.get(
  "/profile",
  passport.authenticate("jwt", { session: false }),
  async (req, res, next) => {
    try {
      console.log("sssss");
      const customer = await Customer.findById(req.user._id);

      if (!customer) return res.status(404).send({ message: "Not found" });

      res.status(200).json(customer);
    } catch (err) {
      res.sendStatus(500);
    }
  }
);

router.get("/", async (req, res, next) => {
  /*  res.send(data); */
  try {
    let results = await Customer.find();
    res.send(results);
  } catch (err) {
    res.sendStatus(500);
  }
});

router.get("/:id", async function (req, res, next) {
  // Validate
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
      const id = req.params.id;

      let found = await Customer.findById(id);

      if (found) {
        return res.send({ ok: true, result: found });
      }

      return res.send({ ok: false, message: "Object not found" });
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

router.post("/", async function (req, res, next) {
  // Validate
  const validationSchema = yup.object({
    body: yup.object({
      firstName: yup.string().required(),
      lastName: yup.string(),
      phoneNumber: yup.string(),
      address: yup.string(),
      email: yup.string().email(),
      birthday: yup.date(),
    }),
  });

  validationSchema
    .validate({ body: req.body }, { abortEarly: false })
    .then(async () => {
      try {
        const data = req.body;
        const newItem = new Customer(data);
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

        let found = await Customer.findByIdAndDelete(id);

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

router.patch("/:id", async function (req, res, next) {
  try {
    const id = req.params.id;
    const patchData = req.body;
    await Customer.findByIdAndUpdate(id, patchData);

    res.send({ ok: true, message: "Updated" });
  } catch (error) {
    res.status(500).send({ ok: false, error });
  }
});
module.exports = router;
