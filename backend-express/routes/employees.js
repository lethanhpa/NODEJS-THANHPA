var express = require("express");
var router = express.Router();

// let data = [
//   { id: 1, name: "Mary", email: "mary@gmail.com", gender: "female" },
//   { id: 2, name: "Honda", email: "honda@gmail.com", gender: "male" },
//   { id: 3, name: "Suzuki", email: "suzuki@gmail.com", gender: "male" },
//   { id: 4, name: "Yamaha", email: "yamaha@gmail.com", gender: "female" },
// ];
// Methods: POST / PATCH / GET / DELETE / PUT

const { write } = require("../helpers/FileHelper");
let data = require("../data/employees.json");
const fileName = "./data/employees.json";

router.get("/", function (req, res, next) {
  res.send(data);
});

router.post("/", function (req, res, next) {
  const newItem = req.body;
  let max = 0;
  data.forEach((item) => {
    if (max < item.id) {
      max = item.id;
    }
  });

  newItem.id = max + 1;

  data.push(newItem);
  write(fileName, data);
  res.send({ ok: true, message: "Created" });
});

router.delete("/:id", function (req, res, next) {
  const id = req.params.id;
  data = data.filter((x) => x.id != id);
  write(fileName, data);
  res.send({ ok: true, message: "Deleted" });
});

router.patch("/:id", function (req, res, next) {
  const id = req.params.id;
  const patchData = req.body;

  let found = data.find((x) => x.id == id);

  if (found) {
    for (let propertyName in patchData) {
      found[propertyName] = patchData[propertyName];
    }
  }
  write(fileName, data);
  res.send({ ok: true, message: "Updated" });
});

module.exports = router;
