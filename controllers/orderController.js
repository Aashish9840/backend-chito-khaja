const orderModel = require("../models/orderModel");
const userModel = require("../models/userModel");
const fs = require("fs");
const { PDFDocument, StandardFonts } = require("pdf-lib");
const path = require("path");

const pathDir = path.join(__dirname, "../orderPDFFiles");

const generateOrderPdf = async (userId, orderData) => {
  const filePath = path.join(pathDir, `${userId}.pdf`);
  const pdfDoc = await PDFDocument.create();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const orders = await orderModel.find({ userId }).sort({ date: -1 });

  for (let orderData of orders) {
    const page = pdfDoc.addPage([600, 700]); // taller page to fit more content
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    let y = 660;
    const lineHeight = 20;

    const drawText = (text, x, y, size = 12, isBold = false) => {
      page.drawText(text, {
        x,
        y,
        size,
        font: isBold ? fontBold : font,
      });
    };

    const drawLine = (x1, y1, x2, y2) => {
      page.drawLine({
        start: { x: x1, y: y1 },
        end: { x: x2, y: y2 },
        thickness: 0.5,
      });
    };

    // --- Section: Order Header ---
    drawText(`Order Summary`, 230, y, 14, true);
    y -= lineHeight * 2;

    drawText(`Order ID:`, 50, y, 12, true);
    drawText(`${orderData._id}`, 150, y);
    y -= lineHeight;

    drawText(`Customer:`, 50, y, 12, true);
    drawText(`${orderData.firstName} ${orderData.lastName}`, 150, y);
    y -= lineHeight;

    drawText(`Contact:`, 50, y, 12, true);
    drawText(`${orderData.contact}`, 150, y);
    y -= lineHeight;

    drawText(`Address:`, 50, y, 12, true);
    drawText(`${orderData.streetAddress}`, 150, y);
    y -= lineHeight;

    drawText(`Status:`, 50, y, 12, true);
    drawText(` ${orderData.status}`, 150, y);
    y -= lineHeight;

    drawText(`Payment:`, 50, y, 12, true);
    drawText(` ${orderData.payment}`, 150, y);
    y -= lineHeight;

    drawText(`Country:`, 50, y, 12, true);
    drawText(`${orderData.country}`, 150, y);
    y -= lineHeight;

    drawText(`Email:`, 50, y, 12, true);
    drawText(`${orderData.email}`, 150, y);
    y -= lineHeight;

    drawText(`Date:`, 50, y, 12, true);
    drawText(`${orderData.date.toDateString()}`, 150, y);
    y -= lineHeight * 2;

    // --- Section: Table Header ---
    const tableX = 50;
    const colWidths = [30, 250, 80, 80]; // S.No, Item Name, Qty, Price
    const headers = ["#", "Item", "Quantity", "Price"];
    let x = tableX;

    headers.forEach((header, i) => {
      drawText(header, x + 2, y, 12, true);
      drawLine(x, y - 2, x, y - lineHeight);
      x += colWidths[i];
    });
    drawLine(x, y - 2, x, y - lineHeight);
    drawLine(tableX, y - 2, x, y - 2); // top border
    y -= lineHeight;
    drawLine(tableX, y, x, y); // bottom border

    // --- Section: Table Rows ---
    orderData.foodItems.forEach((item, index) => {
      x = tableX;
      const values = [
        (index + 1).toString(),
        item.name,
        item.quantity.toString(),
        ` Rs. ${item.prize}`,
      ];

      values.forEach((val, i) => {
        drawText(val, x + 2, y);
        drawLine(x, y - 2, x, y - lineHeight); // vertical line
        x += colWidths[i];
      });

      drawLine(x, y - 2, x, y - lineHeight); // last vertical line
      drawLine(tableX, y - 2, x, y - 2); // top border of the row
      y -= lineHeight;
      drawLine(tableX, y, x, y); // bottom border of the row (moved inside loop)
    });

    // --- Section: Total ---
    y -= lineHeight * 2;
    drawText(`Total Amount:`, 350, y, 12, true);
    drawText(`$${orderData.amount}`, 450, y, 12);
  }

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
    const fileName = await generateOrderPdf(userId);

    savedOrder.pdfFileName = fileName;
    await savedOrder.save();

    res.status(200).json({
      message: "Order placed successfully",
    });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

exports.userOrder = async (req, res) => {
  try {
    const { fromDate, toDate } = req.query;
    const startDate = new Date(fromDate);
    const endDate = new Date(toDate);
    endDate.setHours(23, 59, 59, 999);

    const { userId } = req.body;

    const user = await userModel.findById(userId);

    if (!user) {
      return res.status(400).json({ message: "No user exists" });
    }
    let data;

    if (fromDate !== "undefined" && toDate !== "undefined") {
      console.log("hello");
      data = await orderModel.aggregate([
        {
          $match: {
            userId: userId,
            date: {
              $gte: startDate,
              $lte: endDate,
            },
          },
        },
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
    } else {
      data = await orderModel.aggregate([
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
    }
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
    const { userId, orderId, status } = req.body;
    if (!orderId || !status) {
      return res.status(400).json({ message: "Order ID and Status required" });
    }
    await orderModel.findByIdAndUpdate(orderId, { status: status });
    await generateOrderPdf(userId);
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
    const userId = order.userId;

    await orderModel.findByIdAndDelete(id);
    // for creating a new pdf for each order delete
    const deletfilePath = path.join(pathDir, `${userId}.pdf`);
    const orderDetails = await orderModel.find({ userId: userId });
    if (orderDetails.length > 0) {
      await generateOrderPdf(userId);
    } else {
      if (fs.existsSync(deletfilePath)) {
        console.log("delete file");
        fs.unlinkSync(deletfilePath);
      }
    }

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
    const { userId, orderId, status } = req.body;
    if (!orderId || !status) {
      return res.status(400).json({ message: "Order ID and Status required" });
    }
    await orderModel.findByIdAndUpdate(orderId, { payment: status });
    await generateOrderPdf(userId);
    return res
      .status(200)
      .json({ success: true, message: "Order Status is updated" });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};
