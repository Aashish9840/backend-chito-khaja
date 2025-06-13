const orderModel = require("../models/orderModel");
const userModel = require("../models/userModel");
const fs = require("fs");
const { PDFDocument, StandardFonts } = require("pdf-lib");
const path = require("path");

const pathDir = path.join(__dirname, "../orderPDFFiles");

const createOrUpdatePDF = async (userId, orderData) => {
  const filePath = path.join(pathDir, `${userId}.pdf`);
  let pdfDoc;
  if (fs.existsSync(filePath)) {
    const existDocs = fs.readFileSync(filePath);
    pdfDoc = await PDFDocument.load(existDocs);
  } else {
    pdfDoc = await PDFDocument.create();
  }

  const page = pdfDoc.addPage([600, 500]);
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  let y = 480;
  const lineHeight = 20;

  const drawText = (text, x, y, size = 12) => {
    page.drawText(text, { x, y, size, font });
  };

  const drawLine = (x1, y1, x2, y2) => {
    page.drawLine({
      start: { x: x1, y: y1 },
      end: { x: x2, y: y2 },
      thickness: 1,
    });
  };

  // Header
  drawText(`Order Details`, 220, y);
  y -= lineHeight * 2;

  drawText(`Order ID: ${orderData._id}`, 50, y);
  y -= lineHeight;
  drawText(`Name: ${orderData.firstName} ${orderData.lastName}`, 50, y);
  y -= lineHeight;
  drawText(`Email: ${orderData.email}`, 50, y);
  y -= lineHeight;
  drawText(
    `Address: ${orderData.streetAddress}, ${orderData.city}, ${orderData.country}`,
    50,
    y
  );
  y -= lineHeight;
  drawText(`Contact: ${orderData.contact}`, 50, y);
  y -= lineHeight;
  drawText(`Date: ${new Date().toLocaleString()}`, 50, y);
  y -= lineHeight * 2;

  // Table headers
  const tableX = 50;
  const colWidths = [30, 200, 80, 80]; // S.No, Item, Quantity, Price
  const headers = ["#", "Item", "Quantity", "Price"];
  let x = tableX;

  headers.forEach((header, i) => {
    drawText(header, x + 2, y);
    drawLine(x, y - 2, x, y - lineHeight); // vertical lines
    x += colWidths[i];
  });
  drawLine(x, y - 2, x, y - lineHeight); // last vertical line
  drawLine(tableX, y - 2, x, y - 2); // top border
  y -= lineHeight;
  drawLine(tableX, y, x, y); // bottom border of header row

  // Table rows
  orderData.foodItems.forEach((item, index) => {
    x = tableX;
    const values = [
      (index + 1).toString(),
      item.name,
      item.quantity.toString(),
      `$${item.prize}`,
    ];

    values.forEach((val, i) => {
      drawText(val, x + 2, y);
      drawLine(x, y - 2, x, y - lineHeight); // vertical
      x += colWidths[i];
    });

    drawLine(x, y - 2, x, y - lineHeight);
    drawLine(tableX, y - 2, x, y - 2); // top border
    y -= lineHeight;
    drawLine(tableX, y, x, y); // bottom border
  });

  // Total amount
  y -= lineHeight;
  drawText(`Total Amount: $${orderData.amount}`, 50, y);

  const pdfBytes = await pdfDoc.save();
  fs.writeFileSync(filePath, pdfBytes);

  return `${userId}.pdf`;
};

exports.placeOrder = async (req, res) => {
  try {
    const {
      userId,
      foodItems,
      firstName,
      lastName,
      contact,
      streetAddress,
      country,
      email,
      city,
    } = req.body;

    if (
      !foodItems ||
      !streetAddress ||
      !userId ||
      !contact ||
      !firstName ||
      !lastName ||
      !country ||
      !email ||
      !city
    ) {
      return res
        .status(400)
        .json({ message: "All the order details are required" });
    }

    let amount = 0;
    foodItems.forEach((element) => {
      amount += Number(element.prize) * Number(element.quantity);
    });
    const order = new orderModel({
      userId: userId,
      firstName,
      lastName,
      contact,
      foodItems,
      amount,
      streetAddress,
      city,
      email,
      country,
    });
    const savedOrder = await order.save();
    const fileName = await createOrUpdatePDF(userId, savedOrder);

    savedOrder.pdfFileName = fileName;
    await savedOrder.save();

    res.status(200).json({
      message: "Order placed successfully",
    });
    return res.status(200).json({
      message: "Order is placed Successfully",
      orderId: savedOrder._id,
    });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

exports.userOrder = async (req, res) => {
  try {
    const { userId } = req.body;

    const user = await userModel.findById(userId);

    if (!user) {
      return res.status(400).json({ message: "No user exists" });
    }

    const data = await orderModel.aggregate([
      { $match: { userId: userId } },
      {
        $facet: {
          allData: [{ $sort: { date: -1 } }],
          latestPdf: [
            { $sort: { date: -1 } },
            { $limit: 1 },
            { $project: { pdfFile: "$pdfFileName", _id: 0 } },
          ],
        },
      },
    ]);

    return res.status(200).json({ success: true, data: data });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

// all order list for admin regarding order

exports.getOrder = async (req, res) => {
  try {
    const data = await orderModel.find({});
    return res.status(200).json({ success: true, data: data });
  } catch (error) {
    return res.status(400).json({ message: message.error });
  }
};

// update Status of order

exports.updateStatus = async (req, res) => {
  try {
    const { orderId, status } = req.body;
    if (!orderId || !status) {
      return res.status(400).json({ message: "Order ID and Status required" });
    }
    await orderModel.findByIdAndUpdate(orderId, { status: status });
    return res
      .status(200)
      .json({ success: true, message: "Order Status is updated" });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

exports.deleteOrder = async (req, res) => {
  try {
    const { id, password } = req.body;
    if (!id || !password) {
      return res
        .status(400)
        .json({ message: "Order Id and password is required" });
    }
    const order = await orderModel.findById(id);
    if (!order) {
      return res.status(400).json({ message: "Order with such id not found" });
    }
    await orderModel.findByIdAndDelete(id);
    return res
      .status(200)
      .json({ message: "User Order is deleted Successfully" });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};
// order reports
exports.orderReport = async (req, res) => {
  try {
    const totalOrder = await orderModel.countDocuments();
    const deliveredOrder = await orderModel.countDocuments({
      status: "delivered",
    });
    const pendingOrder = await orderModel.countDocuments({ status: "pending" });
    const failedOrder = await orderModel.countDocuments({ status: "failed" });

    return res.status(200).json({
      data: [
        {
          Name: "Total Order",
          Total: totalOrder,
        },
        {
          Name: "Pending",
          Total: pendingOrder,
        },
        {
          Name: "Delivered",
          Total: deliveredOrder,
        },
        {
          Name: "Failed",
          Total: failedOrder,
        },
      ],
    });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

// payment update
exports.paymentUpdate = async (req, res) => {
  try {
    const { orderId, status } = req.body;
    if (!orderId || !status) {
      return res.status(400).json({ message: "Order ID and Status required" });
    }
    await orderModel.findByIdAndUpdate(orderId, { payment: status });
    return res
      .status(200)
      .json({ success: true, message: "Order Status is updated" });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};
