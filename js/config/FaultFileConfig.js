/**
 * FaultFileConfig.js
 * ===================
 * Configuration for fault CSV files.
 * Centralizes fault file paths for easy maintenance.
 * 
 * In the future, this can be replaced with database queries.
 */

export const FaultFileConfig = {
    basePath: 'CSV_fault/',

    /**
     * Fault files organized by type
     */
    faultsByType: {
        thrustFault: [
            'F1(IL^Thrust Fault).csv',
            'F6(IL^Thrust Fault).csv'
        ],
        
        normalFault: [
            'F2(XL^Normal Fault).csv',
            'F3(XL^Normal Fault).csv',
            'F4(XL^Normal Fault).csv',
            'F5(XL^Normal Fault).csv',
            'F7(XL^Normal Fault).csv',
            'F15(XL^Normal Fault).csv',
            'F22(XL^Normal Fault).csv',
            'F23(XL^Normal Fault).csv',
            'F26(XL^Normal Fault).csv',
            'F27(XL^Normal_Fault).csv',
            'F28(XL^Normal Fault).csv',
            'F30(XL^Normal Fault).csv',
            'F31(XL^Normal Fault).csv',
            'F32(XL^Normal Fault).csv',
            'F33(XL^Normal Fault).csv',
            'F35(XL^Normal Fault).csv',
            'F37(XL^Normal Fault).csv',
            'F38(XL^Normal Fault).csv',
            'F39(XL^Normal Fault).csv',
            'F40(XL^Normal Fault).csv',
            'F41(XL^Normal Fault).csv',
            'F44(XL^Normal Fault).csv',
            'F47 (XL^Normal Fault).csv',
            'F48(XL^Normal Fault).csv',
            'F49 (XL^Normal Fault).csv',
            'F50 (XL^Normal Fault).csv',
            'F51 (XL^Normal Fault).csv',
            'F53 (XL^Normal Fault).csv',
            'F56 (XL^Normal Fault).csv',
            'F57 (XL^Normal Fault).csv',
            'F60 (XL^Normal Fault).csv',
            'F63 (IL^Normal Fault).csv',
            'F64 (IL^Normal Fault).csv',
            'F65 (IL^Normal Fault).csv',
            'F76 (XL^Normal Fault).csv',
            'F77 (XL^Normal Fault).csv',
            'F81 (XL^Normal Fault).csv',
            'F83 (XL^Normal Fault).csv',
            'F89 (XL^Normal Fault).csv',
            'F90 (XL^Normal Fault).csv',
            'F94 (XL^Normal Fault).csv',
            'F101 (XL^Normal Fault).csv',
            'F102 (XL^Normal Fault).csv',
            'F103 (XL^Normal Fault).csv',
            'F104 (XL^Normal Fault).csv',
            'F105 (XL^Normal Fault).csv',
            'F106 (XL^Normal Fault).csv',
            'F107 (XL^Normal Fault).csv',
            'F108 (XL^Normal Fault).csv',
            'F110 (XL^Normal Fault).csv',
            'F114 (XL^Normal Fault).csv',
            'F115 (XL^Normal Fault).csv',
            'F123 (XL^Normal Fault).csv',
            'F124 (XL^Normal Fault).csv',
            'F126 (XL^Normal Fault).csv',
            'F127 (XL^Normal Fault).csv',
            'F128 (XL^Normal Fault).csv',
            'F129 (XL^Normal Fault).csv',
            'F130 (IL^Normal Fault).csv',
            'F131(IL^Normal Fault).csv',
            'F132 (IL^Normal Fault).csv'
        ],

        transpressional: [
            'F8(XL^Transpressional).csv',
            'F9(XL^Transpressional).csv',
            'F10(XL^Transpressional).csv',
            'F11(XL^Transpressional).csv',
            'F12(XL^Transpressional).csv',
            'F13(XL^Normal Transpressional).csv',
            'F14(XL^Transpressional).csv',
            'F16(XL^Transpressional).csv',
            'F17(XL^Transpressional).csv',
            'F18(XL^Transpressional).csv',
            'F19(XL^Transpressional).csv',
            'F20(XL^Transpressional).csv',
            'F21(XL^Transpressional).csv',
            'F24(XL^Transpressional).csv',
            'F25(XL^Transpressional).csv',
            'F34(XL^Transpressional).csv',
            'F36(XL^Transpressional).csv',
            'F42(XL^Transressional).csv',
            'F43(XL^Transpressional).csv',
            'F45 (XL^Transpressional).csv',
            'F46 (XL^Transpressional).csv',
            'F52 (XL^Transpressional).csv',
            'F54(XL^Transpressional).csv',
            'F55 (XL^Transpressional).csv',
            'F58(XL^Transpressional).csv',
            'F59 (XL^Transpressional).csv',
            'F61 (XL^Transpressional).csv',
            'F66 (XL^Transpressional).csv',
            'F67 (XL^Transpressional).csv',
            'F68 (XL^Transpressional).csv',
            'F69 (XL^Transpressional).csv',
            'F70 (XL^Transpressional).csv',
            'F71 (XL^Transpressional).csv',
            'F72 (XL^Trans[ressional).csv',
            'F73 (XL^Transpressional).csv',
            'F74 (XL^Transpressional).csv',
            'F75 (XL^Transpressional).csv',
            'F78 (XL^Transpressional).csv',
            'F79 (XL^Transpressional).csv',
            'F80 (XL^Trampsressional).csv',
            'F82 (XL^Tramspressional).csv',
            'F84 (XL^Transpressional).csv',
            'F85 (XL^Transpressional).csv',
            'F86 (XL^Transpressional).csv',
            'F87 (XL^Transpressional).csv',
            'F88 (XL^Transpressional).csv',
            'F91 (XL^Transpressional).csv',
            'F92 (XL^Transpressional).csv',
            'F93 (XL^Transpressional).csv',
            'F95 (XL^Transpressional).csv',
            'F96 (XL^Transpressional).csv',
            'F100(XL^Transpressional).csv',
            'F109 (XL^Transpressional).csv',
            'F111 (XL^Tranpsressional).csv',
            'F112 (XL^Transpressional).csv',
            'F113 (XL^Transpressional).csv',
            'F116 (XL^Transpressional).csv',
            'F118 (XL^Transpressional).csv',
            'F119 (XL^Transpressional).csv',
            'F120 (XL^Transpressional).csv',
            'F121 (XL^Transressional).csv',
            'F122 (XL^Transprssional).csv',
            'F125 (XL^Transpressional).csv',
            'F126 (XL^Transpressional).csv'
        ],

        reverseFault: [
            'F62 (IL^Reverse Fault).csv'
        ]
    },

    /**
     * Get all fault files with full paths
     * @returns {string[]}
     */
    getAllFaultFiles() {
        const allFiles = [];
        
        Object.values(this.faultsByType).forEach(files => {
            files.forEach(file => {
                allFiles.push(this.basePath + file);
            });
        });

        return allFiles;
    }
};
