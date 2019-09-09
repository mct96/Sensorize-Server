"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
var typeorm_1 = require("typeorm");
var User_1 = require("./User");
var class_validator_1 = require("class-validator");
var Chart_1 = require("./Chart");
var DataSource = /** @class */ (function () {
    function DataSource() {
    }
    __decorate([
        typeorm_1.PrimaryGeneratedColumn() // Cria uma coluna para a chave primário e com au
        ,
        __metadata("design:type", Number)
    ], DataSource.prototype, "id", void 0);
    __decorate([
        typeorm_1.Column({ nullable: false, length: 70 }) /// Não-nulos e tamanho
        // máximo de 70 caracteres.
        ,
        class_validator_1.MinLength(7) // Mínimo de 07 Caracteres.
        ,
        class_validator_1.MaxLength(70) // Máximo de 70 Caracteres.
        ,
        __metadata("design:type", String)
    ], DataSource.prototype, "label", void 0);
    __decorate([
        typeorm_1.Column({ nullable: false }),
        class_validator_1.IsIP(4),
        __metadata("design:type", String)
    ], DataSource.prototype, "ip", void 0);
    __decorate([
        typeorm_1.Column({ nullable: false }),
        class_validator_1.IsInt(),
        class_validator_1.Min(3000),
        __metadata("design:type", Number)
    ], DataSource.prototype, "port", void 0);
    __decorate([
        typeorm_1.Column({ nullable: false }),
        class_validator_1.IsNumber(),
        class_validator_1.Min(0.1),
        class_validator_1.Max(5),
        __metadata("design:type", Number)
    ], DataSource.prototype, "sampleFrequency", void 0);
    __decorate([
        typeorm_1.Column(),
        class_validator_1.IsString(),
        __metadata("design:type", String)
    ], DataSource.prototype, "dataType", void 0);
    __decorate([
        typeorm_1.ManyToOne(function (type) { return User_1.User; }, function (user) { return user.dataSources; }),
        __metadata("design:type", User_1.User)
    ], DataSource.prototype, "owner", void 0);
    __decorate([
        typeorm_1.ManyToMany(function (type) { return Chart_1.Chart; }, function (charts) { return charts.dataSources; }),
        __metadata("design:type", Array)
    ], DataSource.prototype, "charts", void 0);
    __decorate([
        typeorm_1.CreateDateColumn(),
        __metadata("design:type", Date)
    ], DataSource.prototype, "createdDate", void 0);
    DataSource = __decorate([
        typeorm_1.Entity() // Cria uma tabela.
    ], DataSource);
    return DataSource;
}());
exports.DataSource = DataSource;
