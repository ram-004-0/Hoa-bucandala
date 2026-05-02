import User from "../Models/User.js"; // Adjust based on your actual Model file name
import bcrypt from "bcryptjs";

export const createGuard = async (req, res) => {
  try {
    const { full_name, email, contact, address } = req.body;

    // 1. Count existing guards to determine the next ID (e.g., if 2 exist, next is 3)
    const guardCount = await User.countDocuments({ role: "GUARD" });
    const nextNumber = guardCount + 1;
    const plainPassword = `guard${nextNumber}`;

    // 2. Hash the generated password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(plainPassword, salt);

    // 3. Create the new Guard user
    const newGuard = new User({
      full_name,
      email,
      contact,
      address,
      password: hashedPassword,
      role: "GUARD", // Ensure this matches your middleware's check
    });

    await newGuard.save();

    // 4. Return the plain password so the Admin can see it once
    res.status(201).json({
      message: "Guard account created successfully",
      guard: {
        id: newGuard._id,
        full_name: newGuard.full_name,
        email: newGuard.email,
      },
      password: plainPassword, // Output: guard1, guard2, etc.
    });
  } catch (error) {
    console.error("Error creating guard:", error);
    res
      .status(500)
      .json({ message: "Server error while creating guard account" });
  }
};
