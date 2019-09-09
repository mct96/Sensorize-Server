import { Entity, PrimaryGeneratedColumn, Column, OneToMany, CreateDateColumn } from "typeorm";
import { DataSource } from "./DataSource";
import { Chart } from "./Chart";
import { IsEmail, IsString, MinLength, MaxLength } from "class-validator";

@Entity()
export class User {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({nullable: false, unique: true, length: 70})
    @IsEmail()
    @MinLength(7)
    @MaxLength(70)
    email: string;

    @Column({nullable: false})
    @IsString()
    @MinLength(7)
    name: string;

    @Column({nullable: false})
    @MinLength(7)
    password: string;

    @Column({nullable: false})
    avatar: string;

    @CreateDateColumn()
    createdDate: Date;

    @OneToMany(type => DataSource, dataSource => dataSource.owner)
    dataSources: DataSource[]

    @OneToMany(type => Chart, chart => chart.owner)
    charts: Chart[];
}