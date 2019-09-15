import { PrimaryGeneratedColumn, Column, ManyToMany, ManyToOne, JoinTable, CreateDateColumn, Entity } from "typeorm";
import { DataSource } from "./DataSource";
import { User } from "./User";
import { MinLength, MaxLength, IsEnum } from "class-validator";

export enum EChartType {
    PieChart    = "Pie Chart",
    BarChart    = "Bar Chart",
    ScatterPlot = "Scatter Plot",
    LineChart   = "Line Chart",
}

@Entity()
export class Chart {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({nullable: false, length: 70})
    @MinLength(7)
    @MaxLength(70)
    label: string;

    @CreateDateColumn()
    createdDate: Date;

    @Column({
        type: "enum",
        enum: EChartType,
        default: EChartType.LineChart,
        nullable: false,
    })
    @IsEnum(EChartType, {
        message: "Chart type not supported."
    })
    chartType: EChartType;

    @Column()
    buffer: number;

    @ManyToMany(type => DataSource, dataSources => dataSources.charts,
        {cascade: true})
    @JoinTable()
    dataSources: DataSource[];

    @ManyToOne(type => User, user => user.charts)
    owner: User;
}