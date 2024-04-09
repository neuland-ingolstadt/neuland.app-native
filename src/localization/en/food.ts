export default {
    empty: {
        allergens: 'No matching allergens found.',
        noAllergens: 'Allergens not available',
        flags: 'No matching flags found.',
        config: 'No allergens set up yet. Tap to configure your allergies to display not binding information about allergens.',
    },
    preferences: {
        formlist: {
            allergens: 'Allergens',
            flags: 'Flags',
            static: 'Static meals',
            language: 'Food language',
        },
        footer: 'We are not responsible for the correctness and accuracy of the data. Please verify the data at the restaurant before consuming. You can also check the data source of each meal in the detail view.',
        languages: {
            de: 'German',
            en: 'English',
            auto: 'Default',
        },
    },
    price: {
        guests: 'for guests',
        students: 'for students',
        employees: 'for employees',
        unknown: 'not available',
    },
    dashboard: {
        oneMore: 'and one more meal',
        manyMore: 'and {{count}} more meals',
        empty: "Today's menu is empty.",
    },
    categories: {
        soup: 'Soup',
        salad: 'Salad',
        main: 'Food',
        special: 'Special',
    },
    details: {
        footer: 'We are not responsible for the correctness of the data. Please verify the correctness of the data with the respective restaurant before consume anything.',
        translated: 'This meal has been automatically translated. ',
        formlist: {
            prices: {
                title: 'Prices',
                student: 'Student',
                employee: 'Employee',
                guest: 'Guest',
            },
            nutrition: {
                title: 'Nutrition',
                footer: 'Values are per meal and may vary.',
                energy: 'Energy',
                fat: 'Fat',
                saturated: 'Saturated Fat',
                carbs: 'Carbohydrates',
                sugar: 'Sugar',
                fiber: 'Fiber',
                protein: 'Protein',
                salt: 'Salt',
            },
            about: {
                title: 'About',
                category: 'Category',
                source: 'Data source',
            },
            variants: 'Variations',
            allergenFooter:
                'We cannot guarantee the correctness and completeness of the information. ({{allergens}})',
            flagsFooter: 'Tap on a flag to quickly update your preferences.',
            alert: {
                allergen: {
                    title: 'Update allergens',
                    message: {
                        add: 'Do you want to add {{allergen}} to your allergens?',
                        remove: 'Do you want to remove {{allergen}} from your allergens?',
                    },
                },
                flag: {
                    title: 'Update preferences',
                    message: {
                        add: 'Do you want to add {{flag}} to your preferences?',
                        remove: 'Do you want to remove {{flag}} from your preferences?',
                    },
                },
            },
        },
        share: {
            message:
                'Check out "{{meal}}" ({{price}}) at {{location}}.\nhttps://dev.neuland.app/food/{{id}}',
        },
    },
}
