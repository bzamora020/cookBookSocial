import { renderIngredients } from "../../../../components/recipe_posts/functions/RecipePostFunctions";
import { cleanup } from "@testing-library/react";

afterEach(() => {
  cleanup();
});

describe("Recipe Post Tests", () => {
  test("Testing that render ingredients function returns jsx ingredients", async () => {
    // We first create mock/fake data to test our function with
    const ingredientsList = ["Test Ingredient 1", "Test Ingredient 2"];

    const result = renderIngredients(ingredientsList);

    // Because this function returns a JSX element, we have to access its attributes this way
    // result is an array which contains 2 jsx elements

    expect(result[0].props.children).toEqual("Test Ingredient 1");
    expect(result[1].props.children).toEqual("Test Ingredient 2");
  });
});
