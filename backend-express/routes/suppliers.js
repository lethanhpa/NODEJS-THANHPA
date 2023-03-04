var express = require("express");
var router = express.Router();

const { write } = require("../helpers/FileHelper");
let data = require("../data/suppliers.json");

const fileName = "./data/suppliers.json";
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
