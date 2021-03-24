export let formFields = [
    {
        name: 'View',
        type:'select',
        value: '4C',    
        label: '🔭 What view is it?',
        id: 'view',
        options: [
            {label: 'Apical FOUR Chamber', value: '4C'},
            {label: 'Apical FIVE Chamber', value: '5C'},
            {label: 'Parasternal Long Axis', value: 'PLSX'},
            {label: 'Parasternal Short Axis BASAL', value: 'PSAXb'},
            {label: 'Parasternal Short Axis MIDDLE', value: 'PSAXm'},
            {label: 'Parasternal Short Axis APICAL', value: 'PSAXa'},
            {label: 'Aortic Valve Short Axis', value: 'AVSX'},
            {label: 'Subcostal Four Chamber', value: 'SC'},
            {label: 'Right Lateral IVC/SV IVC View', value: 'RISV'},
            {label: 'Lung', value: 'Lung'},
            {label: 'Other', value: 'Other'},
        ]
    },
    {
        name: 'Quality',
        type: 'radio',
        value: 0,
        label: "📸 How's the image quality?",
        id: 'quality',
        options: [
            {label: 'View cannot be identified clearly', value: 0},
            {label: 'View can be identified but diagnosis very difficult/impossible', value: 1},
            {label: 'Most aspects can be diagnosed but image can be clearer', value: 2},
            {label: 'All diagnostic features visible and clear', value: 3},
        ]
    },
    {
        name: 'Gain',
        type: 'radio',
        value: 'NaN',
        label: "☀ How's the gain?",
        id: 'gain',
        options: [
            {label: 'Under gained', value: 'Under gained'},
            {label: 'Optimal', value: 'Optimal'},
            {label: 'Overgained', value: 'Overgained'},
        ]
    },
    {
        name: 'Orientation',
        type: 'radio',
        value: 'NaN',
        label: "🧭 Is the orientation correct?",
        id: 'orientation',
        options: [
            {label: 'Yes', value: 'Correct'},
            {label: 'No', value: 'Incorrect'},
        ]
    },
    {
        name: 'Depth',
        type: 'radio',
        value: 'NaN',
        label: '⛏ Is the depth appropriate?',
        id: 'depth',
        options: [
            {label: 'Yes', value: 'Appropriate'},
            {label: 'No', value: 'Inappropriate'},
        ]
    },
    {
        name: 'Focus',
        type: 'radio',
        value: 'NaN',
        label: '🔬 Is the focus appropriate?',
        id: 'focus',
        options: [
            {label: 'Yes', value: 'Appropriate'},
            {label: 'No', value: 'Inappropriate'},
        ]
    },
    {
        name: 'Frequency',
        type: 'radio',
        value: 'NaN',
        label: '🔊 Is the frequecy appropriate?',
        id: 'frequency',
        options: [
            {label: 'Yes', value: 'Appropriate'},
            {label: 'No', value: 'Inappropriate'},
        ]
    },
    {
        name: 'Physiology',
        type: 'radio',
        value: 'NaN',
        label: '🩺 Is the physiology normal?',
        id: 'normal_physiology',
        options: [
            {label: 'Yes', value: 'Normal'},
            {label: 'No', value: 'Abnormal'},
        ]
    },
    {
        name: 'Cardiac Cycles',
        type: 'radio',
        value: 0,
        label: '💓 How many cardiac cycles?',
        id: 'num_cardiac_cycles',
        options: [
            {label: 0, value: 0},
            {label: 1, value: 1},
            {label: 2, value: 2},
            {label: 3, value: 3},
        ]
    },
    {
        name: 'Comments',
        type: 'text-area',
        id: 'comments',
        value: '',
        label: '📝 Any comments?',
        placeholder: 'Please leave any additional comments you have (optional)...'
    },
    {
        name: 'Bookmark',
        type: 'radio',
        value: 'No',
        label: '📑 Bookmark this clip for future reference?',
        options: [
            {label: 'Yes', value: 'Yes'},
            {label: 'No', value: 'No'},
        ]
    }
]
