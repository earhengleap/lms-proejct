export const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
    }).format(price)
}



export const convertUSDToKHR = (priceUSD: number, conversionRate: number = 4000) => {
    const priceKHR = priceUSD * conversionRate;
    return new Intl.NumberFormat("km-KH", {
        style: "currency",
        currency: "KHR"
    }).format(priceKHR);
}

