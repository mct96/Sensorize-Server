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
var DataSource_1 = require("./DataSource");
var Chart_1 = require("./Chart");
var class_validator_1 = require("class-validator");
var User = /** @class */ (function () {
    function User() {
    }
    __decorate([
        typeorm_1.PrimaryGeneratedColumn(),
        __metadata("design:type", Number)
    ], User.prototype, "id", void 0);
    __decorate([
        typeorm_1.Column({ nullable: false, unique: true, length: 70 }),
        class_validator_1.IsEmail(),
        class_validator_1.MinLength(7),
        class_validator_1.MaxLength(70),
        __metadata("design:type", String)
    ], User.prototype, "email", void 0);
    __decorate([
        typeorm_1.Column({ nullable: false }),
        class_validator_1.IsString(),
        class_validator_1.MinLength(7),
        __metadata("design:type", String)
    ], User.prototype, "name", void 0);
    __decorate([
        typeorm_1.Column({ nullable: false }),
        class_validator_1.MinLength(7),
        __metadata("design:type", String)
    ], User.prototype, "password", void 0);
    __decorate([
        typeorm_1.Column({ nullable: false }),
        __metadata("design:type", String)
    ], User.prototype, "avatar", void 0);
    __decorate([
        typeorm_1.CreateDateColumn(),
        __metadata("design:type", Date)
    ], User.prototype, "createdDate", void 0);
    __decorate([
        typeorm_1.OneToMany(function (type) { return DataSource_1.DataSource; }, function (dataSource) { return dataSource.owner; }),
        __metadata("design:type", Array)
    ], User.prototype, "dataSources", void 0);
    __decorate([
        typeorm_1.OneToMany(function (type) { return Chart_1.Chart; }, function (chart) { return chart.owner; }),
        __metadata("design:type", Array)
    ], User.prototype, "charts", void 0);
    User = __decorate([
        typeorm_1.Entity()
    ], User);
    return User;
}());
exports.User = User;
