
import { PrimaryGeneratedColumn, Column, ManyToOne, ManyToMany, CreateDateColumn, Entity } from "typeorm";
import { User } from "./User";
import { MinLength, IsIP, IsNumber, IsInt, Min, Max, IsString, MaxLength } from "class-validator";
import { Chart } from "./Chart";

@Entity() // Cria uma tabela.
export class DataSource {
    @PrimaryGeneratedColumn() // Cria uma coluna para a chave primário e com au
    id: number;               // auto incremento.

    @Column({nullable: false, length: 70}) /// Não-nulos e tamanho
                            // máximo de 70 caracteres.
    @MinLength(7)           // Mínimo de 07 Caracteres.
    @MaxLength(70)          // Máximo de 70 Caracteres.
    label: string;

    @Column({nullable: false})
    @IsIP(4)
    ip: string;

    @Column({nullable: false})
    @IsInt()
    @Min(3000)
    port: number;

    @Column({nullable: false})
    @IsNumber()
    @Min(0.1)
    @Max(5)
    sampleFrequency: number;

    @Column()
    @IsString()
    dataType: string;

    @ManyToOne(type => User, user => user.dataSources)
    owner: User;

    @ManyToMany(type => Chart, charts => charts.dataSources)
    charts: Chart[];

    @CreateDateColumn()
    createdDate: Date;
}