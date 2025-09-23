import { findRecipesByIngredients } from "@/lib/spoonacular";
import { render, screen, waitFor } from "@testing-library/react-native";
import Recipe from "../recipe/[id]";

jest.mock('@/lib/spoonacular', () => ({
    getRecipeDetails: jest.fn(),
}));

const mockRecipeDetail = {
    id: 1,
    title: "Test Recipe",
    image: "test_image.jpg",
    summary: "This is a test recipe summary.",
    instructions: "These are test recipe instructions.",
    extendedIngredients: [
        { id: 101, name: "ingredient1", amount: 1, unit: "cup" },
        { id: 102, name: "ingredient2", amount: 2, unit: "tbsp" },
    ],
};

beforeEach(() => {
    jest.clearAllMocks();
});

test('renders recipe details correctly from API' , async () => {
    (findRecipesByIngredients as jest.Mock).mockResolvedValue(mockRecipeDetail);
    
    render(<Recipe/>);
    
    expect(await screen.findByText("Test Recipe")).toBeTruthy();
    expect(await screen.findByText("This is a test recipe summary.")).toBeTruthy();
    expect(await screen.findByText("These are test recipe instructions.")).toBeTruthy();
    expect(await screen.findByText("ingredient1")).toBeTruthy();
    expect(await screen.findByText("ingredient2")).toBeTruthy();
    
    expect(findRecipesByIngredients).toHaveBeenCalledTimes(1);
    expect(findRecipesByIngredients).toHaveBeenCalledWith(1); // Assuming recipe ID is 1 for the test

});