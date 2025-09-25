import { getRecipeDetails } from "@/lib/spoonacular";
import { fireEvent, render, screen, waitFor } from "@testing-library/react-native";
import Recipe from "../recipe/[id]";

// Mock api module
jest.mock('@/lib/spoonacular', () => ({
    getRecipeDetails: jest.fn(),
}));

// Mock recipe data
const mockRecipeDetail = {
    id: 1,
    title: "Test Recipe",
    image: "test_image.jpg",
    summary: "This is a test recipe summary.",
    instructions: "These are test recipe instructions.",
    extendedIngredients: [
        { id: 101, name: "ingredient1", original: "ingredient1", amount: 1, unit: "cup" },
        { id: 102, name: "ingredient2", original: "ingredient2", amount: 2, unit: "tbsp" },
    ],
};

// Mock expo-router
jest.mock('expo-router', () => ({
  useRouter: () => ({ push: jest.fn(), back: jest.fn(), replace: jest.fn() }),
  useLocalSearchParams: () => ({ id: '1' }),
}));

// Clear mocks before each test
beforeEach(() => {
    jest.clearAllMocks();
});

//test for recipe detail component
test('renders recipe details correctly from API' , async () => {
    (getRecipeDetails as jest.Mock).mockResolvedValue(mockRecipeDetail);
    
    render(<Recipe/>);
    await waitFor(() => {
            expect(getRecipeDetails).toHaveBeenCalled();
        });
    expect(await screen.findByText("Test Recipe")).toBeTruthy();
    //fireEvent to expand sections and check content
    fireEvent.press(await screen.findByText("Summary"));
    expect(await screen.findByText("This is a test recipe summary.")).toBeTruthy();
    fireEvent.press(await screen.findByText("Ingredients"));
    expect(await screen.findByText(/ingredient1/i)).toBeTruthy();
    expect(await screen.findByText(/ingredient2/i)).toBeTruthy();
    fireEvent.press(await screen.findByText("instructions"));
    expect(await screen.findByText(/These are test recipe instructions./)).toBeTruthy();
    
    
    expect(getRecipeDetails).toHaveBeenCalledTimes(1);
    expect(getRecipeDetails).toHaveBeenCalledWith(1); // Assuming recipe ID is 1 for the test

});