// prettier-ignore
/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ["./src/**/*.{js,ts,jsx,tsx}"],
    theme: {
        extend: {
            fontFamily: {
                'sans': ["Inter", "sans-serif"],
            },
            colors: {
                'chef-orange': '#f96953',
              },
        },
    },
    plugins: [],
};
