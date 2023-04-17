export const renderIngredients = (ingredientsList) => {
    const arrComponents = []
    for (let i = 0; i < ingredientsList.length; i++) {
        arrComponents.push(<li>{ingredientsList[i]}</li>)
    }
    return arrComponents
}