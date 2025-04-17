"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

// 定义类名变种
const labelVariants = cva(
  "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
)

// 创建 Label 组件，使用原生 <label> 元素
const Label = React.forwardRef<
  HTMLLabelElement, // ref 类型是 HTMLLabelElement
  React.LabelHTMLAttributes<HTMLLabelElement> & VariantProps<typeof labelVariants> // 合并原生 label 属性和变种属性
>(({ className, ...props }, ref) => (
  <label
    ref={ref}
    className={cn(labelVariants(), className)} // 使用变种类名和传入的类名
    {...props} // 传递其他属性给 <label>
  />
))

Label.displayName = "Label" // 设置组件名称

export { Label }
