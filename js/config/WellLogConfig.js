export const WellLogConfig = {
    logTypes: {
        'None': { min: 0, max: 1, color: 0xffffff, label: 'None' },
        'GR': {
            min: 0,
            max: 150,
            color: 0x00ff00,
            label: 'Gamma Ray',
            fill: {
                enabled: true,
                color: 0xFF7F7F,
                opacity: 0.6,
                direction: 'right'
            }
        },
        'RT': { min: 0.1, max: 1000, color: 0xff0000, label: 'Resistivity', logScale: true },
        'RHOB': { min: 1.95, max: 2.95, color: 0x0000ff, label: 'Density' },
        'NPHI': { min: 0.45, max: -0.15, color: 0xff00ff, label: 'Neutron Porosity' },
        'DT': { min: 140, max: 40, color: 0x00ffff, label: 'Sonic' },
        'SP': { min: -200, max: 50, color: 0xffff00, label: 'SP' },
        'PHIE': { min: 0, max: 0.4, color: 0x00ff88, label: 'Effective Porosity' },
        'VSH': { min: 0, max: 1, color: 0x8b4513, label: 'Shale Volume' },
        'SWE': { min: 0, max: 1, color: 0x4169e1, label: 'Water Saturation' }
    },
    maxLogWidth: 10,
    tubeRadius: 1,
    curveSegments: 6,
    nullValue: -999.25,
    nullOffset: 0
};