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
var User_1 = require("./User");
var class_validator_1 = require("class-validator");
var EChartType;
(function (EChartType) {
    EChartType["PieChart"] = "Pie Chart";
    EChartType["BarChart"] = "Bar Chart";
    EChartType["ScatterPlot"] = "Scatter Plot";
    EChartType["LineChart"] = "Line Chart";
})(EChartType = exports.EChartType || (exports.EChartType = {}));
var Chart = /** @class */ (function () {
    function Chart() {
    }
    __decorate([
        typeorm_1.PrimaryGeneratedColumn(),
        __metadata("design:type", Number)
    ], Chart.prototype, "id", void 0);
    __decorate([
        typeorm_1.Column({ nullable: false, length: 70 }),
        class_validator_1.MinLength(7),
        class_validator_1.MaxLength(70),
        __metadata("design:type", String)
    ], Chart.prototype, "label", void 0);
    __decorate([
        typeorm_1.CreateDateColumn(),
        __metadata("design:type", Date)
    ], Chart.prototype, "createdDate", void 0);
    __decorate([
        typeorm_1.Column({
            type: "enum",
            enum: EChartType,
            default: EChartType.LineChart,
            nullable: false,
        }),
        class_validator_1.IsEnum(EChartType, {
            message: "Chart type not supported."
        }),
        __metadata("design:type", String)
    ], Chart.prototype, "chartType", void 0);
    __decorate([
        typeorm_1.Column(),
        __metadata("design:type", Number)
    ], Chart.prototype, "buffer", void 0);
    __decorate([
        typeorm_1.ManyToMany(function (type) { return DataSource_1.DataSource; }, function (dataSources) { return dataSources.charts; }, { cascade: true }),
        typeorm_1.JoinTable(),
        __metadata("design:type", Array)
    ], Chart.prototype, "dataSources", void 0);
    __decorate([
        typeorm_1.ManyToOne(function (type) { return User_1.User; }, function (user) { return user.charts; }),
        __metadata("design:type", User_1.User)
    ], Chart.prototype, "owner", void 0);
    Chart = __decorate([
        typeorm_1.Entity()
    ], Chart);
    return Chart;
}());
exports.Chart = Chart;
