export interface TeachingUnitInterface {
    _id : string
    code : string,
    name : string,
    field : 'informatique' | 'gestion' | 'btp',
    semester : 'S1' | 'S2' | 'S3' | 'S4' | 'S5' | 'S6',
    credits : number,
    description : string,
    createdAt : Date,
    updatedAt : Date
}

export interface ModulesInterface {
    code : string,
    title : string
    coefficient : number,
    credits : number
    teachingUnit : string,
    type : 'cours Magistral' | 'TD' | 'TP',
    hours :number,
    description : string,
    files : string[],
    createdAt : Date,
    updatedAt : Date
}