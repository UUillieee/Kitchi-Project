import { findRecipesByIngredients } from "@/lib/spoonacular";
import { render, screen, waitFor } from '@testing-library/react-native';
import GenerateRecipes from "../(tabs)/generateRecipes";

const mockFn = jest.fn();

jest.mock('@/lib/spoonacular', () => ({
    
    findRecipesByIngredients: jest.fn(),
    
    
}));


jest.mock('@/lib/pantry', () => ({
    getPantryItems: jest.fn().mockResolvedValue([
        { food_name: "apple" },
        { food_name: "banana" },
        { food_name: "carrot" },
    ]),
}));

jest.mock('@/lib/auth', () => ({
    getUserId: jest.fn().mockResolvedValue("test-user-id"),
}));

beforeEach(() => {
    jest.clearAllMocks();
});

test('renders recipe from Api correctly', async()=>{
    
    (findRecipesByIngredients as jest.Mock).mockResolvedValue([
        {
            id: 1,
            title: "Test Recipe",
            image: "test_image.jpg"
        }
        
    ]);
    
    render(<GenerateRecipes/>);
    
    //expect(await screen.getByText(/Today's Recipes/)).toBeTruthy();
    expect(await screen.findByText("Test Recipe")).toBeTruthy();
    expect(findRecipesByIngredients).toHaveBeenCalledTimes(1);
    expect(findRecipesByIngredients).toHaveBeenCalledWith(["apple", "banana", "carrot"], 5);
    
    
    console.log("this is calls: " + (findRecipesByIngredients as jest.Mock).mock.calls);
    const result = await(findRecipesByIngredients as jest.Mock).mock.results[0].value;
    console.log("this is result: ", result);
}
);

test('renders no recipes when API returns empty', async()=>{
    
    (findRecipesByIngredients as jest.Mock).mockResolvedValue([]);
    
    render(<GenerateRecipes/>);

    expect(await screen.findByText("No recipes.")).toBeTruthy();    

     await waitFor(() => {
        expect(findRecipesByIngredients).toHaveBeenCalledTimes(1);
    });
    expect(findRecipesByIngredients).toHaveBeenCalledWith(["apple", "banana", "carrot"], 5);


    console.log("this is calls: " + (findRecipesByIngredients as jest.Mock).mock.calls);
    const result = await(findRecipesByIngredients as jest.Mock).mock.results[0].value;
    console.log("this is result: ", result);
}
);

test('passes correct pantry ingredients to API', async()=>{
    
    (findRecipesByIngredients as jest.Mock).mockResolvedValue([]);
    
    render(<GenerateRecipes/>);

    await waitFor(() => {
        expect(findRecipesByIngredients).toHaveBeenCalled();
    });
    const [calledIngredients, calledCount] = (findRecipesByIngredients as jest.Mock).mock.calls[0];
    expect(calledIngredients).toEqual(["apple", "banana", "carrot"]);
    expect(calledCount).toBe(5);
}
);