import jsPDF from 'jspdf'
import type { OrderWithProducts } from '../lib/supabase'

export function generateOrderPDF(orders: OrderWithProducts[]) {
  const doc = new jsPDF()
  const pageWidth = doc.internal.pageSize.width
  const margin = 10
  const cardWidth = 90 // Ancho fijo para cada card
  const cardSpacing = 10 // Espacio entre cards
  const lineHeight = 8 // Altura de línea base
  
  // Calcular posiciones X para las dos columnas
  const leftColumnX = margin
  const rightColumnX = pageWidth - margin - cardWidth
  
  let currentY = margin
  let currentColumn = 'left' // 'left' o 'right'

  orders.forEach((order, index) => {
    // Determinar la posición X basada en la columna actual
    const cardX = currentColumn === 'left' ? leftColumnX : rightColumnX

    // Calcular altura necesaria para la card
    const logoHeight = 25 // Altura para el logo
    const headerHeight = 20 // Altura para número de pedido y cliente
    const addressHeight = 10 // Altura para dirección
    const productHeight = order.products.length * lineHeight // Altura para productos
    const bottomPadding = 20 // Padding inferior
    const cardHeight = logoHeight + headerHeight + addressHeight + productHeight + bottomPadding

    // Verificar si necesitamos una nueva página
    if (currentY + cardHeight > doc.internal.pageSize.height - margin) {
      doc.addPage()
      currentY = margin
      currentColumn = 'left'
    }

    // Dibujar borde de la card
    doc.setDrawColor(0, 0, 0)
    doc.rect(cardX, currentY, cardWidth, cardHeight)

    // Agregar el logo centrado
    const logoWidth = 18
    const logoImgHeight = 20 // Mantener la altura original
    const logoX = cardX + (cardWidth - logoWidth) / 2 // Centrar horizontalmente
    doc.addImage('/assets/logo.jpg', 'JPEG', logoX, currentY + 5, logoWidth, logoImgHeight)

    // Número de pedido
    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.text(`Pedido N° ${index + 1}`, cardX + 5, currentY + logoHeight + 8)

    // Cliente
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.text(`Cliente: ${order.client}`, cardX + 5, currentY + logoHeight + 18)

    // Dirección
    doc.text(`Dirección: ${order.address}`, cardX + 5, currentY + logoHeight + 28)

    // Productos con viñetas
    let productY = currentY + logoHeight + 38
    order.products.forEach(product => {
      doc.text(`• ${product.description} x${product.quantity}`, cardX + 5, productY)
      productY += lineHeight
    })

    // Actualizar posición para la siguiente card
    if (currentColumn === 'left') {
      currentColumn = 'right'
    } else {
      currentColumn = 'left'
      currentY += cardHeight + cardSpacing
    }
  })

  // Generar el PDF como blob y abrirlo en una nueva pestaña
  const pdfBlob = doc.output('blob')
  const pdfUrl = URL.createObjectURL(pdfBlob)
  window.open(pdfUrl, '_blank')
} 