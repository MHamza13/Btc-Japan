// import React from 'react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import imgData from './../../assets/images/in-footer-bg.png';
import headerImgData from './../../assets/images/in-header-bg.png';




export const downloadPdf = (bodyData, columns, fileName, totalProfit, totalLoss) => {
    const addThousandSeparator = (number) => {
        return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    };
    const doc = new jsPDF();

    doc.setTextColor(255, 255, 255); // Set text color to white
    doc.setFillColor(0, 0, 255); // Set fill color to blue
    // Header
    const header = function() {
        doc.setFontSize(18);
        doc.setTextColor(30);
        doc.addImage(headerImgData, 'PNG', 0, 0, doc.internal.pageSize.width, 35);
        const headerText = "";
        const textWidth = doc.getStringUnitWidth(headerText) * doc.internal.getFontSize() / doc.internal.scaleFactor;
        const textX = (doc.internal.pageSize.width - textWidth) / 2;
        doc.text(headerText, textX, 12);
    };
    // const totalPrice = bodyData.reduce((acc, curr) => acc + curr.purchasePrice, 0);
    // const totalCountPrice = function(data){
    //     const lastY = doc.lastAutoTable.finalY + 10;
    //     doc.text(`Total Price: $${totalPrice}`, data.settings.margin.left, lastY);
    // }
    // Footer
    const footer = function() {
        // const pageCount = doc.internal.getNumberOfPages();
        doc.setFontSize(10);
        doc.setTextColor(255, 255, 255);
        doc.addImage(imgData, 'PNG', 0, doc.internal.pageSize.height - 20, doc.internal.pageSize.width, 20.1);

        // doc.text(`Total Price: ${totalPrice}`, data.settings.margin.left, doc.internal.pageSize.height - 10);
        doc.text("https://btcjapan.net", doc.internal.pageSize.width - 10, doc.internal.pageSize.height - 2.5,  { align: 'right' });
        // doc.text("Page " + data.pageNumber + " of " + pageCount, doc.internal.pageSize.width - data.setings.margin.left, doc.internal.pageSize.height - 5, { align: 'left' });
    };

    bodyData.push([
        '',
        '',
        '',
        '',
        '',
        'Total Profit:',
        addThousandSeparator(totalProfit)
    ]);
    
    bodyData.push([
        '',
        '',
        '',
        '',
        '',
        'Total Loss:',
        addThousandSeparator(totalLoss)
    ]);
   
    doc.autoTable({ head: [columns], body: bodyData, styles: { cellPadding: {top: 4, bottom: 4, left: 2, right: 2}, }, headerStyles: {
        fillColor: [49, 103, 177],
        fontSize: 11
    }, margin: { top: 40, left: 5, right: 5 },
    didDrawPage: function(data) {
        // Header
        header(data);
        // Footer
        footer(data);
        // totalCountPrice(data);
    },
    didParseCell: function (data) {
        var rows = data.table.body;
        // if (data.row.index === rows.length - 3) {
        //     data.cell.styles.fillColor = '#fff';
        //     data.cell.styles.fontStyle = 'bold';
        //     // data.cell.styles.alignment = 'right';
        //     data.cell.styles.cellPadding = {top: 20, bottom: 4, left: 2, right: 2};
        //     data.cell.styles.fontSize = 11;
        // }
        if (data.row.index === rows.length - 1) {
            data.cell.styles.textColor = '#e82d2d';
            data.cell.styles.fillColor = '#fff';
            data.cell.styles.fontStyle = 'bold';
            // data.cell.styles.alignment = 'right';
            data.cell.styles.fontSize = 11;
        }
        if (data.row.index === rows.length - 2) {
            // data.cell.styles.textColor = '#e82d2d';
            data.cell.styles.fillColor = '#fff';
            data.cell.styles.fontStyle = 'bold';
            // data.cell.styles.alignment = 'right';
            data.cell.styles.fontSize = 11;
        }
    } 
    });
    doc.save(fileName+'.pdf');
}