import React from "react";
import GenerateRecipes from "../(tabs)/generateRecipes";

test('renders GenerateRecipes component without crashing', ()=>{
    render(<GenerateRecipes/>);
    expect(screen.getByTestId('loading-indicator')).toBeTruthy();
})