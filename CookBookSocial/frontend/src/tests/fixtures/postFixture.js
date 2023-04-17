import { serverTimestamp } from "firebase/firestore";

const postFixture = {
  email: "TestEmail@gmail.com",
  title: "Test Title",
  image: "https://cdn-icons-png.flaticon.com/512/6386/6386976.png",
  description: "Test Description",
  ingredients: ["Test Ingredient 1", "Test Ingredient 2"],
  instructions: ["Test Instructions 1", "Test Instructions 2"],
  createdAt: serverTimestamp(),
};

export default postFixture;
