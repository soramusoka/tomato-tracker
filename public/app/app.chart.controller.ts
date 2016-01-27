/**
 * Created by artem.kolosovich on 28.01.2016.
 */

import {Injectable} from "angular2/core";

@Injectable()
export class ChartController {
    private selector: string = '#chart';

    setSelector(selector: string): void {
        this.selector = selector
    }

    createBar(categories: Array<string>, data: Array<number>): void {
        (<any>$(this.selector)).highcharts({
            chart: {
                type: 'bar',
                height: 150,
            },
            title: { text: null },
            xAxis: {
                categories: categories,
                title: { text: null }
            },
            yAxis: {
                min: 0,
                title: { text: null, },
                labels: { overflow: 'justify' }
            },
            tooltip: { valueSuffix: ' seconds' },
            plotOptions: {
                bar: {
                    dataLabels: {
                        enabled: true
                    }
                },
                title: { text: null }
            },
            credits: { enabled: false },
            series: [{
                showInLegend: false,
                data: data
            }]
        });
    }
}
