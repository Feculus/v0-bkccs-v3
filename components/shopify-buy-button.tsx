"use client"

import { useEffect, useRef } from "react"

declare global {
  interface Window {
    ShopifyBuy: any
  }
}

export default function ShopifyBuyButton() {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const loadShopifyScript = () => {
      const scriptURL = "https://sdks.shopifycdn.com/buy-button/latest/buy-button-storefront.min.js"

      if (window.ShopifyBuy) {
        if (window.ShopifyBuy.UI) {
          initializeShopifyBuy()
        } else {
          loadScript()
        }
      } else {
        loadScript()
      }

      function loadScript() {
        const script = document.createElement("script")
        script.async = true
        script.src = scriptURL
        document.head.appendChild(script)
        script.onload = initializeShopifyBuy
      }

      function initializeShopifyBuy() {
        if (!containerRef.current) return

        const client = window.ShopifyBuy.buildClient({
          domain: "big-kid-custom-rides.myshopify.com",
          storefrontAccessToken: "c45ac1e43631694b541af306601fbd08",
        })

        window.ShopifyBuy.UI.onReady(client).then((ui: any) => {
          ui.createComponent("product", {
            id: "8761791348901",
            node: containerRef.current,
            moneyFormat: "%24%7B%7Bamount%7D%7D",
            options: {
              product: {
                styles: {
                  product: {
                    "@media (min-width: 601px)": {
                      "max-width": "calc(25% - 20px)",
                      "margin-left": "20px",
                      "margin-bottom": "50px",
                    },
                  },
                  button: {
                    "font-family": "Roboto, sans-serif",
                    "font-weight": "bold",
                    "font-size": "18px",
                    "padding-top": "17px",
                    "padding-bottom": "17px",
                    ":hover": {
                      "background-color": "#7e1c24",
                    },
                    "background-color": "#8c1f28",
                    ":focus": {
                      "background-color": "#7e1c24",
                    },
                    "border-radius": "0px",
                    "padding-left": "59px",
                    "padding-right": "59px",
                  },
                  quantityInput: {
                    "font-size": "18px",
                    "padding-top": "17px",
                    "padding-bottom": "17px",
                  },
                },
                buttonDestination: "checkout",
                contents: {
                  img: false,
                  title: false,
                  price: false,
                },
                text: {
                  button: "Purchase Ticket",
                },
                googleFonts: ["Roboto"],
              },
            },
          })
        })
      }
    }

    loadShopifyScript()
  }, [])

  return (
    <div className="w-full max-w-md mx-auto text-center">
      <div ref={containerRef} className="min-h-[60px] flex items-center justify-center"></div>
    </div>
  )
}
